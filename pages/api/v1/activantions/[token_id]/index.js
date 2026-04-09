import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activantion from "models/activantion.js";
import authorization from "models/authorization";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activantion_token"), patchHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function patchHandler(request, response) {
  const token_id = request.query.token_id;
  const userTryngToPatch = request.context.user;
  const validActivantionToken = await activantion.finOneById(token_id);
  await activantion.activateUserById(validActivantionToken.user_id);

  const usedActivantionToken = await activantion.markTokenAsUsed(token_id);
  const secureOutputValue = authorization.filterOutput(
    userTryngToPatch,
    "read:activantion_token",
    usedActivantionToken,
  );
  return response.status(200).json(secureOutputValue);
}
