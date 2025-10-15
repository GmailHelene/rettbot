import React, { useState, useEffect } from 'react';
import { Brain, Users, Target, FileText, Search, Shield, Zap } from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  icon: React.ReactNode;
  specialty: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  confidence: number;
  lastResult?: string;
  workingOn?: string;
}

interface MultiAgentSystemProps {
  query: string;
  caseData?: any;
  onResults: (results: any) => void;
}

export const MultiAgentSystem: React.FC<MultiAgentSystemProps> = ({
  query,
  caseData,
  onResults
}) => {
  const [agents, setAgents] = useState<AIAgent[]>([
    {
      id: 'research',
      name: 'Forskningsagent',
      icon: <Search className="icon-md" />,
      specialty: 'Juridisk forskning og lovanalyse',
      status: 'idle',
      confidence: 0
    },
    {
      id: 'strategy',
      name: 'Strategiagent',
      icon: <Target className="icon-md" />,
      specialty: 'Forsvarsstrategi og saksanalyse',
      status: 'idle',
      confidence: 0
    },
    {
      id: 'drafting',
      name: 'Skrivingsagent',
      icon: <FileText className="icon-md" />,
      specialty: 'Juridisk dokumentasjon',
      status: 'idle',
      confidence: 0
    },
    {
      id: 'adversarial',
      name: 'Adversarial Agent',
      icon: <Shield className="icon-md" />,
      specialty: 'Motparters argumenter og svakheter',
      status: 'idle',
      confidence: 0
    },
    {
      id: 'crossExamination',
      name: 'Krysskjør-agent',
      icon: <Users className="icon-md" />,
      specialty: 'Vitneførsel og avhørsteknikk',
      status: 'idle',
      confidence: 0
    }
  ]);

  const [orchestrationStatus, setOrchestrationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [synthesizedResult, setSynthesizedResult] = useState<string>('');

  // Start multi-agent analysis
  const startAnalysis = async () => {
    setOrchestrationStatus('running');
    
    // Update all agents to working status
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'working' as const,
      workingOn: getAgentTask(agent.id, query)
    })));

    try {
      // Simulate agent execution (in real app, this would call the backend)
      const results = await executeAgents(query, caseData);
      
      // Update agents with results
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'completed' as const,
        confidence: results[agent.id]?.confidence || 85,
        lastResult: results[agent.id]?.summary || `${agent.name} fullført`,
        workingOn: undefined
      })));

      // Set synthesized result
      setSynthesizedResult(results.synthesis || 'Analyse fullført av alle agenter.');
      setOrchestrationStatus('completed');
      
      // Return results to parent
      onResults(results);
      
    } catch (error) {
      console.error('Multi-agent analysis error:', error);
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'error' as const,
        workingOn: undefined
      })));
      setOrchestrationStatus('idle');
    }
  };

  const getAgentTask = (agentId: string, query: string): string => {
    const tasks = {
      research: `Analyserer lovgrunnlag for: "${query.substring(0, 50)}..."`,
      strategy: `Utvikler forsvarsstrategi basert på faktum...`,
      drafting: `Forbereder juridiske dokumenter...`,
      adversarial: `Tester forsvarsargumenter for svakheter...`,
      crossExamination: `Planlegger vitneførsel og krysskjør...`
    };
    return tasks[agentId as keyof typeof tasks] || 'Analyserer...';
  };

  // Mock execution (replace with real API calls)
  const executeAgents = async (query: string, caseData: any) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      research: {
        confidence: 88,
        summary: 'Juridisk grunnlag identifisert',
        analysis: 'Komplett lovanalyse utført med relevante bestemmelser og rettspraksis.'
      },
      strategy: {
        confidence: 85,
        summary: 'Forsvarsstrategi utviklet',
        analysis: 'Optimal forsvarslinje identifisert med alternative strategier.'
      },
      drafting: {
        confidence: 92,
        summary: 'Dokumenter klargjort',
        analysis: 'Profesjonelle juridiske dokumenter utarbeidet.'
      },
      adversarial: {
        confidence: 79,
        summary: 'Svakheter identifisert',
        analysis: 'Potensielle motargumenter og svakheter analysert.'
      },
      crossExamination: {
        confidence: 87,
        summary: 'Vitneførsel planlagt',
        analysis: 'Detaljert plan for vitneførsel og krysskjør utarbeidet.'
      },
      synthesis: 'Basert på analyse fra alle spesialiserte agenter, anbefales en strategi som kombinerer sterk juridisk dokumentasjon med proaktiv forsvarslinje. Identifiserte svakheter kan adresseres gjennom målrettet vitneførsel.'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working': return <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />;
      case 'completed': return <span className="text-green-600">✓</span>;
      case 'error': return <span className="text-red-600">✗</span>;
      default: return <span className="text-slate-400">○</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Brain className="icon-xl text-purple-600" />
          <h1 className="text-3xl font-bold text-slate-800">🤖 Multi-Agent AI System</h1>
        </div>
        <p className="text-slate-600 text-lg">
          Elite juridisk analyse med spesialiserte AI-agenter
        </p>
        
        {query && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <strong>Analyserer:</strong> {query}
            </p>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Agent Orkestrering</h2>
          
          <button
            onClick={startAnalysis}
            disabled={orchestrationStatus === 'running'}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold ${
              orchestrationStatus === 'running'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <Zap className="icon-sm" />
            <span>
              {orchestrationStatus === 'running' ? 'Analyserer...' : 'Start Analyse'}
            </span>
          </button>
        </div>

        {/* Orchestration Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <span className="font-semibold text-slate-700">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              orchestrationStatus === 'running' 
                ? 'bg-blue-100 text-blue-800' 
                : orchestrationStatus === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {orchestrationStatus === 'running' && '🔄 Kjører parallell analyse'}
              {orchestrationStatus === 'completed' && '✅ Analyse fullført'}
              {orchestrationStatus === 'idle' && '⏸️ Venter på start'}
            </span>
          </div>
          
          {orchestrationStatus === 'running' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
            </div>
          )}
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-purple-600">{agent.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{agent.name}</h3>
                  <p className="text-sm text-slate-600">{agent.specialty}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(agent.status)}
                </div>
              </div>

              <div className={`px-3 py-2 rounded-lg text-sm ${getStatusColor(agent.status)}`}>
                {agent.workingOn || agent.lastResult || 'Klar til analyse'}
              </div>

              {agent.status === 'completed' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Tillit:</span>
                    <span className="font-semibold text-slate-800">{agent.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${agent.confidence}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Synthesized Results */}
      {orchestrationStatus === 'completed' && synthesizedResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <Brain className="icon-md text-purple-600 mr-2" />
            Sammenfatning fra alle agenter
          </h2>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 leading-relaxed">{synthesizedResult}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {agents.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-sm text-blue-800">Agenter fullført</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(agents.reduce((acc, a) => acc + a.confidence, 0) / agents.length)}%
              </div>
              <div className="text-sm text-green-800">Gjennomsnittlig tillit</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Elite</div>
              <div className="text-sm text-purple-800">Analysenivå</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiAgentSystem;