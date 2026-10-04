// Explicit, one-time deployment repair. Credentials stay inside Vercel.
import { spawnSync } from "node:child_process";

if (!process.env.ORDER_DATABASE_REPAIR) process.exit(0);
if (!process.env.DATABASE_URL) throw new Error("Database configuration missing.");
const prisma = (args, input) => {
  const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", ...args], { encoding: "utf8", input });
  if (result.status !== 0) throw new Error(result.stderr || "Database schema command failed.");
  return result.stdout;
};
const changes = prisma(["migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--script"]);
if (/\b(DROP\s+(TABLE|COLUMN|TYPE)|TRUNCATE|DELETE\s+FROM)\b/i.test(changes)) {
  throw new Error("Repair stopped: schema changes could delete existing data.");
}
prisma(["db", "execute", "--stdin"], changes);
console.log("Order database schema repaired without deleting existing data.");
