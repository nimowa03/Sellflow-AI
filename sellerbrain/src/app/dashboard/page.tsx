'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TrendingUp,
  Shield,
  Upload,
  MessageSquare,
  Sparkles,
  ChevronRight,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">안녕하세요! 👋</h1>
          <p className="text-muted-foreground">
            오늘도 법적으로 안전한 판매를 시작하세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            AI와 대화하기
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="등록 상품"
          value="127"
          change="+12%"
          changeType="positive"
          icon={Package}
        />
        <StatCard
          title="이번 달 매출"
          value="₩2,450,000"
          change="+23%"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="법적 검사 통과"
          value="98.5%"
          change="+2.1%"
          changeType="positive"
          icon={Shield}
        />
        <StatCard
          title="업로드 대기"
          value="5"
          change="-3"
          changeType="neutral"
          icon={Upload}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">빠른 시작</CardTitle>
          <CardDescription>AI에게 요청하거나 직접 시작하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <QuickActionCard
              title="상품 소싱"
              description="AI가 트렌드 키워드와 황금 상품을 찾아드립니다"
              icon={TrendingUp}
              href="/dashboard/sourcing"
              badge="인기"
            />
            <QuickActionCard
              title="상세페이지 생성"
              description="경쟁사 분석 후 3종 상세페이지 자동 생성"
              icon={Sparkles}
              href="/dashboard/content"
            />
            <QuickActionCard
              title="법적 검사"
              description="상표권, 금지어를 한번에 검사합니다"
              icon={Shield}
              href="/dashboard/legal"
              badge="핵심"
            />
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">최근 상품</CardTitle>
              <CardDescription>최근 등록된 상품 목록</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/products">
                전체 보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProductItem
                name="노이즈캔슬링 무선 이어폰"
                status="published"
                date="2시간 전"
                markets={['스마트스토어', '쿠팡']}
              />
              <ProductItem
                name="프리미엄 요가매트 TPE"
                status="pending"
                date="5시간 전"
                markets={['스마트스토어']}
              />
              <ProductItem
                name="스테인리스 텀블러 500ml"
                status="reviewing"
                date="1일 전"
                markets={['쿠팡', '11번가']}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Chat Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">AI 대화</CardTitle>
              <CardDescription>최근 AI와의 대화</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/chat">
                대화하기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ChatPreviewItem
                message="무선 이어폰 키워드 분석 완료했습니다. 5개의 황금 키워드를 찾았어요!"
                time="10분 전"
                type="ai"
              />
              <ChatPreviewItem
                message="1번 키워드로 상세페이지 만들어줘"
                time="8분 전"
                type="user"
              />
              <ChatPreviewItem
                message="상세페이지 3종을 생성했습니다. 법적 검사도 완료했어요 ✅"
                time="5분 전"
                type="ai"
              />
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/chat">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  대화 계속하기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm">
          {changeType === 'positive' && (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          )}
          {changeType === 'negative' && (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span
            className={
              changeType === 'positive'
                ? 'text-green-500'
                : changeType === 'negative'
                ? 'text-red-500'
                : 'text-muted-foreground'
            }
          >
            {change}
          </span>
          <span className="text-muted-foreground">지난 달 대비</span>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  badge,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-lg border p-4 hover:border-primary/50 hover:bg-accent/50 transition-all"
    >
      {badge && (
        <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground text-[10px]">
          {badge}
        </Badge>
      )}
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <ExternalLink className="absolute top-4 right-4 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function ProductItem({
  name,
  status,
  date,
  markets,
}: {
  name: string;
  status: 'published' | 'pending' | 'reviewing';
  date: string;
  markets: string[];
}) {
  const statusConfig = {
    published: { label: '등록됨', variant: 'default' as const },
    pending: { label: '대기중', variant: 'secondary' as const },
    reviewing: { label: '검토중', variant: 'outline' as const },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{date}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{markets.join(', ')}</span>
        </div>
      </div>
      <Badge variant={config.variant}>{config.label}</Badge>
    </div>
  );
}

function ChatPreviewItem({
  message,
  time,
  type,
}: {
  message: string;
  time: string;
  type: 'ai' | 'user';
}) {
  return (
    <div className={`flex gap-3 ${type === 'user' ? 'flex-row-reverse' : ''}`}>
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          type === 'ai' ? 'bg-primary/10' : 'bg-muted'
        }`}
      >
        {type === 'ai' ? (
          <Sparkles className="h-4 w-4 text-primary" />
        ) : (
          <span className="text-xs font-medium">나</span>
        )}
      </div>
      <div className={`flex-1 ${type === 'user' ? 'text-right' : ''}`}>
        <p className="text-sm">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}


