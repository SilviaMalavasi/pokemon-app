-- limitlessSchema.sql
-- Schema for limitlessDecks table
CREATE TABLE IF NOT EXISTS limitlessDecks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  variantOf TEXT,
  cards TEXT NOT NULL
);
