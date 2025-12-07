use log::LevelFilter;
use tauri_plugin_log::{
    fern::colors::{Color, ColoredLevelConfig},
    Builder,
};
use time::{format_description, OffsetDateTime};

pub fn init_logger() -> Builder {
    tauri_plugin_log::Builder::new()
        .target(tauri_plugin_log::Target::new(
            tauri_plugin_log::TargetKind::LogDir {
                file_name: Some("logs".to_string()),
            },
        ))
        .level(match tauri::is_dev() {
            true => LevelFilter::Debug,
            false => LevelFilter::Warn,
        })
        .format(|out, message, record| {
            let now = OffsetDateTime::now_local().unwrap_or_else(|_| OffsetDateTime::now_utc());
            let format =
                format_description::parse("[year]-[month]-[day] [hour]:[minute]:[second]").unwrap();
            let timestamp = now.format(&format).unwrap();

            let colors = ColoredLevelConfig::new()
                .info(Color::Green)
                .warn(Color::Yellow)
                .error(Color::Red)
                .debug(Color::Blue);

            out.finish(format_args!(
                "[{} - {}] {}",
                timestamp,
                colors.color(record.level()),
                message
            ));
        })
}
