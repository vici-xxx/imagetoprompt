import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

const connectionString = process.env.POSTGRES_URL;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
});
