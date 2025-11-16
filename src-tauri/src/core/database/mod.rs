use rusqlite::{Connection, OpenFlags};
use std::path::{Path, PathBuf};

mod embedded {
    use refinery::embed_migrations;

    embed_migrations!("./db_migrations");
}

#[derive(Debug)]
pub struct Database {
    // Temp: temporary ignore dead code until functionalities are implemented
    #[allow(dead_code)]
    connection: Connection,
}

impl Database {
    pub fn new(path: &Path) -> Result<Self, String> {
        println!("Database Path: {:?}", path);
        let connection = Connection::open_with_flags(
            path,
            OpenFlags::SQLITE_OPEN_CREATE | OpenFlags::SQLITE_OPEN_READ_WRITE,
        );

        let mut connection = connection.map_err(|e| e.to_string())?;
        embedded::migrations::runner()
            .run(&mut connection)
            .map_err(|e| e.to_string())?;

        Ok(Self { connection })
    }

    // Temp: temporary ignore dead code until functionalities are implemented
    #[allow(dead_code)]
    pub fn get_connection(&self) -> &Connection {
        &self.connection
    }

    pub fn db_file_path(base_path: &Path) -> PathBuf {
        base_path.join("database.db")
    }
}
