import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Copy, Download, Check, Lightbulb, Printer } from 'lucide-react';
import { templates } from '../data/templates';
import SaveToCase from '../components/SaveToCase';
import FeedbackWidget from '../components/FeedbackWidget';

export default function Maler() {
  const [activeId, setActiveId] = useState(templates[0].id);
  const active = templates.find((t) => t.id === activeId) ?? templates[0];
  const [text, setText] = useState(active.body);
  const [copied, setCopied] = useState(false);

  const selectTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setActiveId(id);
    setText(t.body);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${active.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printDoc = () => {
    const w = window.open('', '_blank');
    if (!w) {
      alert('Kunne ikke åpne utskriftsvindu. Tillat popup for denne siden.');
      return;
    }
    const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    w.document.write(
      `<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>${active.title}</title>` +
        `<style>body{font-family:Georgia,'Times New Roman',serif;white-space:pre-wrap;` +
        `line-height:1.6;font-size:12pt;color:#111;padding:2.5cm;}` +
        `@media print{body{padding:2cm;}}</style></head><body>${esc}</body></html>`
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="header-title-icon text-primary-700" />
            <div>
              <h1 className="header-title">Maler</h1>
              <p className="header-subtitle">Klage, anke, anmeldelse og innsyn - fyll ut, kopier eller last ned</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Velg mal">
          {templates.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === activeId}
              onClick={() => selectTemplate(t.id)}
              className={
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ' +
                (t.id === activeId
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')
              }
            >
              {t.title}
            </button>
          ))}
        </div>

        <div className="card-professional mb-4">
          <p className="text-sm text-slate-600">{active.description}</p>
          {active.tips.length > 0 && (
            <div className="mt-4 flex gap-3 rounded-lg bg-primary-50 p-4">
              <Lightbulb className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <ul className="text-sm text-primary-900 space-y-1 list-disc pl-4">
                {active.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="card-professional">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="mal-tekst" className="text-sm font-semibold text-slate-800">
              Rediger malen (bytt ut tekst i [klammer])
            </label>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Kopiert' : 'Kopier'}
              </button>
              <button
                onClick={printDoc}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Printer className="w-4 h-4" />
                Skriv ut / PDF
              </button>
              <button
                onClick={download}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-600 text-white hover:bg-primary-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Download className="w-4 h-4" />
                Last ned
              </button>
            </div>
          </div>
          <textarea
            id="mal-tekst"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={22}
            spellCheck
            className="w-full font-mono text-sm p-4 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-y"
          />
        </div>

        <SaveToCase getContent={() => text} defaultTitle={active.title} />

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">
            <strong>Merk:</strong> Dette er nøytrale maler, ikke ferdig juridisk argumentasjon eller
            rådgivning. Frister og fremgangsmåte varierer - sjekk hos instansen saken gjelder, eller
            se <Link to="/hvor-klager-du" className="underline">Hvor klager du?</Link>
          </p>
        </div>
        <FeedbackWidget tool="maler" className="mt-8" />
      </main>
    </div>
  );
}
