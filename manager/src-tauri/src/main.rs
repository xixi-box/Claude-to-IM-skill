// Hide console window on Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod bridge;
mod config;
mod messages;
mod tray;

use bridge::BridgeManager;
use config::AppConfig;
use std::sync::Arc;
use tauri::{Manager, SystemTrayEvent};
use tokio::sync::Mutex;

pub struct AppState {
    pub bridge: Arc<Mutex<BridgeManager>>,
    pub config: Arc<Mutex<AppConfig>>,
}

fn main() {
    let bridge = Arc::new(Mutex::new(BridgeManager::new()));
    let config = Arc::new(Mutex::new(AppConfig::load().unwrap_or_default()));

    // Clone for use in closures
    let bridge_for_setup = bridge.clone();
    let config_for_setup = config.clone();
    let bridge_for_tray = bridge.clone();

    tauri::Builder::default()
        .manage(AppState { bridge, config })
        .system_tray(tray::create_tray())
        .on_system_tray_event(move |app, event| {
            match event {
                SystemTrayEvent::LeftClick { .. } => {
                    if let Some(window) = app.get_window("main") {
                        window.show().ok();
                        window.set_focus().ok();
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    match id.as_str() {
                        "start" => {
                            let bridge = bridge_for_tray.clone();
                            tauri::async_runtime::spawn(async move {
                                bridge.lock().await.start().ok();
                            });
                        }
                        "stop" => {
                            let bridge = bridge_for_tray.clone();
                            tauri::async_runtime::spawn(async move {
                                bridge.lock().await.stop().ok();
                            });
                        }
                        "restart" => {
                            let bridge = bridge_for_tray.clone();
                            tauri::async_runtime::spawn(async move {
                                let mut b = bridge.lock().await;
                                b.stop().ok();
                                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                                b.start().ok();
                            });
                        }
                        "show" => {
                            if let Some(window) = app.get_window("main") {
                                window.show().ok();
                                window.set_focus().ok();
                            }
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .setup(move |app| {
            let bridge = bridge_for_setup.clone();
            let config = config_for_setup.clone();

            // Auto-start bridge if configured
            tauri::async_runtime::spawn(async move {
                let cfg = config.lock().await;
                if cfg.settings.auto_start_bridge {
                    drop(cfg);
                    bridge.lock().await.start().ok();
                }
            });

            // Show window if not start minimized
            let window = app.get_window("main").unwrap();
            let config = config_for_setup.clone();
            tauri::async_runtime::spawn(async move {
                let cfg = config.lock().await;
                if !cfg.settings.start_minimized {
                    window.show().ok();
                }
            });

            Ok(())
        })
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