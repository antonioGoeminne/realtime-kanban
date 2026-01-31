'use client'

import React from "react"

import { useState } from 'react'
import type { Column, Card, Priority } from '@/lib/types'
import { KanbanCard } from './kanban-card'
import { AddCardDialog } from './add-card-dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  column: Column
  cards: Card[]
  isDragOver: boolean
  onDragStart: (cardId: string, columnId: string) => void
  onDragOver: (columnId: string) => void
  onDragEnd: () => void
  onAddCard: (columnId: string, title: string, description: string, priority: Priority) => void
  onUpdateCard: (cardId: string, updates: Partial<Pick<Card, 'title' | 'description' | 'priority'>>) => void
  onDeleteCard: (cardId: string) => void
  onDeleteColumn: (columnId: string) => void
}

export function KanbanColumn({
  column,
  cards,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver(column.id)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDragEnd()
  }

  return (
    <div
      className={cn(
        'flex h-full w-80 shrink-0 flex-col rounded-xl bg-column-bg transition-all duration-200',
        isDragOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">{column.name}</h2>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsAddCardOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add card</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Column options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteColumn(column.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-3">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onDragStart={() => onDragStart(card.id, column.id)}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
          />
        ))}
        {cards.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border/50">
            <p className="text-sm text-muted-foreground">Drop cards here</p>
          </div>
        )}
      </div>

      {/* Add Card Button */}
      <div className="p-3 pt-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsAddCardOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add card
        </Button>
      </div>

      <AddCardDialog
        open={isAddCardOpen}
        onOpenChange={setIsAddCardOpen}
        onAdd={(title, description, priority) => onAddCard(column.id, title, description, priority)}
      />
    </div>
  )
}
