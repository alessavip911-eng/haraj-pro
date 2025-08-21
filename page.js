
'use client';
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function NewListing() {
  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('access');
    const data = Object.fromEntries(new FormData(e.target).entries());
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      price: Number(data.price),
      city: data.city,
      images: data.image ? [data.image] : []
    };
    const res = await fetch(`${API}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (res.ok) location.href = `/listing/${json.id}`;
    else alert('خطأ: ' + (json.error || ''));
  }

  async function loginDemo() {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username: 'seller1', password: 'pass123' })
    });
    const json = await res.json();
    localStorage.setItem('access', json.access);
    alert('تم تسجيل الدخول كمستخدم تجريبي');
  }

  return (
    <div className="container">
      <div className="header">
        <a className="btn" href="/">← رجوع</a>
        <h1 style={{marginInlineStart:8}}>إضافة إعلان</h1>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <input name="title" placeholder="العنوان *" required />
        <select name="category" required>
          <option value="">القسم *</option>
          <option>سيارات</option>
          <option>جوالات</option>
          <option>عقار</option>
        </select>
        <input name="price" type="number" placeholder="السعر (ر.س) *" required />
        <input name="city" placeholder="المدينة" />
        <input name="image" placeholder="رابط الصورة (أو لاحقًا رفع)" />
        <textarea name="description" placeholder="الوصف"></textarea>
        <div style={{display:'flex', gap:8}}>
          <button className="btn" type="submit">نشر</button>
          <button className="btn" type="button" onClick={loginDemo}>تسجيل دخول تجريبي</button>
        </div>
      </form>
    </div>
  )
}
