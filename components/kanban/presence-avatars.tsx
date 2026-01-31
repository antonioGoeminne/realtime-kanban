'use client'

import type { PresenceUser } from '@/lib/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PresenceAvatarsProps {
  users: PresenceUser[]
  currentUser: PresenceUser
}

export function PresenceAvatars({ users, currentUser }: PresenceAvatarsProps) {
  const allUsers = [currentUser, ...users]
  const displayUsers = allUsers.slice(0, 5)
  const remainingCount = allUsers.length - 5

  return (
    <TooltipProvider>
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {displayUsers.map((user, index) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-medium text-primary-foreground transition-transform hover:z-10 hover:scale-110',
                    index === 0 && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                  style={{ backgroundColor: user.color, zIndex: displayUsers.length - index }}
                >
                  {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name}{index === 0 ? ' (You)' : ''}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground"
                  style={{ zIndex: 0 }}
                >
                  +{remainingCount}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{remainingCount} more {remainingCount === 1 ? 'user' : 'users'}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="ml-3 text-sm text-muted-foreground">
          {allUsers.length} {allUsers.length === 1 ? 'user' : 'users'} online
        </span>
      </div>
    </TooltipProvider>
  )
}
