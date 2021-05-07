import {
    Injectable,
    ExecutionContext,
    ForbiddenException,
    CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>(
            'roles',
            context.getHandler(),
        );
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return this.matchRoles(roles, user.roles);
    }

    matchRoles(roles: string[], userRoles: any) {
        const hasRole = () => userRoles.some((role) => roles.includes(role));
        if (!(userRoles && hasRole())) {
            throw new ForbiddenException('Forbidden');
        }
        return userRoles && hasRole();
    }
}
