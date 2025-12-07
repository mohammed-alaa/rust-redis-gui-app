use log::LevelFilter;
use tauri_plugin_log::{
    fern::colors::{Color, ColoredLevelConfig},
    Builder,
};
use time::{macros::format_description, OffsetDateTime};

/// Initializes the application logger with environment-based configuration.
///
/// Configures logging to write to a file in the log directory with colored output.
/// Log level is set to Debug in development mode and Warn in production.
/// Log messages are formatted with a timestamp and colored log level.
///
/// # Returns
/// A `Builder` that should be built and registered as a Tauri plugin.
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
            let format = format_description!("[year]-[month]-[day] [hour]:[minute]:[second]");

            let colors = ColoredLevelConfig::new()
                .info(Color::Green)
                .warn(Color::Yellow)
                .error(Color::Red)
                .debug(Color::Blue);

            out.finish(format_args!(
                "[{} - {}] {}",
                now.format(&format)
                    .unwrap_or_else(|_| now.unix_timestamp().to_string()),
                colors.color(record.level()),
                message
            ));
        })
}
