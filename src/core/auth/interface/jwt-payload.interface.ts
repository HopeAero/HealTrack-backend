import { AllRole } from "@src/constants";

export interface JwtPayload {
  email: string;
  role: AllRole;
}