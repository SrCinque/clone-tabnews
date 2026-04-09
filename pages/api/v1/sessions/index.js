import { createRouter } from "next-connect";
import controller from "infra/controller";
import session from "models/session.js";
import authentication from "models/authentication.js";
import authorization from "models/authorization.js";
import { ForbiddenError } from "infra/errors.js";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:session"), postHandler);
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
  console.log(authenticatedUser);
  const authorized = await authorization.can(
    authenticatedUser,
    "create:session",
  );

  if (authorized === false) {
    throw new ForbiddenError({
      message: "Você não possui permissão para criar uma sessão.",
      action: `Verifique se o seu usuário possui a feature `,
    });
  }

  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(newSession.token, response);
  const secureOutputValue = authorization.filterOutput(
    authenticatedUser,
    "read:session",
    newSession,
  );

  return response.status(201).json(secureOutputValue);
}
6;
