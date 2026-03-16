use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem};

pub fn create_tray() -> SystemTray {
    let start = CustomMenuItem::new("start".to_string(), "启动");
    let stop = CustomMenuItem::new("stop".to_string(), "停止");
    let restart = CustomMenuItem::new("restart".to_string(), "重启");
    let show = CustomMenuItem::new("show".to_string(), "显示窗口");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");

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