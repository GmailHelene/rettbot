import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface Props {
  /** Kort id for hvilken side/verktøy dette gjelder, f.eks. "legal-research". */
  tool: string;
  className?: string;
}

const storageKey = (tool: string) => `rb_feedback_${tool}`;

/**
 * Liten, anonym nytte-tilbakemelding. Spør «var dette nyttig?» og
 * (valgfritt) om brukeren sendte klagen. Lagrer ingen PII, og maser ikke:
 * når du har svart én gang, skjules den for den siden.
 */
export default function FeedbackWidget({ tool, className = '' }: Props) {
  const [done, setDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey(tool)) === '1';
    } catch {
      return false;
    }
  });
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  if (done) return null;

  const submit = async (sentComplaint: string | null) => {
    if (helpful === null) return;
    setSending(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool,
          helpful,
          sent_complaint: sentComplaint,
          comment: comment.trim() || null,
        }),
      });
    } catch {
      /* stille – tilbakemelding er ikke kritisk for brukeren */
    } finally {
      try {
        localStorage.setItem(storageKey(tool), '1');
      } catch {
        /* ignore */
      }
      setDone(true);
      setSending(false);
    }
  };

  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 ${className}`}>
      {helpful === null ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-700">Var dette nyttig?</span>
          <button
            type="button"
            onClick={() => setHelpful(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ThumbsUp className="w-4 h-4" /> Ja
          </button>
          <button
            type="button"
            onClick={() => setHelpful(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ThumbsDown className="w-4 h-4" /> Nei
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">Takk! Sendte du inn klagen eller kravet?</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Valgfritt: hva manglet, eller hva funket? (ikke skriv personopplysninger)"
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-y"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={sending} onClick={() => submit('ja')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60">Ja</button>
            <button type="button" disabled={sending} onClick={() => submit('ikke_enda')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60">Ikke ennå</button>
            <button type="button" disabled={sending} onClick={() => submit('nei')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60">Nei</button>
            <button type="button" disabled={sending} onClick={() => submit(null)} className="text-sm text-slate-500 hover:text-slate-700 px-2 disabled:opacity-60">Hopp over</button>
          </div>
        </div>
      )}
    </div>
  );
}
