import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Phone, Eye, EyeOff, Mic, MicOff, Volume2 } from 'lucide-react';

interface StealthModeProps {
  isActive: boolean;
  onToggle: () => void;
}

export const StealthMode: React.FC<StealthModeProps> = ({ isActive, onToggle }) => {
  const [isCamouflaged, setCamouflaged] = useState(false);
  const [voiceActivated, setVoiceActivated] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Voice activation setup
  useEffect(() => {
    if (!voiceActivated) return;

    const recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'nb-NO';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      // Voice commands
      if (command.includes('rettigheter') || command.includes('hjelp')) {
        speakRights();
      } else if (command.includes('advokat') || command.includes('telefon')) {
        speak('Advokatvakten: 2-2-4-7-9-7-0-0. Ring nå.');
      } else if (command.includes('ikke snakk') || command.includes('stillhet')) {
        speak('Husk: Du trenger ikke svare på spørsmål uten advokat. Stillhet er din rett.');
      } else if (command.includes('skjul') || command.includes('stealth')) {
        setCamouflaged(true);
        speak('Stealth modus aktivert. Appen er nå skjult.');
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [voiceActivated]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'nb-NO';
    utterance.rate = 0.9;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  };

  const speakRights = () => {
    const rightsText = `
      Dine viktigste rettigheter: 
      Ett: Du har rett til advokat før avhør. 
      To: Du trenger ikke svare på spørsmål uten advokat. 
      Tre: Krev å se ransakingsordre ved ransaking. 
      Fire: Ring advokatvakten på 2-2-4-7-9-7-0-0. 
      Fem: Dokument alt som skjer.
    `;
    speak(rightsText);
  };

  // Camouflage modes
  const camouflageApps = [
    {
      name: 'Været i dag',
      icon: '🌤️',
      content: (
        <div className="p-6 bg-blue-50">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">🌤️ Været i dag</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-slate-700">Oslo</h3>
              <p className="text-2xl font-bold text-blue-600">12°C</p>
              <p className="text-slate-600">Delvis skyet, lett regn</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-slate-700">Bergen</h3>
              <p className="text-2xl font-bold text-blue-600">8°C</p>
              <p className="text-slate-600">Regn, vind fra vest</p>
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Nyheter',
      icon: '📰',
      content: (
        <div className="p-6 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📰 Dagens Nyheter</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-slate-700">Politikk</h3>
              <p className="text-slate-600">Nye forslag fra Stortinget...</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-slate-700">Økonomi</h3>
              <p className="text-slate-600">Norges Bank holder renten...</p>
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Kalkulator',
      icon: '🔢',
      content: (
        <div className="p-6 bg-green-50">
          <h2 className="text-2xl font-bold text-green-800 mb-4">🔢 Kalkulator</h2>
          <div className="bg-white p-4 rounded-lg shadow max-w-xs mx-auto">
            <div className="grid grid-cols-4 gap-2">
              {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map((btn) => (
                <button key={btn} className="p-3 bg-gray-100 hover:bg-gray-200 rounded text-lg">
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  const [activeCamouflage, setActiveCamouflage] = useState(0);

  if (isCamouflaged) {
    return (
      <div className="min-h-screen">
        {/* Hidden exit button */}
        <button
          onClick={() => setCamouflaged(false)}
          className="fixed top-2 right-2 w-8 h-8 bg-transparent opacity-10 hover:opacity-100 z-50"
          title="Avslutt stealth (dobbeltklikk)"
          onDoubleClick={() => setCamouflaged(false)}
        >
          <Eye className="w-4 h-4" />
        </button>
        
        {/* Camouflaged content */}
        {camouflageApps[activeCamouflage].content}
        
        {/* Hidden voice controls */}
        {voiceActivated && (
          <div className="fixed bottom-2 left-2 w-4 h-4 bg-red-500 rounded-full opacity-20">
            {isListening && <div className="w-full h-full bg-red-600 rounded-full animate-pulse"></div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="icon-lg text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">🥷 Stealth Modus</h1>
              <p className="text-slate-400">Skjult operasjon - maksimal sikkerhet</p>
            </div>
          </div>
          
          <button
            onClick={onToggle}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
          >
            Deaktiver Stealth
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Voice Activation */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Mic className="icon-md text-green-400" />
              <h3 className="text-lg font-semibold">Taleaktivering</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Kontroller appen med stemmen din. Si "rettigheter" for å høre dine rettigheter.
            </p>
            <button
              onClick={() => setVoiceActivated(!voiceActivated)}
              className={`w-full py-2 rounded-lg flex items-center justify-center space-x-2 ${
                voiceActivated 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            >
              {voiceActivated ? <Mic className="icon-sm" /> : <MicOff className="icon-sm" />}
              <span>{voiceActivated ? 'Lytter...' : 'Aktiver Tale'}</span>
            </button>
            
            {voiceActivated && (
              <div className="mt-4 text-xs text-slate-400">
                <p><strong>Kommandoer:</strong></p>
                <p>• "Rettigheter" - Hør dine rettigheter</p>
                <p>• "Advokat" - Få telefonnummer</p>
                <p>• "Skjul" - Aktiver kamuflasjemodus</p>
              </div>
            )}
          </div>

          {/* Camouflage Mode */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <EyeOff className="icon-md text-purple-400" />
              <h3 className="text-lg font-semibold">Kamuflasjemodus</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Appen ser ut som en vanlig app (vær, nyheter, kalkulator).
            </p>
            
            <div className="space-y-2 mb-4">
              {camouflageApps.map((app, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCamouflage(index)}
                  className={`w-full p-2 rounded flex items-center space-x-2 ${
                    activeCamouflage === index ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <span>{app.icon}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCamouflaged(true)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Aktiver Kamuflasje
            </button>
          </div>

          {/* Quick Escape */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="icon-md text-red-400" />
              <h3 className="text-lg font-semibold">Hurtig Flukt</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Rask exit og datarensing i nødsituasjoner.
            </p>
            
            <div className="space-y-2">
              <button
                onClick={() => window.close()}
                className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded-lg"
              >
                Lukk App
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Dette vil slette ALL data. Fortsett?')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    indexedDB.deleteDatabase('rettbot-cases');
                    window.location.href = 'https://www.google.com';
                  }
                }}
                className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Slett Data & Exit
              </button>
            </div>
          </div>
        </div>

        {/* Voice Status */}
        {voiceActivated && (
          <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Volume2 className="icon-md text-green-400" />
              <div>
                <h4 className="font-semibold text-green-100">Taleaktivering Aktiv</h4>
                <p className="text-green-200 text-sm">
                  {isListening ? 'Lytter etter kommandoer...' : 'Klar til å lytte'}
                </p>
              </div>
              {isListening && (
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Instructions */}
        <div className="bg-red-900 border border-red-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-100 mb-4">🚨 Stealth Instruksjoner</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-red-200 mb-2">Før Kontakt med Politi:</h4>
              <ul className="space-y-1 text-red-300">
                <li>• Aktiver kamuflasjemodus</li>
                <li>• Skru på taleaktivering</li>
                <li>• Hold telefonen diskret</li>
                <li>• Si "rettigheter" for instruksjoner</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-200 mb-2">Under Avhør/Ransaking:</h4>
              <ul className="space-y-1 text-red-300">
                <li>• App ser ut som værmelding</li>
                <li>• Dobbelttrykk øverst høyre for exit</li>
                <li>• Stemmekommandoer fungerer skjult</li>
                <li>• Ingen synlige spor av juridisk app</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-800 rounded-lg">
            <p className="text-red-100 text-xs">
              <strong>VIKTIG:</strong> Denne funksjonen er utviklet for din sikkerhet i lovlige situasjoner. 
              Bruk ansvarlig og i samsvar med norsk lov.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StealthMode;