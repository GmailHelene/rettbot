import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Volume2, VolumeX, Eye, EyeOff, Power } from 'lucide-react';

interface PanicModeProps {
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

export const PanicMode: React.FC<PanicModeProps> = ({ isActive, onActivate, onDeactivate }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stealthMode, setStealthMode] = useState(false);
  const [quickExitEnabled, setQuickExitEnabled] = useState(false);

  // Keyboard shortcuts for panic mode
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Triple Ctrl+P activates panic mode
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        if (!isActive) {
          onActivate();
        }
      }
      
      // Escape key exits panic mode
      if (event.key === 'Escape' && isActive) {
        onDeactivate();
      }
      
      // Ctrl+Shift+X = Quick Exit with optional wipe
      if (event.ctrlKey && event.shiftKey && event.key === 'X') {
        event.preventDefault();
        handleQuickExit();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, onActivate, onDeactivate]);

  const handleQuickExit = () => {
    if (confirm('ADVARSEL: Dette vil lukke appen øyeblikkelig. Vil du slette sensitiv data? (Anbefales ved risiko)')) {
      // Clear sensitive data
      localStorage.clear();
      sessionStorage.clear();
      indexedDB.deleteDatabase('rettbot-cases');
      indexedDB.deleteDatabase('rettbot-evidence');
      
      // Close window
      window.close();
      
      // If that doesn't work, redirect to safe page
      window.location.href = 'https://www.google.com/search?q=nyheter';
    }
  };

  const emergencyRights = [
    {
      situation: "🚔 Politikontakt/Pågripelse",
      rights: [
        "Du har rett til å vite hvorfor du er pågrepet (strpl § 171)",
        "Du har rett til advokat (strpl § 181)",
        "Du trenger IKKE svare på spørsmål uten advokat",
        "Be om navn og tjenestenummer på politiet",
        "Krev skriftlig pågripelsesordre hvis mulig"
      ],
      actions: [
        "Si: 'Jeg ønsker advokat før jeg svarer på spørsmål'",
        "Dokumenter alt: tid, sted, navn på politi",
        "Ring advokat så snart du kan: 22 47 97 00 (Advokatvakten)",
        "Ikke motstand selv om pågripelsen er ulovlig"
      ]
    },
    {
      situation: "🏠 Ransaking",
      rights: [
        "Politiet må ha ransakingsordre (strpl § 192)",
        "Du kan kreve å se ransakingsordren",
        "Du har rett til vitne ved ransaking",
        "De kan IKKE ödelegge ting uten grunn",
        "Ta bilder/video av skader"
      ],
      actions: [
        "Be om ransakingsordre og les den nøye",
        "Ring advokat: 22 47 97 00",
        "Dokumenter alt som tas og skader",
        "Få kvittering for alt som beslaglegges"
      ]
    },
    {
      situation: "👮 Avhør",
      rights: [
        "Du har rett til advokat før avhør (strpl § 181)",
        "Du kan nekte å svare på spørsmål",
        "Avhør skal tas opp på video/lyd",
        "Du skal få kopi av avhøret",
        "Du kan be om pause når som helst"
      ],
      actions: [
        "Si: 'Jeg vil ha advokat tilstede'",
        "Ikke sign noe uten advokat",
        "Be om pause hvis du trenger det",
        "Husk: stillhet er ikke skyld"
      ]
    }
  ];

  const emergencyContacts = [
    { name: "Advokatvakten", number: "22 47 97 00", available: "24/7" },
    { name: "Politiet (ikke-nødvendig)", number: "02800", available: "24/7" },
    { name: "Nødtelefon", number: "112", available: "24/7" },
    { name: "Spesialenheten", number: "23 29 22 00", available: "Hverdager" },
    { name: "Sivilombudet", number: "22 82 85 00", available: "Hverdager" },
    { name: "Krisesentertelefonen", number: "116 006", available: "24/7" }
  ];

  if (!isActive) {
    return (
      <button
        onClick={onActivate}
        className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center space-x-2 z-50"
        title="Trykk for nødhjelp (Ctrl+P)"
      >
        <AlertTriangle className="icon-sm" />
        <span className="font-semibold">NØDHJELP</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-red-900 bg-opacity-95 z-50 overflow-auto">
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="icon-lg text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">🚨 NØDHJELP AKTIVERT</h1>
              <p className="text-red-200">Dine rettigheter og nødkontakter</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 bg-red-700 hover:bg-red-600 rounded-lg text-white"
              title={audioEnabled ? "Skru av lyd" : "Skru på lyd"}
            >
              {audioEnabled ? <Volume2 className="icon-sm" /> : <VolumeX className="icon-sm" />}
            </button>
            
            {/* Stealth Mode */}
            <button
              onClick={() => setStealthMode(!stealthMode)}
              className="p-2 bg-red-700 hover:bg-red-600 rounded-lg text-white"
              title={stealthMode ? "Normal visning" : "Skjult modus"}
            >
              {stealthMode ? <Eye className="icon-sm" /> : <EyeOff className="icon-sm" />}
            </button>
            
            {/* Quick Exit */}
            <button
              onClick={handleQuickExit}
              className="p-2 bg-red-700 hover:bg-red-600 rounded-lg text-white"
              title="Hurtig exit med dataasletting (Ctrl+Shift+X)"
            >
              <Power className="icon-sm" />
            </button>
            
            {/* Close */}
            <button
              onClick={onDeactivate}
              className="p-2 bg-red-700 hover:bg-red-600 rounded-lg text-white"
              title="Lukk nødhjelp (Esc)"
            >
              <X className="icon-sm" />
            </button>
          </div>
        </div>

        {/* Emergency Rights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {emergencyRights.map((emergency, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{emergency.situation}</h3>
              
              <div className="mb-4">
                <h4 className="font-semibold text-slate-700 mb-2">🛡️ Dine Rettigheter:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {emergency.rights.map((right, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>{right}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">⚡ Hva Du Skal Gjøre:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {emergency.actions.map((action, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue-600 mr-2">→</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-slate-800 mb-4">📞 Viktige Telefonnummer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-semibold text-slate-800">{contact.name}</div>
                  <div className="text-sm text-slate-600">{contact.available}</div>
                </div>
                <a
                  href={`tel:${contact.number.replace(/\s/g, '')}`}
                  className="text-xl font-bold text-blue-600 hover:text-blue-800"
                >
                  {contact.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Instructions */}
        {audioEnabled && (
          <div className="mt-6 bg-yellow-100 border border-yellow-400 rounded-lg p-4">
            <p className="text-yellow-800">
              🔊 <strong>Lydveiledning aktivert:</strong> Appen kan lese instruksjoner høyt hvis du trykker på tekst. 
              Hold telefonen nær øret i farlige situasjoner.
            </p>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div className="mt-4 text-center">
          <p className="text-red-200 text-sm">
            Hurtigtaster: <strong>ESC</strong>=Lukk | <strong>Ctrl+Shift+X</strong>=Hurtig exit | <strong>Ctrl+P</strong>=Aktiver nødhjelp
          </p>
        </div>
      </div>
    </div>
  );
};

export default PanicMode;