export type Priority = 'low' | 'medium' | 'high'

export interface Card {
  id: string
  column_id: string
  title: string
  description: string | null
  priority: Priority
  position: number
  created_at: string
  updated_at: string
}

export interface Column {
  id: string
  board_id: string
  name: string
  position: number
  created_at: string
}

export interface Board {
  id: string
  name: string
  created_at: string
}

export interface PresenceUser {
  id: string
  name: string
  color: string
  cursor?: { x: number; y: number }
}

export interface DragState {
  cardId: string | null
  sourceColumnId: string | null
  targetColumnId: string | null
}
