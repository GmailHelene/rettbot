import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, AlertCircle, Loader } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function LegalChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hei! Jeg er RettBot, din AI juridiske assistent. Jeg kan hjelpe deg med:\n\n• Spørsmål om norsk lov\n• Rettigheter og plikter\n• Juridiske råd og veiledning\n• Forklaring av lovtekster\n\nHva kan jeg hjelpe deg med i dag?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
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
      // Note: This should call a chat API endpoint
      // For now, we'll simulate with a simple response
      await new Promise(resolve => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Dette er en simulert respons. I produksjon ville dette være en fullstendig AI-respons basert på OpenAI GPT-4 med kunnskap om norsk lov.\n\nDitt spørsmål: "${input}"\n\nFor å få ekte svar, må vi koble til OpenAI API med /api/chat endpoint.`,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <MessageCircle className="w-8 h-8 mr-3 text-purple-600" />
                Juridisk Chat
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Chat med AI om juridiske spørsmål
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
                }`}
              >
                <div className="whitespace-pre-line">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-purple-200'
                      : 'text-gray-500 dark:text-gray-400'
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
              <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg rounded-lg px-4 py-3">
                <div className="flex items-center">
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  <span>Tenker...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Skriv ditt juridiske spørsmål her... (Trykk Enter for å sende)"
              rows={3}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Tips: Vær så spesifikk som mulig i spørsmålet ditt for best svar
          </div>
        </div>
      </div>
    </div>
  );
}
