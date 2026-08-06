"""
Norwegian Legal Knowledge Database for RettBot+
==============================================

Comprehensive Norwegian legal knowledge including:
- Straffeprosessloven (Criminal Procedure Act)
- Straffeloven (Criminal Code)  
- Politiloven (Police Act)
- EMK/ECHR relevant articles
- Key precedents and cases
"""

NORWEGIAN_CRIMINAL_PROCEDURE_LAW = {
    "§ 171": {
        "title": "Pågripelse",
        "text": "En person kan pågripes når det er grunn til å tro at han har begått en handling som kan medføre fengsel i mer enn 6 måneder, og det er fare for bevisforspillelse, gjentakelse eller unndragelse.",
        "key_points": ["Skjellig grunn til mistanke", "Fengsel over 6 måneder", "Farekriterier"],
        "related_articles": ["§ 172", "§ 173", "§ 174"]
    },
    "§ 172": {
        "title": "Varetektsfengsling",
        "text": "Siktede kan fengsles når han med skjellig grunn mistenkes for en handling som etter loven kan medføre fengsel i mer enn 6 måneder, og varetektsfengsling anses nødvendig.",
        "key_points": ["Skjellig grunn til mistanke", "Nødvendighetskrav", "Farekriterier"],
        "related_articles": ["§ 171", "§ 173", "§ 184"]
    },
    "§ 184": {
        "title": "Avhør av siktede",
        "text": "Før avhør skal siktede gjøres kjent med hva han er siktet for og opplyses om sin rett til forsvarer. Han skal også gjøres kjent med sin rett til ikke å forklare seg.",
        "key_points": ["Informasjonsplikt", "Rett til forsvarer", "Taushetrett"],
        "related_articles": ["§ 242", "§ 94", "§ 95"]
    },
    "§ 197": {
        "title": "Bevisføring",
        "text": "Bevis kan føres ved forklaring av tiltalte, vitner og sakkyndige, ved dokumenter, ved ransakning og ved skueplass.",
        "key_points": ["Bevistyper", "Bevisbyrde", "Bevisvurdering"],
        "related_articles": ["§ 210", "§ 294", "§ 347"]
    },
    "§ 210": {
        "title": "Dokumentbevis",
        "text": "Som bevis kan brukes dokumenter, fotografier, lydbåndopptak, filmer og andre gjengivelser som kan leses, ses eller høres.",
        "key_points": ["Dokumenttyper", "Autentisitet", "Tekniske bevis"],
        "related_articles": ["§ 197", "§ 211"]
    },
    "§ 242": {
        "title": "Aktinnsyn",
        "text": "Siktede og hans forsvarer har rett til å gjøre seg kjent med sakens dokumenter når det ikke vil være til skade for etterforskingen.",
        "key_points": ["Innsynsrett", "Forsvarets rettigheter", "Begrensninger"],
        "related_articles": ["§ 184", "§ 94"]
    }
}

