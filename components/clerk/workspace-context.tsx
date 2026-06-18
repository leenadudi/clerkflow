'use client'

import { createContext, useContext } from 'react'
import { TOWN } from '@/lib/data'

export type WorkspaceTown = typeof TOWN

type WorkspaceContextValue = {
  town: WorkspaceTown
  /** Number of requests with computed status === 'overdue' */
  foiaOverdueCount: number
  /** Number of requests with computed status === 'due-soon' (and no overdue) */
  foiaDueSoonCount: number
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({
  town,
  foiaOverdueCount,
  foiaDueSoonCount,
  children,
}: WorkspaceContextValue & { children: React.ReactNode }) {
  return (
    <WorkspaceContext.Provider value={{ town, foiaOverdueCount, foiaDueSoonCount }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext)
  if (!value) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return value
}
