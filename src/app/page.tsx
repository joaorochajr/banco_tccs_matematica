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
        const normalized = json.filter(
          t =>
            t.autor?.trim() &&
            t.titulo?.trim() &&
            t.ano
        ).map(t => ({
          ...t,
          ano: Number(t.ano)
        }))

        setData(normalized)
        setLoading(false)
      })
      .catch(() => {
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.')
        setLoading(false)
      })
  }, [])

  const years = useMemo(
    () => [...new Set(data.map(t => Number(t.ano)).filter(year => !isNaN(year) && year > 0))].sort((a, b) => b - a),
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
   
      <header
        className="relative overflow-hidden mb-12"
      >
        
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/books-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="absolute inset-0 bg-black/60"></div>

       
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 text-white"
          >
            Banco de TCCs
          </h1>

          <div
            className="mx-auto"
            style={{
              width: 70,
              height: 4,
              background: '#2EA3F2',
              borderRadius: 999,
            }}
          />

          <p
            className="mt-4 text-base text-gray-200"
          >
            Trabalhos de Conclusão de Curso — Matemática · UEFS
          </p>
        </div>
      </header>

     
      <main className="max-w-6xl mx-auto px-6 pt-0 pb-10">
        
        <SearchBar
          value={query}
          onChange={setQuery}
          resultCount={filtered.length}
          totalCount={data.length}
        />

        
        {!loading && years.length > 0 && (
          <YearFilter
            years={years}
            selected={yearFilter}
            onSelect={setYearFilter}
          />
        )}

       
        {error && (
          <div className="p-4 text-sm text-red-600 border border-red-200 rounded">
            {error}
          </div>
        )}

        
        {!loading && !error && (
          <p className="text-sm mb-3 text-gray-600">
            Exibindo <strong>{filtered.length}</strong> resultado
            {filtered.length !== 1 ? 's' : ''}:
          </p>
        )}

        
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
