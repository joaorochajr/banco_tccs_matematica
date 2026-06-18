'use client'

import SearchBar from '@/components/SearchBar'
import TCCTable, { ModeToggle, ViewMode } from '@/components/TCCTable'
import YearFilter from '@/components/YearFilter'
import { SortDir, SortField, TCC } from '@/types/tcc'
import { useEffect, useMemo, useState } from 'react'

// TODO: Mover isso aqui para uma variável de ambiente e ajustar no deploy da vercel
const API_URL =
  'https://script.google.com/macros/s/AKfycbzknCwoeXycvSg_vBzpEw1vLuNL-sO8p5KEO2JYDYisKv-6D2WbO3pU3g7yjw8X3w2dcQ/exec'

export default function HomePage() {
  const [data, setData] = useState<TCC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>('ano')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [mode, setMode] = useState<ViewMode>('infinite')

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then((json: TCC[]) => {
        const normalized = json.filter(
          t => t.autor?.trim() && t.titulo?.trim() && t.ano
        ).map(t => ({ ...t, ano: Number(t.ano) }))
        setData(normalized)
        setLoading(false)
      })
      .catch(() => {
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.')
        setLoading(false)
      })
  }, [])

  const years = useMemo(
    () => [...new Set(data.map(t => Number(t.ano)).filter(y => !isNaN(y) && y > 0))].sort((a, b) => b - a),
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
    const normalizeStr = (str: string) =>
      str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : ''

    const q = normalizeStr(query.trim())
    let result = data

    if (yearFilter !== null) {
      result = result.filter(t => t.ano === yearFilter)
    }

    if (q) {
      result = result.filter(
        t =>
          normalizeStr(t.autor).includes(q) ||
          normalizeStr(t.titulo).includes(q) ||
          String(t.ano).includes(q) ||
          normalizeStr(t.orientador).includes(q)
      )
    }

    return [...result].sort((a, b) => {
      const va = sortField === 'ano' ? a[sortField] : String(a[sortField]).toLowerCase()
      const vb = sortField === 'ano' ? b[sortField] : String(b[sortField]).toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, query, yearFilter, sortField, sortDir])

  return (
    /* ── App shell: full viewport height, no page scroll ── */
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <header className="relative overflow-hidden" style={{ flexShrink: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/books-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
            Banco de TCCs
          </h1>
          <div
            className="mx-auto"
            style={{ width: 70, height: 4, background: '#2EA3F2', borderRadius: 999 }}
          />
          <p className="mt-3 text-base text-gray-200">
            Trabalhos de Conclusão de Curso — Matemática · UEFS
          </p>
        </div>
      </header>

      {/* ── Main: fills remaining height ── */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '72rem',   /* max-w-6xl */
          width: '100%',
          margin: '0 auto',
          padding: '20px 24px 20px',
        }}
      >
        {/* Static top: search + filters + count — does NOT scroll */}
        <div style={{ flexShrink: 0 }}>
          {/* SearchBar — full width */}
          <div className="mb-3">
            <SearchBar
              value={query}
              onChange={setQuery}
              resultCount={filtered.length}
              totalCount={data.length}
            />
          </div>

          {/* Info bar: YearFilter | count | ModeToggle */}
          {!loading && !error && (
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {years.length > 0 && (
                <YearFilter years={years} selected={yearFilter} onSelect={setYearFilter} />
              )}
              <p className="text-sm text-gray-600 flex-1">
                Exibindo <strong>{filtered.length}</strong> resultado
                {filtered.length !== 1 ? 's' : ''}:
              </p>
              <ModeToggle mode={mode} onChange={setMode} />
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-red-600 border border-red-200 rounded mt-3">
              {error}
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="space-y-3" style={{ overflowY: 'auto', flex: 1 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shimmer-loading h-10 rounded" />
            ))}
          </div>
        )}

        {/* Table area — stretches to fill all remaining space */}
        {!loading && !error && (
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <TCCTable
              data={filtered}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              mode={mode}
              onModeChange={setMode}
            />
          </div>
        )}
      </main>
    </div>
  )
}
