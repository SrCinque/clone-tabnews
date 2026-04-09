import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import session from "models/session";
import authorization from "models/authorization";

const router = createRouter();
export default router.handler({ onError: controller.onErrorHandler });

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:session"), getHandler);
router.delete(deleteHandler);

async function getHandler(request, response) {
  const userTryngToGet = request.context.user;
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewedSessionObject.token, response);

  const userFound = await user.findOneById(sessionObject.user_id);

  const secureOutputValue = authorization.filterOutput(
    userTryngToGet,
    "read:user:self",
    userFound,
  );
  response.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate");
  return response.status(200).json(secureOutputValue);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(response);
  return response.status(200).json(expiredSession);
}
