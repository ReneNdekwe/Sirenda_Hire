#!/usr/bin/env node
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

// Connect to database and run migrations
async function main() {
  console.log("Connecting to database...");
  
  try {
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);
    
    console.log("Running migrations...");
    
    await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
    
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

main();