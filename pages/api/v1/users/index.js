import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import activantion from "models/activantion.js";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);
export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function postHandler(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);
  const activantionUser = await activantion.create(newUser.id);
  await activantion.sendEmailToUser(newUser, activantionUser);

  return response.status(201).json(newUser);
}
