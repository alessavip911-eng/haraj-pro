
import { Router } from 'express';
import { prisma, authSchemas, hash, verify, signAccess, signRefresh, redis } from '../lib/core.js';
import jwt from 'jsonwebtoken';

export const router = Router();

router.post('/register', async (req, res) => {
  const parsed = authSchemas.register.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });
  const { username, password, phone, city } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return res.status(409).json({ error: 'username_taken' });
  const user = await prisma.user.create({
    data: { username, password: await hash(password), phone, city }
  });
  res.json({ user: { id: user.id, username: user.username } });
});

router.post('/login', async (req, res) => {
  const parsed = authSchemas.login.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload' });
  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verify(password, user.password))) return res.status(401).json({ error: 'invalid_credentials' });
  const access = signAccess({ sub: user.id, username: user.username });
  const refresh = signRefresh({ sub: user.id });
  res.json({ access, refresh, user: { id: user.id, username: user.username } });
});

router.post('/refresh', async (req, res) => {
  const { refresh } = req.body || {};
  try {
    const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET || 'dev') as any;
    const blacklisted = await redis.get(`bl:${refresh}`);
    if (blacklisted) return res.status(401).json({ error: 'token_revoked' });
    const access = signAccess({ sub: decoded.sub });
    res.json({ access });
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
});

router.post('/logout', async (req, res) => {
  const { refresh } = req.body || {};
  if (refresh) await redis.setex(`bl:${refresh}`, 60 * 60 * 24 * 7, '1');
  res.json({ ok: true });
});
