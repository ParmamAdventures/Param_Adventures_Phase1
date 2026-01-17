import bodyParser from "body-parser";

/**
 * Middleware to capture raw request body as Buffer for signature verification.
 * Used for Razorpay webhook signature verification which requires raw body.
 * @type {express.RequestHandler}
 */
export const rawBodyMiddleware = bodyParser.raw({
  type: "application/json",
});