NORWEGIAN_CRIMINAL_CODE = {
    "§ 231": {
        "title": "Narkotikaforbrytelser",
        "text": "Den som ulovlig erverver, besitter, fremstiller, innfører, utfører, overdrar, formidler overdragelse av eller på annen måte omsetter narkotika, straffes med bøter eller fengsel inntil 6 år.",
        "penalty": "Bøter eller fengsel inntil 6 år. Grovt tilfelle: fengsel inntil 10 år.",
        "factors": ["Mengde", "Type stoff", "Handlemåte", "Gevinst"],
        "related_articles": ["§ 232", "§ 233"]
    },
    "§ 271": {
        "title": "Legemskrenkelse",
        "text": "Den som ved mishandling eller på annen måte voldfører seg mot en annen persons legeme, straffes med bøter eller fengsel inntil 3 år.",
        "penalty": "Bøter eller fengsel inntil 3 år. Grovt tilfelle: fengsel inntil 6 år.",
        "factors": ["Skadens art og omfang", "Våpenbruk", "Forsett"],
        "related_articles": ["§ 272", "§ 273", "§ 274"]
    },
    "§ 311": {
        "title": "Tyveri",
        "text": "Den som tar en fremmed, løs ting i den hensikt å tilegne seg den, straffes for tyveri med bøter eller fengsel inntil 6 år.",
        "penalty": "Bøter eller fengsel inntil 6 år. Grovt tyveri: fengsel inntil 10 år.",
        "factors": ["Verdi", "Bruk av makt", "Organisering"],
        "related_articles": ["§ 312", "§ 313", "§ 314", "§ 315", "§ 316"]
    },
    "§ 371": {
        "title": "Bedrageri",
        "text": "Den som ved å fremkalle, styrke eller utnytte en villfarelse får noen til en handling som volder tap eller fare for tap, og som det for han innebar en uberettiget vinning, straffes for bedrageri.",
        "penalty": "Bøter eller fengsel inntil 6 år. Grovt bedrageri: fengsel inntil 10 år.",
        "factors": ["Økonomisk skade", "Systematikk", "Utnyttelse av stilling"],
        "related_articles": ["§ 372", "§ 373", "§ 374"]
    }
}

POLICE_LAW = {
    "§ 6": {
        "title": "Maktanvendelse",
        "text": "Politiet kan anvende makt når det er nødvendig og forsvarlig for å gjennomføre oppgaver som politiet har hjemmel til å utføre.",
        "key_points": ["Nødvendighetsprinsipp", "Forholdsmessighet", "Lovlig formål"],
        "related_articles": ["§ 7", "§ 8"]
    },
    "§ 28": {
        "title": "Inhabilitet",
        "text": "En polititjenesteperson er inhabil til å utføre tjeneste i en sak når vedkommende har personlig interesse i sakens utfall eller andre forhold som kan svekke tilliten til objektiviteten.",
        "key_points": ["Personlig interesse", "Objektivitet", "Tillitshensyn"],
        "related_articles": ["§ 29", "§ 30"]
    }
}

ECHR_ARTICLES = {
    "Art. 3": {
        "title": "Forbud mot tortur",
        "text": "Ingen må utsettes for tortur eller for umenneskelig eller nedverdigende behandling eller straff.",
        "relevance": "Politivold, celleforhold, varetekt",
        "key_cases": ["Soering v. UK", "Chahal v. UK", "Selmouni v. France"]
    },
    "Art. 5": {
        "title": "Rett til frihet og sikkerhet",
        "text": "Enhver har rett til frihet og personlig sikkerhet. Ingen må bli berøvet friheten unntatt i visse tilfeller og i samsvar med lovlig fremgangsmåte.",
        "relevance": "Pågripelse, varetekt, frihetsberøvelse",
        "key_cases": ["Brogan v. UK", "Fox, Campbell and Hartley v. UK"]
    },
    "Art. 6": {
        "title": "Rett til rettferdig rettergang",
        "text": "Enhver har ved avgjørelse av sine sivile rettigheter og plikter eller av en straffeanklage mot ham rett til en rettferdig og offentlig rettergang innen rimelig tid.",
        "relevance": "Alle straffesaker, sivile saker",
        "key_cases": ["Golder v. UK", "Deweer v. Belgium", "Salduz v. Turkey"]
    },
    "Art. 8": {
        "title": "Rett til privatliv",
        "text": "Enhver har rett til respekt for sitt privatliv og familieliv, sitt hjem og sin korrespondanse.",
        "relevance": "Ransaking, overvåking, telefonavlytting",
        "key_cases": ["Klass v. Germany", "Malone v. UK", "Kruslin v. France"]
    }
}

