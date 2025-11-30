mod commands;
mod core;
mod models;
mod services;
mod utils;

use commands::{add_server, close_server, get_servers, open_server, retrieve_key, retrieve_keys};
use core::{AppState, Database};
use log::{error, LevelFilter};
use log4rs::{
    append::{console::ConsoleAppender, file::FileAppender},
    config::{Logger, Root},
    encode::pattern::PatternEncoder,
    Config,
};
use std::path::Path;
use tauri::{Builder, Manager};
use tokio::sync::Mutex;
use utils::get_db_base_dir;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // let stdout = ConsoleAppender::builder()
    //     .encoder(Box::new(PatternEncoder::new(
    //         "[{d(%Y-%m-%d %H:%M:%S)} - {h({l})}] - {m}{n}",
    //     )))
    //     .build();
    // let file = FileAppender::builder()
    //     .append(true)
    //     .encoder(Box::new(PatternEncoder::new(
    //         "[{d(%Y-%m-%d %H:%M:%S)} - {l}] - {m}{n}",
    //     )))
    //     .build(Path::new("app.log"))
    //     .unwrap();
    // let config = Config::builder()
    //     .appender(log4rs::config::Appender::builder().build("stdout", Box::new(stdout)))
    //     .appender(log4rs::config::Appender::builder().build("file", Box::new(file)))
    //     .logger(Logger::builder().build("stdout", LevelFilter::Debug))
    //     .logger(Logger::builder().build("file", LevelFilter::Debug))
    //     .build(
    //         Root::builder()
    //             .appenders(vec!["stdout", "file"])
    //             .build(LevelFilter::Debug),
    //     )
    //     .unwrap();

    // log4rs::init_config(config).unwrap();
    log4rs::init_file(Path::new("logger.yml"), Default::default()).unwrap();

    Builder::default()
        .setup(|app| {
            let base_path = get_db_base_dir(app, tauri::is_dev())?;
            let db_path = Database::db_file_path(&base_path);
            let db_connection = Database::new(&db_path).map_err(|e| {
                error!("Failed to create database connection: {e}");
                format!("Failed to create database connection: {}", e)
            })?;

            let mut app_state = AppState::new();
            app_state.set_db_connection(Some(db_connection));

            app.manage(Mutex::new(app_state));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            retrieve_keys,
            add_server,
            get_servers,
            open_server,
            close_server,
            retrieve_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running redis GUI application");
}

#[cfg(test)]
mod tests {
    mod common;

    pub use common::*;
}
