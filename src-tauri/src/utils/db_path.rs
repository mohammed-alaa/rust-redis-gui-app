use std::{
    env,
    path::{Path, PathBuf},
};
use tauri::{App, Manager};

pub fn get_db_base_dir(app: &App, is_dev: bool) -> Result<PathBuf, String> {
    if is_dev {
        let current_dir = env::current_dir().map_err(|e| {
            log::error!("Error getting current directory: {}", e);
            format!("Failed to get current directory: {}", e)
        })?;
        Ok(Path::new(&current_dir)
            .parent()
            .ok_or_else(|| {
                log::error!("Error determining parent directory of current directory");
                "Failed to determine database directory: current directory has no parent"
            })?
            .to_path_buf())
    } else {
        let app_data_dir = app.path().app_data_dir().map_err(|e| {
            log::error!("Error getting app data directory: {}", e);
            format!("Failed to get app data directory: {}", e)
        })?;

        if !app_data_dir.exists() {
            std::fs::create_dir_all(&app_data_dir).map_err(|e| {
                log::error!(
                    "Error creating app data directory at {:?}: {}",
                    app_data_dir,
                    e
                );
                format!(
                    "Failed to create app data directory at {:?}: {}",
                    app_data_dir, e
                )
            })?;
        }

        Ok(app_data_dir)
    }
}
