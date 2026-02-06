import { useState, useCallback } from 'react';
import { aiChat } from '../services/api';

export function useAIChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const data = await aiChat(text, history);
      const aiMsg = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, loading, sendMessage, clearChat };
}
