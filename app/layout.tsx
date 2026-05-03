import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'โหงวเฮ้ง — ดาวเทวา',
  description: 'Thai-Chinese Five Elements face reading powered by AI · อ่านดวงชะตาจากใบหน้า',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body style={{ margin: 0, background: '#0A0B1E', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
