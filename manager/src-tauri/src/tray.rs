use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, AppHandle};

pub fn create_tray() -> SystemTray {
    let start = CustomMenuItem::new("start".to_string(), "Start");
    let stop = CustomMenuItem::new("stop".to_string(), "Stop");
    let restart = CustomMenuItem::new("restart".to_string(), "Restart");
    let separator = SystemTrayMenuItem::Separator;
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let menu = SystemTrayMenu::new()
        .add_item(start)
        .add_item(stop)
        .add_item(restart)
        .add_native_item(separator)
        .add_item(show)
        .add_native_item(separator)
        .add_item(quit);

    SystemTray::new().with_menu(menu)
}

pub fn setup_tray_events(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    app.on_system_tray_event(move |app, event| {
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
                        let bridge = app.state::<crate::AppState>().bridge.clone();
                        tauri::async_runtime::spawn(async move {
                            bridge.lock().await.start().ok();
                        });
                    }
                    "stop" => {
                        let bridge = app.state::<crate::AppState>().bridge.clone();
                        tauri::async_runtime::spawn(async move {
                            bridge.lock().await.stop().ok();
                        });
                    }
                    "restart" => {
                        let bridge = app.state::<crate::AppState>().bridge.clone();
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
    });

    Ok(())
}