mod bridge;
mod config;
mod messages;
mod tray;

use bridge::BridgeManager;
use config::AppConfig;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

pub struct AppState {
    pub bridge: Arc<Mutex<BridgeManager>>,
    pub config: Arc<Mutex<AppConfig>>,
}

fn main() {
    let bridge = Arc::new(Mutex::new(BridgeManager::new()));
    let config = Arc::new(Mutex::new(AppConfig::load().unwrap_or_default()));

    tauri::Builder::default()
        .system_tray(tray::create_tray())
        .setup(|app| {
            tray::setup_tray_events(app.handle())?;

            let config_clone = config.clone();
            let bridge_clone = bridge.clone();
            tauri::async_runtime::spawn(async move {
                let cfg = config_clone.lock().await;
                if cfg.settings.auto_start_bridge {
                    drop(cfg);
                    bridge_clone.lock().await.start().ok();
                }
            });

            let window = app.get_window("main").unwrap();
            let config_clone = config.clone();
            tauri::async_runtime::spawn(async move {
                let cfg = config_clone.lock().await;
                if !cfg.settings.start_minimized {
                    window.show().ok();
                }
            });

            Ok(())
        })
        .manage(AppState { bridge, config })
        .invoke_handler(tauri::generate_handler![
            bridge::get_bridge_status,
            bridge::start_bridge,
            bridge::stop_bridge,
            config::get_config,
            config::save_config,
            config::get_settings,
            config::save_settings,
            messages::get_logs,
            messages::get_messages,
            messages::clear_messages,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}