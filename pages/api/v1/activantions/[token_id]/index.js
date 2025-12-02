import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activantion from "models/activantion.js";

const router = createRouter();
router.patch(patchHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function patchHandler(request, response) {
  const token_id = request.query.token_id;
  const validActivantionToken = await activantion.finOneById(token_id);
  const usedActivantionToken = await activantion.markTokenAsUsed(token_id);
  await activantion.activateUserById(validActivantionToken.user_id);
  return response.status(200).json(usedActivantionToken);
}
