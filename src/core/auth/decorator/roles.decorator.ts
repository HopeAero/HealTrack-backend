import { SetMetadata } from '@nestjs/common';
import { AllRole } from '@src/constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AllRole[]) => SetMetadata(ROLES_KEY, roles);