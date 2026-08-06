"""
LEGAL EVIDENCE COLLECTION & PROTECTION MODULE

VIKTIG JURIDISK ANSVARSFRASKRIVELSE:
Dette systemet er designet for LOVLIG bevisinnsamling og beskyttelse.
Alle metoder følger norsk lov og EMK.

LOVLIGE METODER for bevisinnsamling:
1. Dokumentere egne opplevelser (alltid lovlig)
2. Offentlige kilder (Brønnøysund, domstolsavgjørelser, media)
3. Innsyn etter Offentleglova/Forvaltningsloven
4. Vitneutsagn fra andre (med deres samtykke)
5. Åpne kilder (OSINT - Open Source Intelligence)
6. Egne opptak av samtaler du deltar i (enparts-samtykke i Norge)

ULOVLIGE METODER som IKKE støttes:
- Hacking
- Uautorisert tilgang til andres data
- Skjult overvåkning av andre uten lovlig grunn
- Brudd på taushetserklæringer
"""

from typing import List, Dict, Optional
from datetime import datetime
import hashlib
import json

class LegalEvidenceCollector:
    """
    Lovlig bevisinnsamling og beskyttelse
    """
    
    def __init__(self):
        self.evidence_chain = []
        
    async def document_public_sources(
        self,
        target_person: str,
        case_context: str
    ) -> Dict:
        """
        LOVLIG: Søker i offentlige kilder
        
        Inkluderer:
        - Brønnøysundregistrene (firmaer, roller, eierskap)
        - Offentlige domstolsavgjørelser (Lovdata)
        - Åpne medieoppslag
        - Offentlige dokumenter
        - Politiske verv og interesser
        """
        
        sources = {
            "brreg": await self._search_brreg(target_person),
            "court_decisions": await self._search_court_decisions(target_person),
            "media": await self._search_media_mentions(target_person),
            "public_records": await self._search_public_records(target_person),
            "political_connections": await self._search_political_connections(target_person)
        }
        
        # Kryptografisk timestamp
        timestamp = datetime.now().isoformat()
        evidence_hash = self._calculate_hash({
            "timestamp": timestamp,
            "target": target_person,
            "sources": sources
        })
        
        return {
            "timestamp": timestamp,
            "target": target_person,
            "case": case_context,
            "sources": sources,
            "evidence_hash": evidence_hash,
            "collection_method": "Public OSINT - Fully Legal",
            "chain_of_custody": [
                {
                    "action": "collected",
                    "timestamp": timestamp,
                    "method": "automated_public_search",
                    "hash": evidence_hash
                }
            ]
        }
    
    async def _search_brreg(self, person: str) -> Dict:
        """
        Søker Brønnøysundregistrene (helt lovlig og offentlig)
        
        Finner:
        - Firmaer personen er involvert i
        - Styreroller
        - Eierskap
        - Prokura
        - Konkurser/tvangsoppløsninger
        """
        return {
            "method": "Brønnøysundregistrene API (offentlig)",
            "companies": [],  # TODO: Implementer API-kall
            "roles": [],
            "ownership": [],
            "bankruptcies": [],
            "note": "All informasjon er offentlig tilgjengelig"
        }
    
    async def _search_court_decisions(self, person: str) -> Dict:
        """
        Søker offentlige domstolsavgjørelser
        
        Finner:
        - Tidligere dommer
        - Sivile søksmål
        - Straffesaker (hvis offentlige)
        - Rettslige tvister
        """
        return {
            "method": "Lovdata / offentlige dommer",
            "criminal_cases": [],
            "civil_cases": [],
            "note": "Kun offentliggjorte dommer inkluderes"
        }
    
    async def _search_media_mentions(self, person: str) -> List[Dict]:
        """
        Søker i åpne mediekilder
        
        Inkluderer:
        - Nyhetsartikler
        - Pressemeldinger
        - Offentlige uttalelser
        - Sosiale medier (offentlige poster)
        """
        return {
            "method": "Åpne mediekilder",
            "articles": [],
            "note": "Kun offentlig tilgjengelig informasjon"
        }
    
    async def _search_public_records(self, person: str) -> Dict:
        """
        Andre offentlige registre
        
        Kan inkludere:
        - Eiendomsregister (hvis offentlig)
        - Profesjonsregistre (leger, advokater, etc.)
        - Offentlige verv
        """
        return {
            "method": "Offentlige registre",
            "properties": [],
            "professional_licenses": [],
            "public_positions": []
        }
    
    async def _search_political_connections(self, person: str) -> Dict:
        """
        Politiske forbindelser og interesser (offentlig info)
        
        Inkluderer:
        - Partimedlemskap (hvis offentlig)
        - Politiske verv
        - Donasjoner (hvis offentliggjort)
        - Interesseorganisasjoner
        """
        return {
            "method": "Offentlige politiske registre",
            "party_affiliation": [],
            "political_positions": [],
            "donations": [],
            "lobby_connections": []
        }
    
    async def request_official_information(
        self,
        authority: str,
        request_type: str,
        justification: str
    ) -> Dict:
        """
        LOVLIG: Begjæring om innsyn etter Offentleglova/Forvaltningsloven
        
        Norsk lov gir deg rett til innsyn i:
        - Saksdokumenter i din egen sak
        - Offentlige dokumenter (med visse unntak)
        - Politiets saksdokumenter (etter avsluttet etterforskning)
        """
        
        request = {
            "timestamp": datetime.now().isoformat(),
            "authority": authority,
            "request_type": request_type,
            "legal_basis": self._get_legal_basis(request_type),
            "justification": justification,
            "template": self._generate_foia_template(authority, request_type, justification),
            "expected_response_time": "30 dager (Offentleglova § 29)",
            "appeal_process": [
                "1. Klage til samme organ (hvis avslag)",
                "2. Klage til overordnet organ",
                "3. Klage til Sivilombudsmannen",
                "4. Eventuelt søksmål"
            ]
        }
        
        return request
    
    def _get_legal_basis(self, request_type: str) -> List[str]:
        """Juridisk grunnlag for innsynsbegjæring"""
        bases = {
            "police_documents": [
                "Straffeprosessloven § 242 (Innsyn i saksdokumenter)",
                "Offentleglova § 3 (Rett til innsyn)",
                "EMK Artikkel 6 (Rettferdig rettergang krever innsyn)"
            ],
            "administrative_documents": [
                "Offentleglova § 3 (Rett til innsyn)",
                "Forvaltningsloven § 18 (Partsinnsyn)"
            ],
            "own_case_documents": [
                "Forvaltningsloven § 18 (Partsinnsyn)",
                "GDPR Artikkel 15 (Rett til innsyn i egne personopplysninger)"
            ]
        }
        return bases.get(request_type, ["Offentleglova § 3"])
    
    def _generate_foia_template(
        self,
        authority: str,
        request_type: str,
        justification: str
    ) -> str:
        """Genererer ferdig begjæring om innsyn"""
        
        return f"""
BEGJÆRING OM INNSYN

Til: {authority}
Dato: {datetime.now().strftime('%d.%m.%Y')}

INNSYN I SAKSDOKUMENTER

Med hjemmel i Offentleglova § 3 og Forvaltningsloven § 18 ber jeg om innsyn i følgende:

{justification}

RETTSLIG GRUNNLAG:
{chr(10).join(f'- {basis}' for basis in self._get_legal_basis(request_type))}

Jeg ber om at dokumentene sendes meg i digital form (PDF) innen lovens frist på 30 dager.

Dersom deler av dokumentene er unntatt offentlighet, ber jeg om at disse delene sladdes og at jeg får innsyn i resten (jf. Offentleglova § 12).

Jeg gjør oppmerksom på at jeg vil klage til Sivilombudsmannen dersom denne begjæringen ikke behandles i henhold til loven.

Med vennlig hilsen,
[Navn]
[Adresse]
[E-post]
[Telefon]
"""
    
    async def document_own_interaction(
        self,
        interaction_type: str,
        description: str,
        participants: List[str],
        audio_file: Optional[bytes] = None
    ) -> Dict:
        """
        LOVLIG: Dokumenterer egne interaksjoner
        
        I Norge har du rett til å:
        - Ta opp samtaler du selv deltar i (enparts-samtykke)
        - Dokumentere hendelser du selv opplever
        - Notere vitners kontaktinfo (med deres samtykke)
        
        IKKE LOVLIG:
        - Ta opp andres private samtaler du ikke deltar i
        - Skjult overvåkning av andres private sfære
        """
        
        timestamp = datetime.now().isoformat()
        
        evidence = {
            "timestamp": timestamp,
            "type": interaction_type,
            "description": description,
            "participants": participants,
            "documentation_method": "First-hand account (legal)",
            "has_audio": audio_file is not None,
            "legal_basis": "Enparts-samtykke (norsk lov)",
            "chain_of_custody": [
                {
                    "action": "documented",
                    "timestamp": timestamp,
                    "method": "direct_observation",
                    "observer": "self"
                }
            ]
        }
        
        if audio_file:
            audio_hash = hashlib.sha512(audio_file).hexdigest()
            evidence["audio_hash"] = audio_hash
            evidence["audio_note"] = "Opptak av samtale jeg selv deltok i (lovlig)"
        
        # Kryptografisk hash av hele beviset
        evidence["evidence_hash"] = self._calculate_hash(evidence)
        
        return evidence
    
    async def create_witness_statement(
        self,
        witness_name: str,
        witness_contact: str,
        statement: str,
        witness_consent: bool = True
    ) -> Dict:
        """
        LOVLIG: Dokumenterer vitneutsagn (med vitnes samtykke)
        
        Viktig:
        - Vitne må samtykke til at utsagn dokumenteres
        - Vitne bør signere/bekrefte utsagnet
        - Vitnets kontaktinfo lagres for senere bekreftelse
        """
        
        if not witness_consent:
            raise ValueError("Vitne må samtykke til dokumentasjon av utsagn")
        
        timestamp = datetime.now().isoformat()
        
        witness_doc = {
            "timestamp": timestamp,
            "witness_name": witness_name,
            "witness_contact": witness_contact,
            "statement": statement,
            "consent_given": True,
            "legal_basis": "Frivillig vitneutsagn med samtykke",
            "template_for_signature": self._generate_witness_template(
                witness_name,
                statement,
                timestamp
            ),
            "note": "Vitne bør signere dette dokumentet for maksimal bevisverdi"
        }
        
        witness_doc["evidence_hash"] = self._calculate_hash(witness_doc)
        
        return witness_doc
    
    def _generate_witness_template(
        self,
        witness_name: str,
        statement: str,
        timestamp: str
    ) -> str:
        """Genererer ferdig vitneerklæring for signering"""
        
        return f"""
VITNEERKLÆRING

Jeg, undertegnede {witness_name}, avgir følgende erklæring:

TIDSPUNKT: {timestamp}

ERKLÆRING:
{statement}

Jeg erklærer at ovenstående er sant etter beste overbevisning.

Jeg er klar over at falsk forklaring er straffbart etter Straffeloven § 221.

Jeg samtykker til at denne erklæringen brukes som bevis i eventuell rettssak eller klagesak.

____________________    ____________________
Sted, dato              Signatur

{witness_name}
[Kontaktinformasjon]
"""
    
    async def blockchain_timestamp_evidence(
        self,
        evidence_hash: str,
        description: str
    ) -> Dict:
        """
        LOVLIG: Tidsstempling av bevis på blockchain
        
        Dette gir kryptografisk bevis på at:
        - Beviset eksisterte på et bestemt tidspunkt
        - Beviset ikke er endret siden da
        
        Nyttig hvis du frykter at noen vil si beviset er forfalsket senere.
        """
        
        # TODO: Implementer faktisk blockchain-timestamping
        # (OpenTimestamps, Ethereum, Bitcoin, etc.)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "evidence_hash": evidence_hash,
            "description": description,
            "blockchain": "OpenTimestamps",  # Gratis tjeneste
            "proof": "TODO: Actual blockchain proof",
            "verification_url": f"https://opentimestamps.org/verify?hash={evidence_hash}",
            "purpose": "Kryptografisk bevis på at dokumentet eksisterte på dette tidspunktet",
            "tamper_proof": True
        }
    
    async def secure_multi_location_backup(
        self,
        evidence_data: bytes,
        description: str
    ) -> Dict:
        """
        LOVLIG: Sikkerhetskopier bevis på flere steder
        
        Strategi mot bevisødeleggelse:
        - Kryptert kopi til pålitelig advokat
        - Kryptert kopi til familie/venn
        - Kryptert cloud-backup (flere leverandører)
        - Fysisk USB-kopi på trygg lokasjon
        - Paper backup av kritiske hasher
        """
        
        evidence_hash = hashlib.sha512(evidence_data).hexdigest()
        
        backup_plan = {
            "timestamp": datetime.now().isoformat(),
            "description": description,
            "evidence_hash": evidence_hash,
            "backup_locations": [
                {
                    "type": "trusted_attorney",
                    "status": "pending",
                    "encryption": "Per-share encryption",
                    "note": "Advokat med taushetsplikt"
                },
                {
                    "type": "family_member",
                    "status": "pending",
                    "encryption": "Strong passphrase",
                    "note": "Pålitelig familiemedlem med fysisk kopi"
                },
                {
                    "type": "cloud_service_1",
                    "provider": "ProtonDrive",
                    "encryption": "Zero-knowledge",
                    "status": "pending"
                },
                {
                    "type": "cloud_service_2",
                    "provider": "Tresorit",
                    "encryption": "End-to-end",
                    "status": "pending"
                },
                {
                    "type": "physical_usb",
                    "location": "Safe deposit box",
                    "encryption": "Full disk encryption",
                    "status": "pending"
                },
                {
                    "type": "paper_backup",
                    "content": "Evidence hashes + recovery instructions",
                    "location": "Separate secure location",
                    "status": "pending"
                }
            ],
            "dead_mans_switch": {
                "enabled": False,  # TODO: Implementer
                "description": "Automatisk frigivelse hvis du ikke logger inn på X dager",
                "recipients": [],
                "trigger_days": 90
            }
        }
        
        return backup_plan
    
    async def pattern_analysis_of_public_behavior(
        self,
        target_person: str,
        time_period: Dict[str, str]
    ) -> Dict:
        """
        LOVLIG: Analyserer mønstre i OFFENTLIG oppførsel
        
        Kun basert på:
        - Offentlige uttalelser
        - Offentlige handlinger
        - Offentlig tilgjengelig informasjon
        - Dine egne observasjoner av offentlig oppførsel
        
        Kan avdekke:
        - Mønstre i hvordan saker behandles
        - Interessekonflikter
        - Mulige forbindelser til andre
        """
        
        return {
            "target": target_person,
            "period": time_period,
            "data_sources": "Only public information",
            "patterns_found": [],  # TODO: AI-analyse
            "suspicious_patterns": [],
            "legal_note": "All analyse basert på offentlig tilgjengelig informasjon",
            "next_steps": [
                "Dokumenter mønstrene grundig",
                "Sammenlign med normale mønstre",
                "Bruk som grunnlag for innsyn/klage"
            ]
        }
    
    def _calculate_hash(self, data: Dict) -> str:
        """Beregner SHA-512 hash av data"""
        json_str = json.dumps(data, sort_keys=True)
        return hashlib.sha512(json_str.encode()).hexdigest()


