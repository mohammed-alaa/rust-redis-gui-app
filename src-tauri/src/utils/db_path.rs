use std::{
    env,
    path::{Path, PathBuf},
};
use tauri::{App, Manager};

pub fn get_db_base_dir(app: &App, is_dev: bool) -> Result<PathBuf, String> {
    if is_dev {
        let current_dir =
            env::current_dir().map_err(|e| format!("Failed to get current directory: {}", e))?;
        Ok(Path::new(&current_dir)
            .parent()
            .ok_or("Current directory has no parent")?
            .to_path_buf())
    } else {
        app.path()
            .app_data_dir()
            .map_err(|e| format!("Failed to get app data directory: {}", e))
    }
}
