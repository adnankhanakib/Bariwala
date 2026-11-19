import type { Request } from 'express';

export interface AuthUser {
    id: number;
    email: string;
    role: string;
}

export type AuthRequest = Request & { user: AuthUser };