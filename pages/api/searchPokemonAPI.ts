import { NextApiRequest, NextApiResponse } from "next";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "db/pokemonCardsDB.sqlite");
const db = new Database(dbPath);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required and must be a string." });
  }

  const searchQuery = `%${query.toLowerCase()}%`;

  const tables = [
    { name: "cards" },
    { name: "attacks" },
    { name: "abilities" },
    { name: "weaknesses" },
    { name: "legalities" },
    { name: "images" },
    { name: "cardSet" },
  ];

  const results: Record<string, unknown[]> = {};

  tables.forEach(({ name }) => {
    const columns = db.prepare(`PRAGMA table_info(${name})`).all();
    const columnNames = (columns as { name: string }[]).map((col) => col.name);
    const whereClause = columnNames.map((col) => `LOWER(${col}) LIKE ?`).join(" OR ");
    const query = `SELECT * FROM ${name} WHERE ${whereClause}`;
    results[name] = db.prepare(query).all(...Array(columnNames.length).fill(searchQuery));
  });

  res.status(200).json(results);
}
