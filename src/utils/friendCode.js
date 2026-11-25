import { randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const generateFriendCode = (length = 8) =>
  Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');