import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import session from "models/session";

const router = createRouter();
router.get(getHandler);
router.delete(deleteHandler);

export default router.handler({ onError: controller.onErrorHandler });

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewedSessionObject.token, response);

  const userFound = await user.findOneById(sessionObject.user_id);

  response.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate");
  return response.status(200).json(userFound);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(response);
  return response.status(200).json(expiredSession);
}
