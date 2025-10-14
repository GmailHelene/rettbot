# AI Agents Architecture

## Overview

RettBot+ employs a **multi-agent system** where specialized AI models handle different aspects of legal work. This mirrors how top law firms organize: researchers, strategists, document drafters, and adversarial thinkers working together.

## Agent Design Philosophy

Each agent is optimized for a specific task:

1. **Specialization**: Each agent excels at one type of legal work
2. **Model Selection**: Use the best LLM for each task (GPT-4, Claude, Gemini)
3. **Collaboration**: Agents pass information between each other
4. **Verification**: Cross-check outputs for legal accuracy
5. **Learning**: Improve from user feedback and case outcomes

## The Four Core Agents

### 1. Research Agent 🔍

**Model**: GPT-4-turbo (best for multi-source reasoning)

**Primary Responsibilities**:
- Deep legal research across multiple sources
- Precedent analysis and case law search
- Multi-source information synthesis
- Citation generation and verification

**Capabilities**:
- Searches Norwegian law, ECHR, EU directives simultaneously
- Identifies relevant case law (Høyesterett, Lagmannsrett, Tingrett)
- Finds similar cases and analyzes outcomes
- Generates comprehensive legal research reports

**Implementation**:

```python
class ResearchAgent:
    """Elite legal research specialist"""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo", temperature=0.1)
        self.vector_store = get_legal_vector_store()
        self.retriever = self.vector_store.as_retriever(
            search_kwargs={'k': 20}
        )
        
    async def research(self, query: str, context: dict) -> ResearchResult:
        """Perform comprehensive legal research"""
        
        # 1. Multi-source retrieval
        norwegian_law = await self._search_norwegian_law(query)
        echr_cases = await self._search_echr(query)
        precedents = await self._search_precedents(query)
        
        # 2. Synthesize findings
        research_prompt = f"""
        You are an elite legal researcher specializing in Norwegian law.
        
        Question: {query}
        
        Norwegian Law Sources:
        {norwegian_law}
        
        ECHR Cases:
        {echr_cases}
        
        Norwegian Precedents:
        {precedents}
        
        Context: {context}
        
        Provide a comprehensive legal research memo that:
        1. Answers the question with specific legal citations
        2. Analyzes relevant case law and outcomes
        3. Identifies applicable laws (Straffeprosessloven, Politiloven, etc.)
        4. Notes any ECHR implications
        5. Suggests winning strategies from similar cases
        
        CRITICAL: Every legal claim must cite specific laws and cases.
        Format: [Law Name § Section] or [Case Name, Court, Date]
        """
        
        response = await self.llm.ainvoke(research_prompt)
        
        # 3. Verify citations
        verified = await self._verify_citations(response)
        
        # 4. Calculate confidence
        confidence = self._calculate_confidence(verified)
        
        return ResearchResult(
            answer=verified.content,
            sources=[norwegian_law, echr_cases, precedents],
            citations=verified.citations,
            confidence=confidence
        )
    
    async def _search_norwegian_law(self, query: str) -> List[LawSection]:
        """Search Norwegian legal codes"""
        # Vector search + keyword matching
        results = await self.retriever.aget_relevant_documents(
            query,
            filter={'source': 'norwegian_law'}
        )
        return results
    
    async def _verify_citations(self, response) -> VerifiedResponse:
        """Ensure all cited laws/cases actually exist"""
        citations = extract_citations(response.content)
        
        for citation in citations:
            exists = await self.vector_store.verify_citation(citation)
            if not exists:
                raise ValueError(f"Invalid citation: {citation}")
        
        return VerifiedResponse(content=response.content, citations=citations)
```

**Example Output**:

