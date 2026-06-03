import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TCCs de Matemática — UEFS',
  description: 'Repositório de Trabalhos de Conclusão de Curso do Departamento de Matemática da UEFS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}