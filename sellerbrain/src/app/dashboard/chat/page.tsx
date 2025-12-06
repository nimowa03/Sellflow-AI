'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Message } from '@/features/chat/components/ChatMessage';
import { ChatInput } from '@/features/chat/components/ChatInput';
import { WelcomeScreen } from '@/features/chat/components/WelcomeScreen';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Plus, 
  History, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
const generateId = () => crypto.randomUUID();

// 데모용 응답 시뮬레이션
const simulateResponse = (userMessage: string): { content: string; type?: Message['type']; data?: unknown } => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('키워드') && (lowerMessage.includes('분석') || lowerMessage.includes('찾아'))) {
    return {
      content: '키워드 분석을 완료했습니다! 🔍\n\n상표권 검사를 통과한 황금 키워드 5개를 찾았어요. 아래에서 선택해주세요.',
      type: 'keywords',
      data: {
        keywords: [
          { keyword: '노이즈캔슬링 이어폰', searchVolume: 12000, competition: 'medium', legalStatus: 'safe' },
          { keyword: 'TWS 블루투스 이어폰', searchVolume: 8500, competition: 'medium', legalStatus: 'safe' },
          { keyword: '무선 이어버드', searchVolume: 6200, competition: 'low', legalStatus: 'safe' },
          { keyword: '블루투스 5.3 이어폰', searchVolume: 5800, competition: 'low', legalStatus: 'safe' },
          { keyword: '인이어 무선 이어폰', searchVolume: 4500, competition: 'low', legalStatus: 'safe' },
        ]
      }
    };
  }
  
  if (lowerMessage.includes('상세페이지') || lowerMessage.includes('만들어')) {
    return {
      content: '상세페이지를 생성했습니다! ✨\n\n법적 검사도 완료했어요. 아래에서 결과를 확인하고 승인해주세요.',
      type: 'content_preview',
      data: {
        title: '프리미엄 노이즈캔슬링 무선 이어폰',
        description: '최대 40dB 노이즈캔슬링으로 완벽한 몰입감을 경험하세요. 30시간 연속 재생, IPX7 방수 등급, 블루투스 5.3 지원.',
        imageUrl: 'https://picsum.photos/seed/earphone/400/300',
        legalCheck: {
          status: 'safe',
          issues: 0
        }
      }
    };
  }
  
  if (lowerMessage.includes('법적') || lowerMessage.includes('검사') || lowerMessage.includes('상표권')) {
    return {
      content: '법적 검사를 완료했습니다! 🛡️',
      type: 'legal_check',
      data: {
        status: 'safe',
        checks: [
          { type: '상표권', status: 'pass', message: '등록상표 침해 없음' },
          { type: '금지어', status: 'pass', message: '금지어 미포함' },
          { type: '과장광고', status: 'pass', message: '과장 표현 없음' },
        ]
      }
    };
  }
  
  if (lowerMessage.includes('승인') || lowerMessage.includes('업로드')) {
    return {
      content: '업로드를 완료했습니다! 🎉',
      type: 'upload_result',
      data: {
        results: [
          { market: '스마트스토어', status: 'success', productId: '12345678', url: 'https://smartstore.naver.com/example' },
          { market: '쿠팡', status: 'success', productId: '87654321', url: 'https://coupang.com/example' },
          { market: '11번가', status: 'success', productId: '11223344', url: 'https://11st.co.kr/example' },
        ]
      }
    };
  }
  
  // 기본 응답
  return {
    content: `네, "${userMessage}"에 대해 도와드릴게요!\n\n무엇을 원하시나요?\n• 키워드 분석\n• 상세페이지 생성\n• 법적 검사\n• 이미지 생성`,
  };
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // AI 응답 시뮬레이션 (실제로는 API 호출)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = simulateResponse(content);
    const aiMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      type: response.type as Message['type'],
      data: response.data,
      status: 'complete',
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleAction = (action: string, data?: unknown) => {
    if (action === 'select_keyword') {
      const keywordData = data as { keyword: string };
      handleSend(`${keywordData.keyword} 키워드로 상세페이지 만들어줘`);
    } else if (action === 'approve') {
      handleSend('승인할게요. 업로드 진행해줘');
    } else if (action === 'request_edit') {
      // 수정 요청 모달 또는 입력 프롬프트
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-medium text-sm flex items-center gap-2">
              SellerBrain AI
              <Badge variant="secondary" className="text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" />
                GPT-4
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">법적으로 안전한 AI 어시스턴트</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            새 대화
          </Button>
          <Button variant="ghost" size="sm">
            <History className="h-4 w-4 mr-1" />
            기록
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSend} />
        ) : (
          <div className="py-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message}
                onAction={handleAction}
              />
            ))}
            
            {isLoading && (
              <ChatMessage
                message={{
                  id: 'loading',
                  role: 'assistant',
                  content: '',
                  timestamp: new Date(),
                  status: 'thinking',
                }}
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput 
        onSend={handleSend} 
        isLoading={isLoading}
      />
    </div>
  );
}

