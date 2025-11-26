"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Terminal, Search, TrendingUp, FileText, Image as ImageIcon, Lightbulb, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface SourcingResult {
  final_keyword: string;
  product_names: string[];
  hooking_messages: string[];
  detail_page_plan: string;
  image_prompt: string;
  strategy_summary: string;
}

export default function SourcingDashboard() {
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<SourcingResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket('ws://localhost:8000/ws');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
      setLogs(prev => [...prev, 'System: Connected to Real-time Agent Stream...']);
    };

    ws.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'result') {
          setResult(parsed.data);
          setIsSearching(false);
          setLogs(prev => [...prev, 'System: Analysis Completed.']);
        } else {
          // If it's a JSON but not result type, just stringify
          setLogs(prev => [...prev, `Agent: ${JSON.stringify(parsed)}`]);
        }
      } catch (e) {
        // Plain text log
        setLogs(prev => [...prev, `Agent: ${event.data}`]);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setLogs(prev => [...prev, 'System: WebSocket Error.']);
    };

    return () => ws.current?.close();
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setLogs([]);
    setResult(null);
    setLogs(prev => [...prev, `System: Starting sourcing task for "${query}"...`]);

    try {
      const response = await fetch('http://localhost:8000/sourcing/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to start task');
      }
    } catch (error) {
      console.error(error);
      setLogs(prev => [...prev, `System Error: ${error}`]);
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          AI Marketing Hacker
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Deploy your elite team of 5 AI agents. From sourcing to content creation,
          watch them build your product strategy in real-time.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
          <div className="relative flex items-center bg-gray-900 rounded-2xl border border-gray-800 p-2">
            <Search className="w-6 h-6 text-gray-400 ml-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a product idea (e.g., Camping Chair, Organic Dog Food)..."
              className="w-full bg-transparent text-white px-4 py-4 focus:outline-none text-xl placeholder-gray-500"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              {isSearching ? 'Hacking...' : 'Launch Agents'}
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Terminal / Logs Section (Left Side - 4 cols) */}
        <div className="lg:col-span-4 bg-gray-950 rounded-xl border border-gray-800 overflow-hidden flex flex-col h-[700px] shadow-2xl">
          <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Mission Control Log</span>
          </div>
          <div className="flex-1 p-4 font-mono text-xs sm:text-sm overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {logs.length === 0 && (
              <div className="text-gray-600 italic text-center mt-32">
                Waiting for command...
              </div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="break-words">
                <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                <span className={log.startsWith('System:') ? 'text-blue-400' : 'text-green-400'}>
                  {log}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Results Section (Right Side - 8 cols) */}
        <div className="lg:col-span-8 space-y-6 h-[700px] overflow-y-auto pr-2 scrollbar-hide">
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* 1. Strategy Summary */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Target className="w-8 h-8 text-red-500" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                      Final Strategy: {result.final_keyword}
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {result.strategy_summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2. Product Names */}
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
                    <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Winning Product Names
                    </h4>
                    <ul className="space-y-3">
                      {result.product_names?.map((name, i) => (
                        <li key={i} className="flex items-center gap-3 text-white bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                          <span className="text-blue-500 font-bold">0{i + 1}</span>
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. Hooking Messages */}
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
                    <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Killer Hooks
                    </h4>
                    <ul className="space-y-3">
                      {result.hooking_messages?.map((msg, i) => (
                        <li key={i} className="text-gray-300 text-sm italic bg-gray-800/30 p-3 rounded-lg border-l-2 border-purple-500">
                          "{msg}"
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Detail Page Plan */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                  <h4 className="text-xl font-semibold text-green-400 mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Detail Page Blueprint
                  </h4>
                  <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-green-300">
                    <ReactMarkdown>{result.detail_page_plan}</ReactMarkdown>
                  </div>
                </div>

                {/* 5. Image Prompt */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h4 className="text-lg font-semibold text-pink-400 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    AI Image Prompt
                  </h4>
                  <div className="bg-black/50 p-4 rounded-lg border border-gray-700 font-mono text-sm text-gray-400 break-all">
                    {result.image_prompt}
                  </div>
                </div>

              </motion.div>
            )}

            {!result && !isSearching && logs.length > 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p>Agents are collaborating... This may take a minute.</p>
              </div>
            )}

            {!result && !isSearching && logs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
                <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-800">
                  <Target className="w-10 h-10 text-gray-700" />
                </div>
                <p>Ready to launch mission.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
