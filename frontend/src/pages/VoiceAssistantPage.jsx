import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, MessageSquare, Sparkles, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { aiAssistantPrompts } from '../data/mockData';
import { sendVoiceQuery, sendTextQuery } from '../services/aiApi';

// Agentic status steps shown during processing
const STATUS_STEPS = [
  { icon: '🎤', text: 'Listening...' },
  { icon: '🧠', text: 'Understanding your query...' },
  { icon: '📊', text: 'Analyzing schemes...' },
  { icon: '✅', text: 'Ready with results' },
];

const VoiceAssistantPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusStep, setStatusStep] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [conversation, setConversation] = useState([
    { role: 'ai', text: "Hello! I'm Akash, your proactive AI assistant. How can I help you regarding your schemes or profile today?" }
  ]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, statusStep]);

  // Animate through status steps during processing
  useEffect(() => {
    if (!isProcessing) return;
    if (statusStep >= STATUS_STEPS.length - 1) return;

    const timer = setTimeout(() => {
      setStatusStep(prev => Math.min(prev + 1, STATUS_STEPS.length - 2));
    }, 1200);

    return () => clearTimeout(timer);
  }, [isProcessing, statusStep]);

  // Speak the AI response using browser TTS
  const speakResponse = useCallback((text, language) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Explicitly set language based on what the AI responded with
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  // Handle AI response (shared by voice and text paths)
  const handleAIResponse = useCallback((data) => {
    setStatusStep(STATUS_STEPS.length - 1); // Show "Ready with results"

    setTimeout(() => {
      setIsProcessing(false);
      setStatusStep(0);

      // Add AI response to conversation
      setConversation(prev => [...prev, { 
        role: 'ai', 
        text: data.response,
        language: data.language,
        route: (data.intent === 'navigate' || data.route) ? data.route : null // Store route for manual click
      }]);

      // Speak the response
      speakResponse(data.response, data.language);
    }, 600);
  }, [navigate, speakResponse]);

  // Handle errors
  const handleError = useCallback((errorMsg) => {
    setIsProcessing(false);
    setStatusStep(0);
    setConversation(prev => [...prev, { 
      role: 'ai', 
      text: errorMsg || "I'm sorry, something went wrong. Please try again.",
      isError: true
    }]);
  }, []);

  // ─── VOICE RECORDING ───────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size < 1000) {
          handleError("Recording was too short. Please try speaking for a bit longer.");
          return;
        }

        // Show processing state
        setIsProcessing(true);
        setStatusStep(1); // Skip "Listening" — go to "Understanding"

        const browserTranscript = transcriptRef.current; // Use the ref to get the LATEST transcript

        try {
          const data = await sendVoiceQuery(audioBlob, browserTranscript);
          
          // Add the transcribed text as a user message
          // Prefer browserTranscript if it matches what the user saw EXACTLY
          const userText = browserTranscript || data.text;
          if (userText) {
            setConversation(prev => [...prev, { role: 'user', text: userText }]);
          }

          handleAIResponse(data);
        } catch (err) {
          console.error('Voice query error:', err);
          handleError("I couldn't process your voice input. Try typing your query instead.");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatusStep(0);
      transcriptRef.current = ''; // Reset transcript ref

      // Start Web Speech API for real-time feedback
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Fallback to Indian English, Whisper handles actual detection later

        recognition.onresult = (event) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              // We don't necessarily need final here because we use Whisper for the actual final result
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          if (interimTranscript) {
            setMessage(interimTranscript);
            transcriptRef.current = interimTranscript; // Sync with Ref
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.error('Microphone access error:', err);
      handleError("Could not access microphone. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ─── TEXT INPUT ─────────────────────────────────────────
  const handleSend = async (textInput) => {
    const text = textInput || message;
    if (!text.trim() || isProcessing) return;

    // Add user message to conversation
    setConversation(prev => [...prev, { role: 'user', text }]);
    setMessage('');
    setIsProcessing(true);
    setStatusStep(1);

    try {
      const data = await sendTextQuery(text);
      handleAIResponse(data);
    } catch (err) {
      console.error('Text query error:', err);
      handleError("I couldn't process your query right now. Please try again.");
    }
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
          <p className="text-slate-500 mt-2">Speak or type to instantly find information or trigger actions.</p>
         </div>
         {/* TTS Toggle */}
         <button
           onClick={() => {
             setTtsEnabled(!ttsEnabled);
             if (ttsEnabled) window.speechSynthesis?.cancel();
           }}
           className={`p-2.5 rounded-xl transition-all ${
             ttsEnabled 
               ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
               : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
           }`}
           title={ttsEnabled ? 'Mute voice responses' : 'Enable voice responses'}
         >
           {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
         </button>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 flex flex-col custom-scrollbar">
          {conversation.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indian-navy text-white rounded-tr-sm' : `${msg.isError ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-slate-200'} text-slate-800 rounded-tl-sm border`}`}>
                 {msg.role === 'ai' && (
                    <div className={`flex items-center gap-2 mb-2 ${msg.isError ? 'text-red-500' : 'text-indigo-600'}`}>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Akash AI</span>
                    </div>
                 )}
                 <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                 {msg.role === 'ai' && msg.route && (
                    <button
                      onClick={() => navigate(msg.route)}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl border-2 border-indigo-100 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      View Matched Schemes
                    </button>
                 )}
               </div>
            </div>
          ))}

          {/* Agentic Status Indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%] md:max-w-[70%] p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-tl-sm">
                  <div className="flex items-center gap-2 mb-3 text-indigo-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-wider">Processing</span>
                  </div>
                  <div className="space-y-2">
                    {STATUS_STEPS.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0.3 }}
                        animate={{ 
                          opacity: idx <= statusStep ? 1 : 0.3,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center gap-2 text-sm ${
                          idx <= statusStep ? 'text-slate-700' : 'text-slate-400'
                        } ${idx === statusStep ? 'font-semibold' : ''}`}
                      >
                        <span>{step.icon}</span>
                        <span>{step.text}</span>
                        {idx === statusStep && idx < STATUS_STEPS.length - 1 && (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-500 ml-1" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 md:px-8 pb-4 pt-2 flex gap-2 overflow-x-auto custom-scrollbar">
           {aiAssistantPrompts.map((prompt, i) => (
             <button 
               key={i} 
               onClick={() => handleSuggestionClick(prompt)}
               disabled={isProcessing}
               className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-sm font-semibold text-slate-600 hover:text-blue-700 rounded-full transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={toggleRecording}
                disabled={isProcessing}
                className={`absolute left-2 p-3 rounded-full transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                    : isProcessing
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isRecording ? 'Stop recording' : 'Start recording'}
             >
               <Mic className="w-5 h-5" />
             </button>
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRecording ? 'Listening... click mic to stop' : 'Ask me about schemes, eligibility, or applications...'}
                disabled={isProcessing} // Allow typing OR seeing transcription even when recording (readonly achieved by isRecording)
                readOnly={isRecording}
                className={`w-full py-4 pl-14 pr-16 bg-transparent border-none outline-none font-medium placeholder:text-slate-400 disabled:cursor-not-allowed transition-all ${
                  isRecording ? 'text-blue-600' : 'text-slate-700'
                }`}
              />
             <button 
                onClick={() => handleSend()}
                disabled={!message.trim() || isProcessing || isRecording}
                className="absolute right-2 p-3 bg-indian-navy text-white rounded-full hover:bg-blue-800 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
             >
               <Send className="w-5 h-5 ml-0.5" />
             </button>
           </div>
           {/* Recording indicator */}
           <AnimatePresence>
             {isRecording && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="flex items-center justify-center gap-2 mt-3 text-red-500 text-sm font-semibold"
               >
                 <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                 Recording... Speak now
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceAssistantPage;
