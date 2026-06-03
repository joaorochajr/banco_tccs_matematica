'use client'

import { TCC, SortField, SortDir } from '@/types/tcc'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

interface TableProps {
  data: TCC[]
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />
  return sortDir === 'asc'
    ? <ChevronUp size={13} style={{ color: '#1B3C73' }} />
    : <ChevronDown size={13} style={{ color: '#1B3C73' }} />
}

const COLS: { field: SortField; label: string; width: string }[] = [
  { field: 'autor', label: 'Autor', width: '22%' },
  { field: 'titulo', label: 'Título', width: '45%' },
  { field: 'ano', label: 'Ano', width: '8%' },
  { field: 'orientador', label: 'Orientador', width: '25%' },
]

export default function TCCTable({ data, sortField, sortDir, onSort }: TableProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: '#999' }}>
        Nenhum resultado encontrado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #1B3C73' }}>
            {COLS.map(col => (
              <th
                key={col.field}
                className="text-left py-3 px-3"
                style={{ width: col.width }}
              >
                <button
                  className={`sort-btn ${sortField === col.field ? 'active' : ''}`}
                  onClick={() => onSort(col.field)}
                >
                  {col.label}
                  <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((tcc, i) => (
            <tr
              key={`${tcc.autor}-${i}`}
              style={{
                borderBottom: '1px solid #eee',
                background: i % 2 === 0 ? '#fff' : '#f9f9f9',
              }}
            >
              <td className="py-3 px-3 text-xs" style={{ color: '#222' }}>
                {tcc.autor}
              </td>
              <td className="py-3 px-3 text-xs">
                {tcc.link ? (
                  
                    <a href={tcc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1B3C73' }}
                    className="hover:underline"
                  >
                    {tcc.titulo}
                  </a>
                ) : (
                  <span style={{ color: '#444' }}>{tcc.titulo}</span>
                )}
              </td>
              <td className="py-3 px-3 text-xs" style={{ color: '#222' }}>
                {tcc.ano}
              </td>
              <td className="py-3 px-3 text-xs" style={{ color: '#444' }}>
                {tcc.orientador}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}