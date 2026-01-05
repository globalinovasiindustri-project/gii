import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env" });

async function applyMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    console.log("Applying migration 0007_add_location_ids_to_addresses...");

    // Read the migration SQL directly
    const migrationSQL = readFileSync(
      join(
        process.cwd(),
        "lib/db/migrations/0007_add_location_ids_to_addresses.sql"
      ),
      "utf-8"
    );

    // Split by newlines and execute each statement
    const statements = migrationSQL
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      console.log(`Executing: ${statement}`);
      await pool.query(statement);
    }

    console.log("✓ Migration applied successfully!");

    // Verify columns were added
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'addresses' 
      AND column_name IN ('province_id', 'city_id', 'district_id')
      ORDER BY column_name;
    `);

    console.log("\nVerified new columns:");
    result.rows.forEach((row) =>
      console.log(
        `  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      )
    );
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyMigration();
