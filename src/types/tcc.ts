export interface TCC {
  autor: string
  titulo: string
  ano: number
  orientador: string
  link?: string
}

export type SortField = 'autor' | 'titulo' | 'ano' | 'orientador'
export type SortDir = 'asc' | 'desc'