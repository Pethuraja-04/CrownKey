'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { MessageSquare, X, Send, Sparkles, RotateCcw, AlertCircle, Bot } from 'lucide-react';
import { apiChatMessage, ApiError, type ChatMessage } from '@/lib/api';

const SUGGESTIONS = [
  'How do I list a property on Estatery?',
  "What's the difference between Single and Double PG occupancy?",
  'Show me 3 BHK apartments in Bengaluru under ₹2 Cr',
  'What does carpet area vs built-up area mean?',
];

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm **Estatery's property concierge**. I can help you find listings, understand filters, or learn about real estate in India.\n\nWhat would you like to know?",
};

const STORAGE_KEY = 'estatery.chat.v1';

const loadHistory = (): ChatMessage[] => {
  if (typeof window === 'undefined') return [GREETING];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : null;
    return parsed && parsed.length ? parsed : [GREETING];
  } catch {
    return [GREETING];
  }
};

// Minimal Markdown renderer — bold, lists, line-breaks, inline-code, links.
// Keeps the bundle tiny vs. pulling in react-markdown for one widget.
function renderMd(text: string) {
  const escape = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
  const lines = text.split('\n');
  const out: string[] = [];
  let inList = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) { out.push('<ul class="list-disc pl-5 space-y-1 my-1">'); inList = true; }
      out.push(`<li>${formatInline(escape(trimmed.replace(/^[-*]\s+/, '')))}</li>`);
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      if (trimmed === '') out.push('<div class="h-2"></div>');
      else out.push(`<p>${formatInline(escape(trimmed))}</p>`);
    }
  }
  if (inList) out.push('</ul>');
  return out.join('');
}

function formatInline(s: string) {
  // URL pass must run first — the bold/code passes insert HTML containing
  // </strong> and </code>, and a later /-based linkifier would chew the
  // closing tags ("/strong", "/code" match the URL char class).
  return s
    .replace(/(^|[\s(>])(\/[a-zA-Z0-9?=&_,.+-][a-zA-Z0-9/?=&_,.+-]*)/g, '$1<a href="$2" class="underline decoration-gold-400 underline-offset-2 text-ink-900 hover:text-gold-700">$2</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-ink-100 text-[0.85em] text-ink-800">$1</code>');
}

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(false);
  const [err, setErr] = useState('');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Defer the whole widget to client-render only. The panel reads sessionStorage
  // and has conditional DOM (suggestion chips) that's a classic source of
  // SSR/CSR drift — rendering nothing on the server avoids the mismatch entirely.
  useEffect(() => {
    setMounted(true);
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* quota */ }
  }, [messages]);

  useEffect(() => {
    if (open && scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, open, busy]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setErr('');
    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      // Only send the conversational turns (skip the canned greeting) for context.
      const history = next.slice(next[0] === GREETING ? 1 : 0, -1);
      const r = await apiChatMessage(content, history);
      const assistant: ChatMessage = { role: 'assistant', content: r.data.reply };
      setMessages((m) => [...m, assistant]);
      if (!open) setUnread(true);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Sorry, I could not reach the AI right now.';
      setErr(msg);
      setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const reset = () => {
    setMessages([GREETING]);
    setErr('');
    if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating launcher */}
      <button
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full grid place-items-center shadow-lift transition-all duration-300 ${
          open
            ? 'bg-ink-900 text-canvas rotate-90 scale-95'
            : 'bg-gradient-to-br from-gold-400 to-gold-500 text-ink-900 hover:scale-105'
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {unread && !open && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 border-2 border-canvas grid place-items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[400px] max-w-md h-[640px] max-h-[calc(100vh-7rem)] origin-bottom-right transition-all duration-300 ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full rounded-2xl bg-white shadow-lift border border-ink-100 overflow-hidden">
          {/* Header */}
          <div className="relative bg-ink-900 text-canvas px-5 py-4 overflow-hidden">
            <div className="absolute -top-12 -right-10 h-32 w-32 rounded-full bg-gold-400/30 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 grid place-items-center text-ink-900 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg leading-tight">Estatery Concierge</p>
                <p className="text-xs text-ink-300 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AI assistant · Real-estate only
                </p>
              </div>
              <button
                onClick={reset}
                title="Start a new conversation"
                className="p-2 rounded-md hover:bg-white/10 text-ink-300 hover:text-canvas transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-canvas">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {busy && (
              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-ink-900 text-gold-300 grid place-items-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white border border-ink-100 px-3.5 py-2.5">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestion chips (only on the first turn) */}
          {messages.length === 1 && !busy && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 border-t border-ink-100 pt-3 bg-white">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full bg-ink-50 border border-ink-100 text-ink-700 hover:bg-ink-100 hover:border-ink-300 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {err && (
            <div className="px-4 pb-1 -mt-1 text-[11px] text-rose-700 flex items-start gap-1.5">
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          )}

          {/* Composer */}
          <form onSubmit={submit} className="border-t border-ink-100 p-3 bg-white">
            <div className="flex items-end gap-2 rounded-xl border border-ink-200 bg-canvas px-3 py-2 focus-within:border-ink-900 focus-within:ring-2 focus-within:ring-ink-900/10 transition-colors">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Ask about properties, filters, listings…"
                className="flex-1 resize-none bg-transparent outline-none text-sm placeholder:text-ink-400 max-h-32"
                style={{ minHeight: '24px' }}
                disabled={busy}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="shrink-0 h-8 w-8 grid place-items-center rounded-lg bg-ink-900 text-canvas hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-ink-400 text-center">
              AI assistant · Real-estate questions only · Don't share personal info
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-ink-900 text-canvas px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 animate-fade-up">
      <div className="h-7 w-7 rounded-full bg-ink-900 text-gold-300 grid place-items-center shrink-0">
        <Bot className="h-4 w-4" />
      </div>
      <div
        className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-ink-100 px-3.5 py-2.5 text-sm leading-relaxed text-ink-800 [&_p]:my-0 [&_p+p]:mt-2"
        dangerouslySetInnerHTML={{ __html: renderMd(content) }}
      />
    </div>
  );
}
