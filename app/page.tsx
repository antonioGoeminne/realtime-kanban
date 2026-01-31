import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/kanban/kanban-board'

export default async function Home() {
  const supabase = await createClient()

  // Fetch the default board
  const { data: boards } = await supabase
    .from('boards')
    .select('*')
    .limit(1)
    .single()

  // If no board exists, create one
  let board = boards
  if (!board) {
    const { data: newBoard } = await supabase
      .from('boards')
      .insert({ name: 'My Kanban Board' })
      .select()
      .single()
    board = newBoard
  }

  if (!board) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Failed to load board. Please try again.</p>
      </div>
    )
  }

  // Fetch columns for this board
  const { data: columns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', board.id)
    .order('position')

  // Fetch all cards for the columns
  const columnIds = columns?.map((c) => c.id) || []
  const { data: cards } = columnIds.length > 0
    ? await supabase
        .from('cards')
        .select('*')
        .in('column_id', columnIds)
        .order('position')
    : { data: [] }

  return (
    <KanbanBoard
      initialBoard={board}
      initialColumns={columns || []}
      initialCards={cards || []}
    />
  )
}
