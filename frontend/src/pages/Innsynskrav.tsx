import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileKey, Copy, Download, Printer, Check } from 'lucide-react';
import SaveToCase from '../components/SaveToCase';

type Kind = 'personvern' | 'offentleg';

export default function Innsynskrav() {
  const [kind, setKind] = useState<Kind>('personvern');
  const [navn, setNavn] = useState('');
  const [adresse, setAdresse] = useState('');
  const [epost, setEpost] = useState('');
  const [sted, setSted] = useState('');
  const [mottaker, setMottaker] = useState('');
  const [mottakerAdresse, setMottakerAdresse] = useState('');
  const [hva, setHva] = useState('');
  const [referanse, setReferanse] = useState('');
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });

  const grunnlag =
    kind === 'personvern'
      ? 'Kravet gjelder innsyn i personopplysninger om meg selv, og fremmes etter personvernreglene (GDPR). Jeg ber om kopi av opplysningene og informasjon om hvordan de behandles.'
      : 'Kravet fremmes etter offentleglova.';

  const hvaDefault =
    kind === 'personvern'
      ? 'alle personopplysninger dere har registrert om meg'
      : 'dokumentene i saken beskrevet nedenfor';

  const letter = `${navn || '[Ditt navn]'}
${adresse || '[Din adresse]'}
${epost || '[Din e-post]'}

${mottaker || '[Mottaker - instans]'}
${mottakerAdresse || '[Adresse]'}

${sted || '[Sted]'}, ${today}

KRAV OM INNSYN

Jeg ber med dette om innsyn i ${hva || hvaDefault}.

${grunnlag}
${referanse ? `\nSaksreferanse: ${referanse}` : ''}
Jeg ber om å få innsynet oversendt til ${epost || '[din e-post]'}.

Med vennlig hilsen
${navn || '[Ditt navn]'}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innsynskrav.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printDoc = () => {
    const w = window.open('', '_blank');
    if (!w) {
      alert('Kunne ikke åpne utskriftsvindu. Tillat popup for denne siden.');
      return;
    }
    const esc = letter.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    w.document.write(
      `<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>Innsynskrav</title>` +
        `<style>body{font-family:Georgia,'Times New Roman',serif;white-space:pre-wrap;line-height:1.6;font-size:12pt;color:#111;padding:2.5cm;}@media print{body{padding:2cm;}}</style></head><body>${esc}</body></html>`
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const field = (label: string, value: string, set: (v: string) => void, placeholder = '', textarea = false) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => set(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => set(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <FileKey className="header-title-icon text-primary-700" />
            <div>
              <h1 className="header-title">Innsynskrav</h1>
              <p className="header-subtitle">Be om innsyn i egne data eller offentlige dokumenter</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skjema */}
        <div className="card-professional space-y-4">
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">Hva vil du ha innsyn i?</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setKind('personvern')}
                className={
                  'px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 ' +
                  (kind === 'personvern' ? 'bg-primary-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')
                }
              >
                Mine personopplysninger
              </button>
              <button
                onClick={() => setKind('offentleg')}
                className={
                  'px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 ' +
                  (kind === 'offentleg' ? 'bg-primary-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')
                }
              >
                Offentlige dokumenter
              </button>
            </div>
          </div>

          {field('Ditt navn', navn, setNavn, 'Kari Nordmann')}
          {field('Din adresse', adresse, setAdresse, 'Gate 1, 0000 Sted')}
          {field('Din e-post', epost, setEpost, 'kari@epost.no')}
          {field('Sted (for dato)', sted, setSted, 'Oslo')}
          {field('Mottaker (instans)', mottaker, setMottaker, 'Navn på kommune/etat/organisasjon')}
          {field('Mottakers adresse', mottakerAdresse, setMottakerAdresse, 'Adresse')}
          {field('Hva vil du ha innsyn i?', hva, setHva, hvaDefault, true)}
          {field('Saksreferanse (valgfritt)', referanse, setReferanse, 'saksnr, hvis du har')}
        </div>

        {/* Forhåndsvisning */}
        <div className="card-professional flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">Forhåndsvisning</span>
            <div className="flex gap-2">
              <button onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Kopiert' : 'Kopier'}
              </button>
              <button onClick={printDoc} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <Printer className="w-4 h-4" />
                PDF
              </button>
              <button onClick={download} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-600 text-white hover:bg-primary-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <Download className="w-4 h-4" />
                Last ned
              </button>
            </div>
          </div>
          <pre className="flex-1 whitespace-pre-wrap font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-800 overflow-auto">
            {letter}
          </pre>
        </div>
      </main>

      <div className="max-w-5xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
        <SaveToCase getContent={() => letter} defaultTitle="Innsynskrav" />

        <div className="mt-6 rounded-xl border border-primary-200 bg-primary-50 p-5 text-sm text-primary-900">
          <p>
            <strong>Godt å vite:</strong> Du trenger ikke begrunne et innsynskrav. Ved innsyn i egne
            personopplysninger skal den ansvarlige normalt svare innen én måned. Får du avslag eller
            ikke svar, kan du klage - se{' '}
            <Link to="/hvor-klager-du" className="underline">Hvor klager du?</Link> (personvern:
            Datatilsynet). Dette er generell informasjon, ikke juridisk rådgivning.
          </p>
        </div>
      </div>
    </div>
  );
}
