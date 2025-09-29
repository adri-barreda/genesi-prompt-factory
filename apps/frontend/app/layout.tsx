import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clarbi · Campaigns Workspace',
  description: 'Transforma transcripciones de discovery call en paquetes de prompts listos para Genesy para campañas como Lookalike o Creative Ideas.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
