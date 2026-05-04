"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUser } from "@clerk/nextjs";
import { X, Send, Loader2, Check, AlertTriangle, Mail } from "lucide-react";

type Props = {
  trigger: React.ReactNode;
  /** Optional pre-fill for the subject line (e.g. "Tape submission") */
  defaultSubject?: string;
};

/**
 * In-app contact form. Posts to /api/contact which fires a styled email
 * via Resend to the admin (Jerry). Pre-fills name/email from Clerk if the
 * user is signed in; otherwise asks for them.
 */
export function ContactModal({ trigger, defaultSubject }: Props) {
  const { isSignedIn, user, isLoaded } = useUser();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState(defaultSubject ?? "");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Prefill identity from Clerk on open (don't keep stale state if user
  // signs in/out between opens).
  React.useEffect(() => {
    if (!open || !isLoaded) return;
    if (isSignedIn && user) {
      const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        "";
      setName((n) => n || fullName);
      setEmail((e) => e || user.primaryEmailAddress?.emailAddress || "");
    }
    setSubject((s) => s || defaultSubject || "");
  }, [open, isLoaded, isSignedIn, user, defaultSubject]);

  // Reset success/error when reopening
  React.useEffect(() => {
    if (open) {
      setSent(false);
      setError(null);
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error ?? `Failed (${resp.status})`);
      }
      setSent(true);
      setMessage("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg max-h-[92vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-foreground/15 bg-card p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:p-8">
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center text-foreground/60 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          <Dialog.Title className="caps text-primary">
            Message Jerry
          </Dialog.Title>
          <Dialog.Description className="mt-1 font-display text-2xl font-medium leading-tight tracking-tight">
            Sent straight to his inbox.
          </Dialog.Description>
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">
            For technical questions about a chord or transition, use Jerry AI
            (the floating chat) — it&apos;s instant. This form is for real-human
            replies.
          </p>

          {sent ? (
            <div className="mt-8 flex items-start gap-3 border border-green-700/30 bg-green-50 p-4 dark:bg-green-950/20">
              <Check className="mt-0.5 h-4 w-4 text-green-700 shrink-0 dark:text-green-500" />
              <div>
                <div className="caps text-green-800 dark:text-green-300">
                  Message sent
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  Jerry got it. He usually replies within a day or two.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {!isSignedIn && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label="Your name"
                    value={name}
                    onChange={setName}
                    placeholder="Optional"
                  />
                  <Field
                    label="Your email"
                    type="email"
                    required
                    value={email}
                    onChange={setEmail}
                    placeholder="so Jerry can reply"
                  />
                </div>
              )}
              <Field
                label="Subject"
                value={subject}
                onChange={setSubject}
                placeholder="Optional"
              />
              <div>
                <label
                  htmlFor="contact-msg"
                  className="caps mb-2 block"
                >
                  Message
                </label>
                <textarea
                  id="contact-msg"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="What's on your mind?"
                  className="w-full border border-foreground/20 bg-transparent px-3 py-2.5 font-body text-sm leading-relaxed text-foreground placeholder:text-foreground/35 focus:border-foreground focus:outline-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 border border-destructive/40 bg-destructive/[0.05] p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-5 py-2.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submitting ? "Sending…" : "Send message"}
                </button>
                <span className="caps hidden sm:inline">
                  <Mail className="inline-block h-3 w-3 mr-1 align-text-bottom" />
                  via email
                </span>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="caps mb-2 block">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-foreground/20 bg-transparent px-3 py-2 font-body text-sm text-foreground placeholder:text-foreground/35 focus:border-foreground focus:outline-none"
      />
    </div>
  );
}
