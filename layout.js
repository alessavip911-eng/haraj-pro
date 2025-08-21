
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{fontFamily:'system-ui', background:'#fafafa', color:'#111'}}>{children}</body>
    </html>
  )
}
