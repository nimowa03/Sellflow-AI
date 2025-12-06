'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Shield,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // AI 메시지 전용
  type?: 'text' | 'keywords' | 'content_preview' | 'legal_check' | 'upload_result';
  data?: unknown;
  status?: 'thinking' | 'complete';
}

interface ChatMessageProps {
  message: Message;
  onAction?: (action: string, data?: unknown) => void;
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 px-4 py-3',
        isUser ? 'flex-row-reverse' : ''
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        'h-8 w-8 flex-shrink-0',
        isUser ? 'bg-muted' : 'bg-primary/10'
      )}>
        <AvatarFallback className={isUser ? '' : 'text-primary'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className={cn(
        'flex-1 space-y-2',
        isUser ? 'items-end' : 'items-start',
        isUser ? 'flex flex-col' : ''
      )}>
        {/* Text Content */}
        <div className={cn(
          'rounded-2xl px-4 py-2.5 max-w-[85%]',
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
        )}>
          {message.status === 'thinking' ? (
            <ThinkingIndicator />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Special Content Types */}
        {!isUser && message.type && message.data && (
          <div className="max-w-[85%]">
            {message.type === 'keywords' && (
              <KeywordsResult data={message.data as KeywordsData} onAction={onAction} />
            )}
            {message.type === 'content_preview' && (
              <ContentPreview data={message.data as ContentPreviewData} onAction={onAction} />
            )}
            {message.type === 'legal_check' && (
              <LegalCheckResult data={message.data as LegalCheckData} />
            )}
            {message.type === 'upload_result' && (
              <UploadResult data={message.data as UploadResultData} />
            )}
          </div>
        )}

        {/* Actions for AI messages */}
        {!isUser && message.status === 'complete' && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Timestamp */}
        <span className={cn(
          'text-[10px] text-muted-foreground',
          isUser ? 'text-right' : ''
        )}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">AI가 생각 중...</span>
    </div>
  );
}

// ========== 키워드 결과 ==========
interface KeywordsData {
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    legalStatus: 'safe' | 'warning' | 'danger';
  }>;
}

function KeywordsResult({ data, onAction }: { data: KeywordsData; onAction?: (action: string, data?: unknown) => void }) {
  const competitionLabel = {
    low: '낮음',
    medium: '중간',
    high: '높음'
  };

  const competitionColor = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">발견된 황금 키워드</span>
      </div>
      <div className="space-y-2">
        {data.keywords.map((kw, idx) => (
          <button
            key={kw.keyword}
            onClick={() => onAction?.('select_keyword', { index: idx, keyword: kw.keyword })}
            className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground w-6">{idx + 1}.</span>
              <div>
                <p className="font-medium text-sm">{kw.keyword}</p>
                <p className="text-xs text-muted-foreground">
                  검색량: {kw.searchVolume.toLocaleString()} · 경쟁: 
                  <span className={competitionColor[kw.competition]}> {competitionLabel[kw.competition]}</span>
                </p>
              </div>
            </div>
            <LegalStatusBadge status={kw.legalStatus} />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        키워드를 선택하면 상세페이지 생성을 시작합니다.
      </p>
    </Card>
  );
}

// ========== 콘텐츠 미리보기 ==========
interface ContentPreviewData {
  title: string;
  description: string;
  imageUrl?: string;
  legalCheck: {
    status: 'safe' | 'warning';
    issues: number;
  };
}

function ContentPreview({ data, onAction }: { data: ContentPreviewData; onAction?: (action: string, data?: unknown) => void }) {
  return (
    <Card className="overflow-hidden">
      {data.imageUrl && (
        <div className="aspect-video bg-muted relative">
          <img 
            src={data.imageUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-2 right-2 bg-green-500">
            <Shield className="h-3 w-3 mr-1" />
            저작권 클리어
          </Badge>
        </div>
      )}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold">{data.title}</h4>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {data.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <LegalStatusBadge status={data.legalCheck.status} showLabel />
          {data.legalCheck.issues === 0 && (
            <span className="text-xs text-green-500">검사 통과</span>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onAction?.('approve')}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            승인
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onAction?.('request_edit')}
          >
            수정 요청
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onAction?.('reject')}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ========== 법적 검사 결과 ==========
interface LegalCheckData {
  status: 'safe' | 'warning' | 'blocked';
  checks: Array<{
    type: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
  }>;
}

function LegalCheckResult({ data }: { data: LegalCheckData }) {
  const statusConfig = {
    safe: { icon: CheckCircle2, color: 'text-green-500', label: '안전' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', label: '주의 필요' },
    blocked: { icon: XCircle, color: 'text-red-500', label: '수정 필요' },
  };

  const config = statusConfig[data.status];
  const Icon = config.icon;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">법적 검사 결과</span>
        <Badge variant={data.status === 'safe' ? 'default' : 'secondary'} className={config.color}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </div>
      <div className="space-y-2">
        {data.checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            {check.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {check.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            {check.status === 'fail' && <XCircle className="h-4 w-4 text-red-500" />}
            <span className="text-muted-foreground">{check.type}:</span>
            <span>{check.message}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ========== 업로드 결과 ==========
interface UploadResultData {
  results: Array<{
    market: string;
    status: 'success' | 'pending' | 'error';
    productId?: string;
    url?: string;
  }>;
}

function UploadResult({ data }: { data: UploadResultData }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span className="font-medium text-sm">업로드 완료!</span>
      </div>
      <div className="space-y-2">
        {data.results.map((result, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
            <div className="flex items-center gap-2">
              {result.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {result.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
              {result.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
              <span className="text-sm">{result.market}</span>
            </div>
            {result.url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  보기
                </a>
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ========== 헬퍼 컴포넌트 ==========
function LegalStatusBadge({ status, showLabel = false }: { status: 'safe' | 'warning' | 'danger'; showLabel?: boolean }) {
  const config = {
    safe: { icon: Shield, color: 'bg-green-500/10 text-green-500', label: '안전' },
    warning: { icon: AlertTriangle, color: 'bg-yellow-500/10 text-yellow-500', label: '주의' },
    danger: { icon: XCircle, color: 'bg-red-500/10 text-red-500', label: '위험' },
  };

  const { icon: Icon, color, label } = config[status];

  return (
    <Badge variant="secondary" className={cn('gap-1', color)}>
      <Icon className="h-3 w-3" />
      {showLabel && label}
    </Badge>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}


