import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

async function create(inputValues) {
  await validateUniqueEmail(inputValues.email);
  await validateUniqueUserName(inputValues.username);

  const newUser = await runInsertQuery(inputValues);
  return newUser;

  async function validateUniqueEmail(email) {
    const result = await database.query({
      text: `
    SELECT 
      email
    FROM
      users
    WHERE
      LOWER(email) = LOWER($1)    
    ;`,
      values: [email],
    });
    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "Email já cadastrado",
        action: "Utilize outro email para cadastrar o usuário",
      });
    }
  }

  async function validateUniqueUserName(username) {
    const result = await database.query({
      text: `
    SELECT 
      username
    FROM
      users
    WHERE
      LOWER(username) = LOWER($1)    
    ;`,
      values: [username],
    });
    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "Username já cadastrado",
        action: "Atualize os dados enviados e tente novamente.",
      });
    }
  }

  async function runInsertQuery(inputValues) {
    const result = await database.query({
      text: `INSERT INTO 
      users (username, email, password) 
    VALUES 
      ($1, $2, $3)
    RETURNING *
    ;`,
      values: [inputValues.username, inputValues.email, inputValues.password],
    });
    return result.rows[0];
  }
}

const user = {
  create,
};

export default user;
