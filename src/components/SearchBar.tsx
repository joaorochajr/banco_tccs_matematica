'use client'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  resultCount: number
  totalCount: number
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Palavra (ou parte da palavra) presente no autor, título, ano ou orientador"
          className="input-field"
          style={{ borderRadius: 999, paddingLeft: 20, paddingRight: 20 }}
        />
        
      </div>
    </div>
  )
}