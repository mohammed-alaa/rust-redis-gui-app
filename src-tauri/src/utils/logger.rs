use log::{LevelFilter, SetLoggerError};
use log4rs::{
    append::{console::ConsoleAppender, file::FileAppender},
    config::{Appender, Logger, Root},
    encode::pattern::PatternEncoder,
    Config, Handle,
};
use std::path::Path;

fn build_console_logger() -> (String, LevelFilter, Appender) {
    let name = "console".to_string();
    let logger = log4rs::config::Appender::builder().build(
        name.clone(),
        Box::new(
            ConsoleAppender::builder()
                .encoder(Box::new(PatternEncoder::new(
                    "[{d(%Y-%m-%d %H:%M:%S)} - {h({l})}] - {m}{n}",
                )))
                .build(),
        ),
    );

    (name, LevelFilter::Debug, logger)
}

fn build_file_logger() -> (String, LevelFilter, Appender) {
    let name = "file".to_string();
    let logger = log4rs::config::Appender::builder().build(
        name.clone(),
        Box::new(
            FileAppender::builder()
                .append(true)
                .encoder(Box::new(PatternEncoder::new(
                    "[{d(%Y-%m-%d %H:%M:%S)} - {l}] - {m}{n}",
                )))
                .build(Path::new("app.log"))
                .unwrap(),
        ),
    );

    (name, LevelFilter::Warn, logger)
}

pub fn init_logger(is_dev: bool) -> Result<Handle, SetLoggerError> {
    let (name, minimum_level, logger) = match is_dev {
        true => build_console_logger(),
        false => build_file_logger(),
    };

    let config = Config::builder()
        .appender(logger)
        .logger(Logger::builder().build(&name, minimum_level))
        .build(Root::builder().appender(&name).build(minimum_level))
        .unwrap();

    log4rs::init_config(config)
}
