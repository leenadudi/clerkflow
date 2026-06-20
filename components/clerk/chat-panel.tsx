'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { X, Send, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTED_PROMPTS = [
  "What's overdue?",
  'Any pending permits?',
  'Show upcoming meetings',
  'Log a new FOIA request',
]

type ToolOutput = {
  ok?: boolean
  summary?: string
  href?: string
  count?: number
  requests?: { id: string; requester: string; daysOverdue: number; href: string }[]
  meetings?: { id: string; title: string; date: string; time: string; status: string; href: string }[]
  permits?: { id: string; applicant: string; type: string; href: string }[]
  results?: { type: string; title: string; subtitle: string; href: string }[]
}

function ToolResultCard({ output }: { output: ToolOutput }) {
  // Write action confirmation card
  if (output.summary && output.href && output.ok !== undefined) {
    return (
      <div className={cn(
        'mt-1 flex items-start gap-2 rounded-lg border p-3 text-sm',
        output.ok
          ? 'border-[#16a34a]/30 bg-[#16a34a]/5'
          : 'border-destructive/30 bg-destructive/5',
      )}>
        <CheckCircle2 className={cn('mt-0.5 size-4 shrink-0', output.ok ? 'text-[#16a34a]' : 'text-destructive')} />
        <div className="min-w-0 flex-1">
          <p className={cn('font-medium', output.ok ? 'text-[#16a34a]' : 'text-destructive')}>
            {output.summary}
          </p>
          {output.ok && (
            <Link href={output.href} className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              View record <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      </div>
    )
  }

  // List results
  const listItems = output.requests ?? output.meetings ?? output.permits ?? output.results ?? []
  if (listItems.length > 0) {
    return (
      <div className="mt-1 rounded-lg border border-border bg-muted/30 text-sm overflow-hidden">
        {listItems.slice(0, 6).map((item, i) => {
          const href = 'href' in item ? item.href : ''
          const title = 'requester' in item
            ? `${item.id} — ${item.requester}${'daysOverdue' in item && item.daysOverdue > 0 ? ` (${item.daysOverdue}d overdue)` : ''}`
            : 'title' in item
              ? `${item.title}${'date' in item ? ` · ${item.date}` : ''}`
              : 'applicant' in item
                ? `${item.applicant} — ${item.type}`
                : ''
          return (
            <Link
              key={i}
              href={href}
              className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-accent border-b border-border last:border-0 transition-colors"
            >
              <span className="truncate text-foreground">{title}</span>
              <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
            </Link>
          )
        })}
      </div>
    )
  }

  if (output.count === 0) {
    return (
      <div className="mt-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        None found.
      </div>
    )
  }

  return null
}

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/app/chat' }), [])
  const { messages, sendMessage, status, error } = useChat({ transport })
  const isLoading = status === 'streaming' || status === 'submitted'

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage({ text })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      className={cn(
        'fixed right-0 top-16 bottom-0 z-40 flex w-96 flex-col border-l border-border bg-card shadow-xl transition-transform duration-200',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
      aria-hidden={!open}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Clerkie</p>
          <p className="text-xs text-muted-foreground">Ask me to look things up or take action</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close assistant"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-8">
            <p className="text-sm text-muted-foreground">
              Ask me anything about your town&apos;s records, or tell me what you need done.
            </p>
            <div className="flex flex-col gap-2 w-full">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); inputRef.current?.focus() }}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            {/* User message */}
            {message.role === 'user' && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#1e3a5f] px-3 py-2 text-sm text-white">
                  {message.parts.filter(p => p.type === 'text').map((p, i) => (
                    p.type === 'text' ? <span key={i}>{p.text}</span> : null
                  ))}
                </div>
              </div>
            )}

            {/* Assistant message */}
            {message.role === 'assistant' && (
              <div className="flex flex-col gap-1">
                {message.parts.map((part, i) => {
                  if (part.type === 'text' && part.text) {
                    return (
                      <div key={i} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground whitespace-pre-wrap">
                        {part.text}
                      </div>
                    )
                  }
                  if (part.type === 'dynamic-tool') {
                    if (part.state === 'input-streaming' || part.state === 'input-available') {
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                          <Loader2 className="size-3 animate-spin" />
                          Working…
                        </div>
                      )
                    }
                    if (part.state === 'output-available' && part.output) {
                      return <ToolResultCard key={i} output={part.output as ToolOutput} />
                    }
                  }
                  return null
                })}
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Thinking…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            Error: {error.message}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something or give a command…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            style={{ minHeight: '38px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f] text-white transition-opacity disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="size-4" />
          </button>
        </form>
        <p className="mt-1.5 text-[10px] text-muted-foreground/60 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
