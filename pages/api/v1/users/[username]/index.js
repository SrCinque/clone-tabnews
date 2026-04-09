import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import authorization from "models/authorization.js";
import { ForbiddenError } from "infra/errors.js";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(request, response) {
  const userTryingToget = request.context.user;

  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);

  const secureOutputValue = authorization.filterOutput(
    userTryingToget,
    "read:user",
    userFound,
  );

  return response.status(200).json(secureOutputValue);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const inputUserValues = request.body;

  const userTryngToPatch = request.context.user;
  const targetUser = await user.findOneByUsername(username);

  if (!authorization.can(userTryngToPatch, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para outro usuário",
      action:
        "Verifique se você possui a feature para atualizar outros usuários",
    });
  }

  const updatedUser = await user.update(username, inputUserValues);
  const secureOutputValue = authorization.filterOutput(
    userTryngToPatch,
    "read:user",
    updatedUser,
  );
  return response.status(200).json(secureOutputValue);
}
