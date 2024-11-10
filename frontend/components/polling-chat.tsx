'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { emotionalTherapy } from '@/actions/emotional-therapy';

interface Message {
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

const ZenDecorator = () => (
  <svg className="absolute opacity-10" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="currentColor"
      d="M47.5,-61.5C59.6,-52.2,66.3,-35.3,69.4,-18.1C72.4,-0.9,71.8,16.6,64.4,30.5C57,44.4,42.8,54.7,27.4,61.6C12,68.5,-4.6,72,-20.8,68.4C-37,64.8,-52.8,54.1,-63.1,39.2C-73.4,24.3,-78.3,5.2,-74.3,-11.7C-70.4,-28.5,-57.7,-43.1,-43.1,-52C-28.5,-60.9,-12,-64.1,3.4,-68.4C18.8,-72.7,35.4,-70.9,47.5,-61.5Z"
      transform="translate(100 100)"
    />
  </svg>
);

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userMemory, setUserMemory] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstMessage = messages.length === 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEmotionalTherapy = async () => {
    if (!userMemory.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      content: userMemory,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await emotionalTherapy(userMemory);
      if (response.status === 200) {
        const assistantMessage: Message = {
          content: response.data,
          sender: 'assistant',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setErrorMessage(response?.message || "Failed to generate response");
      }
    } catch (error) {
      setErrorMessage("An error occurred while processing your request");
    }

    setIsLoading(false);
    setUserMemory("");
  };

return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 text-teal-700/20 w-64 h-64">
          <ZenDecorator />
        </div>
        <div className="absolute bottom-0 right-0 text-purple-700/20 w-64 h-64">
          <ZenDecorator />
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 backdrop-blur-md bg-gray-900/80 border-b border-gray-700/50 p-6 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="relative">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
              Revisit
            </h1>
            <p className="text-sm text-gray-400">Because Every Memory Deserves Healing</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-lg transition-all duration-300 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-gray-100'
                    : 'bg-gray-800/80 text-gray-100 border border-gray-700'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                <span className="text-xs text-gray-400 mt-2 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl p-4 border border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className={`border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-md p-6 transition-all duration-300 ${
        isFirstMessage ? 'mt-auto' : ''
      }`}>
        <div className="max-w-4xl mx-auto">
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-900/50 text-red-300 rounded-xl border border-red-700/50">
              {errorMessage}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Share your memory here in a safe space..."
              value={userMemory}
              onChange={(e) => setUserMemory(e.target.value)}
              className="min-h-[120px] p-4 rounded-xl border border-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-gray-800/50 placeholder:text-gray-500 text-gray-100 transition-all duration-200 resize-none"
            />
            <Button
              onClick={handleEmotionalTherapy}
              disabled={isLoading || !userMemory.trim()}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-gray-100 py-3 px-6 rounded-xl shadow-lg shadow-teal-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  Processing
                  <span className="inline-block w-2 h-2 bg-gray-100 rounded-full animate-pulse" />
                </span>
              ) : (
                'Share Memory'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
