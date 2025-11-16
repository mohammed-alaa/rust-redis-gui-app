use rusqlite::{Connection, OpenFlags};
use std::path::{Path, PathBuf};

mod embedded {
    use refinery::embed_migrations;

    embed_migrations!("./db_migrations");
}

#[derive(Debug)]
pub struct Database {
    _connection: Connection,
}

impl Database {
    pub fn new(path: &Path) -> Result<Self, String> {
        println!("Database Path: {:?}", path);
        let db_connection = Connection::open_with_flags(
            path,
            OpenFlags::SQLITE_OPEN_CREATE | OpenFlags::SQLITE_OPEN_READ_WRITE,
        );

        if db_connection.is_err() {
            match db_connection.err() {
                Some(err) => return Err(err.to_string()),
                None => return Err("Unknown error".to_string()),
            }
        }

        let mut db_connection = db_connection.unwrap();
        embedded::migrations::runner()
            .run(&mut db_connection)
            .map_err(|e| e.to_string())?;

        Ok(Self {
            _connection: db_connection,
        })
    }

    pub fn db_file_path(base_path: &PathBuf) -> PathBuf {
        base_path.join("database.db")
    }
}
