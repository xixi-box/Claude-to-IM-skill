use crate::AppState;
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::Duration;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeStatus {
    pub running: bool,
    pub pid: Option<u32>,
    pub platforms: Vec<String>,
    pub last_error: Option<String>,
}

pub struct BridgeManager {
    pid: Option<u32>,
}

impl BridgeManager {
    pub fn new() -> Self {
        let pid = dirs::home_dir()
            .and_then(|h| std::fs::read_to_string(h.join(".claude-to-im/runtime/bridge.pid")).ok())
            .and_then(|s| s.trim().parse::<u32>().ok());

        Self { pid }
    }

    pub fn start(&mut self) -> Result<(), String> {
        let home = dirs::home_dir().ok_or("Cannot find home directory")?;
        let skill_dir = home.join(".claude/skills/claude-to-im");

        #[cfg(target_os = "windows")]
        {
            let output = Command::new("powershell")
                .args([
                    "-ExecutionPolicy", "Bypass",
                    "-File",
                    &skill_dir.join("scripts/supervisor-windows.ps1").to_string_lossy(),
                    "start"
                ])
                .output()
                .map_err(|e| format!("Failed to start bridge: {}", e))?;

            if !output.status.success() {
                return Err(String::from_utf8_lossy(&output.stderr).to_string());
            }
            std::thread::sleep(Duration::from_secs(2));
        }

        #[cfg(not(target_os = "windows"))]
        {
            let output = Command::new("bash")
                .args([&skill_dir.join("scripts/daemon.sh").to_string_lossy(), "start"])
                .output()
                .map_err(|e| format!("Failed to start bridge: {}", e))?;

            if !output.status.success() {
                return Err(String::from_utf8_lossy(&output.stderr).to_string());
            }
        }

        let pid_file = home.join(".claude-to-im/runtime/bridge.pid");
        if pid_file.exists() {
            self.pid = std::fs::read_to_string(&pid_file)
                .ok()
                .and_then(|s| s.trim().parse::<u32>().ok());
        }

        Ok(())
    }

    pub fn stop(&mut self) -> Result<(), String> {
        let home = dirs::home_dir().ok_or("Cannot find home directory")?;
        let skill_dir = home.join(".claude/skills/claude-to-im");

        #[cfg(target_os = "windows")]
        {
            let _ = Command::new("powershell")
                .args([
                    "-ExecutionPolicy", "Bypass",
                    "-File",
                    &skill_dir.join("scripts/supervisor-windows.ps1").to_string_lossy(),
                    "stop"
                ])
                .output();
        }

        #[cfg(not(target_os = "windows"))]
        {
            let _ = Command::new("bash")
                .args([&skill_dir.join("scripts/daemon.sh").to_string_lossy(), "stop"])
                .output();
        }

        self.pid = None;
        Ok(())
    }

    pub fn get_status(&self) -> BridgeStatus {
        let home = dirs::home_dir().unwrap();
        let status_file = home.join(".claude-to-im/runtime/status.json");

        let status_json: Option<serde_json::Value> = std::fs::read_to_string(&status_file)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok());

        let running = status_json
            .as_ref()
            .and_then(|j| j.get("running"))
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        let pid = self.pid.or_else(|| {
            std::fs::read_to_string(home.join(".claude-to-im/runtime/bridge.pid"))
                .ok()
                .and_then(|s| s.trim().parse::<u32>().ok())
        });

        let platforms: Vec<String> = status_json
            .as_ref()
            .and_then(|j| j.get("platforms"))
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let last_error = status_json
            .as_ref()
            .and_then(|j| j.get("lastError"))
            .and_then(|v| v.as_str().map(|s| s.to_string()));

        BridgeStatus {
            running,
            pid,
            platforms,
            last_error,
        }
    }
}

#[tauri::command]
pub async fn get_bridge_status(state: State<'_, AppState>) -> Result<BridgeStatus, String> {
    Ok(state.bridge.lock().await.get_status())
}

#[tauri::command]
pub async fn start_bridge(state: State<'_, AppState>) -> Result<(), String> {
    state.bridge.lock().await.start()
}

#[tauri::command]
pub async fn stop_bridge(state: State<'_, AppState>) -> Result<(), String> {
    state.bridge.lock().await.stop()
}