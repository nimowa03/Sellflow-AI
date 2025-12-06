'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search,
  FileText,
  Image,
  ArrowRight, 
  Menu, 
  X, 
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Info,
  Loader2,
  Users,
  MessageSquare,
  XCircle,
  HelpCircle,
  Bot,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// ========== 네비게이션 ==========
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border/50' : 'bg-transparent'
    }`}>
      <nav className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">SellerBrain</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">문제</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">기능</a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">데모</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">로그인</Button>
            <Button size="sm" asChild>
              <Link href="/dashboard">무료로 시작</Link>
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="#problem" className="text-sm py-2" onClick={() => setMobileMenuOpen(false)}>문제</a>
              <a href="#features" className="text-sm py-2" onClick={() => setMobileMenuOpen(false)}>기능</a>
              <a href="#demo" className="text-sm py-2" onClick={() => setMobileMenuOpen(false)}>데모</a>
              <div className="flex gap-2 pt-4 border-t border-border/50">
                <Button variant="ghost" size="sm" className="flex-1">로그인</Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link href="/dashboard">무료로 시작</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ========== 히어로 섹션 ==========
function HeroSection() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const questions = [
    { text: '"이 키워드, 상표권 침해 아닐까?"', emoji: '🤔' },
    { text: '"이 이미지, 저작권 문제 없을까?"', emoji: '😰' },
    { text: '"혹시 계정 정지되면 어쩌지?"', emoji: '😱' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestion((prev) => (prev + 1) % questions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-background to-background pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* 타겟 명시 - 포괄적으로 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Badge variant="outline" className="px-4 py-2 text-sm border-muted-foreground/30">
            <Users className="w-4 h-4 mr-2" />
            이커머스 셀러 · 1인 셀러 · 온라인 판매자를 위한
          </Badge>
        </motion.div>

        {/* 문제 제기 - 셀러의 두려움 (애니메이션) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 h-20 flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <span className="text-4xl">{questions[currentQuestion].emoji}</span>
              <span className="text-xl md:text-2xl text-muted-foreground font-medium">
                {questions[currentQuestion].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 메인 카피 - 행동 유도 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground">업로드 전에</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
            한번 확인해보세요
          </span>
        </motion.h1>

        {/* 서브 카피 - 기능 설명 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed"
        >
          <span className="text-foreground font-medium">문제될 키워드, 미리 알려드려요.</span>
          <br />
          상표권 · 정책 위반 표현 · 저작권 리스크까지.
        </motion.p>

        {/* 데이터 출처 - 간결하게 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-sm text-muted-foreground mb-8"
        >
          <span className="inline-flex items-center gap-1">
            특허청{' '}
            <a href="https://kipris.or.kr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              KIPRIS
            </a>{' '}
            50만+ 상표 데이터 기반
          </span>
        </motion.p>

        {/* 기능 독립 사용 강조 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10 text-sm"
        >
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
            <Search className="w-4 h-4 text-primary" />
            <span>키워드 검사</span>
          </span>
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
            <FileText className="w-4 h-4 text-primary" />
            <span>상세페이지 검사</span>
          </span>
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
            <Image className="w-4 h-4 text-primary" />
            <span>이미지 생성</span>
          </span>
          <span className="text-xs text-muted-foreground px-2">
            필요한 기능만 선택해서 사용
          </span>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <Button size="lg" className="h-14 px-8 text-base" asChild>
            <Link href="/dashboard">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI와 대화하며 시작하기
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base" asChild>
            <a href="#demo">
              <HelpCircle className="w-4 h-4 mr-2" />
              데모 체험하기
            </a>
          </Button>
        </motion.div>

        {/* 면책 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xs text-muted-foreground/60"
        >
          * 검사 결과는 참고용이며, 최종 확인은 KIPRIS 또는 전문가 상담 권장
        </motion.p>
      </div>
    </section>
  );
}

// ========== 문제 섹션 ==========
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: XCircle,
      title: '상표권 침해',
      description: '"에어팟 스타일", "다이슨 느낌" 같은 키워드',
      result: '계정 정지 + 손해배상 청구',
      frequency: '매우 높음',
      color: 'red'
    },
    {
      icon: AlertCircle,
      title: '저작권 침해',
      description: '타사 상품 이미지, 도매 이미지 무단 사용',
      result: '저작권 침해 고소',
      frequency: '높음',
      color: 'orange'
    },
    {
      icon: AlertTriangle,
      title: '정책 위반 표현',
      description: '"최저가", "1위", "완벽한" 등 마켓 정책 위반',
      result: '상품 삭제 + 벌금',
      frequency: '높음',
      color: 'yellow'
    },
  ];

  return (
    <section ref={ref} id="problem" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-red-500/30 text-red-500">문제</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            모르고 쓰면, <span className="text-red-500">큰일</span>납니다
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            이커머스 셀러들이 자주 하는 실수.
            <br />
            "몰랐다"고 해도 <span className="text-foreground font-medium">법적 책임</span>은 피할 수 없습니다.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-red-500/30 transition-all"
            >
              <div className={`p-3 rounded-xl w-fit mb-4 ${
                problem.color === 'red' ? 'bg-red-500/10' :
                problem.color === 'orange' ? 'bg-orange-500/10' :
                'bg-yellow-500/10'
              }`}>
                <problem.icon className={`w-6 h-6 ${
                  problem.color === 'red' ? 'text-red-500' :
                  problem.color === 'orange' ? 'text-orange-500' :
                  'text-yellow-500'
                }`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {problem.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-500 font-medium">{problem.result}</span>
                <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-500">
                  {problem.frequency}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 경쟁사 비교 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 md:p-8 rounded-2xl bg-card border border-border"
        >
          <h3 className="text-lg font-semibold mb-6 text-center">
            기존 서비스들의 공통 문제
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
              <p className="text-sm font-medium text-red-500 mb-2">❌ 기존 서비스</p>
              <p className="text-muted-foreground text-sm mb-3">
                "데이터는 주지만, <strong className="text-foreground">책임은 안 진다</strong>"
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  키워드 분석: "검색량 높아요" (끝)
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  이미지 편집: "저작권은 사용자 책임"
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  리스크 검사: 기능 없음
                </li>
              </ul>
            </div>
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-primary mb-2">✅ SellerBrain</p>
              <p className="text-muted-foreground text-sm mb-3">
                "<strong className="text-foreground">학습된 AI</strong>가 사전에 검사"
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  키워드: <span className="text-primary font-medium">상표권 + 정책 위반 검사</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  이미지: <span className="text-primary font-medium">AI 생성으로 저작권 클리어</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  챗봇: <span className="text-primary font-medium">대화하며 검사 & 수정</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ========== 기능 섹션 - 독립 사용 가능 ==========
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Search,
      title: '키워드 리스크 검사',
      description: '판매하려는 키워드가 상표권 침해나 정책 위반에 해당하는지 학습된 AI가 검사합니다.',
      chatExample: '"무선 이어폰 추천 키워드 검사해줘"',
      badge: '상표권 + 정책 위반',
    },
    {
      icon: FileText,
      title: '상세페이지 리스크 검사',
      description: '작성한 상세페이지 문구에 정책 위반 표현이나 과장광고가 있는지 검사합니다.',
      chatExample: '"이 상세페이지 문구 검사해줘"',
      badge: '정책 위반 + 과장광고',
    },
    {
      icon: Image,
      title: 'AI 이미지 생성',
      description: '저작권 걱정 없는 상품 이미지를 AI가 생성합니다. 배경 변경, 모델 합성 등.',
      chatExample: '"흰 배경으로 상품 이미지 만들어줘"',
      badge: '저작권 클리어',
    },
  ];

  return (
    <section ref={ref} id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">기능</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            필요한 기능만, <span className="text-primary">챗봇</span>으로
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            순서 상관없이, <span className="text-foreground font-medium">원하는 기능만 선택</span>해서 사용하세요.
            <br />
            AI와 대화하듯 검사하고, 수정하고, 생성합니다.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {feature.badge}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {feature.description}
              </p>
              
              {/* 챗봇 예시 */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-xs text-muted-foreground italic">
                    {feature.chatExample}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 챗봇 UI 강조 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-blue-500/5 border border-primary/20"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold mb-2">
                대화하듯 사용하는 AI 대시보드
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                복잡한 메뉴 대신, <span className="text-foreground font-medium">챗봇에게 말하듯</span> 요청하세요.
                <br />
                "이 키워드 검사해줘", "상세페이지 문구 수정해줘", "배경 바꿔줘" 등
                <br />
                <span className="text-primary">학습된 AI</span>가 검사하고, 수정안을 제안합니다.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI와 대화하기
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ========== 인터랙티브 데모 ==========
interface CheckResult {
  keyword: string;
  status: 'safe' | 'warning' | 'danger';
  message: string;
  suggestion?: string;
}

function InteractiveDemo() {
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const checkKeyword = async () => {
    if (!input.trim()) return;
    
    setIsChecking(true);
    setHasSearched(true);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const keywords = input.split(' ').filter(k => k.length > 0);
    const demoResults: CheckResult[] = [];
    
    const trademarkWords = ['에어팟', '버즈', '비츠', '갤럭시', '아이폰', '다이슨', '나이키', '아디다스', '샤넬', '루이비통'];
    const policyViolationWords = ['정품', '최저가', '1위', '최고', '완벽', '100%'];
    
    keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      
      if (trademarkWords.some(tw => lowerKeyword.includes(tw.toLowerCase()))) {
        demoResults.push({
          keyword,
          status: 'danger',
          message: '등록상표 포함 가능성',
          suggestion: keyword.includes('에어팟') ? '무선 이어버드' : 
                     keyword.includes('버즈') ? 'TWS 이어폰' : 
                     keyword.includes('다이슨') ? '무선 청소기' : '일반 명칭 사용 권장'
        });
      } else if (policyViolationWords.some(pw => lowerKeyword.includes(pw.toLowerCase()))) {
        demoResults.push({
          keyword,
          status: 'warning',
          message: '마켓 정책 위반 가능성',
          suggestion: '객관적 표현으로 변경 권장'
        });
      } else if (keyword.length > 1) {
        demoResults.push({
          keyword,
          status: 'safe',
          message: '검사 결과 이상 없음'
        });
      }
    });
    
    setResults(demoResults);
    setIsChecking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkKeyword();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* 챗봇 스타일 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-sm">SellerBrain AI</span>
            <Badge variant="secondary" className="text-[10px]">Demo</Badge>
          </div>
          <span className="text-xs text-muted-foreground">학습된 AI 검사</span>
        </div>

        {/* 챗봇 스타일 입력 */}
        <div className="p-5">
          <div className="flex gap-2">
            <Input
              placeholder="검사할 키워드를 입력하세요"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={checkKeyword} disabled={isChecking || !input.trim()}>
              {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : '검사'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            예시: 다이슨 느낌 무선청소기 최저가
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isChecking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 pb-5"
            >
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">AI가 검사 중...</span>
              </div>
            </motion.div>
          )}

          {!isChecking && hasSearched && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-5 pb-5 space-y-3"
            >
              {/* AI 응답 스타일 */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground">검사 결과입니다:</p>
                  
                  {results.map((result, index) => (
                    <motion.div
                      key={result.keyword}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        result.status === 'safe' 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : result.status === 'warning'
                          ? 'bg-yellow-500/5 border-yellow-500/20'
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      {result.status === 'safe' && <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />}
                      {result.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                      {result.status === 'danger' && <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${result.status === 'danger' ? 'line-through text-muted-foreground' : ''}`}>
                            {result.keyword}
                          </span>
                          {result.suggestion && (
                            <>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <span className="text-green-600 font-medium">{result.suggestion}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{result.message}</p>
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className={`text-xs shrink-0 ${
                          result.status === 'safe' ? 'bg-green-500/10 text-green-600' :
                          result.status === 'warning' ? 'bg-yellow-500/10 text-yellow-600' :
                          'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {result.status === 'safe' ? '안전' : result.status === 'warning' ? '주의' : '위험'}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 mt-4">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  본 검사는{' '}
                  <a href="https://kipris.or.kr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                    KIPRIS
                  </a>{' '}
                  데이터로 학습된 AI의 참고용 결과입니다. 
                  정확한 확인은 전문가 상담을 권장합니다.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="demo" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">직접 체험</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            AI에게 물어보세요
          </h2>
          <p className="text-muted-foreground">
            판매하려는 키워드의 리스크를 학습된 AI가 검사합니다
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <InteractiveDemo />
        </motion.div>
      </div>
    </section>
  );
}

// ========== 타겟 사용자 섹션 ==========
function TargetSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">대상</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            이런 분들을 위해 만들었습니다
          </h2>
          <p className="text-muted-foreground">
            리스크가 걱정되는 모든 <span className="text-foreground font-medium">이커머스 셀러</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { emoji: '🛒', label: '이커머스 셀러', desc: '오픈마켓 판매자', pain: '"이 키워드 괜찮을까?"' },
            { emoji: '👤', label: '1인 셀러', desc: '소호/개인 사업자', pain: '"법적 문제 어떡하지?"' },
            { emoji: '📦', label: '위탁/구매대행', desc: '도매·해외 소싱', pain: '"이미지 써도 되나?"' },
            { emoji: '💼', label: '부업 셀러', desc: '직장인·투잡', pain: '"잘 모르고 했다가..."' },
            { emoji: '🚀', label: '스타트업', desc: '초기 이커머스 팀', pain: '"빠르게 검증하고 싶어"' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="text-3xl mb-3">{item.emoji}</div>
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mb-2">{item.desc}</p>
              <p className="text-[10px] text-muted-foreground italic">
                {item.pain}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== CTA 섹션 ==========
function CTASection() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-10 md:p-12 rounded-3xl overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-blue-500/10" />
          <div className="absolute inset-0 border border-border rounded-3xl" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              판매 전, AI에게 물어보세요
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
              상표권, 정책 위반, 저작권 리스크를 학습된 AI가 검사합니다.
              <br />
              필요한 기능만 골라서, 챗봇으로 간편하게.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href="/dashboard">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  무료로 시작하기
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              * 검사 결과는 참고용이며, 최종 확인은 전문가 상담 권장
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ========== 푸터 ==========
function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SellerBrain</span>
              <span className="text-xs text-muted-foreground">| 이커머스 리스크 검사 AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">이용약관</a>
              <a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-foreground transition-colors">문의</a>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 text-xs text-muted-foreground leading-relaxed">
            <p className="font-medium mb-2">서비스 이용 안내</p>
            <p>
              SellerBrain은 상표권/정책 위반/저작권 리스크 확인을 돕는 <strong>참고용 도구</strong>입니다. 
              본 서비스의 검사 결과는 법적 효력이 없으며, 실제 상표권 침해 여부 및 마켓 정책 준수 여부는 
              <a href="https://kipris.or.kr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mx-1">KIPRIS(특허정보검색서비스)</a>, 
              변리사, 또는 각 마켓의 공식 가이드라인을 통해 최종 확인하시기 바랍니다.
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            © 2025 SellerBrain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ========== 메인 페이지 ==========
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <DemoSection />
      <TargetSection />
      <CTASection />
      <Footer />
    </main>
  );
}
