"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState<"input" | "analyzing" | "result" | "agent-setup">("input");
  const [activeAgent, setActiveAgent] = useState<number>(-1);

  const agents = [
    { name: "트렌드 헌터", role: "황금 키워드 발굴", icon: "🕵️‍♂️", color: "text-blue-400" },
    { name: "마켓 전략가", role: "소구점 분석", icon: "🧠", color: "text-purple-400" },
    { name: "크리에이티브 디렉터", role: "콘텐츠 생성", icon: "🎨", color: "text-pink-400" },
    { name: "컴플라이언스 오피서", role: "리스크 방어", icon: "⚖️", color: "text-green-400" },
  ];

  const startAgentSetup = () => {
    setStep("agent-setup");
    agents.forEach((_, index) => {
      setTimeout(() => {
        setActiveAgent(index);
      }, index * 1200 + 500);
    });
  };

  const handleAnalyze = () => {
    if (!url) return;
    setIsAnalyzing(true);
    setStep("analyzing");

    // Fake Analysis Sequence
    const sequence = [
      "URL 유효성 검사 중...",
      "경쟁사 페이지 크롤링 시작...",
      "이미지 5장 추출 완료",
      "키워드 분석 중... (황금 키워드 탐색)",
      "소구점(Selling Point) 추출 완료!",
      "분석 완료!"
    ];

    sequence.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        if (index === sequence.length - 1) {
          setTimeout(() => {
            setStep("result");
            setIsAnalyzing(false);
          }, 1000);
        }
      }, index * 800);
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-secondary">
                SellFlow AI
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 font-light">
                경쟁사 분석으로 시작하는 <span className="text-primary font-semibold">완전 자동화</span> 상품 등록
              </p>
            </motion.div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex items-center bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
                <Search className="w-6 h-6 text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="벤치마킹할 경쟁사 상품 URL을 입력하세요..."
                  className="w-full bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder:text-gray-600"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <button
                  onClick={handleAnalyze}
                  className="bg-primary hover:bg-primary/80 text-black font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
                >
                  분석 시작 <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-8 text-sm text-gray-500">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> 3분 만에 소싱 완료</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> 지재권 리스크 0%</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> 클릭률 200% 상승</span>
            </div>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl text-center space-y-8"
          >
            <div className="relative w-32 h-32 mx-auto">
              <motion.div
                className="absolute inset-0 border-4 border-primary/30 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 border-t-4 border-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">AI 에이전트가 분석 중입니다...</h2>
              <div className="h-40 overflow-hidden relative bg-black/30 rounded-xl p-4 border border-white/10 text-left font-mono text-sm text-green-400">
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-2"
                  >
                    &gt; {log}
                  </motion.div>
                ))}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full max-w-4xl"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-bold border border-primary/50">
                  분석 성공
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white">
                    황금 키워드 <span className="text-primary">발견 완료!</span>
                  </h2>
                  <p className="text-gray-400">
                    입력하신 경쟁사 상품에서 <strong className="text-white">3가지 핵심 소구점</strong>과 <strong className="text-white">지재권 안전 키워드</strong>를 추출했습니다.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="text-xs text-gray-500 mb-1">추천 키워드</div>
                      <div className="text-lg font-semibold text-white">#감성캠핑 #초경량 #논슬립</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="text-xs text-gray-500 mb-1">예상 마진율</div>
                      <div className="text-lg font-semibold text-primary">32% (예상 순수익 12,000원)</div>
                    </div>
                  </div>

                  <button
                    onClick={startAgentSetup}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                  >
                    이 데이터로 내 상품 만들기
                  </button>
                </div>

                <div className="relative">
                  {/* Mockup UI Card */}
                  <div className="bg-white rounded-2xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="bg-gray-200 h-48 rounded-xl mb-4 flex items-center justify-center text-gray-400">
                      [AI 생성 이미지 예시]
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-primary/20 rounded w-full" />
                      <div className="h-8 bg-secondary/20 rounded w-full" />
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -bottom-6 -left-6 bg-black border border-white/20 p-4 rounded-xl shadow-xl flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">상표권 리스크</div>
                      <div className="text-sm font-bold text-white">안전 (Safe)</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "agent-setup" && (
          <motion.div
            key="agent-setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl text-center space-y-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              <span className="text-primary">AI 팀</span>을 소집하고 있습니다...
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {agents.map((agent, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.3, scale: 0.9, y: 20 }}
                  animate={{
                    opacity: activeAgent >= index ? 1 : 0.3,
                    scale: activeAgent >= index ? 1.05 : 0.9,
                    y: activeAgent >= index ? 0 : 20,
                    borderColor: activeAgent >= index ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"
                  }}
                  className="bg-black/40 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 transition-colors duration-500"
                >
                  <div className="text-4xl mb-2">{agent.icon}</div>
                  <div className="font-bold text-white">{agent.name}</div>
                  <div className={`text-xs ${agent.color}`}>{agent.role}</div>
                  {activeAgent >= index && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full w-full mt-2"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {activeAgent >= agents.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button className="bg-white text-black font-bold py-4 px-12 rounded-full text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  대시보드로 입장하기
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
