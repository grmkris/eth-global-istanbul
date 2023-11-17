import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

import * as schema from "../db/schema";

const sqlite = new Database("nw.sqlite");
export const db = drizzle(sqlite, { schema, logger: true });

export type db = typeof db;
