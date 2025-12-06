'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Paperclip,
  Mic,
  Image,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading = false, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      {/* Quick Actions */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
        <QuickAction label="키워드 분석" icon={Sparkles} onClick={() => setInput('키워드 분석해줘: ')} />
        <QuickAction label="상세페이지 생성" icon={Sparkles} onClick={() => setInput('상세페이지 만들어줘: ')} />
        <QuickAction label="법적 검사" icon={Sparkles} onClick={() => setInput('법적 검사해줘: ')} />
        <QuickAction label="이미지 생성" icon={Image} onClick={() => setInput('이미지 생성해줘: ')} />
      </div>

      {/* Input Area */}
      <div className="relative flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "무엇을 도와드릴까요? (예: 무선 이어폰 키워드 찾아줘)"}
            className="min-h-[52px] max-h-[200px] pr-24 resize-none bg-muted/50 border-0 focus-visible:ring-1"
            disabled={isLoading}
            rows={1}
          />
          
          {/* Input Actions */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={!input.trim() || isLoading}
          size="icon"
          className="h-[52px] w-[52px] rounded-xl"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        AI가 생성한 콘텐츠는 자동으로 법적 검사를 거칩니다. 
        <span className="text-primary cursor-pointer hover:underline ml-1">자세히 알아보기</span>
      </p>
    </div>
  );
}

function QuickAction({ 
  label, 
  icon: Icon, 
  onClick 
}: { 
  label: string; 
  icon: React.ElementType; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs',
        'bg-muted hover:bg-accent transition-colors whitespace-nowrap',
        'border border-transparent hover:border-border'
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}


