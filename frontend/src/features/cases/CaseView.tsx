/**
 * PROFESSIONAL CASE VIEW
 * 
 * Profesjonell, ryddig og strukturert visning av saker
 * 
 * Features:
 * - Oversikt over alle saker med smart filtrering
 * - Detaljert saksvisning med mapper, tidslinje, sjekkliste
 * - Drag-and-drop organisering av dokumenter
 * - Smart søk og tagging
 * - Automatisk backup-status
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Case,
  Folder,
  TimelineEvent,
  ChecklistItem,
  CaseOrganizer,
  CaseSummaryGenerator
} from './caseManagement';

export default function CaseView({ caseId }: { caseId: string }) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'folders' | 'timeline' | 'checklist'>('overview');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const organizer = new CaseOrganizer();
  const summaryGenerator = new CaseSummaryGenerator();

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    // TODO: Load from encrypted storage
    // For now, mock data
    const mockCase: Case = {
      id: caseId,
      title: 'Min Sak',
      type: 'corruption',
      status: 'investigation',
      priority: 'high',
      client: {
        name: 'Meg',
        role: 'client'
      },
      otherParties: [],
      folders: organizer.createStandardFolders('corruption'),
      timeline: [],
      deadlines: [],
      checklist: organizer.generateChecklist('corruption'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['korrupsjon', 'politi'],
      relatedCases: [],
      aiSummary: 'AI-generert sammendrag av saken...',
      riskAssessment: await organizer.assessRisk({}),
      suggestedActions: organizer.generateSuggestedActions({})
    };

    setCaseData(mockCase);
  };

  if (!caseData) {
    return <div className="loading">Laster sak...</div>;
  }

  return (
    <div className="case-view">
      {/* Header */}
      <header className="case-header">
        <div className="case-title-section">
          <h1>{caseData.title}</h1>
          {caseData.caseNumber && (
            <span className="case-number">Saksnr: {caseData.caseNumber}</span>
          )}
          <div className="case-meta">
            <span className={`status ${caseData.status}`}>
              {translateStatus(caseData.status)}
            </span>
            <span className={`priority ${caseData.priority}`}>
              {caseData.priority.toUpperCase()}
            </span>
            <span className="case-type">
              {translateCaseType(caseData.type)}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="btn-primary">
            📤 Legg til bevis
          </button>
          <button className="btn-secondary">
            📄 Generer dokument
          </button>
          <button className="btn-secondary">
            📊 Eksporter rapport
          </button>
        </div>
      </header>

      {/* Risk Assessment Banner */}
      {caseData.riskAssessment.overall === 'critical' && (
        <div className="risk-banner critical">
          ⚠️ <strong>Høy risiko:</strong> {caseData.riskAssessment.factors[0]?.description}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📋 Oversikt
        </button>
        <button
          className={activeTab === 'folders' ? 'active' : ''}
          onClick={() => setActiveTab('folders')}
        >
          📁 Mapper ({caseData.folders.length})
        </button>
        <button
          className={activeTab === 'timeline' ? 'active' : ''}
          onClick={() => setActiveTab('timeline')}
        >
          📅 Tidslinje
        </button>
        <button
          className={activeTab === 'checklist' ? 'active' : ''}
          onClick={() => setActiveTab('checklist')}
        >
          ✅ Sjekkliste ({getCompletedCount(caseData.checklist)}/{caseData.checklist.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="overview-tab"
            >
              <OverviewTab caseData={caseData} />
            </motion.div>
          )}

          {activeTab === 'folders' && (
            <motion.div
              key="folders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="folders-tab"
            >
              <FoldersTab 
                folders={caseData.folders}
                selectedFolder={selectedFolder}
                onSelectFolder={setSelectedFolder}
              />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="timeline-tab"
            >
              <TimelineTab events={caseData.timeline} />
            </motion.div>
          )}

          {activeTab === 'checklist' && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="checklist-tab"
            >
              <ChecklistTab 
                items={caseData.checklist}
                onToggle={(id) => toggleChecklistItem(id, caseData, setCaseData)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .case-view {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .case-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 2px solid #eee;
        }

        .case-title-section h1 {
          margin: 0 0 8px 0;
          font-size: 2em;
        }

        .case-number {
          color: #666;
          font-size: 0.9em;
        }

        .case-meta {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .case-meta span {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .status {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status.investigation {
          background: #fff3cd;
          color: #856404;
        }

        .status.trial {
          background: #f8d7da;
          color: #721c24;
        }

        .priority.critical {
          background: #dc3545;
          color: white;
        }

        .priority.high {
          background: #ff6b35;
          color: white;
        }

        .priority.medium {
          background: #ffc107;
          color: #333;
        }

        .case-type {
          background: #e9ecef;
          color: #495057;
        }

        .quick-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .risk-banner {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-weight: 600;
        }

        .risk-banner.critical {
          background: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        }

        .tabs {
          display: flex;
          gap: 4px;
          border-bottom: 2px solid #eee;
          margin-bottom: 24px;
        }

        .tabs button {
          padding: 12px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 600;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .tabs button:hover {
          color: #007bff;
          background: #f8f9fa;
        }

        .tabs button.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }

        .tab-content {
          min-height: 400px;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #666;
          font-size: 1.2em;
        }
      `}</style>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ caseData }: { caseData: Case }) {
  return (
    <div className="overview">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <div className="card-icon">📁</div>
          <div className="card-content">
            <h3>{caseData.folders.length}</h3>
            <p>Mapper</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">📎</div>
          <div className="card-content">
            <h3>{getTotalItems(caseData.folders)}</h3>
            <p>Dokumenter & Bevis</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>{getCompletedCount(caseData.checklist)}/{caseData.checklist.length}</h3>
            <p>Oppgaver fullført</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>{caseData.deadlines.filter(d => !d.completed).length}</h3>
            <p>Kommende frister</p>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="ai-summary-section">
        <h2>🤖 AI Sammendrag</h2>
        <div className="ai-summary-box">
          <p>{caseData.aiSummary}</p>
        </div>
      </div>

      {/* Suggested Actions */}
      {caseData.suggestedActions.length > 0 && (
        <div className="suggested-actions">
          <h2>💡 Foreslåtte neste steg</h2>
          {caseData.suggestedActions.map(action => (
            <div key={action.id} className={`action-item ${action.priority}`}>
              <div className="action-content">
                <h4>{action.action}</h4>
                <p>{action.reason}</p>
                {action.deadline && (
                  <p className="deadline">Frist: {new Date(action.deadline).toLocaleDateString('no')}</p>
                )}
              </div>
              <button className="btn-action">Start</button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .overview {
          padding: 20px 0;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .card-icon {
          font-size: 3em;
        }

        .card-content h3 {
          margin: 0;
          font-size: 2em;
          color: #007bff;
        }

        .card-content p {
          margin: 4px 0 0 0;
          color: #666;
        }

        .ai-summary-section {
          margin: 32px 0;
        }

        .ai-summary-section h2 {
          margin-bottom: 16px;
        }

        .ai-summary-box {
          background: #f0f8ff;
          padding: 24px;
          border-radius: 12px;
          border-left: 4px solid #007bff;
        }

        .suggested-actions h2 {
          margin-bottom: 16px;
        }

        .action-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          margin-bottom: 12px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .action-item.critical {
          background: #fff5f5;
          border-left-color: #dc3545;
        }

        .action-item.high {
          background: #fff8f5;
          border-left-color: #ff6b35;
        }

        .action-item h4 {
          margin: 0 0 8px 0;
        }

        .action-item p {
          margin: 0;
          color: #666;
        }

        .deadline {
          font-weight: 600;
          color: #dc3545;
          margin-top: 8px;
        }

        .btn-action {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-action:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
}

// Folders Tab Component
function FoldersTab({ 
  folders, 
  selectedFolder, 
  onSelectFolder 
}: { 
  folders: Folder[]; 
  selectedFolder: Folder | null;
  onSelectFolder: (folder: Folder) => void;
}) {
  return (
    <div className="folders-view">
      <div className="folders-grid">
        {folders.map(folder => (
          <div
            key={folder.id}
            className={`folder-card ${selectedFolder?.id === folder.id ? 'selected' : ''}`}
            onClick={() => onSelectFolder(folder)}
            style={{ borderLeftColor: folder.color }}
          >
            <div className="folder-icon">{folder.icon}</div>
            <div className="folder-info">
              <h3>{folder.name}</h3>
              <p>{folder.items.length} element(er)</p>
            </div>
          </div>
        ))}
      </div>

      {selectedFolder && (
        <div className="folder-contents">
          <h2>{selectedFolder.icon} {selectedFolder.name}</h2>
          {selectedFolder.items.length === 0 ? (
            <div className="empty-folder">
              <p>Ingen filer i denne mappen ennå</p>
              <button className="btn-primary">Legg til fil</button>
            </div>
          ) : (
            <div className="items-list">
              {selectedFolder.items.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-icon">📄</div>
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <div className="item-meta">
                      <span>{formatFileSize(item.size || 0)}</span>
                      {item.encrypted && <span className="encrypted">🔒 Kryptert</span>}
                      {item.blockchainProof && <span className="verified">✅ Verifisert</span>}
                    </div>
                    {item.tags.length > 0 && (
                      <div className="tags">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .folders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .folder-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .folder-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .folder-card.selected {
          background: #f0f8ff;
          box-shadow: 0 0 0 3px #007bff;
        }

        .folder-icon {
          font-size: 3em;
        }

        .folder-info h3 {
          margin: 0 0 4px 0;
        }

        .folder-info p {
          margin: 0;
          color: #666;
          font-size: 0.9em;
        }

        .folder-contents {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .folder-contents h2 {
          margin-top: 0;
        }

        .empty-folder {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .item-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .item-card:hover {
          background: #e9ecef;
        }

        .item-icon {
          font-size: 2em;
        }

        .item-info {
          flex: 1;
        }

        .item-info h4 {
          margin: 0 0 8px 0;
        }

        .item-meta {
          display: flex;
          gap: 12px;
          font-size: 0.85em;
          color: #666;
        }

        .encrypted,
        .verified {
          font-weight: 600;
          color: #28a745;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .tag {
          padding: 2px 8px;
          background: #007bff;
          color: white;
          border-radius: 12px;
          font-size: 0.75em;
        }
      `}</style>
    </div>
  );
}

// Timeline Tab Component
function TimelineTab({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="empty-timeline">
        <p>Ingen hendelser ennå. Last opp bevis og dokumenter for å bygge tidslinjen.</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {events.map((event, index) => (
        <div key={event.id} className="timeline-event">
          <div className="timeline-marker" style={{ background: event.color }}>
            {event.icon}
          </div>
          <div className="timeline-content">
            <div className="timeline-date">
              {new Date(event.date).toLocaleDateString('no')}
            </div>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <span className={`importance ${event.importance}`}>
              {event.importance.toUpperCase()}
            </span>
          </div>
        </div>
      ))}

      <style jsx>{`
        .timeline {
          position: relative;
          padding: 20px 0 20px 40px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }

        .timeline-event {
          position: relative;
          margin-bottom: 32px;
          display: flex;
          gap: 20px;
        }

        .timeline-marker {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2em;
          flex-shrink: 0;
          position: absolute;
          left: 0;
          background: #007bff;
        }

        .timeline-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-left: 52px;
          flex: 1;
        }

        .timeline-date {
          color: #666;
          font-size: 0.85em;
          margin-bottom: 8px;
        }

        .timeline-content h3 {
          margin: 0 0 8px 0;
        }

        .timeline-content p {
          margin: 0 0 12px 0;
          color: #666;
        }

        .importance {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75em;
          font-weight: 600;
        }

        .importance.critical {
          background: #dc3545;
          color: white;
        }

        .importance.high {
          background: #ff6b35;
          color: white;
        }

        .importance.medium {
          background: #ffc107;
          color: #333;
        }

        .empty-timeline {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
}

// Checklist Tab Component
function ChecklistTab({ 
  items, 
  onToggle 
}: { 
  items: ChecklistItem[];
  onToggle: (id: string) => void;
}) {
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="checklist">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category} className="checklist-category">
          <h3>{category}</h3>
          {categoryItems.map(item => (
            <div key={item.id} className="checklist-item">
              <input
                type="checkbox"
                id={`check-${item.id}`}
                checked={item.completed}
                onChange={() => onToggle(item.id)}
              />
              <label htmlFor={`check-${item.id}`}>
                <h4>{item.title} {item.required && <span className="required">*</span>}</h4>
                <p>{item.description}</p>
              </label>
            </div>
          ))}
        </div>
      ))}

      <style jsx>{`
        .checklist {
          padding: 20px 0;
        }

        .checklist-category {
          margin-bottom: 32px;
        }

        .checklist-category h3 {
          margin-bottom: 16px;
          color: #007bff;
        }

        .checklist-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          margin-bottom: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .checklist-item input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .checklist-item label {
          flex: 1;
          cursor: pointer;
        }

        .checklist-item h4 {
          margin: 0 0 4px 0;
        }

        .required {
          color: #dc3545;
          font-weight: bold;
        }

        .checklist-item p {
          margin: 0;
          color: #666;
          font-size: 0.9em;
        }

        .checklist-item:has(input:checked) {
          opacity: 0.6;
        }

        .checklist-item:has(input:checked) label h4 {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}

// Helper functions
function translateCaseType(type: string): string {
  const translations: Record<string, string> = {
    criminal: 'Straffesak',
    corruption: 'Korrupsjonssak',
    civil: 'Sivil sak'
  };
  return translations[type] || type;
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    investigation: 'Etterforskning',
    police_report: 'Anmeldt',
    trial: 'Rettssak'
  };
  return translations[status] || status;
}

function getTotalItems(folders: Folder[]): number {
  return folders.reduce((sum, folder) => sum + folder.items.length, 0);
}

function getCompletedCount(items: ChecklistItem[]): number {
  return items.filter(item => item.completed).length;
}

function toggleChecklistItem(
  id: string,
  caseData: Case,
  setCaseData: React.Dispatch<React.SetStateAction<Case | null>>
) {
  setCaseData({
    ...caseData,
    checklist: caseData.checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    )
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
