// Hide console window on Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod bridge;
mod config;
mod messages;
mod skill_installer;
mod tray;

use bridge::BridgeManager;
use config::AppConfig;
use std::sync::Arc;
use tauri::{Manager, SystemTrayEvent, WindowEvent};
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
    let bridge_for_close = bridge.clone();

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
                                if let Err(e) = bridge.lock().await.start() {
                                    eprintln!("Failed to start bridge: {}", e);
                                }
                            });
                        }
                        "stop" => {
                            let bridge = bridge_for_tray.clone();
                            tauri::async_runtime::spawn(async move {
                                if let Err(e) = bridge.lock().await.stop() {
                                    eprintln!("Failed to stop bridge: {}", e);
                                }
                            });
                        }
                        "restart" => {
                            let bridge = bridge_for_tray.clone();
                            tauri::async_runtime::spawn(async move {
                                let mut b = bridge.lock().await;
                                if let Err(e) = b.stop() {
                                    eprintln!("Failed to stop: {}", e);
                                }
                                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                                if let Err(e) = b.start() {
                                    eprintln!("Failed to start: {}", e);
                                }
                            });
                        }
                        "show" => {
                            if let Some(window) = app.get_window("main") {
                                window.show().ok();
                                window.set_focus().ok();
                            }
                        }
                        "quit" => {
                            // 退出前停止桥接服务
                            let bridge = bridge_for_close.clone();
                            tauri::async_runtime::block_on(async {
                                if let Err(e) = bridge.lock().await.stop() {
                                    eprintln!("Failed to stop bridge on exit: {}", e);
                                }
                            });
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .on_window_event(|event| {
            // 关闭窗口时隐藏到托盘而不是退出
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                event.window().hide().ok();
                api.prevent_close();
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
                    if let Err(e) = bridge.lock().await.start() {
                        eprintln!("Failed to auto-start bridge: {}", e);
                    }
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
            skill_installer::get_skill_status,
            skill_installer::install_skill,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}