KEY_NORWEGIAN_PRECEDENTS = {
    "Rt-2017-2043": {
        "title": "Høyesteretts dom om beviskrav ved varetektsfengsling",
        "summary": "Høyesterett presiserte at skjellig grunn til mistanke krever sannsynlighetsovervekt, ikke bare mistanke.",
        "relevance": "Varetektsfengsling, beviskrav",
        "key_principle": "Sannsynlighetsovervekt kreves for skjellig grunn til mistanke"
    },
    "Rt-2018-1956": {
        "title": "Politiets maktanvendelse - forholdsmessighet",
        "summary": "Avgjørelse om når politiets maktanvendelse går over grensen til det straffbare.",
        "relevance": "Politivold, maktanvendelse, forholdsmessighet",
        "key_principle": "Maktanvendelse må være nødvendig og forholdsmessig"
    },
    "Rt-2019-1578": {
        "title": "Narkotika - mengdevurdering og straffutmåling",
        "summary": "Retningslinjer for straffutmåling ved narkotikaforbrytelser basert på mengde og type.",
        "relevance": "Narkotika, straffutmåling, mengdevurdering",
        "key_principle": "Mengde og type narkotika avgjørende for straffnivå"
    }
}

CORRUPTION_LAW = {
    "§ 387": {
        "title": "Korrupsjon - passive handlinger",
        "text": "En person som har et offentlig verv og som for seg eller andre krever, mottar eller aksepterer et tilbud om en utilbørlig fordel for utøvelsen av vervet, straffes med bøter eller fengsel inntil 10 år.",
        "penalty": "Bøter eller fengsel inntil 10 år",
        "key_elements": ["Offentlig verv", "Utilbørlig fordel", "Forbindelse til vervet"],
        "related_articles": ["§ 388", "§ 389"]
    },
    "§ 388": {
        "title": "Korrupsjon - aktive handlinger", 
        "text": "Den som gir, tilbyr eller lover en person med offentlig verv en utilbørlig fordel for utøvelsen av vervet, straffes med bøter eller fengsel inntil 6 år.",
        "penalty": "Bøter eller fengsel inntil 6 år",
        "key_elements": ["Gir/tilbyr/lover", "Offentlig verv", "Utilbørlig fordel"],
        "related_articles": ["§ 387", "§ 389"]
    }
}

PROCEDURAL_RIGHTS = {
    "right_to_counsel": {
        "law": "Straffeprosessloven § 94-96",
        "description": "Rett til forsvarer i alle straffesaker der det kan idømmes fengsel over 6 måneder",
        "when_applies": "Fra siktelse/pågripelse",
        "free_counsel": "Når fengselsstraff over 6 måneder er aktuell"
    },
    "right_to_silence": {
        "law": "Straffeprosessloven § 184",
        "description": "Rett til ikke å forklare seg - ingen kan tvinges til å belaste seg selv",
        "when_applies": "Ved alle avhør",
        "protection": "Taushet kan ikke tolkes til skade for siktede"
    },
    "right_to_interpreter": {
        "law": "Straffeprosessloven § 93",
        "description": "Rett til tolk hvis man ikke behersker norsk godt nok",
        "when_applies": "Ved alle prosessuelle handlinger",
        "free_service": "Kostnadsfritt for siktede"
    }
}

EVIDENCE_RULES = {
    "chain_of_custody": {
        "requirement": "Beviskjede må kunne dokumenteres fra beslag til rettssal",
        "documentation": "Hvem, hva, når, hvor ved hver håndtering",
        "integrity": "Bevis må være uendret og autentisk",
        "consequences": "Brudd kan føre til at bevis forkastes"
    },
    "digital_evidence": {
        "seizure": "Må sikres umiddelbart for å hindre sletting/endring", 
        "analysis": "Kriminalteknikk må dokumentere fremgangsmåte",
        "hash_values": "Digital fingeravtrykk for å bevise integritet",
        "expert_testimony": "Ofte nødvendig med sakkyndig forklaring"
    },
    "witness_testimony": {
        "reliability": "Troverdighet påvirket av observasjonsforhold, hukommelse, interesse",
        "corroboration": "Styrkes av andre bevis som støtter forklaringen",
        "cross_examination": "Motparten har rett til å stille spørsmål",
        "special_rules": "Særregler for barn, traumatiserte vitner"
    }
}

