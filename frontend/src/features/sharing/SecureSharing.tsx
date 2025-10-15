import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, Users, Clock, Eye, Share2, AlertTriangle } from 'lucide-react';
import { getZeroKnowledgeSystem } from '../../core/crypto/zeroKnowledgeSecurity';

interface SecureSharingProps {
  caseId: string;
  dataToShare: any;
  onShareCreated: (shareInfo: any) => void;
}

export const SecureSharing: React.FC<SecureSharingProps> = ({
  caseId,
  dataToShare,
  onShareCreated
}) => {
  const [shareConfig, setShareConfig] = useState({
    permissions: [] as string[],
    expiryHours: 24,
    maxAccess: 5,
    passwordProtected: true,
    revokeOnFirstAccess: false
  });

  const [activeShares, setActiveShares] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [zkSystem, setZkSystem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize zero-knowledge system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const system = await getZeroKnowledgeSystem();
        setZkSystem(system);
      } catch (error) {
        console.error('Failed to initialize ZK system:', error);
      }
    };

    initializeSystem();
  }, []);

  const permissionOptions = [
    { id: 'view', label: 'Vis innhold', description: 'Kan se dokumenter og bevis' },
    { id: 'download', label: 'Last ned', description: 'Kan laste ned filer' },
    { id: 'comment', label: 'Kommentere', description: 'Kan legge til kommentarer' },
    { id: 'edit', label: 'Redigere', description: 'Kan gjøre endringer (kun metadata)' },
    { id: 'share', label: 'Videredele', description: 'Kan dele med andre' }
  ];

  const handleCreateShare = async () => {
    if (!zkSystem || shareConfig.permissions.length === 0) {
      alert('Velg minst én tillatelse');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create per-share encryption key
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { shareKey, encryptedShareKey, shareKeyId } = await zkSystem.createShareKey(shareId, shareConfig.permissions);

      // Encrypt data for sharing
      const encryptedData = await zkSystem.encryptForSharing(JSON.stringify(dataToShare), shareKey);

      // Create access token
      const { token, expiresAt } = await zkSystem.createAccessToken(
        shareId,
        shareConfig.permissions,
        shareConfig.expiryHours
      );

      // Create audit log
      const auditEntry = await zkSystem.createAuditLog(
        'share_created',
        shareId,
        'current_user',
        {
          permissions: shareConfig.permissions,
          expiryHours: shareConfig.expiryHours,
          passwordProtected: shareConfig.passwordProtected
        }
      );

      const shareInfo = {
        id: shareId,
        token,
        expiresAt,
        permissions: shareConfig.permissions,
        encryptedData,
        encryptedShareKey,
        shareKeyId,
        maxAccess: shareConfig.maxAccess,
        accessCount: 0,
        createdAt: new Date().toISOString(),
        active: true
      };

      setActiveShares(prev => [...prev, shareInfo]);
      setAuditLog(prev => [...prev, {
        timestamp: new Date().toISOString(),
        action: 'Deling opprettet',
        details: `Tillatelser: ${shareConfig.permissions.join(', ')}`
      }]);

      onShareCreated(shareInfo);

      // Reset form
      setShareConfig({
        permissions: [],
        expiryHours: 24,
        maxAccess: 5,
        passwordProtected: true,
        revokeOnFirstAccess: false
      });

    } catch (error) {
      console.error('Share creation failed:', error);
      alert('Feil ved opprettelse av deling');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      if (!zkSystem) return;

      // Create revocation audit log
      await zkSystem.createAuditLog('share_revoked', shareId, 'current_user');

      setActiveShares(prev => prev.map(share => 
        share.id === shareId ? { ...share, active: false, revokedAt: new Date().toISOString() } : share
      ));

      setAuditLog(prev => [...prev, {
        timestamp: new Date().toISOString(),
        action: 'Deling tilbakekalt',
        details: `Share ID: ${shareId}`
      }]);

    } catch (error) {
      console.error('Share revocation failed:', error);
    }
  };

  const copyShareLink = (shareInfo: any) => {
    const shareUrl = `${window.location.origin}/shared/${shareInfo.id}?token=${shareInfo.token}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Delingslenke kopiert til utklippstavle');
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffHours = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours <= 0) return 'Utløpt';
    if (diffHours < 24) return `${diffHours} timer igjen`;
    const days = Math.ceil(diffHours / 24);
    return `${days} dager igjen`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Share2 className="icon-lg text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">🔐 Sikker Deling</h1>
            <p className="text-slate-600">End-to-end kryptert deling med granulære tillatelser</p>
          </div>
        </div>

        {/* Zero-Knowledge Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="icon-sm text-purple-600" />
            <span className="font-semibold text-purple-800">Zero-Knowledge Deling</span>
          </div>
          <p className="text-purple-700 text-sm">
            Serveren har aldri tilgang til dine data. Alt krypteres lokalt før deling.
            Hver deling får unike krypteringsnøkler som kan tilbakekalles øyeblikkelig.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Share */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Opprett Ny Deling</h2>

          {/* Permissions */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Tillatelser (velg minst én)
            </label>
            <div className="space-y-3">
              {permissionOptions.map((permission) => (
                <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareConfig.permissions.includes(permission.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setShareConfig(prev => ({
                          ...prev,
                          permissions: [...prev.permissions, permission.id]
                        }));
                      } else {
                        setShareConfig(prev => ({
                          ...prev,
                          permissions: prev.permissions.filter(p => p !== permission.id)
                        }));
                      }
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-slate-800">{permission.label}</div>
                    <div className="text-sm text-slate-600">{permission.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Expiry */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Utløper etter (timer)
            </label>
            <select
              value={shareConfig.expiryHours}
              onChange={(e) => setShareConfig(prev => ({ ...prev, expiryHours: parseInt(e.target.value) }))}
              className="w-full p-3 border border-slate-300 rounded-lg"
            >
              <option value={1}>1 time</option>
              <option value={24}>24 timer</option>
              <option value={72}>3 dager</option>
              <option value={168}>1 uke</option>
              <option value={720}>30 dager</option>
            </select>
          </div>

          {/* Max Access */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Maksimalt antall tilganger
            </label>
            <input
              type="number"
              value={shareConfig.maxAccess}
              onChange={(e) => setShareConfig(prev => ({ ...prev, maxAccess: parseInt(e.target.value) }))}
              min="1"
              max="100"
              className="w-full p-3 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Security Options */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareConfig.passwordProtected}
                onChange={(e) => setShareConfig(prev => ({ ...prev, passwordProtected: e.target.checked }))}
              />
              <span className="text-slate-700">Passord-beskyttet</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareConfig.revokeOnFirstAccess}
                onChange={(e) => setShareConfig(prev => ({ ...prev, revokeOnFirstAccess: e.target.checked }))}
              />
              <span className="text-slate-700">Tilbakekall etter første tilgang</span>
            </label>
          </div>

          <button
            onClick={handleCreateShare}
            disabled={isLoading || shareConfig.permissions.length === 0}
            className={`w-full py-3 rounded-lg font-semibold ${
              isLoading || shareConfig.permissions.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isLoading ? 'Oppretter...' : 'Opprett Sikker Deling'}
          </button>
        </div>

        {/* Active Shares */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Aktive Delinger</h2>

          <div className="space-y-4">
            {activeShares.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Ingen aktive delinger
              </div>
            ) : (
              activeShares.map((share) => (
                <div key={share.id} className={`border rounded-lg p-4 ${
                  share.active ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {share.active ? (
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      )}
                      <span className="font-semibold text-slate-800">
                        {share.active ? 'Aktiv' : 'Tilbakekalt'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-600">
                      {formatTimeRemaining(share.expiresAt)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Tillatelser:</span>
                      <span className="ml-2 text-slate-800">{share.permissions.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Tilganger:</span>
                      <span className="ml-2 text-slate-800">{share.accessCount}/{share.maxAccess}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Opprettet:</span>
                      <span className="ml-2 text-slate-800">
                        {new Date(share.createdAt).toLocaleString('nb-NO')}
                      </span>
                    </div>
                  </div>

                  {share.active && (
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => copyShareLink(share)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                      >
                        Kopier Lenke
                      </button>
                      <button
                        onClick={() => handleRevokeShare(share.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                      >
                        Tilbakekall
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <Eye className="icon-md mr-2" />
          Revisjonslogg
        </h2>

        <div className="space-y-3">
          {auditLog.length === 0 ? (
            <div className="text-center py-4 text-slate-500">
              Ingen aktivitet ennå
            </div>
          ) : (
            auditLog.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-medium text-slate-800">{entry.action}</span>
                  <p className="text-sm text-slate-600">{entry.details}</p>
                </div>
                <span className="text-sm text-slate-500">
                  {new Date(entry.timestamp).toLocaleString('nb-NO')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="icon-md text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">Sikkerhetspåminnelse</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Selv med zero-knowledge kryptering bør du være forsiktig med hvem du deler med.
              Vurder alltid om deling er nødvendig og bruk minste nødvendige tillatelser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureSharing;