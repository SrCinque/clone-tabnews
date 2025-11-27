import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver";
import { NotFoundError } from "infra/errors";
const EXPIRES_IN_MILISECONDS = 15 * 60 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRES_IN_MILISECONDS);

  const newToken = runInsertQuery(userId, expiresAt);

  return newToken;
  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO
          user_activantion_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      `,
      values: [userId, expiresAt],
    });

    return result.rows[0];
  }
}

async function finOneById(tokenId) {
  const tokenFound = await selectQuery(tokenId);
  return tokenFound;

  async function selectQuery(tokenId) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM
        user_activantion_tokens
      WHERE
        id = $1
      AND
        used_at IS NULL
      AND
        expires_at > NOW()
      LIMIT
        1
    `,
      values: [tokenId],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Token de ativação não encontrado ou expirado",
        action: "Solicite um novo token de ativação.",
      });
    }

    return result.rows[0];
  }
}

async function sendEmailToUser(user, activantionToken) {
  await email.send({
    from: "FinTab <contato@gmail.com>",
    to: user.email,
    subject: "Ative seu cadastro no Fintab!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no FinTab!
    
${webserver.origin}/cadastro/activate-account?token=${activantionToken.id}

Atencionsamente,
equipe FinTab.
    `,
  });
}

const activantion = {
  sendEmailToUser,
  create,
  finOneById,
};

export default activantion;
