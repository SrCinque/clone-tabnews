import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";

const router = createRouter();
router.get(getHandler);
router.patch(patchHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);

  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const inputUserValues = request.body;

  const updatedUser = await user.update(username, inputUserValues);
  return response.status(200).json(updatedUser);
}
