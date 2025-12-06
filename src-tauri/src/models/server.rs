use super::Model;
use crate::core::{AppError, Database};
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
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
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

    fn get(db: &Database) -> Result<Vec<Self>, AppError> {
        let sql = format!("SELECT * FROM {}", Self::table_name());
        log::debug!("Executing query: {}", sql);

        let mut stmt = db.get_connection().prepare(&sql).map_err(|e| {
            log::error!(
                "Failed to prepare statement while retrieving all servers: {}",
                e
            );
            AppError::DbQueryFailed
        })?;

        let servers_iter = stmt.query_map([], Self::from_row).map_err(|e| {
            log::error!(
                "Failed to execute query while retrieving all servers: {}",
                e
            );
            AppError::DbQueryFailed
        })?;

        let servers: Result<Vec<Self>, _> = servers_iter.collect();
        servers.map_err(|e| {
            log::error!("Failed to collect servers from query result: {}", e);
            AppError::DbQueryFailed
        })
    }

    fn create(&self, db: &Database) -> Result<Self, AppError>
    where
        Self: Sized,
    {
        let mut _self = self.clone();
        _self.id = Uuid::now_v7();
        _self.save(db)?;
        Ok(_self)
    }

    fn delete(&self, db: &Database) -> Result<bool, AppError>
    where
        Self: Sized,
    {
        let sql = format!("DELETE FROM {} WHERE id = ?", Self::table_name());
        db.get_connection()
            .execute(&sql, [&self.id.to_string()])
            .map(|_| true)
            .map_err(|_| AppError::DbQueryFailed)
    }

    fn save(&self, db: &Database) -> Result<(), AppError> {
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
            .map_err(|_| AppError::DbQueryFailed)?;
        Ok(())
    }

    fn find_by_id(id: &str, db: &Database) -> Result<Self, AppError> {
        let sql = format!("SELECT * FROM {} WHERE id = ? LIMIT 1", Self::table_name());
        log::debug!("Executing query: {}, ID: {}", sql, id);

        let mut stmt = db.get_connection().prepare(&sql).map_err(|e| {
            log::error!(
                "Failed to prepare statement while finding server by id {}: {}",
                id,
                e
            );
            AppError::DbQueryFailed
        })?;

        let row = stmt.query_row([id], Self::from_row).map_err(|e| {
            log::error!(
                "Failed to execute query while finding server by id {}: {}",
                id,
                e
            );
            AppError::DbQueryFailed
        })?;
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_server_new() {
        let server = Server::new();
        assert_eq!(server.id, Uuid::nil());
        assert_eq!(server.name, "");
        assert_eq!(server.address, "");
        assert_eq!(server.port, 0);
    }

    #[test]
    fn test_server_from_payload() {
        let server = Server::from_payload(
            "Test Server".to_string(),
            "localhost".to_string(),
            6379,
        );
        assert_eq!(server.id, Uuid::nil());
        assert_eq!(server.name, "Test Server");
        assert_eq!(server.address, "localhost");
        assert_eq!(server.port, 6379);
    }

    #[test]
    fn test_server_default() {
        let server = Server::default();
        assert_eq!(server.id, Uuid::nil());
        assert_eq!(server.name, "");
        assert_eq!(server.address, "");
        assert_eq!(server.port, 0);
    }

    #[test]
    fn test_server_display() {
        let server = Server::from_payload(
            "My Server".to_string(),
            "127.0.0.1".to_string(),
            6379,
        );
        let display = format!("{}", server);
        assert!(display.contains("My Server"));
        assert!(display.contains("127.0.0.1"));
        assert!(display.contains("6379"));
    }

    #[test]
    fn test_server_equality_same_id() {
        let mut server1 = Server::new();
        let id = Uuid::new_v4();
        server1.id = id;
        server1.name = "Server 1".to_string();

        let mut server2 = Server::new();
        server2.id = id;
        server2.name = "Server 2".to_string();

        assert_eq!(server1, server2);
    }

    #[test]
    fn test_server_equality_different_id() {
        let mut server1 = Server::new();
        server1.id = Uuid::new_v4();

        let mut server2 = Server::new();
        server2.id = Uuid::new_v4();

        assert_ne!(server1, server2);
    }

    #[test]
    fn test_server_clone() {
        let server = Server::from_payload(
            "Test".to_string(),
            "localhost".to_string(),
            6379,
        );
        let cloned = server.clone();
        assert_eq!(server.name, cloned.name);
        assert_eq!(server.address, cloned.address);
        assert_eq!(server.port, cloned.port);
    }

    #[test]
    fn test_server_table_name() {
        assert_eq!(Server::table_name(), "servers");
    }

    #[test]
    fn test_server_to_db_values() {
        let server = Server::from_payload(
            "Test".to_string(),
            "localhost".to_string(),
            6379,
        );
        let values = server.to_db_values();
        assert_eq!(values.len(), 6);
        assert_eq!(values[1], "Test");
        assert_eq!(values[2], "localhost");
        assert_eq!(values[3], "6379");
    }

    #[test]
    fn test_server_serialization() {
        let server = Server::from_payload(
            "Test".to_string(),
            "localhost".to_string(),
            6379,
        );
        let json = serde_json::to_value(&server).unwrap();
        assert_eq!(json["name"], "Test");
        assert_eq!(json["address"], "localhost");
        assert_eq!(json["port"], 6379);
    }

    #[test]
    fn test_server_create_and_find() {
        let db = Database::new_in_memory().unwrap();
        let server = Server::from_payload(
            "Test Server".to_string(),
            "localhost".to_string(),
            6379,
        );

        let created = server.create(&db).unwrap();
        assert_ne!(created.id, Uuid::nil());

        let found = Server::find_by_id(&created.id.to_string(), &db).unwrap();
        assert_eq!(found, created);
    }

    #[test]
    fn test_server_get_empty() {
        let db = Database::new_in_memory().unwrap();
        let servers = Server::get(&db).unwrap();
        assert!(servers.is_empty());
    }

    #[test]
    fn test_server_get_with_data() {
        let db = Database::new_in_memory().unwrap();
        let server1 = Server::from_payload(
            "Server 1".to_string(),
            "localhost".to_string(),
            6379,
        );
        let server2 = Server::from_payload(
            "Server 2".to_string(),
            "localhost".to_string(),
            6380,
        );

        server1.create(&db).unwrap();
        server2.create(&db).unwrap();

        let servers = Server::get(&db).unwrap();
        assert_eq!(servers.len(), 2);
    }

    #[test]
    fn test_server_delete() {
        let db = Database::new_in_memory().unwrap();
        let server = Server::from_payload(
            "Test Server".to_string(),
            "localhost".to_string(),
            6379,
        );

        let created = server.create(&db).unwrap();
        assert!(created.delete(&db).unwrap());

        let result = Server::find_by_id(&created.id.to_string(), &db);
        assert!(result.is_err());
    }

    #[test]
    fn test_server_save_updates() {
        let db = Database::new_in_memory().unwrap();
        let server = Server::from_payload(
            "Original".to_string(),
            "localhost".to_string(),
            6379,
        );

        let mut created = server.create(&db).unwrap();
        created.name = "Updated".to_string();
        created.save(&db).unwrap();

        let found = Server::find_by_id(&created.id.to_string(), &db).unwrap();
        assert_eq!(found.name, "Updated");
    }
}
