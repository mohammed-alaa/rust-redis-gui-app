use super::Model;
use crate::core::Database;
use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Server {
    id: String,
    name: String,
    address: String,
    port: u16,
    created_at: String,
    updated_at: String,
}

impl Server {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn from_payload(name: String, address: String, port: u16) -> Self {
        Self {
            name,
            address,
            port,
            ..Self::new()
        }
    }
}

impl Model for Server {
    fn table_name() -> &'static str {
        "servers"
    }

    fn get(db: &Database) -> Result<Vec<Self>, String> {
        let sql = format!("SELECT * FROM {}", Self::table_name());

        let mut stmt = db
            .get_connection()
            .prepare(&sql)
            .map_err(|e| e.to_string())?;

        let servers_iter = stmt
            .query_map([], Self::from_row)
            .map_err(|e| e.to_string())?;

        let servers: Result<Vec<Self>, _> = servers_iter.collect();
        servers.map_err(|e| e.to_string())
    }

    fn create(&self, db: &Database) -> Result<Self, String>
    where
        Self: Sized,
    {
        let mut _self = self.clone();
        _self.id = Uuid::now_v7().to_string();
        _self.save(db)?;
        Ok(_self)
    }

    fn delete(&self, db: &Database) -> Result<bool, String>
    where
        Self: Sized,
    {
        let sql = format!("DELETE FROM {} WHERE id = ?", Self::table_name());
        db.get_connection()
            .execute(&sql, [&self.id])
            .map(|_| true)
            .map_err(|e| e.to_string())
    }

    fn save(&self, db: &Database) -> Result<(), String> {
        let placeholders = "?,"
            .repeat(self.to_db_values().len())
            .trim_end_matches(',')
            .to_string();

        let sql = format!(
            "INSERT OR REPLACE INTO {} VALUES ({})",
            Self::table_name(),
            placeholders
        );

        db.get_connection()
            .execute(&sql, self.to_db_values_safe())
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    fn find_by_id(id: &str, db: &Database) -> Result<Self, String> {
        let sql = format!("SELECT * FROM {} WHERE id = ? LIMIT 1", Self::table_name());

        let mut stmt = db
            .get_connection()
            .prepare(&sql)
            .map_err(|e| e.to_string())?;

        let row = stmt
            .query_row([id], Self::from_row)
            .map_err(|e| e.to_string())?;
        Ok(row)
    }

    fn from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            id: row.get("id")?,
            name: row.get("name")?,
            address: row.get("address")?,
            port: row.get("port")?,
            created_at: row.get("created_at")?,
            updated_at: row.get("updated_at")?,
        })
    }

    fn to_db_values(&self) -> Vec<String> {
        vec![
            self.id.clone(),
            self.name.clone(),
            self.address.clone(),
            self.port.to_string(),
            self.created_at.clone(),
            self.updated_at.clone(),
        ]
    }
}

impl fmt::Display for Server {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Server {{ id: {}, name: {}, address: {}, port: {} }}",
            self.id, self.name, self.address, self.port
        )
    }
}

impl PartialEq for Server {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

impl Eq for Server {}

impl Clone for Server {
    fn clone(&self) -> Self {
        Self {
            // TODO: check if generating new id is necessary
            id: self.id.clone(),
            name: self.name.clone(),
            address: self.address.clone(),
            port: self.port,
            created_at: self.created_at.clone(),
            updated_at: self.updated_at.clone(),
        }
    }
}
