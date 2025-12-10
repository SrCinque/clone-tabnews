import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";

const router = createRouter();
router.post(postHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function postHandler(request, response) {
  const email = request.body.email;
  const password = request.body.password;
  const userAuthenticated = await authentication.getAuthenticatedUser(
    email,
    password,
  );
  return response.status(200).json(userAuthenticated);
}
