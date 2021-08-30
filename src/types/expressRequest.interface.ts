import { UserEntity } from '@app/user/user.entity';
import { Request } from 'express';

export interface ExpressRequestInterface extends Request {
    user?: UserEntity
}