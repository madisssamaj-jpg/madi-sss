import type { Metadata } from 'next';
import '../globals.css';
import Nav from '../components/Nav';

export const metadata: Metadata = {
  title: 'Madi SSS',
  description: 'Multilingual site',
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Nav />
        {children}
      </body>
    </html>
  );
}

