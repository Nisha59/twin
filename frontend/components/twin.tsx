'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Who are you?',
  'What are you working on?',
  'Tell me about your skills',
  'What technologies do you use?',
];

export default function Twin() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [hasAvatar, setHasAvatar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetch('/avatar.jpg', { method: 'HEAD' })
      .then(res => setHasAvatar(res.ok))
      .catch(() => setHasAvatar(false));
  }, []);

  const sendMessage = async (text?: string) => {
    const content = text ?? input;
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            session_id: sessionId || undefined,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      if (!sessionId) setSessionId(data.session_id);

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const Avatar = ({ size = 7 }: { size?: number }) => {
    const sizeClass = size === 8 ? 'w-8 h-8' : 'w-7 h-7';
    const px = size === 8 ? 32 : 28;
    return hasAvatar ? (
      <Image
        src="/avatar.jpg"
        alt="Nisha"
        width={px}
        height={px}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    ) : (
      <div className={`${sizeClass} bg-zinc-800 rounded-full flex items-center justify-center shrink-0`}>
        <Bot className="w-4 h-4 text-zinc-400" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Mobile-only header */}
      <div className="md:hidden border-b border-zinc-800 bg-zinc-900 px-4 py-3 flex items-center gap-3">
        <Avatar size={8} />
        <div>
          <p className="text-white text-sm font-medium">Nisha Chavan</p>
          <p className="text-zinc-500 text-xs">Digital Twin</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5">
            <div>
              {hasAvatar ? (
                <Image
                  src="/avatar.jpg"
                  alt="Nisha Chavan"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3 ring-2 ring-indigo-500"
                />
              ) : (
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-8 h-8 text-zinc-400" />
                </div>
              )}
              <p className="text-zinc-200 font-medium">Hi, I&apos;m Nisha&apos;s Digital Twin</p>
              <p className="text-zinc-500 text-sm mt-1">Ask me anything</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="mt-1">
                <Avatar size={7} />
              </div>
            )}

            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="mt-1">
              <Avatar size={7} />
            </div>
            <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex gap-2 items-center max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Nisha's Twin..."
            disabled={isLoading}
            autoFocus
            className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
