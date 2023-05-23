import type { Metadata } from 'next';

import StyledComponentsRegistry from '../lib/registry';

export const metadata: Metadata = {
  title: 'Dutch Houses',
  description: 'Generator of Dutch houses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
