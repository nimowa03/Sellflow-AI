"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Terminal, Search, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoldenKeyword {
  keyword: string;
  search_volume: string;
  competition: string;
  reason: string;
  risk: string;
}

interface SourcingResult {
  query: string;
  golden_keywords: GoldenKeyword[];
  market_analysis: string;
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
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          AI Product Sourcing Agent
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Enter a keyword to deploy autonomous AI agents. They will analyze market trends, 
          competition, and find "Golden Keywords" for you in real-time.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
          <div className="relative flex items-center bg-gray-900 rounded-xl border border-gray-800 p-2">
            <Search className="w-6 h-6 text-gray-400 ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Camping Chair, Wireless Earbuds..."
              className="w-full bg-transparent text-white px-4 py-3 focus:outline-none text-lg placeholder-gray-500"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSearching ? 'Analyzing...' : 'Deploy Agent'}
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Terminal / Logs Section */}
        <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden flex flex-col h-[500px] shadow-2xl">
          <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono text-gray-400">Agent Terminal Output</span>
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {logs.length === 0 && (
              <div className="text-gray-600 italic text-center mt-20">
                Waiting for mission...
              </div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 break-words">
                <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6 h-[500px] overflow-y-auto pr-2">
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Market Analysis Card */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Market Analysis
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {result.market_analysis}
                  </p>
                </div>

                {/* Golden Keywords List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                    Golden Keywords Discovered
                  </h3>
                  {result.golden_keywords?.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-white">{item.keyword}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.risk.includes('없음') || item.risk.includes('낮음') 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.risk}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500 block">Search Volume</span>
                          <span className="text-gray-300">{item.search_volume}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Competition</span>
                          <span className="text-gray-300">{item.competition}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 bg-gray-900/50 p-2 rounded">
                        💡 {item.reason}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {!result && !isSearching && logs.length > 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Agent is working... Results will appear here.
              </div>
            )}
            
            {!result && !isSearching && logs.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Ready to analyze.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
