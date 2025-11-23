mod commands;
mod core;
mod models;
mod services;
mod utils;

use commands::{add_server, close_server, get_keys, get_servers, open_server};
use core::{AppState, Database};
use tauri::{Builder, Manager};
use tokio::sync::Mutex;
use utils::get_db_base_dir;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
            let base_path = get_db_base_dir(app, tauri::is_dev())?;
            let db_path = Database::db_file_path(&base_path);
            let db_connection = Database::new(&db_path)
                .map_err(|e| format!("Failed to create database connection: {}", e))?;

            let mut app_state = AppState::new();
            app_state.set_db_connection(Some(db_connection));

            app.manage(Mutex::new(app_state));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_keys,
            add_server,
            get_servers,
            open_server,
            close_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running redis GUI application");
}

#[cfg(test)]
mod tests {
    mod common;

    pub use common::*;
}
