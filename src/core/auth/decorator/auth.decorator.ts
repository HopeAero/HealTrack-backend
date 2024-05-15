import { SetMetadata, UnauthorizedException, UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "../guard/auth.guard";
import { RolesGuard } from "../guard/roles.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "./roles.decorator";
import { ApiException } from "@nanogiants/nestjs-swagger-api-exception-decorator";
import { AllRole } from "@src/constants";

export function Auth(roles: AllRole) {
  return applyDecorators(
    Roles(roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiException(() => UnauthorizedException, {
      description: "User is not authorized",
    }),
  );
}
