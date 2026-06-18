'use client'

import { Input } from '@/components/ui/input'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  resultCount: number
  totalCount: number
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex-1">
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Palavra (ou parte da palavra) presente no autor, título, ano ou orientador"
        className="h-[42px] w-full text-sm"
      />
    </div>
  )
}