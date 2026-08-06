import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  '/': 'RettBot+ – Kjenn rettighetene dine mot politi og myndigheter',
  '/app': 'RettBot+ – Dashboard',
  '/login': 'Logg inn – RettBot+',
  '/register': 'Opprett konto – RettBot+',
  '/forgot-password': 'Glemt passord – RettBot+',
  '/reset-password': 'Tilbakestill passord – RettBot+',
  '/evidence-analysis': 'Bevisanalyse – RettBot+',
  '/legal-research': 'Juridisk research i norsk lov – RettBot+',
  '/defense-strategy': 'Forsvarsstrategi – RettBot+',
  '/document-generator': 'Dokumentgenerator – RettBot+',
  '/penalties': 'Strafferammer etter norsk lov – RettBot+',
  '/rights-protection': 'Rettighetsvern og klage – RettBot+',
  '/corruption-assessment': 'Korrupsjonsvurdering – RettBot+',
  '/evidence-upload': 'Last opp bevis – RettBot+',
  '/legal-chat': 'AI juridisk chat – RettBot+',
  '/my-cases': 'Mine saker – RettBot+',
  '/min-konto': 'Min konto – RettBot+',
  '/tidslinje': 'Saks-tidslinje – RettBot+',
  '/hvor-klager-du': 'Hvor klager du? Norske klageorganer – RettBot+',
  '/maler': 'Maler: klage, anke, anmeldelse, innsyn – RettBot+',
  '/fristkalkulator': 'Fristkalkulator – klage- og ankefrist – RettBot+',
  '/innsynskrav': 'Innsynskrav – be om innsyn i egne data – RettBot+',
  '/kom-i-gang': 'Kom i gang – RettBot+',
  '/eksempler': 'Eksempler: gode klager og vanlige feil – RettBot+',
  '/personvern': 'Personvernerklæring – RettBot+',
  '/vilkar': 'Brukervilkår – RettBot+',
};

/**
 * Setter <title> per rute (SEO + brukeropplevelse) fra ett sted.
 */
export default function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] || 'RettBot+ – AI-assistert juridisk plattform';
  }, [pathname]);
  return null;
}