# AUTOMATISK MONITORING AV OFFENTLIGE KILDER
class PublicSourceMonitor:
    """
    LOVLIG: Overvåker offentlige kilder for endringer
    
    Nyttig for:
    - Oppdage når nye dommer publiseres
    - Se når firmaregistreringer endres
    - Følge med på medieomtale
    - Varsles om relevante endringer
    """
    
    def __init__(self):
        self.monitored_sources = []
    
    async def monitor_court_decisions(
        self,
        keywords: List[str],
        notify_on_match: bool = True
    ) -> Dict:
        """Overvåker offentlige domstolsavgjørelser"""
        return {
            "source": "Lovdata / Offentlige dommer",
            "keywords": keywords,
            "check_frequency": "daily",
            "legal": True,
            "note": "Kun offentliggjorte dommer"
        }
    
    async def monitor_company_registry(
        self,
        person_or_company: str
    ) -> Dict:
        """Overvåker Brønnøysundregistrene for endringer"""
        return {
            "source": "Brønnøysundregistrene",
            "target": person_or_company,
            "monitors": [
                "Nye styreroller",
                "Endringer i eierskap",
                "Nye firmaer",
                "Konkurser"
            ],
            "legal": True,
            "public": True
        }
    
    async def monitor_media_mentions(
        self,
        keywords: List[str]
    ) -> Dict:
        """Overvåker medieomtale"""
        return {
            "source": "Åpne mediekilder",
            "keywords": keywords,
            "legal": True,
            "note": "Kun offentlige nyhetskilder"
        }
