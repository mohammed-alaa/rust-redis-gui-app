use super::Model;
use crate::core::Database;
use serde::{Deserialize, Serialize};
use std::fmt;
use time::{format_description::well_known::Rfc3339, OffsetDateTime};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Eq, Clone)]
pub struct Server {
    pub id: Uuid,
    pub name: String,
    pub address: String,
    pub port: u16,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
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

impl Default for Server {
    fn default() -> Self {
        Self {
            id: Uuid::nil(),
            name: String::new(),
            address: String::new(),
            port: 0,
            created_at: OffsetDateTime::now_utc(),
            updated_at: OffsetDateTime::now_utc(),
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
            .map_err(|e| format!("Failed to prepare statement: {}", e))?;

        let servers_iter = stmt
            .query_map([], Self::from_row)
            .map_err(|e| format!("Failed to query servers: {}", e))?;

        let servers: Result<Vec<Self>, _> = servers_iter.collect();
        servers.map_err(|e| format!("Failed to fetch servers: {}", e))
    }

    fn create(&self, db: &Database) -> Result<Self, String>
    where
        Self: Sized,
    {
        let mut _self = self.clone();
        _self.id = Uuid::now_v7();
        _self.save(db)?;
        Ok(_self)
    }

    fn delete(&self, db: &Database) -> Result<bool, String>
    where
        Self: Sized,
    {
        let sql = format!("DELETE FROM {} WHERE id = ?", Self::table_name());
        db.get_connection()
            .execute(&sql, [&self.id.to_string()])
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
        let id_str: String = row.get("id")?;
        let id = Uuid::parse_str(&id_str).map_err(|e| {
            rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(e))
        })?;

        Ok(Self {
            id,
            name: row.get("name")?,
            address: row.get("address")?,
            port: row.get("port")?,
            created_at: row.get("created_at")?,
            updated_at: row.get("updated_at")?,
        })
    }

    fn to_db_values(&self) -> Vec<String> {
        vec![
            self.id.to_string(),
            self.name.clone(),
            self.address.clone(),
            self.port.to_string(),
            self.created_at.format(&Rfc3339).unwrap(),
            self.updated_at.format(&Rfc3339).unwrap(),
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
