import cripto from "crypto";
import database from "infra/database";

const EXPIRANTION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 dias

async function findOneValidByToken(sessionToken) {
  const sessionFound = await selectQuery(sessionToken);

  return sessionFound;

  async function selectQuery(sessionToken) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
      AND 
        expires_at > NOW()
      LIMIT
        1
    `,
      values: [sessionToken],
    });

    return result.rows[0];
  }
}

async function create(userId) {
  const token = cripto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRANTION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;
  async function runInsertQuery(token, userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      `,
      values: [token, userId, expiresAt],
    });

    return result.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  EXPIRANTION_IN_MILLISECONDS,
};

export default session;
