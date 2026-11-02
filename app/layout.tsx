import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Madi SSS',
  description: 'Multilingual site',
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
