use log::{debug, error, warn};
use rusqlite::{Connection, OpenFlags};
use std::path::{Path, PathBuf};

mod embedded {
    use refinery::embed_migrations;

    embed_migrations!("./db_migrations");
}

#[derive(Debug)]
pub struct Database {
    connection: Connection,
}

impl Database {
    pub fn new(path: &Path) -> Result<Self, String> {
        let connection = Connection::open_with_flags(
            path,
            OpenFlags::SQLITE_OPEN_CREATE | OpenFlags::SQLITE_OPEN_READ_WRITE,
        );

        let mut connection = connection.map_err(|e| {
            error!("Error opening database connection: {}", e.to_string());
            e.to_string()
        })?;
        embedded::migrations::runner()
            .run(&mut connection)
            .map_err(|e| {
                error!("Error running migration: {} ", e.to_string());
                e.to_string()
            })?;

        debug!("Database is ready @ {:?}", path);
        Ok(Self { connection })
    }

    #[cfg(test)]
    pub fn new_in_memory() -> Result<Self, String> {
        let mut connection = Connection::open_in_memory().map_err(|e| {
            error!(
                "Error opening in-memory database connection: {}",
                e.to_string()
            );
            e.to_string()
        })?;

        embedded::migrations::runner()
            .run(&mut connection)
            .map_err(|e| {
                error!("Error running migration in-memory DB: {}", e.to_string());
                e.to_string()
            })?;

        debug!("In-memory Database is ready");
        Ok(Self { connection })
    }

    pub fn get_connection(&self) -> &Connection {
        &self.connection
    }

    pub fn db_file_path(base_path: &Path) -> PathBuf {
        base_path.join("database.db")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{env::temp_dir, fs};

    #[test]
    fn test_database_creation() {
        let temp_dir = temp_dir();
        let db_path = Database::db_file_path(temp_dir.as_path());

        let db = Database::new(&db_path);
        assert!(db.is_ok());

        db.unwrap().connection.close().unwrap();
        fs::remove_file(db_path).unwrap();
    }

    #[test]
    fn test_in_memory_database_creation() {
        let db = Database::new_in_memory();
        assert!(db.is_ok());
        assert_eq!(db.unwrap().connection.path(), Some(""));
    }

    #[test]
    fn test_db_file_path() {
        let base_path = Path::new("/some/base/path");
        let expected_path = base_path.join("database.db");
        let db_path = Database::db_file_path(base_path);
        assert_eq!(db_path, expected_path);
    }

    #[test]
    fn test_get_connection() {
        assert!(Database::new_in_memory().is_ok());
    }

    #[test]
    fn test_migrations_run() {
        let db = Database::new_in_memory();
        assert!(db.is_ok());
        assert!(db
            .unwrap()
            .connection
            .table_exists(None, "servers")
            .unwrap());
    }
}
