import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import password from "models/password";
("models/password.js");
import { UnauthorizedError } from "infra/errors.js";
import authentication from "models/authentication.js";
import { RuleTester } from "eslint";

const router = createRouter();
router.post(postHandler);
export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );
  return response.status(201).json({});
}
