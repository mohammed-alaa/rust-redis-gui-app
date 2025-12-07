use log::{LevelFilter, SetLoggerError};
use log4rs::{
    config::{Appender, Logger, Root},
    encode::pattern::PatternEncoder,
    Config, Handle,
};

#[cfg(any(test, dev))]
use log4rs::append::console::ConsoleAppender;
#[cfg(any(test, dev))]
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

#[cfg(all(not(test), not(dev)))]
use log4rs::append::file::FileAppender;
#[cfg(all(not(test), not(dev)))]
use std::path::Path;
#[cfg(all(not(test), not(dev)))]
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

pub fn init_logger() -> Result<Handle, SetLoggerError> {
    let (name, minimum_level, logger) = {
        #[cfg(any(test, dev))]
        {
            build_console_logger()
        }

        #[cfg(all(not(test), not(dev)))]
        {
            build_file_logger()
        }
    };

    let config = Config::builder()
        .appender(logger)
        .logger(Logger::builder().build(&name, minimum_level))
        .build(Root::builder().appender(&name).build(minimum_level))
        .unwrap();

    log4rs::init_config(config)
}
