import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";
import password from "models/password.js";

async function findOneById(userId) {
  const userfound = await runSelectQuery(userId);

  return userfound;
  async function runSelectQuery(userId) {
    const result = await database.query({
      text: `
        SELECT 
          *
        FROM
          users
        WHERE
          id = $1
        LIMIT 
          1    
        ;`,
      values: [userId],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado",
        action: "Verifique o username e tente novamente.",
      });
    }
    return result.rows[0];
  }
}

async function findOneByUsername(username) {
  const userfound = await runSelectQuery(username);

  return userfound;
  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
        SELECT 
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT 
          1    
        ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado",
        action: "Verifique o username e tente novamente.",
      });
    }
    return result.rows[0];
  }
}

async function findOneByEmail(email) {
  const userfound = await runSelectQuery(email);

  return userfound;
  async function runSelectQuery(email) {
    const result = await database.query({
      text: `
        SELECT 
          *
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        LIMIT 
          1    
        ;`,
      values: [email],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado",
        action: "Verifique o email e tente novamente.",
      });
    }
    return result.rows[0];
  }
}

async function create(inputValues) {
  await validateUniqueUserName(inputValues.username);
  await validateUniqueEmail(inputValues.email);
  await hashPasswordInObject(inputValues);

  const newUser = await runInsertQuery(inputValues);
  return newUser;

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

async function update(username, inputUserValues) {
  const currentUser = await findOneByUsername(username);
  if ("username" in inputUserValues) {
    await validateUniqueUserName(inputUserValues.username);
  }

  if ("email" in inputUserValues) {
    await validateUniqueEmail(inputUserValues.email);
  }

  if ("password" in inputUserValues) {
    await hashPasswordInObject(inputUserValues);
  }

  const userWithNewValues = { ...currentUser, ...inputUserValues };
  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const result = await database.query({
      text: `
      UPDATE 
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING 
        *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return result.rows[0];
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
      action: "Utilize outro email para realizar está operação",
    });
  }
}

async function hashPasswordInObject(inputValues) {
  const hashPassword = await password.hash(inputValues.password);
  inputValues.password = hashPassword;
}

const user = {
  create,
  findOneByUsername,
  update,
  findOneByEmail,
  findOneById,
};

export default user;
