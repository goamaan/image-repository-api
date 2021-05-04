import { RolesBuilder } from 'nest-access-control';

export enum AppRoles {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export const roles = new RolesBuilder();

roles
    .grant(AppRoles.USER)
    .readOwn('user')
    .updateOwn('user')
    .deleteOwn('user')
    .updateOwn('image')
    .deleteOwn('image')
    .grant(AppRoles.ADMIN)
    .readAny('users')
    .updateAny('users')
    .deleteAny('users')
    .readAny('images')
    .updateAny('images')
    .deleteAny('images');
