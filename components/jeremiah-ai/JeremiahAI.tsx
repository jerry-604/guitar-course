"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { MessageCircle, X, Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "jeremiah-ai-history-v1";
const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi. I'm Jerry AI — Jerry's 24/7 stand-in for when you get stuck on a chord, a strum pattern, or just want to know what to practice next. What's giving you trouble?",
};

const SUGGESTIONS: string[] = [
  "My chords aren't ringing clean",
  "How do I switch from G to D faster?",
  "My guitar sounds out of tune — how do I tune it?",
  "How long should I practice each day?",
  "I can't reach the C chord stretch",
  "When can I move to the next song?",
];

export function JeremiahAI() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load history on first mount.
  // - Signed in: GET /api/chat/history (Postgres). Cross-device.
  // - Guest:     localStorage on this device only.
  useEffect(() => {
    if (!authLoaded) return;
    let cancelled = false;
    (async () => {
      if (isSignedIn) {
        try {
          const resp = await fetch("/api/chat/history", { cache: "no-store" });
          if (resp.ok) {
            const data = (await resp.json()) as { messages?: Message[] };
            if (!cancelled && data.messages && data.messages.length > 0) {
              setMessages(
                data.messages.map((m) => ({
                  id: m.id,
                  role: m.role,
                  content: m.content,
                })),
              );
            }
          }
        } catch {
          // fall back to localStorage if the API fails
        }
      } else {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Message[];
            if (!cancelled && Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
            }
          }
        } catch {}
      }
      if (!cancelled) setHistoryLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn]);

  // For guests, mirror messages to localStorage so they persist on this device.
  useEffect(() => {
    if (!historyLoaded || isSignedIn) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages, historyLoaded, isSignedIn]);

  // Auto-scroll on new content
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };
      const next = [...messages, userMsg, assistantMsg];
      setMessages(next);
      setInput("");
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      let accumulated = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: next
              .filter((m) => m.id !== assistantMsg.id)
              .map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const errBody = await res.text().catch(() => "");
          setMessages((curr) =>
            curr.map((m) =>
              m.id === assistantMsg.id
                ? {
                    ...m,
                    content: `Sorry, couldn't reach the assistant (${res.status}). ${errBody.slice(0, 120)}`,
                  }
                : m,
            ),
          );
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const dataLine = frame
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!dataLine) continue;
            const data = dataLine.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta: string | undefined =
                parsed?.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                setMessages((curr) =>
                  curr.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: accumulated }
                      : m,
                  ),
                );
              }
            } catch {
              // OpenRouter sometimes sends non-JSON keep-alive comments; ignore
            }
          }
        }

        if (!accumulated) {
          setMessages((curr) =>
            curr.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: "(no response)" }
                : m,
            ),
          );
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // user closed/cancelled
        } else {
          setMessages((curr) =>
            curr.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `Network error: ${(err as Error).message}` }
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;

        // Persist this turn server-side so signed-in users get their
        // history on every device. Fire-and-forget; the API quietly
        // no-ops for guests.
        if (accumulated && isSignedIn) {
          void fetch("/api/chat/persist", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              userMessage: trimmed,
              assistantMessage: accumulated,
            }),
          });
        }
      }
    },
    [messages, isStreaming, isSignedIn],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setInput("");
    if (isSignedIn) {
      void fetch("/api/chat/history", { method: "DELETE" });
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, [isSignedIn]);

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Jerry AI" : "Open Jerry AI"}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2.5 border border-foreground bg-foreground px-4 font-display text-sm text-background shadow-lg transition-all hover:bg-primary hover:border-primary md:bottom-7 md:right-7",
          open && "scale-95 opacity-90",
        )}
      >
        {open ? (
          <X className="h-4 w-4" strokeWidth={2.5} />
        ) : (
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
          {open ? "Close" : "Ask Jerry AI"}
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-3 bottom-24 z-40 flex max-h-[78vh] flex-col border border-foreground/15 bg-card text-foreground shadow-2xl md:inset-auto md:bottom-28 md:right-7 md:h-[600px] md:w-[420px]">
          {/* Header */}
          <div className="border-b border-foreground/15 bg-foreground px-4 py-3 text-background">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/60">
                  24/7 Course Assistant
                </div>
                <div className="font-display text-lg font-medium leading-tight">
                  Jerry AI
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/60 underline-offset-4 transition-colors hover:text-background hover:underline"
              >
                New chat
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto px-4 py-5 space-y-5"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[88%] text-[15px] leading-relaxed",
                  m.role === "user"
                    ? "ml-auto rounded-sm bg-foreground/[0.06] px-3.5 py-2.5 font-body"
                    : "font-body text-foreground/90",
                )}
              >
                {m.role === "assistant" && (
                  <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                    Jerry AI
                  </div>
                )}
                {m.role === "assistant" ? (
                  <div
                    className={cn(
                      "prose prose-sm prose-stone max-w-none dark:prose-invert",
                      "prose-p:my-2 prose-p:leading-relaxed prose-p:text-foreground/90",
                      "prose-headings:font-display prose-headings:tracking-tight prose-headings:text-foreground",
                      "prose-strong:font-display prose-strong:font-semibold prose-strong:text-foreground",
                      "prose-em:italic",
                      "prose-a:text-primary prose-a:underline-offset-2 hover:prose-a:underline",
                      "prose-code:bg-foreground/[0.08] prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-[0.85em] prose-code:before:content-[''] prose-code:after:content-['']",
                      "prose-pre:bg-foreground/[0.06] prose-pre:p-3 prose-pre:text-foreground prose-pre:my-3",
                      "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:text-foreground/90 prose-li:marker:text-primary",
                      "prose-blockquote:border-l-primary prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-foreground/80",
                      "prose-hr:my-4 prose-hr:border-foreground/15",
                    )}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content || " "}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                )}
              </div>
            ))}
            {isStreaming &&
              messages[messages.length - 1]?.content === "" && (
                <div className="flex items-center gap-2 text-foreground/50">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                    thinking
                  </span>
                </div>
              )}

            {/* Suggested first questions — only when transcript is fresh */}
            {messages.length === 1 && !isStreaming && (
              <div className="space-y-2 pt-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/45">
                  Try asking
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="border border-foreground/15 bg-background/50 px-2.5 py-1.5 text-left font-body text-xs leading-snug text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={onSubmit}
            className="flex items-end gap-2 border-t border-foreground/15 px-3 py-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              placeholder="Ask anything about the course…"
              rows={1}
              disabled={isStreaming}
              className="min-h-[2.5rem] flex-1 resize-none border border-foreground/15 bg-transparent px-3 py-2 font-body text-sm leading-snug text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              aria-label="Send"
              className="grid h-10 w-10 place-items-center border border-foreground bg-foreground text-background transition-colors hover:bg-primary hover:border-primary disabled:opacity-40"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          <div className="border-t border-foreground/10 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-foreground/40">
            AI-generated · email Jerry for human help
          </div>
        </div>
      )}
    </>
  );
}
