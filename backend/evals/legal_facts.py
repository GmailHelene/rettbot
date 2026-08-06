"""
Fasit for juridiske evals: verifiserte frister og paragrafer.

Formålet er å fange den farligste feilen et slikt verktøy kan gjøre: å oppgi
feil klagefrist eller en paragraf som ikke finnes. Da kan brukeren tape saken.

Hvert testtilfelle har `must_contain`: en liste av grupper. For at svaret skal
regnes som riktig må minst én variant i HVER gruppe finnes i AI-svaret
(case-insensitivt). Slik tåler vi at modellen skriver «3 uker» eller «tre uker».

VIKTIG: Dette er et STARTSETT. Faktaene bør bekreftes og utvides (mål: 50+) av en
jurist. Ikke stol blindt på fasiten – det er nettopp derfor vi tester.
"""

EVAL_CASES = [
    {
        "id": "forvaltning-klagefrist",
        "case_type": "forvaltning",
        "question": "Hva er klagefristen på et forvaltningsvedtak, og hvilken paragraf regulerer det?",
        "must_contain": [["3 uker", "tre uker"], ["§ 29", "forvaltningsloven"]],
        "note": "Forvaltningsloven § 29: klagefrist tre uker.",
    },
    {
        "id": "forvaltning-partsinnsyn",
        "case_type": "forvaltning",
        "question": "Hvilken paragraf gir en part rett til innsyn i sakens dokumenter i en forvaltningssak?",
        "must_contain": [["§ 18"], ["forvaltningsloven", "fvl"]],
        "note": "Forvaltningsloven § 18: partsinnsyn.",
    },
    {
        "id": "forvaltning-begrunnelse",
        "case_type": "forvaltning",
        "question": "Kan jeg kreve en begrunnelse for et forvaltningsvedtak, og hvor står det?",
        "must_contain": [["§ 24", "§ 25"], ["forvaltningsloven", "fvl"]],
        "note": "Forvaltningsloven §§ 24-25: begrunnelsesplikt.",
    },
    {
        "id": "straff-ankefrist-dom",
        "case_type": "straffesak",
        "question": "Hva er ankefristen over en dom i en straffesak?",
        "must_contain": [["2 uker", "to uker"], ["§ 310", "straffeprosessloven", "strpl"]],
        "note": "Straffeprosessloven § 310: ankefrist to uker.",
    },
    {
        "id": "straff-klage-henleggelse",
        "case_type": "straffesak",
        "question": "Politiet har henlagt saken min. Hva er fristen for å klage, og til hvem?",
        "must_contain": [["3 uker", "tre uker"], ["statsadvokat"]],
        "note": "Klage på henleggelse: tre uker, til statsadvokaten (strpl. § 59 a).",
    },
    {
        "id": "sivil-ankefrist",
        "case_type": "sivil",
        "question": "Hva er ankefristen over en dom i en sivil sak etter tvisteloven?",
        "must_contain": [["1 måned", "en måned", "én måned"], ["§ 29-5", "tvisteloven"]],
        "note": "Tvisteloven § 29-5: ankefrist én måned.",
    },
    {
        "id": "offentleglova-innsyn",
        "case_type": "forvaltning",
        "question": "Hvilken lov gir allmennheten rett til innsyn i offentlige dokumenter?",
        "must_contain": [["offentleglova", "offentlighetsloven"]],
        "note": "Offentleglova regulerer innsyn i offentlige dokumenter.",
    },
    {
        "id": "emk-rettferdig-rettergang",
        "case_type": "menneskerettigheter",
        "question": "Hvilken artikkel i EMK gir rett til en rettferdig rettergang?",
        "must_contain": [["artikkel 6", "art. 6", "art 6"], ["EMK", "menneskerettighet"]],
        "note": "EMK art. 6: rett til rettferdig rettergang.",
    },
]
