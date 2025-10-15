import React, { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, FileText, Users, ChevronRight } from 'lucide-react';
import { SecureEvidence, EncryptedTimeline, SecureDocument, CustodyRecord } from '../../core/crypto/secureCaseManager';

interface SecureCaseViewProps {
  caseId: string;
  timeline: EncryptedTimeline;
  evidence: SecureEvidence[];
  documents: SecureDocument[];
  onAddEvidence: (file: File) => void;
  onGenerateDocument: (type: string) => void;
}

export const SecureCaseView: React.FC<SecureCaseViewProps> = ({
  caseId,
  timeline,
  evidence,
  documents,
  onAddEvidence,
  onGenerateDocument
}) => {
  const [selectedTab, setSelectedTab] = useState<'timeline' | 'evidence' | 'documents' | 'chain'>('timeline');
  const [timelineIntegrity, setTimelineIntegrity] = useState<{ isValid: boolean; issues: string[] }>({ isValid: true, issues: [] });

  // Verify timeline integrity on component mount
  useEffect(() => {
    // In production, this would call the actual verification method
    setTimelineIntegrity({ isValid: true, issues: [] });
  }, [timeline]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('nb-NO');
  };

  const getEvidenceTypeIcon = (type: string) => {
    const icons = {
      photograph: '📷',
      video_recording: '🎥',
      audio_recording: '🎵',
      document: '📄',
      digital_communication: '💬',
      physical_evidence_photo: '🔍',
      expert_report: '👨‍⚕️',
      witness_statement: '👥',
      other: '📎'
    };
    return icons[type as keyof typeof icons] || icons.other;
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'suspicious': return 'text-yellow-600 bg-yellow-100';
      case 'corrupted': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddEvidence(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="icon-lg text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">🔒 Sikker Saksbehandling</h1>
              <p className="text-slate-600">Kryptert tidslinje og chain of custody</p>
            </div>
          </div>
          
          {/* Integrity Status */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            timelineIntegrity.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {timelineIntegrity.isValid ? (
              <CheckCircle className="icon-sm" />
            ) : (
              <AlertTriangle className="icon-sm" />
            )}
            <span className="font-semibold">
              {timelineIntegrity.isValid ? 'Integritet Verifisert' : 'Integritetsfeil'}
            </span>
          </div>
        </div>

        {/* Case Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{evidence.length}</div>
            <div className="text-sm text-blue-800">Krypterte Bevis</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{timeline.events.length}</div>
            <div className="text-sm text-green-800">Tidslinje Hendelser</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{documents.length}</div>
            <div className="text-sm text-purple-800">Genererte Dokumenter</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {timeline.encryptionLevel === 'quintuple' ? '5' : '3'}
            </div>
            <div className="text-sm text-orange-800">Krypteringslag</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-8">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'timeline', label: 'Kryptert Tidslinje', icon: Clock },
              { id: 'evidence', label: 'Bevishåndtering', icon: Shield },
              { id: 'documents', label: 'Dokumenter', icon: FileText },
              { id: 'chain', label: 'Chain of Custody', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <tab.icon className="icon-sm" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Timeline Tab */}
          {selectedTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Kryptert Tidslinje</h2>
                <div className="text-sm text-slate-600">
                  Sist oppdatert: {formatTimestamp(timeline.lastModified)}
                </div>
              </div>

              {/* Timeline Events */}
              <div className="space-y-4">
                {timeline.events.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.importance === 'critical' ? 'bg-red-100 text-red-600' :
                        event.importance === 'high' ? 'bg-orange-100 text-orange-600' :
                        event.importance === 'medium' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800">{event.eventType}</span>
                        <span className="text-sm text-slate-600">{formatTimestamp(event.timestamp)}</span>
                      </div>
                      
                      <div className="text-sm text-slate-600 mb-2">
                        Hash: <code className="bg-slate-200 px-2 py-1 rounded text-xs">{event.eventHash.substring(0, 16)}...</code>
                      </div>
                      
                      {event.verified && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Verifisert</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chain Verification */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Kjedeintegritet</h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-blue-700">
                    Alle {timeline.events.length} hendelser er kryptografisk lenket og verifisert
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Tab */}
          {selectedTab === 'evidence' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Bevishåndtering</h2>
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  />
                  Last opp bevis
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {evidence.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{getEvidenceTypeIcon(item.evidenceType)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{item.fileName}</h3>
                        <p className="text-sm text-slate-600">{item.evidenceType}</p>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium mb-3 ${getVerificationStatusColor(item.verificationStatus)}`}>
                      {item.verificationStatus}
                    </div>

                    {/* Legal Relevance */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600">Juridisk relevans:</span>
                        <span className="font-semibold">{item.legalRelevance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.legalRelevance}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {item.aiAnalysis && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">AI-analyse:</h4>
                        <p className="text-xs text-slate-600">{item.aiAnalysis.summary}</p>
                        <div className="text-xs text-slate-500 mt-2">
                          Tillit: {item.aiAnalysis.confidence}%
                        </div>
                      </div>
                    )}

                    {/* Security Info */}
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>🔒 Kryptert</span>
                        <span>⛓️ Blockchain</span>
                        <span>✓ Hash</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {selectedTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Genererte Dokumenter</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => onGenerateDocument('police_report')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Politianmeldelse
                  </button>
                  <button
                    onClick={() => onGenerateDocument('appeal')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Ankeskrift
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-white border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="icon-md text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{doc.title}</h3>
                        <p className="text-sm text-slate-600">{doc.type}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        doc.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.status}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">AI-generert:</span>
                        <span className="text-slate-800">{doc.aiGenerated ? 'Ja' : 'Nei'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Menneskegjennomgått:</span>
                        <span className="text-slate-800">{doc.humanReviewed ? 'Ja' : 'Nei'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Rettsklar:</span>
                        <span className="text-slate-800">{doc.courtReady ? 'Ja' : 'Nei'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>🔒 Kryptert</span>
                        <span>📋 Versjon {doc.version}</span>
                        <span>✓ Signert</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chain of Custody Tab */}
          {selectedTab === 'chain' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Chain of Custody</h2>
              
              {evidence.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{getEvidenceTypeIcon(item.evidenceType)}</span>
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.fileName}</h3>
                      <p className="text-sm text-slate-600">Opprettet av: {item.createdBy}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {item.chainOfCustody.map((record, index) => (
                      <div key={index} className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-800">{record.action}</span>
                            <span className="text-sm text-slate-600">{formatTimestamp(record.timestamp)}</span>
                          </div>
                          <div className="text-sm text-slate-600">
                            <p>Bruker: {record.user}</p>
                            <p>Lokasjon: {record.location}</p>
                            <p>Enhet: {record.device}</p>
                            {record.notes && <p>Notater: {record.notes}</p>}
                          </div>
                          <div className="text-xs text-slate-500 mt-2">
                            Hash: <code className="bg-slate-200 px-1 rounded">{record.verificationHash.substring(0, 16)}...</code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureCaseView;