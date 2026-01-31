'use client'

import React from "react"

import { useState } from 'react'
import type { Card, Priority } from '@/lib/types'
import { EditCardDialog } from './edit-card-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KanbanCardProps {
  card: Card
  onDragStart: () => void
  onUpdate: (cardId: string, updates: Partial<Pick<Card, 'title' | 'description' | 'priority'>>) => void
  onDelete: (cardId: string) => void
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: {
    label: 'High',
    className: 'bg-priority-high-bg text-priority-high',
  },
  medium: {
    label: 'Medium',
    className: 'bg-priority-medium-bg text-priority-medium',
  },
  low: {
    label: 'Low',
    className: 'bg-priority-low-bg text-priority-low',
  },
}

export function KanbanCard({ card, onDragStart, onUpdate, onDelete }: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
    onDragStart()
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const priority = priorityConfig[card.priority]

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          'group relative cursor-grab rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:border-border/80 hover:shadow-md active:cursor-grabbing',
          isDragging && 'rotate-2 scale-105 shadow-xl shadow-drag-shadow opacity-90'
        )}
      >
        {/* Priority Badge */}
        <div className="mb-2 flex items-center justify-between">
          <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', priority.className)}>
            {priority.label}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Card options</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(card.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Card Content */}
        <h3 className="font-medium text-card-foreground">{card.title}</h3>
        {card.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{card.description}</p>
        )}
      </div>

      <EditCardDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        card={card}
        onSave={(updates) => onUpdate(card.id, updates)}
      />
    </>
  )
}
