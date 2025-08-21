
import { prisma, hash } from './lib/core.js';

async function main() {
  const u1 = await prisma.user.upsert({
    where: { username: 'seller1' },
    update: {},
    create: { username: 'seller1', password: await hash('pass123'), phone: '0500000001', city: 'الرياض' }
  });
  const u2 = await prisma.user.upsert({
    where: { username: 'buyer1' },
    update: {},
    create: { username: 'buyer1', password: await hash('pass123'), phone: '0500000002', city: 'جدة' }
  });

  await prisma.listing.createMany({
    data: [
      { title: 'تويوتا كامري 2018 نظيفة', description: 'السيارة على الشرط، ممشى 95 ألف، صيانة وكالة.', category: 'سيارات', price: 68000, city: 'الرياض', images: ['https://picsum.photos/seed/camry/600/400'], sellerId: u1.id },
      { title: 'آيفون 14 برو مستخدم', description: 'لون بنفسجي عميق، ذاكرة 256GB، مع الفاتورة.', category: 'جوالات', price: 3200, city: 'جدة', images: ['https://picsum.photos/seed/iphone/600/400'], sellerId: u1.id },
      { title: 'شقة 3 غرف للإيجار السنوي', description: 'شقة واسعة قريبة من الخدمات، يتوفر مواقف.', category: 'عقار', price: 45000, city: 'الدمام', images: ['https://picsum.photos/seed/apartment/600/400'], sellerId: u2.id },
    ]
  });
}

main().then(() => {
  console.log('Seeded');
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
