
import { Router } from 'express';
import { prisma } from '../lib/core.js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

export const router = Router();

function requireAuth(req, res, next) {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ error: 'missing_auth' });
  const token = hdr.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev') as any;
    (req as any).userId = decoded.sub;
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}

router.get('/', async (req, res) => {
  const q = (req.query.q as string) || '';
  const category = (req.query.category as string) || undefined;
  const city = (req.query.city as string) || undefined;
  const sort = (req.query.sort as string) || 'new';
  const page = Number(req.query.page || 1);
  const pageSize = Math.min(50, Number(req.query.pageSize || 12));
  const where: any = {
    AND: [
      q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {},
      category ? { category } : {},
      city ? { city } : {}
    ]
  };
  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: sort === 'priceAsc' ? { price: 'asc' } : sort === 'priceDesc' ? { price: 'desc' } : { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.listing.count({ where })
  ]);
  res.json({ items, total, page, pageSize });
});

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string().min(2),
  price: z.number().int().nonnegative(),
  city: z.string().optional(),
  images: z.array(z.string().url()).min(1)
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.listing.findUnique({ where: { id }, include: { seller: { select: { id: true, username: true, phone: true, city: true } } } });
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });
  const userId = (req as any).userId as number;
  const created = await prisma.listing.create({
    data: { ...parsed.data, sellerId: userId }
  });
  res.status(201).json(created);
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).userId as number;
  const item = await prisma.listing.findUnique({ where: { id } });
  if (!item || item.sellerId !== userId) return res.status(403).json({ error: 'forbidden' });
  const updated = await prisma.listing.update({ where: { id }, data: req.body });
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).userId as number;
  const item = await prisma.listing.findUnique({ where: { id } });
  if (!item || item.sellerId !== userId) return res.status(403).json({ error: 'forbidden' });
  await prisma.listing.delete({ where: { id } });
  res.json({ ok: true });
});
