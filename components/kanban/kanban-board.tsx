'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Board, Column, Card, PresenceUser, DragState } from '@/lib/types'
import { KanbanColumn } from './kanban-column'
import { PresenceAvatars } from './presence-avatars'
import { AddColumnDialog } from './add-column-dialog'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid } from 'lucide-react'

interface KanbanBoardProps {
  initialBoard: Board
  initialColumns: Column[]
  initialCards: Card[]
}

const PRESENCE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
]

function getRandomName() {
  const adjectives = ['Swift', 'Clever', 'Bright', 'Quick', 'Sharp']
  const animals = ['Fox', 'Owl', 'Eagle', 'Wolf', 'Bear']
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`
}

export function KanbanBoard({ initialBoard, initialColumns, initialCards }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const [dragState, setDragState] = useState<DragState>({
    cardId: null,
    sourceColumnId: null,
    targetColumnId: null,
  })
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)

  const supabase = createClient()
  const userIdRef = useRef<string>(`user-${Math.random().toString(36).slice(2, 9)}`)
  const userNameRef = useRef<string>(getRandomName())
  const userColorRef = useRef<string>(PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)])
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to card changes
    const cardSubscription = supabase
      .channel('cards-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCards((prev) => [...prev, payload.new as Card])
          } else if (payload.eventType === 'UPDATE') {
            setCards((prev) =>
              prev.map((card) => (card.id === payload.new.id ? (payload.new as Card) : card))
            )
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) => prev.filter((card) => card.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Subscribe to column changes
    const columnSubscription = supabase
      .channel('columns-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'columns' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setColumns((prev) => [...prev, payload.new as Column])
          } else if (payload.eventType === 'UPDATE') {
            setColumns((prev) =>
              prev.map((col) => (col.id === payload.new.id ? (payload.new as Column) : col))
            )
          } else if (payload.eventType === 'DELETE') {
            setColumns((prev) => prev.filter((col) => col.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      cardSubscription.unsubscribe()
      columnSubscription.unsubscribe()
    }
  }, [supabase])

  // Set up presence
  useEffect(() => {
    const channel = supabase.channel(`board:${initialBoard.id}`, {
      config: {
        presence: {
          key: userIdRef.current,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users: PresenceUser[] = []
        for (const [, presences] of Object.entries(state)) {
          for (const presence of presences as Array<{ id: string; name: string; color: string }>) {
            if (presence.id !== userIdRef.current) {
              users.push({
                id: presence.id,
                name: presence.name,
                color: presence.color,
              })
            }
          }
        }
        setPresenceUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: userIdRef.current,
            name: userNameRef.current,
            color: userColorRef.current,
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, initialBoard.id])

  const handleDragStart = useCallback((cardId: string, columnId: string) => {
    setDragState({
      cardId,
      sourceColumnId: columnId,
      targetColumnId: null,
    })
  }, [])

  const handleDragOver = useCallback((columnId: string) => {
    setDragState((prev) => ({
      ...prev,
      targetColumnId: columnId,
    }))
  }, [])

  const handleDragEnd = useCallback(async () => {
    const { cardId, sourceColumnId, targetColumnId } = dragState

    if (!cardId || !targetColumnId || sourceColumnId === targetColumnId) {
      setDragState({ cardId: null, sourceColumnId: null, targetColumnId: null })
      return
    }

    // Optimistic update
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, column_id: targetColumnId } : card
      )
    )

    // Update in database
    const { error } = await supabase
      .from('cards')
      .update({ column_id: targetColumnId, updated_at: new Date().toISOString() })
      .eq('id', cardId)

    if (error) {
      // Revert on error
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, column_id: sourceColumnId! } : card
        )
      )
    }

    setDragState({ cardId: null, sourceColumnId: null, targetColumnId: null })
  }, [dragState, supabase])

  const handleAddCard = useCallback(
    async (columnId: string, title: string, description: string, priority: 'low' | 'medium' | 'high') => {
      const columnCards = cards.filter((c) => c.column_id === columnId)
      const maxPosition = columnCards.length > 0 ? Math.max(...columnCards.map((c) => c.position)) : 0

      const { error } = await supabase.from('cards').insert({
        column_id: columnId,
        title,
        description: description || null,
        priority,
        position: maxPosition + 1,
      })

      if (error) {
        console.error('Error adding card:', error)
      }
    },
    [cards, supabase]
  )

  const handleUpdateCard = useCallback(
    async (cardId: string, updates: Partial<Pick<Card, 'title' | 'description' | 'priority'>>) => {
      const { error } = await supabase
        .from('cards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', cardId)

      if (error) {
        console.error('Error updating card:', error)
      }
    },
    [supabase]
  )

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      const { error } = await supabase.from('cards').delete().eq('id', cardId)

      if (error) {
        console.error('Error deleting card:', error)
      }
    },
    [supabase]
  )

  const handleAddColumn = useCallback(
    async (name: string) => {
      const maxPosition = columns.length > 0 ? Math.max(...columns.map((c) => c.position)) : 0

      const { error } = await supabase.from('columns').insert({
        board_id: initialBoard.id,
        name,
        position: maxPosition + 1,
      })

      if (error) {
        console.error('Error adding column:', error)
      }
    },
    [columns, supabase, initialBoard.id]
  )

  const handleDeleteColumn = useCallback(
    async (columnId: string) => {
      const { error } = await supabase.from('columns').delete().eq('id', columnId)

      if (error) {
        console.error('Error deleting column:', error)
      }
    },
    [supabase]
  )

  const sortedColumns = [...columns].sort((a, b) => a.position - b.position)

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <LayoutGrid className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{initialBoard.name}</h1>
            <p className="text-sm text-muted-foreground">Real-time collaborative board</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PresenceAvatars users={presenceUsers} currentUser={{ id: userIdRef.current, name: userNameRef.current, color: userColorRef.current }} />
          <Button onClick={() => setIsAddColumnOpen(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Column
          </Button>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full gap-4">
          {sortedColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={cards.filter((card) => card.column_id === column.id).sort((a, b) => a.position - b.position)}
              isDragOver={dragState.targetColumnId === column.id}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onDeleteColumn={handleDeleteColumn}
            />
          ))}
          {columns.length === 0 && (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No columns yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first column</p>
                <Button onClick={() => setIsAddColumnOpen(true)} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Column
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <AddColumnDialog
        open={isAddColumnOpen}
        onOpenChange={setIsAddColumnOpen}
        onAdd={handleAddColumn}
      />
    </div>
  )
}
