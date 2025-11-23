'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
    const [query, setQuery] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState('idle'); // idle, processing, completed
    const [result, setResult] = useState<any>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to WebSocket
        ws.current = new WebSocket('ws://localhost:8000/ws');

        ws.current.onopen = () => {
            console.log('Connected to WebSocket');
            addLog('시스템: 실시간 서버에 연결되었습니다.');
        };

        ws.current.onmessage = (event) => {
            const message = event.data;
            addLog(message);

            // Simple check for completion (in real app, use structured JSON)
            if (message.includes('완료')) {
                setStatus('completed');
            }
        };

        ws.current.onclose = () => {
            console.log('Disconnected from WebSocket');
            addLog('시스템: 서버 연결이 끊어졌습니다.');
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    const addLog = (message: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const startSourcing = async () => {
        if (!query) return;
        setStatus('processing');
        setLogs([]);
        setResult(null);

        try {
            const res = await fetch('http://localhost:8000/sourcing/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            addLog(`시스템: 작업이 시작되었습니다. (Task ID: ${data.task_id})`);
        } catch (error) {
            console.error(error);
            addLog('시스템: 에러가 발생했습니다.');
            setStatus('idle');
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                AI Marketing Hacker
            </h1>

            <div className="w-full max-w-2xl space-y-8">
                {/* Input Section */}
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="상품 키워드를 입력하세요 (예: 무선 이어폰)"
                        className="flex-1 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                        disabled={status === 'processing'}
                    />
                    <button
                        onClick={startSourcing}
                        disabled={status === 'processing'}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors disabled:opacity-50"
                    >
                        {status === 'processing' ? '분석 중...' : '소싱 시작'}
                    </button>
                </div>

                {/* Real-time Logs */}
                <div className="bg-black rounded-lg p-6 h-96 overflow-y-auto font-mono text-sm border border-gray-800 shadow-2xl">
                    <div className="mb-2 text-gray-500 border-b border-gray-800 pb-2">실시간 에이전트 로그</div>
                    {logs.map((log, index) => (
                        <div key={index} className="mb-1 text-green-400">
                            {log}
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-gray-600 text-center mt-32">
                            대기 중... 키워드를 입력하고 시작하세요.
                        </div>
                    )}
                </div>

                {/* Result Section (Placeholder) */}
                {status === 'completed' && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">분석 결과</h2>
                        <p className="text-gray-300">
                            분석이 완료되었습니다. 상세 리포트는 준비 중입니다.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
