'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface YearFilterProps {
  years: number[]
  selected: number | null
  onSelect: (year: number | null) => void
}

export default function YearFilter({ years, selected, onSelect }: YearFilterProps) {
  return (
    <Select
      value={selected ? String(selected) : ''}
      onValueChange={(val) => onSelect(val ? Number(val) : null)}
    >
      <SelectTrigger className="h-[42px] w-auto min-w-[140px]">
        <SelectValue placeholder="Todos os anos" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Todos os anos</SelectItem>
        {years.sort((a, b) => b - a).map(year => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}