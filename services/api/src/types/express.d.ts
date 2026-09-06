import type { AccessTokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      societyId?: string;
      /** Raw request body bytes, captured by express.json()'s verify hook — needed for HMAC signature checks (Razorpay webhook). */
      rawBody?: Buffer;
    }
  }
}

export {};
