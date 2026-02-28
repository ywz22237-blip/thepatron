import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Users } from 'lucide-react'

// 랜딩 페이지 — 퍼블릭
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2F2F2F] bg-[#0A0A0A]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-widest text-[#D4AF37]">THE PATRON</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/simulator"
              className="hidden text-sm text-[#A0A0A0] transition-colors hover:text-white sm:block"
            >
              절세 시뮬레이터
            </Link>
            <Link
              href="/login"
              className="text-sm text-[#A0A0A0] transition-colors hover:text-white"
            >
              로그인
            </Link>
            <Link
              href="/apply"
              className="rounded-md bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#E8CC6A]"
            >
              입장 신청
            </Link>
          </nav>
        </div>
      </header>

      {/* 히어로 */}
      <section className="flex min-h-screen flex-col items-center justify-center px-4 pt-16 text-center">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
            Tax-to-Equity
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
            납부할 세금을
            <br />
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#E8CC6A] to-[#B8941F] bg-clip-text text-transparent">
              기업 지분으로
            </span>
            <br />
            전환하세요
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-[#A0A0A0]">
            조세특례제한법 제16조 벤처투자 소득공제로
            <br className="hidden sm:block" />
            고소득 전문직 패트론을 위한 프라이빗 투자 브릿지
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/simulator"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D4AF37] px-6 py-3 text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10 sm:w-auto"
            >
              절세액 계산하기
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/apply"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-[#0A0A0A] transition-colors hover:bg-[#E8CC6A] sm:w-auto"
            >
              패트론 신청하기
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 핵심 가치 3가지 */}
      <section className="border-t border-[#2F2F2F] bg-[#111111] py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold lg:text-3xl">
            왜 THE PATRON인가
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-[#D4AF37]" />}
              title="Tax-to-Equity"
              description="벤처투자 소득공제로 최대 100% 공제. 납부할 세금이 기업 지분이 됩니다."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-[#D4AF37]" />}
              title="VC 검증 딜만"
              description="VC Route 유입 후 더페트론 2차 심사를 통과한 딜만 플랫폼에 등재됩니다."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-[#D4AF37]" />}
              title="프라이빗 브릿지"
              description="더페트론 매니저가 투자자와 스타트업 사이를 중개. 완전한 정보 격리 보장."
            />
          </div>
        </div>
      </section>

      {/* 절세 계산 미리보기 */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="mb-4 text-2xl font-bold lg:text-3xl">예상 절세액 미리보기</h2>
          <p className="mb-10 text-[#A0A0A0]">
            연봉 1억 기준, 3,000만원 투자 시
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TaxPreviewCard label="소득공제율" value="100%" />
            <TaxPreviewCard label="공제 금액" value="3,000만원" highlight />
            <TaxPreviewCard label="예상 절세액" value="약 1,320만원" />
          </div>
          <p className="mt-6 text-sm text-[#666666]">
            * 실제 절세액은 개인 소득 및 세율에 따라 다를 수 있습니다
          </p>
          <Link
            href="/simulator"
            className="mt-8 inline-flex items-center gap-2 text-[#D4AF37] hover:underline"
          >
            내 절세액 직접 계산하기 <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#2F2F2F] bg-[#111111] py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">초대 전용</p>
          <h2 className="mb-4 text-2xl font-bold lg:text-3xl">
            심사를 통과한 패트론만 입장 가능합니다
          </h2>
          <p className="mb-8 text-[#A0A0A0]">
            의사, 변호사, 회계사, 대기업 임원 등 고소득 전문직을 위한<br />
            프라이빗 벤처투자 플랫폼
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-8 py-4 text-lg font-bold text-[#0A0A0A] transition-colors hover:bg-[#E8CC6A]"
          >
            패트론 입장 신청 <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-[#2F2F2F] py-8 text-center text-sm text-[#666666]">
        <p>© 2024 주식회사 벤처플랫폼. All rights reserved.</p>
        <p className="mt-1">THE PATRON — 고소득 전문직 패트론 전용 프라이빗 투자 플랫폼</p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-[#2F2F2F] bg-[#1A1A1A] p-6 transition-all hover:-translate-y-1 hover:border-[#D4AF37]/30 hover:shadow-[0_8px_32px_rgba(212,175,55,0.1)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4AF37]/10">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-[#A0A0A0]">{description}</p>
    </div>
  )
}

function TaxPreviewCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-6 text-center ${
        highlight
          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
          : 'border-[#2F2F2F] bg-[#1A1A1A]'
      }`}
    >
      <p className="mb-2 text-sm text-[#A0A0A0]">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-[#D4AF37]' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}