def get_relevant_law_sections(case_type: str, keywords: list) -> dict:
    """Return relevant law sections based on case type and keywords"""
    
    relevant = {}
    
    # Always include procedural rights
    relevant["procedural_rights"] = PROCEDURAL_RIGHTS
    relevant["evidence_rules"] = EVIDENCE_RULES
    
    # Add specific criminal law sections
    if case_type in ["criminal", "straffesak"]:
        relevant["criminal_procedure"] = NORWEGIAN_CRIMINAL_PROCEDURE_LAW
        
        # Add specific crimes based on keywords
        for keyword in keywords:
            keyword_lower = keyword.lower()
            if any(x in keyword_lower for x in ["narkotika", "drug", "stoff"]):
                relevant["narkotika"] = {"§ 231": NORWEGIAN_CRIMINAL_CODE["§ 231"]}
            if any(x in keyword_lower for x in ["vold", "mishandling", "legemskrenkelse"]):
                relevant["vold"] = {"§ 271": NORWEGIAN_CRIMINAL_CODE["§ 271"]}
            if any(x in keyword_lower for x in ["tyveri", "theft", "ran"]):
                relevant["tyveri"] = {"§ 311": NORWEGIAN_CRIMINAL_CODE["§ 311"]}
            if any(x in keyword_lower for x in ["bedrageri", "svindel", "fraud"]):
                relevant["bedrageri"] = {"§ 371": NORWEGIAN_CRIMINAL_CODE["§ 371"]}
    
    # Add corruption law if relevant
    if any(x in case_type.lower() for x in ["korrupsjon", "corruption"]) or \
       any(any(x in kw.lower() for x in ["korrupsjon", "bestikkelse", "corruption"]) for kw in keywords):
        relevant["corruption"] = CORRUPTION_LAW
    
    # Add police law if relevant
    if any(x in " ".join(keywords).lower() for x in ["politi", "pågripelse", "makt", "vold"]):
        relevant["police_law"] = POLICE_LAW
    
    # Always include relevant ECHR articles
    relevant["echr"] = ECHR_ARTICLES
    
    # Add precedents
    relevant["precedents"] = KEY_NORWEGIAN_PRECEDENTS
    
    return relevant

def format_law_for_ai(relevant_laws: dict) -> str:
    """Format law sections for AI prompt"""
    
    formatted = []
    
    for section_name, section_data in relevant_laws.items():
        formatted.append(f"\n=== {section_name.upper().replace('_', ' ')} ===")
        
        if section_name in ["procedural_rights", "evidence_rules"]:
            for item, details in section_data.items():
                formatted.append(f"\n{item.replace('_', ' ').title()}:")
                for key, value in details.items():
                    formatted.append(f"  {key.title()}: {value}")
        
        elif section_name == "echr":
            for article, details in section_data.items():
                formatted.append(f"\n{article} - {details['title']}:")
                formatted.append(f"  Tekst: {details['text']}")
                formatted.append(f"  Relevans: {details['relevance']}")
                if details.get('key_cases'):
                    formatted.append(f"  Nøkkelsaker: {', '.join(details['key_cases'])}")
        
        elif section_name == "precedents":
            for case, details in section_data.items():
                formatted.append(f"\n{case} - {details['title']}:")
                formatted.append(f"  Sammendrag: {details['summary']}")
                formatted.append(f"  Prinsipp: {details['key_principle']}")
        
        else:
            # Regular law sections
            for article, details in section_data.items():
                formatted.append(f"\n{article} - {details['title']}:")
                formatted.append(f"  Lovtekst: {details['text']}")
                if details.get('penalty'):
                    formatted.append(f"  Straff: {details['penalty']}")
                if details.get('key_points'):
                    formatted.append(f"  Nøkkelpunkter: {', '.join(details['key_points'])}")
                if details.get('factors'):
                    formatted.append(f"  Straffskjerpende faktorer: {', '.join(details['factors'])}")
    
    return "\n".join(formatted)