```
Research Question: "Can police search my phone without a warrant during a traffic stop?"

Research Memo:

LEGAL ANALYSIS:

1. PRIMARY LAW:
   Straffeprosessloven § 197 (Search of persons and premises) states that 
   searches require a court order, with limited exceptions for immediate 
   danger or evidence destruction risk.
   
   Politiloven § 7 (Police authority) allows limited searches during lawful 
   stops, but digital devices have heightened protection.

2. RELEVANT CASE LAW:
   - HR-2020-1234-A (Høyesterett, 2020): Supreme Court ruled that phone 
     searches require warrant except in narrow circumstances.
   - LB-2019-5678 (Borgarting, 2019): Warrantless phone search during 
     traffic stop ruled unlawful, evidence suppressed.

3. ECHR IMPLICATIONS:
   Article 8 (Right to privacy) provides additional protection. 
   Case: Barbulescu v. Romania (2017) - Electronic communications have 
   heightened privacy expectations.

4. ANSWER:
   NO, police generally cannot search your phone during a traffic stop 
   without a warrant. Exceptions are extremely narrow and require 
   immediate danger or evidence destruction risk.

5. RECOMMENDED STRATEGY:
   - Politely refuse consent: "I do not consent to searches"
   - Document the interaction
   - If searched anyway, document as potential rights violation
   - Motion to suppress evidence (based on HR-2020-1234-A)

CONFIDENCE: 95% (Strong precedent, clear statutory language)
```

---

### 2. Defense Agent ⚖️

**Model**: Claude 3 Opus (best for nuanced legal reasoning)

**Primary Responsibilities**:
- Formulate defense strategies
- Identify prosecution weaknesses
- Generate counter-arguments
- Risk assessment and case evaluation

**Capabilities**:
- Multi-layered defense strategy creation
- Weakness analysis of prosecution's case
- Procedural error identification
- Alternative narrative development

**Implementation**:

```python
class DefenseAgent:
    """Elite defense strategist"""
    
    def __init__(self):
        self.llm = ChatAnthropic(model="claude-3-opus-20240229", temperature=0.2)
        
    async def build_defense(
        self,
        case_facts: str,
        charges: str,
        research: ResearchResult
    ) -> DefenseStrategy:
        """Create comprehensive defense strategy"""
        
        strategy_prompt = f"""
        You are an elite defense attorney known for achieving acquittals 
        in difficult cases. Your specialty is finding weaknesses in the 
        prosecution's case and building multi-layered defense strategies.
        
        CASE FACTS:
        {case_facts}
        
        CHARGES:
        {charges}
        
        LEGAL RESEARCH:
        {research.answer}
        
        TASK: Build a comprehensive defense strategy that includes:
        
        1. PRIMARY DEFENSE THEORY
           - Main argument for dismissal or acquittal
           - Legal basis (cite specific laws)
           - Factual support
        
        2. WEAKNESS ANALYSIS
           - Identify holes in prosecution's case
           - Missing evidence
           - Procedural errors
           - Credibility issues
        
        3. ALTERNATIVE DEFENSES (Layered Strategy)
           - Fallback positions if primary defense fails
           - Lesser included offenses
           - Mitigating circumstances
        
        4. PROCEDURAL CHALLENGES
           - Rights violations during investigation
           - Illegal search/seizure issues
           - Coerced statements
           - Chain of custody problems
        
        5. MOTION STRATEGY
           - Motions to file (dismiss, suppress evidence, etc.)
           - Timing and sequence
           - Likelihood of success
        
        6. RISK ASSESSMENT
           - Probability of conviction (0-100%)
           - Recommended approach (trial vs. negotiation)
           - Worst/best/likely outcomes
        
        Be creative, aggressive, and strategic like top defense attorneys.
        """
        
        response = await self.llm.ainvoke(strategy_prompt)
        
        return DefenseStrategy(
            primary_theory=extract_primary_theory(response),
            weaknesses=extract_weaknesses(response),
            alternatives=extract_alternatives(response),
            procedural_challenges=extract_challenges(response),
            motions=extract_motions(response),
            risk_assessment=extract_risk(response)
        )
    
    async def analyze_weakness(self, prosecution_case: str) -> List[Weakness]:
        """Deep analysis of prosecution's case weaknesses"""
        
        weakness_prompt = f"""
        Analyze this prosecution case for weaknesses, holes, and vulnerabilities:
        
        {prosecution_case}
        
        Find:
        1. Missing evidence that prosecution should have but doesn't
        2. Contradictions in witness statements
        3. Procedural errors in investigation
        4. Alternative explanations for evidence
        5. Credibility issues with witnesses/evidence
        6. Constitutional violations
        
        For each weakness, rate exploitability (1-10) and explain how to leverage it.
        """
        
        response = await self.llm.ainvoke(weakness_prompt)
        return parse_weaknesses(response)
```

**Example Output**:

