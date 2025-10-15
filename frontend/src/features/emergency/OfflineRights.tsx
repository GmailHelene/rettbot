import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Book, Volume2, Shield, AlertTriangle } from 'lucide-react';

interface OfflineRightsProps {
  isOnline: boolean;
}

export const OfflineRights: React.FC<OfflineRightsProps> = ({ isOnline }) => {
  const [isOfflineReady, setOfflineReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('paagripeise');

  // Check if offline content is cached
  useEffect(() => {
    checkOfflineContent();
  }, []);

  const checkOfflineContent = async () => {
    try {
      const cache = await caches.open('rettbot-offline-rights');
      const cachedRequests = await cache.keys();
      setOfflineReady(cachedRequests.length > 0);
    } catch (error) {
      console.error('Feil ved sjekk av offline innhold:', error);
    }
  };

  const downloadOfflineContent = async () => {
    try {
      const cache = await caches.open('rettbot-offline-rights');
      const contentToCache = [
        '/offline-rights/paagripeise.json',
        '/offline-rights/ransaking.json',
        '/offline-rights/avhoer.json',
        '/offline-rights/korrupsjon.json',
        '/offline-rights/lovtekster.json'
      ];

      for (let i = 0; i < contentToCache.length; i++) {
        await cache.add(contentToCache[i]);
        setDownloadProgress(((i + 1) / contentToCache.length) * 100);
      }

      setOfflineReady(true);
    } catch (error) {
      console.error('Feil ved nedlasting av offline innhold:', error);
    }
  };

  // Offline legal content (Norwegian law)
  const offlineRightsContent = {
    paagripeise: {
      title: "🚔 Pågripelse - Dine Rettigheter",
      lawBasis: "Straffeprosessloven kapittel 15",
      rights: [
        {
          right: "Rett til å vite årsak (§ 171)",
          explanation: "Politiet MÅ fortelle deg hvorfor du blir pågrepet. Dette er ikke en høflighet, men en lovfestet rett.",
          action: "Spør direkte: 'Hva er grunnen til pågripelsen?' og noter svaret."
        },
        {
          right: "Rett til advokat (§ 181)",
          explanation: "Du har ubetinget rett til advokat før ethvert avhør. Politiet kan ikke nekte deg dette.",
          action: "Si tydelig: 'Jeg ønsker advokat før jeg svarer på spørsmål.' Ring 22 47 97 00."
        },
        {
          right: "Rett til taushet (§ 181)",
          explanation: "Du trenger ALDRI svare på spørsmål uten advokat. Stillhet er ikke tegn på skyld.",
          action: "Si: 'Jeg benytter min rett til taushet til advokat er tilstede.'"
        },
        {
          right: "Rett til informasjon (§ 171)",
          explanation: "Du skal få vite dine rettigheter, få kopi av pågripelsesordre og vite hvor lenge du kan holdes.",
          action: "Krev skriftlig pågripelsesordre og spør: 'Hvor lenge kan jeg holdes?'"
        }
      ],
      criticalActions: [
        "Noter TID, STED og NAVN på politifolk",
        "Be om badge-nummer/tjenestenummer",
        "Ikke motstand selv om pågripelsen virker ulovlig",
        "Dokument alt - skriv ned eller husk detaljer",
        "Ring advokat så snart som mulig: 22 47 97 00"
      ]
    },

    ransaking: {
      title: "🏠 Ransaking - Dine Rettigheter", 
      lawBasis: "Straffeprosessloven kapittel 16",
      rights: [
        {
          right: "Krav om ransakingsordre (§ 192)",
          explanation: "Politiet MÅ ha skriftlig ransakingsordre fra politimester eller domstol, med meget få unntak.",
          action: "Krev å se ransakingsordren. Les den nøye og ta bilde hvis mulig."
        },
        {
          right: "Rett til vitne (§ 195)",
          explanation: "Du har rett til å ha vitne tilstede under ransaking av ditt hjem.",
          action: "Be om å få kalle inn vitne. Dette kan være nabo, venn eller familiemedlem."
        },
        {
          right: "Begrensning av ransaking (§ 192)",
          explanation: "Ransaking må være relevant for etterforskningen og ikke mer omfattende enn nødvendig.",
          action: "Spør: 'Hva ser dere etter?' og noter om de ransaker utenfor ordren."
        },
        {
          right: "Kvittering for beslaglagte gjenstander (§ 204)",
          explanation: "Du skal få skriftlig kvittering for alt som tas fra deg eller ditt hjem.",
          action: "Krev kvittering for alt som beslaglegges. Noter beskrivelse av gjenstander."
        }
      ],
      criticalActions: [
        "Ikke hindre ransaking, men protestr verbalt hvis den virker ulovlig",
        "Ta bilder/video av skader politiet forårsaker", 
        "Noter navn på alle politi som deltar",
        "Ring advokat øyeblikkelig: 22 47 97 00",
        "Dokument alt som tas og eventuell ødeleggelse"
      ]
    },

    avhoer: {
      title: "👮 Avhør - Dine Rettigheter",
      lawBasis: "Straffeprosessloven kapittel 17",
      rights: [
        {
          right: "Rett til advokat før avhør (§ 181)", 
          explanation: "Du har absolutt rett til advokat før ethvert formelt avhør. Ingen unntak.",
          action: "Si: 'Jeg vil ha advokat tilstede under avhøret.' Ikke start uten advokat."
        },
        {
          right: "Rett til opptak (§ 244)",
          explanation: "Avhør skal tas opp på video eller lyd. Du har rett til kopi av opptaket.",
          action: "Spør: 'Blir dette tatt opp?' Krev kopi av opptaket når avhøret er ferdig."
        },
        {
          right: "Rett til pause (§ 244)",
          explanation: "Du kan be om pause når som helst under avhøret for å rådføre deg med advokat.",
          action: "Si: 'Jeg ønsker en pause for å snakke med min advokat.'"
        },
        {
          right: "Ingen tvang til tilståelse (§ 93)",
          explanation: "Du kan ikke tvinges til å tilstå eller belaste deg selv. Stillhet er din rett.",
          action: "Husk: Du trenger ikke svare på spørsmål som kan belaste deg."
        }
      ],
      criticalActions: [
        "ALDRI sign noe uten at advokat har lest det",
        "Be om pause hvis du føler press eller stress",
        "Ikke lat deg lokke til 'uformell prat' - det er også avhør",
        "Noter navn på alle tilstede under avhøret",
        "Ring 22 47 97 00 hvis du ikke har advokat"
      ]
    },

    korrupsjon: {
      title: "🏛️ Korrupsjon/Politivold - Spesielle Rettigheter",
      lawBasis: "Spesialenheten for politisaker",
      rights: [
        {
          right: "Anmeldelse til Spesialenheten",
          explanation: "Alle anklager om politivold eller korrupsjon MÅ behandles av Spesialenheten (SEFO).",
          action: "Ring SEFO direkte: 23 29 22 00 eller send anmeldelse til post@sefo.no"
        },
        {
          right: "Rett til uavhengig etterforskning",
          explanation: "Politiet kan IKKE etterforske seg selv. SEFO er uavhengig av politiet.",
          action: "Krev at saken overføres til SEFO hvis lokal politi prøver å etterforskel"
        },
        {
          right: "Bevissikring",
          explanation: "Du har rett til å sikre bevis før politiet kan ødelegge eller fjerne dem.",
          action: "Ta bilder, video, lydopptak. Sikre vitnemål. Kontakt journalist hvis nødvendig."
        },
        {
          right: "Internasjonal klage",
          explanation: "Du kan klage til Europarådets komité mot tortur (CPT) eller EMD ved systemiske problemer.",
          action: "Kontakt Norges Instittt for Menneskerettigheter: 22 84 30 00"
        }
      ],
      criticalActions: [
        "Dokument ALT - tid, sted, vitner, skader",
        "Søk medisinsk hjelp og få dokumentert skader",
        "Kontakt journalist/media hvis politiet fortieer saken", 
        "Ring SEFO: 23 29 22 00 - ikke lokal politi",
        "Vurder å kontakte menneskerettighetsorganisasjoner"
      ]
    }
  };

  const emergencyContacts = [
    { name: "Advokatvakten", number: "22 47 97 00", description: "24/7 juridisk hjelp", critical: true },
    { name: "Spesialenheten (SEFO)", number: "23 29 22 00", description: "Politivold/korrupsjon", critical: true },
    { name: "Menneskerettigheter", number: "22 84 30 00", description: "Systemiske problemer", critical: false },
    { name: "Sivilombudet", number: "22 82 85 00", description: "Forvaltningsklager", critical: false },
    { name: "Krisesenter", number: "116 006", description: "24/7 krisetelefon", critical: false }
  ];

  const currentContent = offlineRightsContent[selectedCategory as keyof typeof offlineRightsContent];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Status Header */}
        <div className={`rounded-lg p-4 mb-6 ${isOnline ? 'bg-green-100 border border-green-300' : 'bg-orange-100 border border-orange-300'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isOnline ? <Wifi className="icon-md text-green-600" /> : <WifiOff className="icon-md text-orange-600" />}
              <div>
                <h2 className={`text-lg font-semibold ${isOnline ? 'text-green-800' : 'text-orange-800'}`}>
                  {isOnline ? '🌐 Online Modus' : '📱 Offline Modus'}
                </h2>
                <p className={`text-sm ${isOnline ? 'text-green-700' : 'text-orange-700'}`}>
                  {isOnline 
                    ? 'Tilgang til fullstendig lovdatabase og AI-assistanse'
                    : 'Offline rettigheter tilgjengelig - viktigste informasjon cachet lokalt'
                  }
                </p>
              </div>
            </div>

            {/* Download Offline Content */}
            {isOnline && !isOfflineReady && (
              <button
                onClick={downloadOfflineContent}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Download className="icon-sm" />
                <span>Last ned offline innhold</span>
              </button>
            )}

            {downloadProgress > 0 && downloadProgress < 100 && (
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{Math.round(downloadProgress)}%</span>
              </div>
            )}

            {isOfflineReady && (
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="icon-sm" />
                <span className="text-sm font-medium">Offline innhold klar</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(offlineRightsContent).map(([key, content]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
              }`}
            >
              <div className="text-2xl mb-2">{content.title.split(' ')[0]}</div>
              <div className="font-semibold text-sm">{content.title.split(' ').slice(1).join(' ')}</div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rights Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Book className="icon-lg text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{currentContent.title}</h1>
                  <p className="text-slate-600">Lovgrunnlag: {currentContent.lawBasis}</p>
                </div>
              </div>

              {/* Rights List */}
              <div className="space-y-6 mb-8">
                {currentContent.rights.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-slate-800 mb-2">⚖️ {item.right}</h3>
                    <p className="text-slate-700 mb-3">{item.explanation}</p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-800 font-medium">
                        🎯 <strong>Handling:</strong> {item.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Critical Actions */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center">
                  <AlertTriangle className="icon-md mr-2" />
                  Kritiske Handlinger - Gjør Dette UMIDDELBART
                </h3>
                <ul className="space-y-2">
                  {currentContent.criticalActions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 font-bold mr-2">•</span>
                      <span className="text-red-800">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                📞 Nødkontakter
              </h3>
              
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      contact.critical 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{contact.name}</span>
                      {contact.critical && <span className="text-red-600 text-xs font-bold">KRITISK</span>}
                    </div>
                    <a 
                      href={`tel:${contact.number.replace(/\s/g, '')}`}
                      className="text-lg font-bold text-blue-600 hover:text-blue-800"
                    >
                      {contact.number}
                    </a>
                    <p className="text-xs text-slate-600 mt-1">{contact.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Instructions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Volume2 className="icon-md mr-2" />
                Lydinstruksjoner
              </h3>
              
              <p className="text-slate-600 text-sm mb-4">
                Trykk på tekst for å høre instruksjoner. Bruk dette hvis du ikke kan lese skjermen.
              </p>
              
              <button
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(
                    `Viktigste rettigheter: Du har rett til advokat. Ring 2-2-4-7-9-7-0-0. Du trenger ikke svare på spørsmål uten advokat. Krev ransakingsordre ved ransaking. Dokument alt som skjer.`
                  );
                  utterance.lang = 'nb-NO';
                  speechSynthesis.speak(utterance);
                }}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center space-x-2"
              >
                <Volume2 className="icon-sm" />
                <span>Hør Viktigste Rettigheter</span>
              </button>
            </div>

            {/* Offline Status */}
            {!isOnline && (
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">📱 Offline Modus Aktiv</h4>
                <p className="text-orange-700 text-sm">
                  Denne informasjonen er lagret lokalt på din enhet og fungerer uten internett. 
                  All viktig juridisk informasjon er tilgjengelig.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineRights;