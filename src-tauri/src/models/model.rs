use crate::core::Database;
use rusqlite::{params_from_iter, Error, ParamsFromIter, Row};
use std::fmt::Display;

pub trait Model: Display + Clone + PartialEq + Eq {
    /// Returns the table name for the model.
    fn table_name() -> &'static str;

    /// Saves the model to the database.
    fn save(&self, db: &Database) -> Result<(), String>;

    /// Queries the model by its ID.
    #[allow(dead_code)]
    fn find_by_id(id: &str, db: &Database) -> Result<Self, String>
    where
        Self: Sized;

    /// Creates a new model from a database row.
    fn from_row(row: &Row) -> Result<Self, Error>
    where
        Self: Sized;

    /// Converts the model's values to a vector of strings for database insertion.
    fn to_db_values(&self) -> Vec<String>;
    /// Converts the model's values to a safe parameter iterator for SQL queries.
    fn to_db_values_safe(&self) -> ParamsFromIter<Vec<String>> {
        params_from_iter(self.to_db_values())
    }

    /// Creates a new model in the database.
    fn create(&self, db: &Database) -> Result<Self, String>
    where
        Self: Sized;

    /// Deletes the model from the database.
    #[allow(dead_code)]
    fn delete(&self, db: &Database) -> Result<bool, String>
    where
        Self: Sized;

    fn get(db: &Database) -> Result<Vec<Self>, String>
    where
        Self: Sized;
}
