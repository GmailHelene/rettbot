import OpenAI from 'openai';

// Multi-model configuration for elite legal expertise
interface AIModel {
  name: string;
  client: OpenAI;
  specialties: string[];
  strengths: string[];
}

interface AgentResponse {
  analysis: string;
  confidence: number;
  sources: string[];
  recommendations: string[];
  followUpQuestions?: string[];
}

export class MultiAgentAISystem {
  private models: Map<string, AIModel> = new Map();
  private openaiClient: OpenAI;

  constructor() {
    // Initialize multiple AI models for different specialties
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    // Configure specialized models
    this.setupModels();
  }

  private setupModels() {
    // Research Agent (GPT-4-turbo) - Best for comprehensive legal research
    this.models.set('research', {
      name: 'GPT-4-Turbo Research Agent',
      client: this.openaiClient,
      specialties: ['Legal research', 'Case law analysis', 'Precedent discovery'],
      strengths: ['Comprehensive search', 'Pattern recognition', 'Citation accuracy']
    });

    // Strategy Agent (GPT-4) - Best for defense strategy and case analysis
    this.models.set('strategy', {
      name: 'GPT-4 Strategy Agent',
      client: this.openaiClient,
      specialties: ['Defense strategy', 'Weakness analysis', 'Case planning'],
      strengths: ['Strategic thinking', 'Risk assessment', 'Tactical planning']
    });

    // Drafting Agent (GPT-4) - Best for document creation and legal writing
    this.models.set('drafting', {
      name: 'GPT-4 Drafting Agent',
      client: this.openaiClient,
      specialties: ['Legal drafting', 'Document creation', 'Appeal writing'],
      strengths: ['Precise language', 'Formal structure', 'Legal terminology']
    });

    // Adversarial Agent (GPT-4) - Simulates prosecution to find counter-arguments
    this.models.set('adversarial', {
      name: 'GPT-4 Adversarial Agent',
      client: this.openaiClient,
      specialties: ['Prosecution simulation', 'Argument testing', 'Weakness identification'],
      strengths: ['Critical analysis', 'Counter-argument generation', 'Stress testing']
    });

    // Cross-Examination Agent (GPT-4) - Specialized for witness examination
    this.models.set('crossExamination', {
      name: 'GPT-4 Cross-Examination Agent',
      client: this.openaiClient,
      specialties: ['Witness examination', 'Question strategy', 'Evidence challenges'],
      strengths: ['Question formulation', 'Testimony analysis', 'Evidence evaluation']
    });
  }

