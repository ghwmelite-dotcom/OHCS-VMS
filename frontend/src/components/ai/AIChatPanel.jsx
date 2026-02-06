import { useState, useRef, useEffect } from 'react';
import { useAIChat } from '../../hooks/useAIChat';

const QUICK_ACTIONS = [
  { label: 'Peak hours?', icon: '\u{23F0}' },
  { label: 'Busiest office?', icon: '\u{1F3DB}\u{FE0F}' },
  { label: 'Any anomalies?', icon: '\u{1F6A8}' },
  { label: 'Generate report', icon: '\u{1F4CA}' },
];

export default function AIChatPanel({ open, onClose }) {
  const { messages, loading, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!open) return null;

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        style={{ background: 'var(--bg-backdrop)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-screen w-[380px] z-50 flex flex-col animate-slide-in-right"
        style={{
          background: 'var(--bg-panel)',
          borderLeft: '1px solid var(--border-secondary)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          boxShadow: 'var(--shadow-panel)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <span className="text-sm font-bold" style={{ color: '#818CF8' }}>AI</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-ghana-green" style={{ boxShadow: '0 0 8px rgba(0,107,63,0.4)' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">OHCS Assistant</h3>
              <p className="text-[10px] text-text-muted">Workers AI &middot; Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary transition-colors"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-inset)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              title="Clear"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary transition-colors"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-inset)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08))',
                  border: '1px solid rgba(99, 102, 241, 0.12)',
                }}
              >
                <span className="text-2xl">AI</span>
              </div>
              <p className="text-text-secondary text-sm mb-1">How can I help?</p>
              <p className="text-text-muted text-xs mb-6">Ask about visitors, offices, or analytics</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_ACTIONS.map(({ label, icon }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(label)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5"
                    style={{
                      background: 'var(--bg-card-inset)',
                      border: '1px solid var(--border-secondary)',
                      color: 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                      e.currentTarget.style.color = '#818CF8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-secondary)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={msg.role === 'user' ? {
                  background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                  color: 'white',
                  borderBottomRightRadius: '6px',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)',
                } : {
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-secondary)',
                  color: 'var(--text-primary)',
                  borderBottomLeftRadius: '6px',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-md"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-secondary)' }}
              >
                <div className="flex gap-1.5">
                  {[0, 150, 300].map(delay => (
                    <div
                      key={delay}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: '#818CF8', animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Ask about visitors, offices..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-3.5 rounded-xl flex items-center justify-center disabled:opacity-30"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #3B82F6, #6366F1)' : 'var(--bg-card)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
