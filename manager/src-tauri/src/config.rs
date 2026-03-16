use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub auto_start: bool,
    pub start_minimized: bool,
    pub auto_start_bridge: bool,
    pub notify_on_start: bool,
    pub notify_on_stop: bool,
    pub notify_on_message: bool,
    pub theme: String,
    pub language: String,
    pub message_retention_days: u32,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            auto_start: false,
            start_minimized: false,
            auto_start_bridge: false,
            notify_on_start: true,
            notify_on_stop: true,
            notify_on_message: false,
            theme: "system".to_string(),
            language: "zh-CN".to_string(),
            message_retention_days: 3,
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct AppConfig {
    pub settings: Settings,
}

impl AppConfig {
    pub fn load() -> Result<Self, String> {
        let home = dirs::home_dir().ok_or("Cannot find home directory")?;
        let settings_path = home.join(".claude-to-im/settings.json");

        let settings: Settings = if settings_path.exists() {
            std::fs::read_to_string(&settings_path)
                .ok()
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default()
        } else {
            Settings::default()
        };

        Ok(AppConfig { settings })
    }

    pub fn save(&self) -> Result<(), String> {
        let home = dirs::home_dir().ok_or("Cannot find home directory")?;
        let base_dir = home.join(".claude-to-im");
        std::fs::create_dir_all(&base_dir).map_err(|e| e.to_string())?;

        let settings_path = base_dir.join("settings.json");
        let settings_json = serde_json::to_string_pretty(&self.settings).map_err(|e| e.to_string())?;
        std::fs::write(&settings_path, settings_json).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn get_config() -> Result<Option<serde_json::Value>, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let config_path = home.join(".claude-to-im/config.env");

    if !config_path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let mut config = serde_json::Map::new();

    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') { continue; }

        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim();
            let value = value.trim().trim_matches('"').trim_matches('\'');
            config.insert(key.to_string(), serde_json::Value::String(value.to_string()));
        }
    }

    Ok(Some(serde_json::Value::Object(config)))
}

#[tauri::command]
pub async fn save_config(config: serde_json::Value) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let config_path = home.join(".claude-to-im/config.env");
    let base_dir = config_path.parent().unwrap();
    std::fs::create_dir_all(base_dir).map_err(|e| e.to_string())?;

    let mut lines = vec!["# Claude-to-IM Configuration".to_string()];

    if let Some(obj) = config.as_object() {
        for (key, value) in obj {
            if let Some(v) = value.as_str() {
                lines.push(format!("{}={}", key, v));
            }
        }
    }

    std::fs::write(&config_path, lines.join("\n")).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_settings(state: tauri::State<'_, crate::AppState>) -> Result<Settings, String> {
    Ok(state.config.lock().await.settings.clone())
}

#[tauri::command]
pub async fn save_settings(state: tauri::State<'_, crate::AppState>, settings: Settings) -> Result<(), String> {
    let mut cfg = state.config.lock().await;
    cfg.settings = settings;
    cfg.save()
}