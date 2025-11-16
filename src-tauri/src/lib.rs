mod commands;
mod state;
mod utils;

use commands::{connect_to_server, get_keys};
use state::AppState;
use std::sync::Mutex;
use tauri::{Builder, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
            app.manage(Mutex::new(AppState::new()));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![connect_to_server, get_keys])
        .run(tauri::generate_context!())
        .expect("error while running redis GUI application");
}
