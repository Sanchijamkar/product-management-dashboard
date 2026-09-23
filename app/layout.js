import './globals.css';

export const metadata = {
  title: 'Nexgensis | Product Operations',
  description: 'Nexgensis product operations dashboard built with Next.js and DummyJSON.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