  // Research Agent - Elite legal research with multi-source analysis
  async researchAgent(query: string, jurisdiction: string = 'norway'): Promise<AgentResponse> {
    const model = this.models.get('research')!;
    
    const prompt = `
Du er en elite juridisk forskningsagent med ekspertise i norsk rett og internasjonal rett.

OPPGAVE: Utfør dybdeanalyse av: "${query}"

RETTSOMRÅDER Å ANALYSERE:
1. Norsk rett (lover, forskrifter, rundskriv)
2. EU-direktiver og forordninger  
3. EMK (Europakonvensjonen for menneskerettigheter)
4. Rettspraksis fra Høyesterett
5. Underrettspraksis (lagmannsretter, tingretter)
6. Forvaltningspraksis
7. Juridisk teori og kommentarlitteratur

ANALYSEMETODE:
- Identifiser relevante lovbestemmelser med presise paragrafhenvisninger
- Finn lignende saker og precedenser
- Analyser rettsutviklingen over tid
- Vurder styrken i ulike argumenter
- Identifiser potensielle svakheter i motparten

LEVERANSE:
- Konkret lovgrunnlag med eksakte sitater
- Relevante rettspraksis med referanser
- Argumentasjonslinjer for og imot
- Risikovurdering
- Anbefalte strategier

Svar på norsk med høy juridisk presisjon.
`;

    try {
      const response = await model.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1, // Low temperature for factual accuracy
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        analysis: content,
        confidence: 85,
        sources: this.extractSources(content),
        recommendations: this.extractRecommendations(content),
        followUpQuestions: this.generateFollowUpQuestions(content)
      };
    } catch (error) {
      console.error('Research Agent error:', error);
      throw new Error('Feil i juridisk forskningsagent');
    }
  }

  // Strategy Agent - Elite defense strategy development
  async strategyAgent(caseData: any, evidence: any[]): Promise<AgentResponse> {
    const model = this.models.get('strategy')!;
    
    const prompt = `
Du er en elite forsvarsstrategisk agent - en av verdens beste strategiske advokater.

SAKSDATA: ${JSON.stringify(caseData, null, 2)}
BEVISMATERIALE: ${JSON.stringify(evidence, null, 2)}

STRATEGISK ANALYSE:

1. CASE OVERVIEW:
   - Identifiser anklagepunktene
   - Vurder bevisstyrken
   - Finn prosessuelle feil
   - Analyser påtalemyndighetens svakheter

2. FORSVARSSTRATEGI:
   - Hovedlinje for forsvar
   - Alternative strategier
   - Bevispresentasjon
   - Vitneførsel
   - Prosessuelle innsigelser

3. RISIKOANALYSE:
   - Sannsynlighet for domfellelse
   - Potensielle straffer
   - Ankemulighetier
   - Sivile konsekvenser

4. TAKTISK PLAN:
   - Forberedelse til hovedforhandling
   - Rekkefølge av bevisførsel
   - Krysskjør-strategi
   - Prosedyre-argumenter

LEVERANSE:
Komplett strategisk plan med konkrete handlinger og tidslinje.

Svar på norsk med ekspert-kvalitet strategi.
`;

    try {
      const response = await model.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Analyser denne saken og utvikle optimal forsvarsstrategi.' }
        ],
        temperature: 0.2,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        analysis: content,
        confidence: 88,
        sources: this.extractSources(content),
        recommendations: this.extractRecommendations(content)
      };
    } catch (error) {
      console.error('Strategy Agent error:', error);
      throw new Error('Feil i strategisk agent');
    }
  }

  // Drafting Agent - Professional legal document creation
  async draftingAgent(documentType: string, content: any, requirements: string[]): Promise<AgentResponse> {
    const model = this.models.get('drafting')!;
    
    const prompt = `
Du er en elite juridisk skriveragent - ekspert på profesjonell juridisk dokumentasjon.

DOKUMENTTYPE: ${documentType}
INNHOLD: ${JSON.stringify(content, null, 2)}
KRAV: ${requirements.join(', ')}

SKRIVESTANDARD:
- Profesjonell juridisk stil
- Presis juridisk terminologi
- Korrekt struktur og format
- Overbevisende argumentasjon
- Presise lovhenvisninger

DOKUMENTTYPER Jeg kan skrive:
1. Ankeskrift til lagmannsrett/Høyesterett
2. Klage til offentlige myndigheter
3. Anmeldelse til politiet/SEFO
4. Sivilt søksmål
5. Avtaledokumenter
6. Prosessuelle skriv
7. EMD-klage (Europadomstolen)

STRUKTUR FOR ${documentType}:
- Formell overskrift og adressering
- Faktum/bakgrunn
- Juridisk grunnlag
- Argumentasjon
- Bevismateriale
- Konklusjon/påstand
- Vedlegg og referanser

LEVERANSE:
Komplett, profesjonelt dokument klar for innsendelse.

Skriv på norsk med høyeste juridiske kvalitet.
`;

    try {
      const response = await model.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Skriv profesjonelt ${documentType} basert på oppgitt informasjon.` }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });

      const content_text = response.choices[0]?.message?.content || '';
      
      return {
        analysis: content_text,
        confidence: 92,
        sources: this.extractSources(content_text),
        recommendations: this.extractRecommendations(content_text)
      };
    } catch (error) {
      console.error('Drafting Agent error:', error);
      throw new Error('Feil i dokumentskriving-agent');
    }
  }

  // Adversarial Agent - Simulates prosecution to find weaknesses
  async adversarialAgent(defense_strategy: string, evidence: any[]): Promise<AgentResponse> {
    const model = this.models.get('adversarial')!;
    
    const prompt = `
Du er en elite påtalejurist som skal teste forsvarsstrategien for svakheter.

FORSVARSSTRATEGI: ${defense_strategy}
BEVISMATERIALE: ${JSON.stringify(evidence, null, 2)}

PÅTALEMYNDIGHETENS PERSPEKTIV:

1. ANGREP PÅ FORSVARET:
   - Hvor er forsvarsstrategien svakest?
   - Hvilke argumenter kan påtalemakten bruke?
   - Hvordan kan de undergrave forsvarets bevis?
   - Hvilke vitner/eksperter kan de stevne?

2. PROSESSUELLE MOTANGREP:
   - Innsigelser mot forsvarets bevisførsel
   - Prosedureargumenter
   - Tolkingstvister om loven
   - Bevisbyrdeargumenter

3. ALTERNATIVE TEORIER:
   - Andre måter å tolke bevisene på
   - Motiv og mulighet
   - Tilståelsespresss
   - Plea bargain muligheter

4. STRATEGISKE SVAKHETER:
   - Inkonsistenser i forsvaret
   - Svake vitner
   - Problematisk bevismateriale
   - Historikk/tidligere straffbare forhold

LEVERANSE:
Komplett analyse av forsvarets svakheter og påtalens motstrategi.

Vær kritisk og grundig - dette skal styrke forsvaret.
`;

    try {
      const response = await model.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Analyser forsvarsstrategien og identifiser svakheter påtalemakten kan utnytte.' }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        analysis: content,
        confidence: 87,
        sources: this.extractSources(content),
        recommendations: this.extractRecommendations(content)
      };
    } catch (error) {
      console.error('Adversarial Agent error:', error);
      throw new Error('Feil i adversarial agent');
    }
  }

  // Cross-Examination Agent - Specialist for witness examination
  async crossExaminationAgent(witness_type: string, testimony: string, case_theory: string): Promise<AgentResponse> {
    const model = this.models.get('crossExamination')!;
    
    const prompt = `
Du er en elite krysskjør-ekspert - spesialist på vitneførsel og avhørsteknikk.

VITNETYPE: ${witness_type}
FORKLARING: ${testimony}
FORSVARSLINJE: ${case_theory}

KRYSSKJØR-STRATEGI:

1. VITNEANALYSE:
   - Vitnes troverdighet
   - Motivasjon for å vitne
   - Hukommelse og observasjonsevne
   - Tidligere inconsistente uttalelser
   - Potensielle interessekonflikter

2. SPØRSMÅLSSTRATEGI:
   - Ledende spørsmål som tvinger frem ønskede svar
   - Konfrontasjon med motstridende bevis
   - Gradvis oppbygning til viktige poenger
   - Kontroll av vitnes svar
   - Avsløring av usikkerheter

3. BEVISMATERIALE:
   - Hvilke dokumenter skal brukes mot vitnet?
   - Lydopptak/videoer
   - Vitneinterviuer
   - Ekspertuttalelser
   - Tidslinjekonflikter

4. TAKTIKK:
   - Rekkefølge av spørsmål
   - Tone og tilnærming
   - Når skal man stoppe?
   - Hvordan håndtere aggressive vitner
   - Exit-strategi hvis det går galt

LEVERANSE:
Detaljert krysskjørsplan med konkrete spørsmål.

Formuler på norsk med profesjonell advokat-kvalitet.
`;

    try {
      const response = await model.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Utvikle optimal krysskjørsstrategi for dette vitnet.' }
        ],
        temperature: 0.2,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        analysis: content,
        confidence: 90,
        sources: this.extractSources(content),
        recommendations: this.extractRecommendations(content)
      };
    } catch (error) {
      console.error('Cross-Examination Agent error:', error);
      throw new Error('Feil i krysskjør-agent');
    }
  }

  // Orchestrator - Combines multiple agents for comprehensive analysis
  async orchestrateAgents(query: string, caseData: any): Promise<{
    research: AgentResponse;
    strategy: AgentResponse;
    adversarial: AgentResponse;
    synthesis: string;
  }> {
    try {
      // Run multiple agents in parallel for comprehensive analysis
      const [research, strategy, adversarial] = await Promise.all([
        this.researchAgent(query),
        this.strategyAgent(caseData, caseData.evidence || []),
        this.adversarialAgent(caseData.strategy || 'Ikke oppgitt', caseData.evidence || [])
      ]);

      // Synthesize results from all agents
      const synthesis = await this.synthesizeAgentResults(research, strategy, adversarial);

      return {
        research,
        strategy,
        adversarial,
        synthesis
      };
    } catch (error) {
      console.error('Agent orchestration error:', error);
      throw new Error('Feil i AI-agent orkestrering');
    }
  }

  // Synthesize results from multiple agents into coherent recommendations
  private async synthesizeAgentResults(
    research: AgentResponse,
    strategy: AgentResponse,
    adversarial: AgentResponse
  ): Promise<string> {
    const prompt = `
Du er en senior partner som skal syntetisere analyser fra flere spesialagenter.

FORSKNINGSRESULTAT:
${research.analysis}

STRATEGIRESULTAT:
${strategy.analysis}

ADVERSARIAL ANALYSE:
${adversarial.analysis}

OPPGAVE:
Lag en sammenfattet, koherent analyse som integrerer alle perspektiver.

STRUKTUR:
1. Sammendrag av situasjonen
2. Juridisk grunnlag (fra research)
3. Anbefalt hovedstrategi (fra strategy)
4. Identifiserte risikoer (fra adversarial)
5. Konkrete handlingsanbefalinger
6. Prioriterte neste steg

Lever en profesjonell, sammenhengende analyse som er bedre enn summen av delene.
`;

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Syntetiser disse analysene til en koherent anbefaling.' }
        ],
        temperature: 0.1,
        max_tokens: 3000
      });

      return response.choices[0]?.message?.content || 'Kunne ikke syntetisere resultatene.';
    } catch (error) {
      console.error('Synthesis error:', error);
      return 'Feil ved sammenfatning av analyser.';
    }
  }

  // Helper methods
  private extractSources(content: string): string[] {
    const sources: string[] = [];
    
    // Extract Norwegian law references
    const lawReferences = content.match(/\b(?:straffeprosessloven|straffeloven|grunnloven|forvaltningsloven)\s*§\s*\d+/gi);
    if (lawReferences) sources.push(...lawReferences);
    
    // Extract case references
    const caseReferences = content.match(/\b(?:Rt\.|HR-)\d{4}-\d+/gi);
    if (caseReferences) sources.push(...caseReferences);
    
    // Extract EU law references
    const euReferences = content.match(/\b(?:artikkel|art\.)\s*\d+\s*(?:EMK|ECHR|EU-traktaten)/gi);
    if (euReferences) sources.push(...euReferences);
    
    return sources.filter((source, index, arr) => arr.indexOf(source) === index);
  }

  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    
    // Look for numbered recommendations
    const numberedRecs = content.match(/\d+\.\s*([^.]+\.)/g);
    if (numberedRecs) {
      recommendations.push(...numberedRecs.map(rec => rec.replace(/^\d+\.\s*/, '')));
    }
    
    // Look for bullet point recommendations
    const bulletRecs = content.match(/[-•]\s*([^.]+\.)/g);
    if (bulletRecs) {
      recommendations.push(...bulletRecs.map(rec => rec.replace(/^[-•]\s*/, '')));
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private generateFollowUpQuestions(content: string): string[] {
    return [
      'Trenger du dypere analyse av spesifikke lovbestemmelser?',
      'Skal jeg analysere lignende rettspraksis?',
      'Ønsker du strategiske alternativer?',
      'Trenger du hjelp til dokumentutforming?',
      'Skal jeg simulere motparters argumenter?'
    ];
  }
}

export default MultiAgentAISystem;