```
DEFENSE STRATEGY

PRIMARY DEFENSE THEORY:
Unlawful search and seizure - Motion to suppress all evidence

The phone search violated Straffeprosessloven § 197 and ECHR Article 8.
No warrant was obtained, no exigent circumstances existed, and client 
did not consent. Under HR-2020-1234-A, this search is per se unlawful.

CRITICAL WEAKNESSES IN PROSECUTION'S CASE:
1. No warrant obtained [Exploitability: 10/10]
   → File motion to suppress under § 197
   → Cite HR-2020-1234-A precedent
   → Without phone evidence, prosecution has no case

2. Conflicting police reports [Exploitability: 8/10]
   → Officer A claims "consent given"
   → Officer B report makes no mention of consent
   → Impeach credibility at suppression hearing

3. Missing dashcam footage [Exploitability: 7/10]
   → Police claim equipment "malfunctioned"
   → Suspicious timing suggests footage contradicts their story
   → Argue spoliation of evidence

ALTERNATIVE DEFENSES (if suppression fails):
1. Lack of intent (required element for charge)
2. Mistaken identity (weak, use only if necessary)
3. Constitutional vagueness of statute

MOTION STRATEGY:
1. Motion to Suppress Evidence (Week 1)
   - 85% chance of success based on HR-2020-1234-A
   - If granted, case likely dismissed
   
2. Motion for Discovery (concurrent)
   - Demand dashcam footage or explanation
   - Subpoena phone search protocols
   
3. Motion to Dismiss (if suppression granted)
   - No remaining evidence to support charges

RISK ASSESSMENT:
- Current conviction probability: 65%
- If evidence suppressed: 5%
- Recommended: Aggressive motion practice, proceed to trial if suppression fails
- Best outcome: Case dismissed after suppression
- Worst outcome: Conviction, but strong appellate issues
```

---

### 3. Drafting Agent ✍️

**Model**: Gemini Pro (excellent at structured document generation)

**Primary Responsibilities**:
- Generate legal documents
- Format according to court standards
- Integrate citations and evidence
- Customize templates

**Capabilities**:
- Motions, complaints, appeals, briefs
- Professional legal formatting
- Citation integration
- Multiple jurisdiction formats

**Implementation**:

```python
class DraftingAgent:
    """Elite legal document drafter"""
    
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.1)
        self.templates = load_legal_templates()
        
    async def draft_motion(
        self,
        motion_type: str,
        strategy: DefenseStrategy,
        research: ResearchResult,
        case_details: dict
    ) -> LegalDocument:
        """Generate professional legal motion"""
        
        template = self.templates.get(motion_type)
        
        drafting_prompt = f"""
        You are an elite legal writer drafting a motion for Norwegian court.
        
        MOTION TYPE: {motion_type}
        
        LEGAL STRATEGY:
        {strategy.primary_theory}
        
        SUPPORTING RESEARCH:
        {research.answer}
        
        CASE DETAILS:
        - Court: {case_details['court']}
        - Case Number: {case_details['case_number']}
        - Client: {case_details['client_name']}
        - Charges: {case_details['charges']}
        
        TEMPLATE STRUCTURE:
        {template.structure}
        
        Draft a professional motion that:
        1. Follows Norwegian court formatting
        2. Cites all relevant laws and cases
        3. Presents arguments persuasively
        4. Anticipates and addresses counterarguments
        5. Requests specific relief
        
        Use formal legal language appropriate for court submission.
        """
        
        document = await self.llm.ainvoke(drafting_prompt)
        
        # Format and validate
        formatted = self._format_legal_document(document)
        validated = self._validate_citations(formatted)
        
        return LegalDocument(
            type=motion_type,
            content=validated,
            citations=extract_citations(validated),
            metadata=case_details
        )
    
    async def draft_appeal(
        self,
        trial_outcome: str,
        errors: List[str],
        research: ResearchResult
    ) -> LegalDocument:
        """Generate appellate brief"""
        # Similar structure for appeals
        pass
```

**Example Output** (Motion to Suppress):

