import { signAccessToken } from "../../src/utils/jwt";

export function generateAuthToken(userId: string) {
  return signAccessToken(userId);
}
