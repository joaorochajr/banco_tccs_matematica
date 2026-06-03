'use client'

interface YearFilterProps {
  years: number[]
  selected: number | null
  onSelect: (year: number | null) => void
}

export default function YearFilter({ years, selected, onSelect }: YearFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onSelect(null)}
        style={{
          padding: '4px 14px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          border: '1px solid #1B3C73',
          background: selected === null ? '#1B3C73' : 'transparent',
          color: selected === null ? '#fff' : '#1B3C73',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        Todos
      </button>
      {years.sort((a, b) => b - a).map(year => (
        <button
          key={year}
          onClick={() => onSelect(year === selected ? null : year)}
          style={{
            padding: '4px 14px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            border: '1px solid #1B3C73',
            background: selected === year ? '#1B3C73' : 'transparent',
            color: selected === year ? '#fff' : '#1B3C73',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {year}
        </button>
      ))}
    </div>
  )
}