```
TINGRETT I [JURISDICTION]

SAKSØKER                              SAK NR. [CASE-NUMBER]
[CLIENT NAME]
                                       BEGJÆRING OM
mot                                    BEVISFORKASTELSE

PÅTALEMYNDIGHETEN


            BEGJÆRING OM FORKASTELSE AV ULOVLIG INNHENTEDE BEVIS


Saksøker, [CLIENT NAME], ved underskrevne prosessfullmektig, ber 
tingretten forkaste alle bevis innhentet ved ransaking av mobiltelefon 
den [DATE] som ulovlig innhentet i strid med Straffeprosessloven § 197 
og EMK artikkel 8.

I. FAKTUM

1. Den [DATE] ble saksøker stoppet i en rutinekontroll av politiet på [LOCATION].

2. Uten rettslig kjennelse, uten samtykke, og uten at det forelå akutt fare, 
   gjennomførte politiet en fullstendig ransaking av saksøkers mobiltelefon.

3. All påståtte bevismateriale stammer fra denne ulovlige ransakingen.

II. RETTSLIG GRUNNLAG

A. Straffeprosessloven § 197

Straffeprosessloven § 197 krever rettslig kjennelse for ransaking, med 
snevre unntak for akutt fare eller bevissikring. Ingen slike unntak 
forelå i denne saken:

   - Ingen akutt fare for liv eller helse
   - Ingen umiddelbar risiko for bevisødeleggelse
   - Samtykke ble aldri innhentet

B. Høyesterettspraksis

Høyesterett har i HR-2020-1234-A fastslått at ransaking av mobiltelefon 
uten kjennelse er per se ulovlig med mindre klare unntakskriterier er 
oppfylt. Retten uttalte:

   "Mobiltelefoner inneholder så omfattende personlig informasjon at 
    særskilt høy beskyttelse kreves. Ransaking uten kjennelse kan kun 
    aksepteres ved påviselig akutt fare."

Borgarting lagmannsrett kom til samme resultat i LB-2019-5678, hvor 
beviser fra telefon ble forkastet ved tilsvarende omstendigheter.

C. EMK Artikkel 8

ECHR har i Barbulescu v. Romania (2017) fastslått at elektronisk 
kommunikasjon nyter særskilt høy personvernbeskyttelse under artikkel 8.

III. ARGUMENTASJON

1. Ingen rettslig kjennelse forelå
   Politiet har ikke fremlagt noen rettslig kjennelse. Dette innrømmes 
   i politirapporten.

2. Ingen gyldig unntaksgrunn
   Politirapporten påstår "mistanke om lovbrudd", men dette er ikke 
   tilstrekkelig under § 197. Akutt fare må påvises konkret.

3. Motstridende forklaringer om samtykke
   Politibetjent A hevder saksøker "samtykket", men:
   - Politibetjent B nevner intet samtykke i sin rapport
   - Saksøker benekter samtykke
   - Ingen skriftlig dokumentasjon av samtykke foreligger

4. Påstand om "teknisk feil" på dashcam-opptak
   Politiet hevder dashcam-opptak ikke er tilgjengelig grunnet "teknisk feil".
   Dette er mistenkelig og indikerer at opptak ville ha motbevist politiets versjon.

IV. RETTSFØLGE

Dersom ransakingen var ulovlig (hvilket den var), må alle bevis forkastes 
under læren om "fruktene fra det giftige tre". Uten disse bevisene har 
påtalemyndigheten ingen sak.

V. PÅSTAND

Saksøker ber tingretten:

1. Forkaste alle bevis innhentet fra mobiltelefon som ulovlig innhentet
2. Forkaste alle avledede bevis (bevis funnet som følge av telefonbevis)
3. Eventuelt henlegge saken ved mangel på bevis

[LOCATION], [DATE]

Med vennlig hilsen,

_______________________
[ATTORNEY NAME]
Prosessfullmektig for saksøker
```

---

### 4. Adversarial Agent 🎭

**Model**: GPT-4 (best at role-playing opposition)

**Primary Responsibilities**:
- Simulate prosecution arguments
- Identify defense weaknesses
- Prepare for counterarguments
- Cross-examination simulation

**Capabilities**:
- Red-team the defense strategy
- Anticipate prosecution moves
- Generate tough questions
- Stress-test legal theories

**Implementation**:

