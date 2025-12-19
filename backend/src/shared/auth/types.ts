import { Request } from 'express';

/**
 * Express request augmented by JWT-authenticated user payload.
 *
 * The `user` claims originate from our JWT and are injected by the `JwtAuthGuard`.
 * - `id`: UUID of the user (mapped from `sub` claim)
 * - `username`: human-friendly unique name
 * - `role`: authorization role used by `RolesGuard`
 */
export interface AuthenticatedRequest extends Request {
  user: { id: string; username: string; role: 'admin' | 'user' };
}
