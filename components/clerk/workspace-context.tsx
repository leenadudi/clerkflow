'use client'

import { createContext, useContext } from 'react'
import { TOWN } from '@/lib/data'

export type WorkspaceTown = typeof TOWN

type WorkspaceContextValue = {
  town: WorkspaceTown
  foiaAttentionCount: number
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({
  town,
  foiaAttentionCount,
  children,
}: WorkspaceContextValue & { children: React.ReactNode }) {
  return (
    <WorkspaceContext.Provider value={{ town, foiaAttentionCount }}>
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
