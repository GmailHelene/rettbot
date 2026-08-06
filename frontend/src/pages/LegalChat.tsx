import { apiFetch } from '../lib/api';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalDraft } from '../hooks/useLocalDraft';
import AiDisclaimer from '../components/AiDisclaimer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function LegalChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hei! Jeg er RettBot, din AI juridiske assistent. Jeg kan hjelpe deg med:\n\n• Spørsmål om norsk lov\n• Rettigheter og plikter\n• Juridiske råd og veiledning\n• Forklaring av lovtekster\n\nHva kan jeg hjelpe deg med i dag?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useLocalDraft('rb_draft_chat_input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await apiFetch('/api/legal/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input,
          conversation_history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Kunne ikke få svar fra AI');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.answer || 'Ingen svar mottatt',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError('Kunne ikke sende melding. Prøv igjen.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="header-professional">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="mr-3 p-2 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeft className="header-nav-icon" />
            </Link>
            <div>
              <h1 className="header-title flex items-center">
                <MessageCircle className="header-title-icon mr-2 text-slate-600" />
                Juridisk Chat
              </h1>
              <p className="header-subtitle">
                AI-drevet juridisk rådgivning • Sikker og konfidensiell
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 overflow-y-auto">
        <AiDisclaimer className="mb-4" />
        <div className="space-y-4" aria-live="polite" aria-atomic="false" aria-busy={loading}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-slate-700 text-white'
                    : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString('nb-NO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-900 shadow-sm border border-slate-200 rounded-lg px-4 py-3">
                <div className="flex items-center">
                  <Loader className="icon-sm animate-spin mr-2" />
                  <span>Tenker...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="icon-sm text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Skriv ditt juridiske spørsmål her... (Trykk Enter for å sende)"
              rows={3}
              className="input-legal resize-none"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="icon-sm" />
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500 text-center">
            💡 Tips: Vær så spesifikk som mulig i spørsmålet ditt for best svar
          </div>
        </div>
      </div>
    </div>
  );
}
