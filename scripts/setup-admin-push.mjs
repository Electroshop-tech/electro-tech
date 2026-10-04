import fs from "node:fs";
import webpush from "web-push";
import { randomBytes } from "node:crypto";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), true);
if (Boolean(process.env.VAPID_PUBLIC_KEY) !== Boolean(process.env.VAPID_PRIVATE_KEY)) throw new Error("Incomplete VAPID configuration; restore the matching key pair before continuing.");
const values = {};
if (!process.env.VAPID_PUBLIC_KEY) {
  const keys = webpush.generateVAPIDKeys();
  values.VAPID_PUBLIC_KEY = keys.publicKey;
  values.VAPID_PRIVATE_KEY = keys.privateKey;
}
if (!process.env.VAPID_SUBJECT) values.VAPID_SUBJECT = "mailto:contact@electroshop-tech.com";
if (!process.env.CRON_SECRET) values.CRON_SECRET = randomBytes(32).toString("hex");
if (Object.keys(values).length) fs.appendFileSync(".env.local", `\n# Admin browser push (keep these keys stable)\n${Object.entries(values).map(([key, value]) => `${key}=${value}`).join("\n")}\n`);
console.log("Local push configuration ready. Secrets saved in ignored .env.local; no credentials printed.");