```python
class AdversarialAgent:
    """Simulates prosecution to strengthen defense"""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.3)
        
    async def simulate_prosecution(
        self,
        case_facts: str,
        defense_strategy: DefenseStrategy
    ) -> ProsecutionCase:
        """Simulate prosecution's case"""
        
        prosecution_prompt = f"""
        You are an aggressive prosecutor trying to convict the defendant.
        
        CASE FACTS:
        {case_facts}
        
        DEFENSE STRATEGY (you've seen their motion):
        {defense_strategy.primary_theory}
        
        Build the strongest possible prosecution case:
        
        1. THEORY OF THE CASE
           - Why defendant is guilty
           - Key evidence
           - Witness testimony
        
        2. COUNTER-DEFENSE ARGUMENTS
           - Rebut each defense argument
           - Exploit weaknesses in defense
           - Alternative interpretations of evidence
        
        3. LEGAL ARGUMENTS
           - Why evidence should NOT be suppressed
           - Distinguish unfavorable precedents
           - Argue for broad interpretation of exceptions
        
        4. CROSS-EXAMINATION STRATEGY
           - Questions to undermine defendant's credibility
           - Trap questions
           - Impeachment strategy
        
        Be aggressive, creative, and realistic. Find every weakness in the defense.
        """
        
        response = await self.llm.ainvoke(prosecution_prompt)
        
        return ProsecutionCase(
            theory=extract_theory(response),
            counter_arguments=extract_counter_args(response),
            cross_exam=extract_cross_exam(response)
        )
    
    async def prepare_cross_examination(
        self,
        witness: str,
        defense_theory: str
    ) -> List[Question]:
        """Generate cross-examination questions"""
        
        cross_exam_prompt = f"""
        You are a skilled prosecutor preparing cross-examination.
        
        WITNESS: {witness}
        DEFENSE THEORY: {defense_theory}
        
        Generate 20 cross-examination questions that:
        1. Undermine witness credibility
        2. Expose inconsistencies
        3. Force damaging admissions
        4. Never ask open-ended questions (only yes/no or specific facts)
        
        Format each question with expected answer and strategic purpose.
        """
        
        response = await self.llm.ainvoke(cross_exam_prompt)
        return parse_questions(response)
```

**Example Output**:

```
PROSECUTION CASE SIMULATION

THEORY OF THE CASE:
Defendant's motion to suppress is a desperate attempt to avoid accountability.
The phone search was lawful under the "plain view" doctrine and exigent 
circumstances exception. Officers had reasonable suspicion that evidence 
would be destroyed if they waited for a warrant.

COUNTER-ARGUMENTS TO DEFENSE MOTION:

1. "No warrant required" argument
   → Exigent circumstances existed: Defendant was seen deleting data
   → Plain view: Illegal content visible on unlocked phone screen
   → HR-2020-1234-A distinguishable: That case lacked exigent circumstances

2. Consent was clearly given
   → Officer A's testimony is credible and detailed
   → Defendant's denial is self-serving and should be disregarded
   → Officer B's report doesn't mention consent because it wasn't his interaction

3. Dashcam "technical failure" is genuine
   → Equipment malfunction documented in maintenance logs
   → No spoliation occurred

ANTICIPATED DEFENSE WEAKNESSES TO EXPLOIT:

1. Defendant's prior criminal history (impeachment material)
2. Inconsistent statements to police at scene
3. Technical ignorance (didn't know phone was "deleting" - was just locking)
4. Delayed assertion of rights (didn't object at scene)

CROSS-EXAMINATION QUESTIONS (for defendant):

1. Q: "You've been convicted of a crime before, correct?"
   Expected: "Yes" [damages credibility]

2. Q: "At the scene, you told Officer A you had 'nothing to hide', correct?"
   Expected: "I don't remember exactly" [inconsistent with current position]

3. Q: "You never said 'I do not consent to searches', did you?"
   Expected: "Well, no, but..." [admission of no explicit refusal]

4. Q: "You were touching your phone when officers approached, weren't you?"
   Expected: "Yes" [supports exigent circumstances]

5. Q: "Officers could see the phone screen, correct?"
   Expected: "Yes" [supports plain view]

RECOMMENDED DEFENSE COUNTER-PREPARATION:
- Prepare defendant for credibility attacks
- Rehabilitate "nothing to hide" statement as polite cooperation
- Emphasize that silence ≠ consent
- Expert witness on phone auto-lock (not deletion)
```

---

## Agent Collaboration Workflow

### Example: Complete Case Analysis

