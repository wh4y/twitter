import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const { currentUser } = context.switchToHttp().getRequest<TypedRequest>();

    if (!currentUser) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
