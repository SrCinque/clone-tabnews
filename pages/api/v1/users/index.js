import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import activantion from "models/activantion.js";
import authorization from "models/authorization";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);
export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function postHandler(request, response) {
  const userTryngToPost = request.query.username;

  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);
  const secureOutputValue = authorization.filterOutput(
    userTryngToPost,
    "read:user",
    newUser,
  );
  const activantionUser = await activantion.create(newUser.id);
  await activantion.sendEmailToUser(newUser, activantionUser);

  return response.status(201).json(secureOutputValue);
}
