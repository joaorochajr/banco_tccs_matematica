'use client'

import { TCC, SortField, SortDir } from '@/types/tcc'
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2, Infinity, LayoutList } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'

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
  { field: 'autor',      label: 'Autor',      width: '22%' },
  { field: 'titulo',     label: 'Título',     width: '45%' },
  { field: 'ano',        label: 'Ano',        width: '8%'  },
  { field: 'orientador', label: 'Orientador', width: '25%' },
]

const INFINITE_BATCH = 30
const INFINITE_LOAD  = 20

type ViewMode = 'infinite' | 'paginated'

// ─── Shared rows ─────────────────────────────────────────────────────────────
function TableRows({ rows }: { rows: TCC[] }) {
  return (
    <>
      {rows.map((tcc, i) => (
        <tr
          key={`${tcc.autor}-${tcc.ano}-${i}`}
          className="tcc-row"
          style={{
            borderBottom: '1px solid #eee',
            background: i % 2 === 0 ? '#fff' : '#f9f9f9',
            animationDelay: `${Math.min(i * 28, 280)}ms`,
          }}
        >
          <td className="py-3 px-3 text-xs" style={{ color: '#222' }}>{tcc.autor}</td>
          <td className="py-3 px-3 text-xs">
            {tcc.link ? (
              <a
                href={tcc.link}
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
          <td className="py-3 px-3 text-xs" style={{ color: '#222' }}>{tcc.ano}</td>
          <td className="py-3 px-3 text-xs" style={{ color: '#444' }}>{tcc.orientador}</td>
        </tr>
      ))}
    </>
  )
}

// ─── Table shell (thead sticky inside scroll container) ───────────────────────
function TableShell({
  sortField, sortDir, onSort, children,
}: {
  sortField: SortField
  sortDir: SortDir
  onSort: (f: SortField) => void
  children: React.ReactNode
}) {
  return (
    <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
      {/* sticky: top is 0 because the thead sticks within the scrollable parent */}
      <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: '#fff', boxShadow: '0 2px 0 0 #1B3C73' }}>
        <tr>
          {COLS.map(col => (
            <th key={col.field} className="text-left py-3 px-3" style={{ width: col.width }}>
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
      <tbody>{children}</tbody>
    </table>
  )
}

// ─── Mode toggle ──────────────────────────────────────────────────────────────
function ModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="view-mode-toggle" role="group" aria-label="Modo de exibição">
      <button
        className={`mode-btn ${mode === 'infinite' ? 'active' : ''}`}
        onClick={() => onChange('infinite')}
        title="Scroll infinito"
      >
        <Infinity size={14} />
        <span>Scroll infinito</span>
      </button>
      <button
        className={`mode-btn ${mode === 'paginated' ? 'active' : ''}`}
        onClick={() => onChange('paginated')}
        title="Paginação"
      >
        <LayoutList size={14} />
        <span>Paginação</span>
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TCCTable({ data, sortField, sortDir, onSort }: TableProps) {
  const [mode, setMode] = useState<ViewMode>('infinite')

  // ── Infinite scroll state ──
  const [visibleCount, setVisibleCount]   = useState(INFINITE_BATCH)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef        = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevDataRef        = useRef(data)

  // ── Pagination state ──
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Reset when data changes (filter / sort)
  useEffect(() => {
    if (prevDataRef.current !== data) {
      setVisibleCount(INFINITE_BATCH)
      setPage(1)
      // Scroll back to top in both modes
      scrollContainerRef.current?.scrollTo({ top: 0 })
      prevDataRef.current = data
    }
  }, [data])

  // Reset when switching modes
  const handleModeChange = (m: ViewMode) => {
    setMode(m)
    setVisibleCount(INFINITE_BATCH)
    setPage(1)
  }

  // ── Infinite scroll logic ──
  const loadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= data.length) return
    setIsLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(v => Math.min(v + INFINITE_LOAD, data.length))
      setIsLoadingMore(false)
    }, 300)
  }, [isLoadingMore, visibleCount, data.length])

  // Observer anchored to the scrollable div (not the window)
  useEffect(() => {
    if (mode !== 'infinite') return
    const sentinel  = sentinelRef.current
    const container = scrollContainerRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { root: container, rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, mode])

  // ── Pagination ──
  const totalPages = Math.ceil(data.length / pageSize)
  const pageStart  = (page - 1) * pageSize
  const pageEnd    = Math.min(page * pageSize, data.length)
  const pageRows   = data.slice(pageStart, pageEnd)

  // Scroll to top on page change
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  // ── Empty state ──
  if (data.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: '#999' }}>
        Nenhum resultado encontrado.
      </p>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    /* Takes all space given by parent */
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Toggle row — never scrolls */}
      <div className="flex justify-end mb-2" style={{ flexShrink: 0 }}>
        <ModeToggle mode={mode} onChange={handleModeChange} />
      </div>

      {/* ── Infinite scroll mode ── */}
      {mode === 'infinite' && (
        <div
          ref={scrollContainerRef}
          data-scroll
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}
        >
          <TableShell sortField={sortField} sortDir={sortDir} onSort={onSort}>
            <TableRows rows={data.slice(0, visibleCount)} />
          </TableShell>

          {/* Sentinel: IntersectionObserver watches this inside the scroll div */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {isLoadingMore && (
            <div className="flex justify-center items-center gap-2 py-5" style={{ color: '#1B3C73' }}>
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm" style={{ opacity: 0.7 }}>Carregando mais...</span>
            </div>
          )}

          {visibleCount >= data.length && data.length > INFINITE_BATCH && (
            <p className="text-center text-xs py-5" style={{ color: '#bbb' }}>
              Todos os {data.length} resultados exibidos
            </p>
          )}
        </div>
      )}

      {/* ── Paginated mode ── */}
      {mode === 'paginated' && (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Scrollable table area */}
          <div
            ref={scrollContainerRef}
            data-scroll
            style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}
          >
            <TableShell sortField={sortField} sortDir={sortDir} onSort={onSort}>
              <TableRows rows={pageRows} />
            </TableShell>
          </div>

          {/* Pagination bar — always visible, never scrolls */}
          <div className="pagination-bar" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-4">
              <span className="pagination-info">
                {pageStart + 1}–{pageEnd} de {data.length}
              </span>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#666' }}>
                <label htmlFor="pageSize">Itens por página:</label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  className="border rounded px-1 py-0.5 outline-none cursor-pointer"
                  style={{ borderColor: '#ddd', background: '#fff' }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1} aria-label="Primeira página">«</button>
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Página anterior">‹</button>

              {buildPageNumbers(page, totalPages).map((p, idx) =>
                p === '…' ? (
                  <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? 'current' : ''}`}
                    onClick={() => setPage(Number(p))}
                    aria-current={page === p ? 'page' : undefined}
                  >
                    {p}
                  </button>
                )
              )}

              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Próxima página">›</button>
              <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Última página">»</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helper: smart page number list ───────────────────────────────────────────
function buildPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')

  const start = Math.max(2, current - 1)
  const end   = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}