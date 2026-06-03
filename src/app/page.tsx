'use client'

import { useEffect, useState, useMemo } from 'react'
import { TCC, SortField, SortDir } from '@/types/tcc'
import SearchBar from '@/components/SearchBar'
import TCCTable from '@/components/TCCTable'
import YearFilter from '@/components/YearFilter'

const API_URL =
  'https://script.google.com/macros/s/AKfycbzi-Y4qCJfyF0Wf0TG-dTc3AbkAhfg-3k3rn27kfwW1PfyKVpCVOHodFFpYWm3fnWiD7w/exec'

export default function HomePage() {
  const [data, setData] = useState<TCC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>('ano')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then((json: TCC[]) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.')
        setLoading(false)
      })
  }, [])

  const years = useMemo(
    () => [...new Set(data.map(t => t.ano))].sort((a, b) => b - a),
    [data]
  )

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    let result = data

    if (yearFilter !== null) {
      result = result.filter(t => t.ano === yearFilter)
    }

    if (q) {
      result = result.filter(
        t =>
          t.autor.toLowerCase().includes(q) ||
          t.titulo.toLowerCase().includes(q) ||
          String(t.ano).includes(q) ||
          t.orientador.toLowerCase().includes(q)
      )
    }

    return [...result].sort((a, b) => {
      const va =
        sortField === 'ano'
          ? a[sortField]
          : String(a[sortField]).toLowerCase()

      const vb =
        sortField === 'ano'
          ? b[sortField]
          : String(b[sortField]).toLowerCase()

      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, query, yearFilter, sortField, sortDir])

  return (
    <>
      {/* HEADER FULL WIDTH */}
      <header
        className="relative overflow-hidden"
      >
        {/* Fundo matemático */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/math-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.08,
            filter: 'invert(1)',
          }}
        />

        {/* Conteúdo centralizado */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ color: '#1B3C73' }}
          >
            Banco de TCCs
          </h1>

          <div
            className="mx-auto"
            style={{
              width: 70,
              height: 4,
              background: '#1B3C73',
              borderRadius: 999,
            }}
          />

          <p
            className="mt-4 text-base"
            style={{ color: '#666' }}
          >
            Trabalhos de Conclusão de Curso — Matemática · UEFS
          </p>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-6 pt-0 pb-10">
        {/* Busca */}
        <SearchBar
          value={query}
          onChange={setQuery}
          resultCount={filtered.length}
          totalCount={data.length}
        />

        {/* Filtro por ano */}
        {!loading && years.length > 0 && (
          <YearFilter
            years={years}
            selected={yearFilter}
            onSelect={setYearFilter}
          />
        )}

        {/* Erro */}
        {error && (
          <div className="p-4 text-sm text-red-600 border border-red-200 rounded">
            {error}
          </div>
        )}

        {/* Contador */}
        {!loading && !error && (
          <p className="text-sm mb-3 text-gray-600">
            Exibindo <strong>{filtered.length}</strong> resultado
            {filtered.length !== 1 ? 's' : ''}:
          </p>
        )}

        {/* Skeleton */}
        {loading && !error && (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="shimmer-loading h-10 rounded"
              />
            ))}
          </div>
        )}

        {/* Tabela */}
        {!loading && !error && (
          <TCCTable
            data={filtered}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
          />
        )}

       
      </main>
    </>
  )
}