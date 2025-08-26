import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller";

const router = createRouter();
router.get(getHandler);

/*function onNoMatchHandler(request, response) {
  return response.status(405);
}*/

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();
  const databaseVersionResult = await database.query("SHOW server_version;");
  const databseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionValue =
    databaseMaxConnectionResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseopenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseopenedConnectionsValue =
    databaseopenedConnectionsResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependecies: {
      database: {
        version: databseVersionValue,
        max_connections: parseInt(databaseMaxConnectionValue),
        opened_connections: databaseopenedConnectionsValue,
      },
    },
  });
}
