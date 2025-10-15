import React, { useState, useEffect } from 'react';
import { Download, Wifi, WifiOff, Bell, Shield, Smartphone, RefreshCw } from 'lucide-react';

interface PWAManagerProps {
  onInstallPrompt?: () => void;
}

export const PWAManager: React.FC<PWAManagerProps> = ({ onInstallPrompt }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize PWA features
  useEffect(() => {
    // Check online status
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Check if app is installed
    checkIfInstalled();

    // Register service worker
    registerServiceWorker();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check notification permission
    checkNotificationPermission();

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const checkIfInstalled = () => {
    // Check if app is installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-advanced.js');
        setSwRegistration(registration);
        
        console.log('✅ Service Worker registered successfully');

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'UPDATE_AVAILABLE') {
            setUpdateAvailable(true);
          } else if (event.data.type === 'OFFLINE_READY') {
            setOfflineReady(true);
          }
        });

        // Check if offline content is ready
        checkOfflineReadiness(registration);

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  };

  const checkOfflineReadiness = async (registration: ServiceWorkerRegistration) => {
    if (registration.active) {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          setOfflineReady(true);
        }
      };

      registration.active.postMessage(
        { type: 'OFFLINE_READY' },
        [messageChannel.port2]
      );
    }
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        onInstallPrompt?.();
      }
      
      setInstallPrompt(null);
    }
  };

  const handleEnableNotifications = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        
        // Subscribe to push notifications
        if (swRegistration) {
          try {
            const subscription = await swRegistration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertVapidKey(import.meta.env.VITE_VAPID_PUBLIC_KEY || '')
            });
            
            // Send subscription to server
            await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription)
            });
            
            console.log('✅ Push notifications enabled');
          } catch (error) {
            console.error('❌ Push subscription failed:', error);
          }
        }
      }
    }
  };

  const handleUpdateApp = async () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate new service worker
      window.location.reload();
    }
  };

  const handleDownloadOfflineContent = async () => {
    if (swRegistration && swRegistration.active) {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          setOfflineReady(true);
          alert('Offline innhold lastet ned. RettBot+ fungerer nå uten internett!');
        }
      };

      swRegistration.active.postMessage(
        { type: 'DOWNLOAD_OFFLINE_CONTENT' },
        [messageChannel.port2]
      );
    }
  };

  const convertVapidKey = (vapidKey: string) => {
    const padding = '='.repeat((4 - vapidKey.length % 4) % 4);
    const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Smartphone className="icon-lg text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">📱 PWA Manager</h1>
            <p className="text-slate-600">Progressive Web App funksjoner og innstillinger</p>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isOnline ? 'bg-green-50' : 'bg-orange-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              {isOnline ? <Wifi className="icon-sm text-green-600" /> : <WifiOff className="icon-sm text-orange-600" />}
              <span className={`font-semibold ${isOnline ? 'text-green-800' : 'text-orange-800'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className={`text-sm ${isOnline ? 'text-green-700' : 'text-orange-700'}`}>
              {isOnline ? 'Tilkoblet internett' : 'Offline modus aktiv'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isInstalled ? 'bg-green-50' : 'bg-blue-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Download className={`icon-sm ${isInstalled ? 'text-green-600' : 'text-blue-600'}`} />
              <span className={`font-semibold ${isInstalled ? 'text-green-800' : 'text-blue-800'}`}>
                {isInstalled ? 'Installert' : 'Kan installeres'}
              </span>
            </div>
            <p className={`text-sm ${isInstalled ? 'text-green-700' : 'text-blue-700'}`}>
              {isInstalled ? 'App er installert' : 'Installer som app'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${offlineReady ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Shield className={`icon-sm ${offlineReady ? 'text-green-600' : 'text-gray-600'}`} />
              <span className={`font-semibold ${offlineReady ? 'text-green-800' : 'text-gray-800'}`}>
                Offline
              </span>
            </div>
            <p className={`text-sm ${offlineReady ? 'text-green-700' : 'text-gray-700'}`}>
              {offlineReady ? 'Klar for offline' : 'Ikke klar'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${notificationsEnabled ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Bell className={`icon-sm ${notificationsEnabled ? 'text-green-600' : 'text-gray-600'}`} />
              <span className={`font-semibold ${notificationsEnabled ? 'text-green-800' : 'text-gray-800'}`}>
                Varsler
              </span>
            </div>
            <p className={`text-sm ${notificationsEnabled ? 'text-green-700' : 'text-gray-700'}`}>
              {notificationsEnabled ? 'Aktivert' : 'Ikke aktivert'}
            </p>
          </div>
        </div>
      </div>

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="icon-md text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Oppdatering Tilgjengelig</h3>
                <p className="text-blue-700 text-sm">En ny versjon av RettBot+ er klar til installasjon</p>
              </div>
            </div>
            <button
              onClick={handleUpdateApp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Oppdater Nå
            </button>
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Install App */}
        {isInstallable && !isInstalled && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="icon-lg text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-800">Installer App</h2>
                <p className="text-slate-600">Få raskere tilgang og offline-funksjonalitet</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Raskere oppstart</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Offline-funksjonalitet</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Push-varsler for frister</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Ingen app store nødvendig</span>
              </div>
            </div>

            <button
              onClick={handleInstallApp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              Installer RettBot+ som App
            </button>
          </div>
        )}

        {/* Offline Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="icon-lg text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Offline Innhold</h2>
              <p className="text-slate-600">Last ned juridiske rettigheter for offline bruk</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Pågripelse og rettigheter</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Ransaking og avhør</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Korrupsjon og klager</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Nødkontakter og frister</span>
            </div>
          </div>

          <button
            onClick={handleDownloadOfflineContent}
            disabled={offlineReady}
            className={`w-full py-3 rounded-lg font-semibold ${
              offlineReady
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {offlineReady ? '✅ Offline Innhold Klar' : 'Last ned Offline Innhold'}
          </button>
        </div>

        {/* Push Notifications */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="icon-lg text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Push-Varsler</h2>
              <p className="text-slate-600">Få varsler om juridiske frister og oppdateringer</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Frister for anke og klage</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Rettssaksdatoer</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Viktidige oppdateringer</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Sikkerhetsvarsler</span>
            </div>
          </div>

          <button
            onClick={handleEnableNotifications}
            disabled={notificationsEnabled}
            className={`w-full py-3 rounded-lg font-semibold ${
              notificationsEnabled
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {notificationsEnabled ? '✅ Varsler Aktivert' : 'Aktiver Push-Varsler'}
          </button>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Smartphone className="icon-lg text-slate-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">App-Informasjon</h2>
              <p className="text-slate-600">Status og tekniske detaljer</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Service Worker:</span>
              <span className="text-slate-800">{swRegistration ? '✅ Aktiv' : '❌ Ikke aktiv'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Cache Status:</span>
              <span className="text-slate-800">{offlineReady ? '✅ Cachet' : '⏳ Ikke cachet'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Display Mode:</span>
              <span className="text-slate-800">{isInstalled ? 'Standalone' : 'Browser'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Nettverkstatus:</span>
              <span className="text-slate-800">{isOnline ? '🌐 Online' : '📱 Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-blue-800 mb-3">💡 PWA Tips</h3>
        <div className="space-y-2 text-blue-700 text-sm">
          <p>• Installer appen for raskest mulig tilgang og full offline-funksjonalitet</p>
          <p>• Last ned offline innhold før du trenger det - spesielt viktig for nødsituasjoner</p>
          <p>• Aktiver push-varsler for å aldri gå glipp av juridiske frister</p>
          <p>• Appen fungerer på alle enheter - mobil, tablet og desktop</p>
          <p>• All data krypteres lokalt før lagring for maksimal sikkerhet</p>
        </div>
      </div>
    </div>
  );
};

export default PWAManager;