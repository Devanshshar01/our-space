import { createHash, randomBytes } from 'node:crypto';
import { INVITATION_TOKEN_BYTES } from './validation';

export function generateRawTokenHex(): string {
  // Returns URL-safe hex token (64 chars for 32 bytes).
  return randomBytes(INVITATION_TOKEN_BYTES).toString('hex');
}

export function generateInvitationToken(): string {
  return generateRawTokenHex();
}

export function hashInvitationToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}