import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Sparkles, ChefHat, ChevronDown, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClose?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ messages, onSendMessage, isLoading, onClose }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white w-full">
      
      <div className="pt-safe px-6 py-4 border-b border-slate-50 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" />
          <span className="text-lg font-bold text-slate-800">Chef Assistant</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50"
      >
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-50">
              <ChefHat className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-sm font-medium text-slate-400">Ask me for recipes based on your fridge magnets!</p>
           </div>
        )}

        {messages.map((msg) => {
          const parts = msg.text.split('---RECIPE---');
          const mainText = parts[0];
          const recipeText = parts[1];

          return (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`
                  max-w-[90%] px-5 py-3 text-base leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-sm'}
                `}
              >
                 <div className="prose prose-sm max-w-none dark:prose-invert">
                   <ReactMarkdown>{mainText}</ReactMarkdown>
                 </div>
              </div>

              {recipeText && msg.role === 'model' && (
                <div className="mt-2 max-w-[95%] w-full">
                  <details className="group bg-white border border-orange-100 rounded-xl shadow-sm overflow-hidden" open>
                    <summary className="flex items-center gap-2 p-3 bg-orange-50/50 cursor-pointer list-none select-none">
                      <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-sm">
                         <ChefHat className="w-3 h-3" />
                      </div>
                      <span className="flex-1 font-bold text-orange-900 text-xs">View Recipe</span>
                      <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="p-4 bg-white text-slate-700 text-sm border-t border-orange-100">
                      <div className="prose prose-sm prose-orange max-w-none">
                        <ReactMarkdown>{recipeText}</ReactMarkdown>
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          );
        })}
        
        {isLoading && (
           <div className="flex gap-1 pl-4">
             <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
             <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
             <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
           </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 pb-safe shadow-lg z-20">
        <div className="flex gap-2 items-center bg-slate-100 p-1.5 rounded-full pl-5 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Reply to ChefMate..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-base py-2"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 disabled:bg-slate-300 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
};