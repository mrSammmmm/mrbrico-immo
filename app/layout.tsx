import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'MrBrico Immo - Portail de gestion',
  description: 'Portail de gestion des demandes de travaux pour les gestionnaires d\'immeubles - Monsieur Bricole, Sherbrooke',
  keywords: ['gestion immobilière', 'travaux', 'Sherbrooke', 'Monsieur Bricole', 'rénovation'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
