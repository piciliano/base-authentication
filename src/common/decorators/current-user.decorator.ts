import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUserType } from 'src/auth/types';

interface RequestWithUser extends Request {
  user?: CurrentUserType;
}

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): CurrentUserType | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
