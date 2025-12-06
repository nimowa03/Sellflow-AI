'use client';

import { Bot, Search, FileText, Shield, Upload, Sparkles, Image } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Search,
    title: '키워드 분석',
    description: '트렌드 키워드와 상표권 안전 키워드를 찾아드려요',
    prompt: '무선 이어폰 관련 키워드를 분석해줘',
  },
  {
    icon: FileText,
    title: '상세페이지 생성',
    description: '경쟁사 분석 후 최적의 상세페이지를 만들어요',
    prompt: '노이즈캔슬링 이어폰 상세페이지 만들어줘',
  },
  {
    icon: Image,
    title: '이미지 생성',
    description: '저작권 걱정 없는 AI 이미지를 생성해요',
    prompt: '무선 이어폰 배경 이미지를 카페 스타일로 만들어줘',
  },
  {
    icon: Shield,
    title: '법적 검사',
    description: '상표권과 금지어를 한번에 검사해요',
    prompt: '이 키워드가 상표권에 문제없는지 확인해줘: ',
  },
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-2xl mx-auto"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">
          안녕하세요! 무엇을 도와드릴까요?
        </h1>
        <p className="text-muted-foreground mb-8">
          상품 소싱, 콘텐츠 생성, 법적 검사까지 AI가 도와드립니다.
        </p>

        {/* Suggestion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <suggestion.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {suggestion.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Features */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-green-500" />
            <span>상표권 자동 검사</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI 콘텐츠 생성</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Upload className="h-4 w-4 text-blue-500" />
            <span>다중 마켓 업로드</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


