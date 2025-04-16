import { NextApiRequest, NextApiResponse } from "next";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "db/pokemonCardsDB.db");
const db = new Database(dbPath);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(results);
}
