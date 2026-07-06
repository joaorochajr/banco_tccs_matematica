'use client'

import { useEffect } from 'react'

interface SobreModalProps {
  open: boolean
  onClose: () => void
}

export default function SobreModal({ open, onClose }: SobreModalProps) {
  // Fecha com a tecla ESC
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho do modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Sobre o projeto</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-5 space-y-4 text-sm text-gray-700 leading-relaxed">
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">O que é o Banco de TCCs</h3>
            <p>
              O Banco de TCCs reúne os Trabalhos de Conclusão de Curso produzidos
              pelo curso de Matemática da UEFS, permitindo buscar por autor, título,
              ano ou orientador de forma rápida e centralizada.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">Desenvolvimento</h3>
            <p>
              Este site foi desenvolvido como projeto de extensão na disciplina{' '}
              <span className="font-medium text-gray-900">EXA618 — Programação para Redes</span>,
              sob orientação do professor{' '}
              <span className="font-medium text-gray-900">João Rocha</span>, pelos alunos:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-0.5">
              <li>José Victor</li>
              <li>Lucas de Paiva</li>
              <li>Mateus Antony</li>
              <li>Weslei Santos</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}