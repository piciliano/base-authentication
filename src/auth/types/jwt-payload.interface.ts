export interface JwtPayload {
  readonly email: string;
  readonly sub: string;
  readonly role: string;
}
