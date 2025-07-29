import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function App() {
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem('chat_history')) || [];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': import.meta.env.VITE_REFERRER,
          'X-Title': import.meta.env.VITE_APP_TITLE
        },
        body: JSON.stringify({
          model: 'openrouter/gpt-3.5-turbo',
          messages: newMessages
        })
      });
      const data = await res.json();
      const botReply = data.choices?.[0]?.message?.content || "Lỗi khi trả lời!";
      setMessages([...newMessages, { role: 'assistant', content: botReply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Lỗi kết nối API!" }]);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-blue-600 text-center">💙 Miku-AI Waifu</h1>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`p-3 rounded-xl ${m.role === 'user' ? 'bg-blue-100 text-right' : 'bg-blue-50 text-left'}`}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-2 rounded-lg border border-blue-300 focus:outline-none"
            placeholder="Gửi gì đó cho Miku..."
          />
          <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Gửi
          </button>
        </div>
      </div>
    </main>
  );
}
