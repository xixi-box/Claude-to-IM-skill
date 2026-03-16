use serde::{Deserialize, Serialize};
use crate::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogLine {
    pub time: String,
    pub level: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub session_id: String,
    #[serde(default)]
    pub platform: String,
    pub role: String,
    pub content: String,
    #[serde(default)]
    pub timestamp: u64,
}

// 兼容实际存储的简化格式
#[derive(Debug, Clone, Serialize, Deserialize)]
struct StoredMessage {
    role: String,
    content: String,
    #[serde(default)]
    timestamp: u64,
}

#[tauri::command]
pub async fn get_logs(lines: Option<usize>) -> Result<Vec<LogLine>, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let log_file = home.join(".claude-to-im/logs/bridge.log");

    if !log_file.exists() {
        return Ok(vec![]);
    }

    let content = std::fs::read_to_string(&log_file).map_err(|e| e.to_string())?;
    let all_lines: Vec<&str> = content.lines().rev().take(lines.unwrap_or(100)).collect();

    let logs: Vec<LogLine> = all_lines
        .into_iter()
        .rev()
        .filter_map(|line| {
            // Match ISO format: [2026-03-16T07:18:56.594Z] or [2026-03-16 07:18:56]
            let re = regex::Regex::new(r"\[(\d{4}-\d{2}-\d{2}T?\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)\]\s*\[(\w+)\]\s*(.+)").ok()?;
            let caps = re.captures(line)?;

            let time_str = caps.get(1)?.as_str();
            // Convert ISO format to readable format
            let time_display = if time_str.contains('T') {
                time_str
                    .replace('T', " ")
                    .replace(".000Z", "")
                    .replace('Z', "")
                    .split('.')
                    .next()
                    .unwrap_or(time_str)
                    .to_string()
            } else {
                time_str.to_string()
            };

            Some(LogLine {
                time: time_display,
                level: caps.get(2)?.as_str().to_lowercase(),
                message: caps.get(3)?.as_str().to_string(),
            })
        })
        .collect();

    Ok(logs)
}

#[tauri::command]
pub async fn get_messages() -> Result<Vec<ChatMessage>, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let messages_dir = home.join(".claude-to-im/data/messages");

    if !messages_dir.exists() {
        return Ok(vec![]);
    }

    let mut all_messages: Vec<ChatMessage> = vec![];

    if let Ok(entries) = std::fs::read_dir(&messages_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map(|e| e == "json").unwrap_or(false) {
                let session_id = path.file_stem()
                    .and_then(|s| s.to_str())
                    .unwrap_or("")
                    .to_string();

                if let Ok(content) = std::fs::read_to_string(&path) {
                    // 尝试解析为完整格式
                    if let Ok(session_messages) = serde_json::from_str::<Vec<ChatMessage>>(&content) {
                        for mut msg in session_messages {
                            if msg.session_id.is_empty() {
                                msg.session_id = session_id.clone();
                            }
                            all_messages.push(msg);
                        }
                    } else {
                        // 尝试解析为简化格式
                        if let Ok(stored_messages) = serde_json::from_str::<Vec<StoredMessage>>(&content) {
                            for (i, stored) in stored_messages.into_iter().enumerate() {
                                all_messages.push(ChatMessage {
                                    id: format!("{}-{}", session_id, i),
                                    session_id: session_id.clone(),
                                    platform: "unknown".to_string(),
                                    role: stored.role,
                                    content: stored.content,
                                    timestamp: stored.timestamp,
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    all_messages.sort_by_key(|m| m.timestamp);
    Ok(all_messages)
}

#[tauri::command]
pub async fn clear_messages(session_id: Option<String>, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let messages_dir = home.join(".claude-to-im/data/messages");

    if !messages_dir.exists() {
        return Ok(());
    }

    let cfg = state.config.lock().await;
    let retention_days = cfg.settings.message_retention_days;

    if session_id.as_deref() == Some("old") {
        if retention_days == 0 { return Ok(()); }

        let cutoff = chrono::Utc::now() - chrono::Duration::days(retention_days as i64);
        let cutoff_ts = cutoff.timestamp() as u64;

        if let Ok(entries) = std::fs::read_dir(&messages_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().map(|e| e == "json").unwrap_or(false) {
                    if let Ok(content) = std::fs::read_to_string(&path) {
                        // 尝试解析两种格式
                        if let Ok(mut messages) = serde_json::from_str::<Vec<ChatMessage>>(&content) {
                            messages.retain(|m| m.timestamp > cutoff_ts);
                            let json = serde_json::to_string_pretty(&messages).map_err(|e| e.to_string())?;
                            std::fs::write(&path, json).map_err(|e| e.to_string())?;
                        } else if let Ok(mut messages) = serde_json::from_str::<Vec<StoredMessage>>(&content) {
                            messages.retain(|m| m.timestamp > cutoff_ts);
                            let json = serde_json::to_string_pretty(&messages).map_err(|e| e.to_string())?;
                            std::fs::write(&path, json).map_err(|e| e.to_string())?;
                        }
                    }
                }
            }
        }
    } else if let Some(sid) = session_id {
        let session_file = messages_dir.join(format!("{}.json", sid));
        if session_file.exists() {
            std::fs::remove_file(&session_file).map_err(|e| e.to_string())?;
        }
    } else {
        if let Ok(entries) = std::fs::read_dir(&messages_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().map(|e| e == "json").unwrap_or(false) {
                    std::fs::remove_file(&path).ok();
                }
            }
        }
    }

    Ok(())
}