```python
async def analyze_complete_case(case_data: CaseData) -> CompleteAnalysis:
    """Full multi-agent case analysis"""
    
    # Stage 1: Research
    print("🔍 Research Agent: Analyzing legal issues...")
    research = await research_agent.research(
        query=case_data.legal_question,
        context=case_data.facts
    )
    
    # Stage 2: Adversarial Analysis
    print("🎭 Adversarial Agent: Simulating prosecution...")
    prosecution = await adversarial_agent.simulate_prosecution(
        case_facts=case_data.facts,
        charges=case_data.charges
    )
    
    # Stage 3: Defense Strategy
    print("⚖️ Defense Agent: Building defense strategy...")
    defense = await defense_agent.build_defense(
        case_facts=case_data.facts,
        charges=case_data.charges,
        research=research,
        prosecution_case=prosecution  # Account for prosecution strategy
    )
    
    # Stage 4: Adversarial Review (Red Team Defense)
    print("🎭 Adversarial Agent: Red-teaming defense strategy...")
    defense_weaknesses = await adversarial_agent.find_weaknesses(
        defense_strategy=defense
    )
    
    # Stage 5: Refine Defense
    print("⚖️ Defense Agent: Refining strategy based on weaknesses...")
    refined_defense = await defense_agent.strengthen(
        original_strategy=defense,
        identified_weaknesses=defense_weaknesses
    )
    
    # Stage 6: Document Drafting
    print("✍️ Drafting Agent: Generating legal documents...")
    documents = await drafting_agent.draft_all(
        defense_strategy=refined_defense,
        research=research,
        case_details=case_data
    )
    
    return CompleteAnalysis(
        research=research,
        prosecution_case=prosecution,
        defense_strategy=refined_defense,
        documents=documents,
        confidence_score=calculate_overall_confidence(refined_defense)
    )
```

**Output Timeline**:
```
[00:00] 🔍 Research Agent: Analyzing legal issues...
[00:05] ✅ Found 23 relevant laws and 8 precedents
[00:05] 🎭 Adversarial Agent: Simulating prosecution...
[00:12] ⚠️  Identified 5 strong prosecution arguments
[00:12] ⚖️ Defense Agent: Building defense strategy...
[00:20] ✅ Generated 3-layer defense strategy
[00:20] 🎭 Adversarial Agent: Red-teaming defense strategy...
[00:25] ⚠️  Found 4 defense weaknesses
[00:25] ⚖️ Defense Agent: Refining strategy based on weaknesses...
[00:30] ✅ Strengthened defense with counter-strategies
[00:30] ✍️ Drafting Agent: Generating legal documents...
[00:45] ✅ Generated: Motion to Suppress, Reply Brief, Case Memo

FINAL ANALYSIS COMPLETE
Acquittal Probability: 78%
Recommended Approach: File motion to suppress, proceed to trial if denied
```

## Quality Assurance

### Citation Verification
Every legal citation is verified against the legal database:

```python
async def verify_all_citations(agent_output: str) -> bool:
    citations = extract_citations(agent_output)
    
    for citation in citations:
        exists = await legal_db.verify_citation(citation)
        if not exists:
            log.error(f"INVALID CITATION: {citation}")
            return False
    
    return True
```

### Confidence Scoring

```python
def calculate_confidence(strategy: DefenseStrategy) -> float:
    factors = {
        'strong_precedent': 0.3,      # Directly on-point case law
        'clear_statute': 0.25,        # Unambiguous statutory language
        'multiple_defenses': 0.2,     # Layered strategies
        'prosecution_weaknesses': 0.15, # Holes in their case
        'procedural_errors': 0.1      # Rights violations
    }
    
    score = 0.0
    if strategy.has_strong_precedent:
        score += factors['strong_precedent']
    # ... evaluate other factors
    
    return min(score, 1.0) * 100  # Return 0-100%
```

### Human-in-the-Loop

Critical decisions always involve user confirmation:

```python
# Before filing motion
if document.type == "motion" and document.importance == "critical":
    await ui.show_review_dialog(
        title="Review Motion Before Filing",
        content=document.content,
        citations=document.citations,
        warning="Please review carefully. Filing this motion is irreversible."
    )
    
    user_approved = await ui.wait_for_approval()
    if not user_approved:
        return await drafting_agent.revise(document, user_feedback)
```

## Future Enhancements

1. **Fine-Tuned Models**: Train specialized models on Norwegian legal corpus
2. **Reinforcement Learning**: Learn from case outcomes to improve strategies
3. **Multi-Language**: Support for Nynorsk, Sami languages
4. **Specialized Agents**: Tax law, family law, criminal law sub-specialists
5. **Collaborative Agents**: Multiple defense agents debating best strategy
