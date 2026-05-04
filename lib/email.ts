/**
 * Tiny Resend client — no SDK, just fetch. Edge-runtime safe. We use
 * Resend's `onboarding@resend.dev` from-address which works without a
 * verified domain as long as the recipient is the Resend account owner
 * (Jeremiah). For production, add a verified domain and switch the from.
 */
type EmailParams = {
  to: string | string[];
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — dropping email:", subject);
    return { ok: false, reason: "no-key" as const };
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Guitar Course <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    console.error("[email] Resend error", resp.status, text);
    return { ok: false, reason: "upstream" as const, status: resp.status };
  }

  return { ok: true as const };
}

type SubmissionEmailParams = {
  studentName: string | null;
  studentEmail: string | null;
  songTitle: string;
  videoUrl: string;
  source: "upload" | "link";
  baseUrl: string;
};

export function buildSubmissionEmail({
  studentName,
  studentEmail,
  songTitle,
  videoUrl,
  source,
  baseUrl,
}: SubmissionEmailParams) {
  const adminUrl = `${baseUrl}/admin/submissions`;
  const who = studentName ?? studentEmail ?? "A student";
  return {
    subject: `🎸 New tape: ${songTitle} (from ${who})`,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #2A1F18; padding: 24px; max-width: 560px;">
        <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #5C4A3D; margin: 0 0 12px 0;">
          Guitar Course · New tape submission
        </p>
        <h1 style="font-size: 24px; margin: 0 0 18px 0; color: #2A1F18;">
          ${escapeHtml(who)} sent in their take of <em>${escapeHtml(songTitle)}</em>.
        </h1>
        <p style="margin: 0 0 18px 0;">
          <strong>Submitted via:</strong> ${source === "upload" ? "file upload" : "link"}<br/>
          <strong>Student email:</strong> ${escapeHtml(studentEmail ?? "(not on file)")}<br/>
        </p>
        <p style="margin: 24px 0;">
          <a href="${escapeHtml(videoUrl)}"
             style="background: #2A1F18; color: #F1E9D6; padding: 10px 18px; text-decoration: none; font-weight: 600; display: inline-block;">
            ▶ Watch the tape
          </a>
        </p>
        <p style="margin: 24px 0;">
          <a href="${escapeHtml(adminUrl)}"
             style="color: #8E2A26; text-decoration: underline; font-weight: 600;">
            Open the admin grading dashboard →
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #C5B69E; margin: 32px 0 16px 0;"/>
        <p style="font-family: monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #5C4A3D; margin: 0;">
          Approve or reject from the dashboard. The student gets emailed automatically.
        </p>
      </div>
    `,
  };
}

type ReviewEmailParams = {
  studentEmail: string | null;
  songTitle: string;
  status: "approved" | "rejected";
  feedback: string | null;
  baseUrl: string;
  unlockedSongTitle?: string | null;
};

export function buildReviewEmail({
  studentEmail,
  songTitle,
  status,
  feedback,
  baseUrl,
  unlockedSongTitle,
}: ReviewEmailParams) {
  const continueUrl = `${baseUrl}/learn`;
  const isApproved = status === "approved";
  const headline = isApproved
    ? `🎉 Your ${songTitle} tape is approved!`
    : `Your ${songTitle} tape — feedback inside`;

  return {
    subject: headline,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #2A1F18; padding: 24px; max-width: 560px;">
        <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #5C4A3D; margin: 0 0 12px 0;">
          Guitar Course · Tape review
        </p>
        <h1 style="font-size: 24px; margin: 0 0 18px 0;">${escapeHtml(headline)}</h1>
        ${
          isApproved
            ? `<p style="margin: 0 0 18px 0;">Jeremiah watched your tape of <em>${escapeHtml(songTitle)}</em> and gave it the green light.${unlockedSongTitle ? ` <strong>${escapeHtml(unlockedSongTitle)}</strong> just unlocked for you.` : ""}</p>`
            : `<p style="margin: 0 0 18px 0;">Not quite there yet — Jeremiah left some notes below. Take another pass and resubmit when you're ready.</p>`
        }
        ${
          feedback
            ? `<blockquote style="border-left: 3px solid #8E2A26; padding: 6px 16px; margin: 18px 0; color: #2A1F18; background: #F1E9D6;"><em>${escapeHtml(feedback)}</em></blockquote>`
            : ""
        }
        <p style="margin: 24px 0;">
          <a href="${escapeHtml(continueUrl)}"
             style="background: #2A1F18; color: #F1E9D6; padding: 10px 18px; text-decoration: none; font-weight: 600; display: inline-block;">
            ${isApproved ? "Continue learning →" : "Practice and try again →"}
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #C5B69E; margin: 32px 0 16px 0;"/>
        <p style="font-family: monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #5C4A3D; margin: 0;">
          Jeremiah · jeremiahomolewa.work@gmail.com
        </p>
      </div>
    `,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
