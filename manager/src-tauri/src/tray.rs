use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

pub fn create_tray() -> SystemTray {
    let start = CustomMenuItem::new("start".to_string(), "Start");
    let stop = CustomMenuItem::new("stop".to_string(), "Stop");
    let restart = CustomMenuItem::new("restart".to_string(), "Restart");
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let menu = SystemTrayMenu::new()
        .add_item(start)
        .add_item(stop)
        .add_item(restart)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(menu)
}