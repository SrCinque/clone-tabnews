import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const allowMethod = ["GET", "POST"];
  if (!allowMethod.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" no allowed`,
    });
  }
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationsOptions = {
      databaseUrl: dbClient,
      dryRun: false,
      dir: join("infra", "migrations"),
      direction: "up",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationsOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
