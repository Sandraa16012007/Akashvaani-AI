import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, MessageSquare, Sparkles } from 'lucide-react';
import { aiAssistantPrompts } from '../data/mockData';

const VoiceAssistantPage = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState([
    { role: 'ai', text: "Hello! I'm Akash, your proactive AI assistant. How can I help you regarding your schemes or profile today?" }
  ]);

  const handleSend = (textInput) => {
    const text = textInput || message;
    if (!text.trim()) return;

    setConversation(prev => [...prev, { role: 'user', text }]);
    setMessage('');
    
    // Mock AI response
    setTimeout(() => {
      setConversation(prev => [...prev, { role: 'ai', text: "I'm analyzing your request. Since this is a demo, I'll record that you asked: " + text }]);
    }, 1000);
  };

  const handleSuggestionClick = (prompt) => {
    handleSend(prompt);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col"
    >
      <div className="mb-6 flex items-center justify-between">
         <div>
          <h1 className="text-3xl font-extrabold text-indian-navy flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
               <Mic className="w-6 h-6 text-white" />
            </div>
            Ask Akash AI
          </h1>
          <p className="text-slate-500 mt-2">"Speak or type to instantly find information or trigger actions."</p>
         </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 flex flex-col custom-scrollbar">
          {conversation.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indian-navy text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200'}`}>
                 {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Akash AI</span>
                    </div>
                 )}
                 <p className="leading-relaxed">{msg.text}</p>
               </div>
            </div>
          ))}
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 md:px-8 pb-4 pt-2 flex gap-2 overflow-x-auto custom-scrollbar">
           {aiAssistantPrompts.map((prompt, i) => (
             <button 
               key={i} 
               onClick={() => handleSuggestionClick(prompt)}
               className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-sm font-semibold text-slate-600 hover:text-blue-700 rounded-full transition-colors flex items-center gap-2"
             >
               <MessageSquare className="w-3.5 h-3.5" />
               {prompt}
             </button>
           ))}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200">
           <div className="relative flex items-center bg-white border border-slate-300 rounded-full shadow-inner focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
             <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`absolute left-2 p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
             >
               <Mic className="w-5 h-5" />
             </button>
             <input 
               type="text" 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Ask me about schemes, eligibility, or applications..."
               className="w-full py-4 pl-14 pr-16 bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400"
             />
             <button 
                onClick={() => handleSend()}
                disabled={!message.trim()}
                className="absolute right-2 p-3 bg-indian-navy text-white rounded-full hover:bg-blue-800 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
             >
               <Send className="w-5 h-5 ml-0.5" />
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceAssistantPage;
