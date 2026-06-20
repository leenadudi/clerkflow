'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

const FEATURES = [
  { value: 'foia', label: 'Public records request form' },
  { value: 'meetings', label: 'Meetings & minutes list' },
  { value: 'apply', label: 'Licence & permit application' },
  { value: 'track', label: 'Request tracker' },
] as const

type Feature = typeof FEATURES[number]['value']

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      aria-label="Copy snippet"
    >
      {copied ? <Check className="size-3 text-[#16a34a]" /> : <Copy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function EmbedSnippets({ townSlug }: { townSlug: string }) {
  const [feature, setFeature] = useState<Feature>('foia')

  const baseUrl = 'https://clerkflow.software'
  const embedUrl = `${baseUrl}/embed/${townSlug}/${feature}`

  const iframeSnippet = `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  title="${FEATURES.find(f => f.value === feature)?.label ?? 'Town services'}"\n  loading="lazy"\n></iframe>`

  const scriptSnippet = `<script\n  src="${baseUrl}/widget.js"\n  data-town="${townSlug}"\n  data-feature="${feature}"\n></script>`

  return (
    <div className="space-y-5">
      {/* Feature picker */}
      <div className="flex flex-wrap gap-2">
        {FEATURES.map((f) => (
          <button
            key={f.value}
            onClick={() => setFeature(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              feature === f.value
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Option 1: iframe */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Option 1 — Inline embed (easiest)</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Works in Wix, Squarespace, WordPress — add an "HTML" or "Embed" block and paste this.
            </p>
          </div>
          <CopyButton text={iframeSnippet} />
        </div>
        <pre className="mt-3 overflow-x-auto rounded-md bg-background p-3 text-xs text-foreground/80 font-mono leading-relaxed border border-border">
          {iframeSnippet}
        </pre>
      </div>

      {/* Option 2: widget script */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Option 2 — Floating button widget</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adds a "Town Services" button in the corner of any page. Paste before the closing{' '}
              <code className="rounded bg-muted px-1 font-mono">&lt;/body&gt;</code> tag.
            </p>
          </div>
          <CopyButton text={scriptSnippet} />
        </div>
        <pre className="mt-3 overflow-x-auto rounded-md bg-background p-3 text-xs text-foreground/80 font-mono leading-relaxed border border-border">
          {scriptSnippet}
        </pre>
      </div>

      <p className="text-xs text-muted-foreground">
        Not sure which to use?{' '}
        <strong>Option 1</strong> is easier — if your website builder has an "Embed" or "HTML block," use that.
      </p>
    </div>
  )
}
