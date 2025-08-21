
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { z } from 'zod';
import { S3Client } from '@aws-sdk/client-s3';
import Redis from 'ioredis';

export const prisma = new PrismaClient();
export const redis = new Redis(process.env.REDIS_URL);

export const s3 = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_USE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || ''
  }
});

export const cfg = {
  bucket: process.env.S3_BUCKET || 'haraj-media',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev',
  accessExp: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshExp: process.env.JWT_REFRESH_EXPIRES || '7d'
};

export const authSchemas = {
  register: z.object({
    username: z.string().min(3).max(24),
    password: z.string().min(6),
    phone: z.string().optional(),
    city: z.string().optional()
  }),
  login: z.object({
    username: z.string(),
    password: z.string()
  })
};

export async function hash(pw: string) { return argon2.hash(pw); }
export async function verify(pw: string, hashv: string) { return argon2.verify(hashv, pw); }

export function signAccess(payload: any) {
  return jwt.sign(payload, cfg.jwtAccessSecret, { expiresIn: cfg.accessExp });
}
export function signRefresh(payload: any) {
  return jwt.sign(payload, cfg.jwtRefreshSecret, { expiresIn: cfg.refreshExp });
}
