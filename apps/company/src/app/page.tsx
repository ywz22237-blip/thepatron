import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, TrendingUp } from 'lucide-react'

// 기업 포털 랜딩 — 라이트 B2B 테마
export default function CompanyLandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      {/* 헤더 */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3A6B] text-xs font-bold text-white">
              P
            </div>
            <div>
              <span className="font-bold text-[#1B3A6B]">THE PATRON</span>
              <span className="ml-2 text-xs text-[#64748B]">스타트업 포털</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#64748B] hover:text-[#1B3A6B]"
            >
              로그인
            </Link>
            <Link
              href="/apply"
              className="rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2B5099]"
            >
              딜 등재 신청
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="border-b border-[#E2E8F0] bg-[#F8FAFC] py-20 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#1B3A6B]">
            VC Route → THE PATRON
          </p>
          <h1 className="mb-5 text-3xl font-bold leading-tight lg:text-5xl">
            검증된 스타트업만을 위한
            <br />
            <span className="text-[#1B3A6B]">고소득 전문직 투자자 연결</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-[#64748B]">
            VC Route를 통해 유입된 후 더페트론 2차 심사를 통과한 딜만 플랫폼에 등재됩니다.
            딜 등재 시 중계료 100만원이 발생합니다.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-6 py-3 font-semibold text-white hover:bg-[#2B5099]"
            >
              딜 등재 신청하기 <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg border border-[#1B3A6B] px-6 py-3 text-[#1B3A6B] hover:bg-[#1B3A6B]/5"
            >
              기업 로그인
            </Link>
          </div>
        </div>
      </section>

      {/* 프로세스 */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold">딜 등재 프로세스</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ProcessCard
              step="01"
              icon={<FileText className="h-5 w-5 text-[#1B3A6B]" />}
              title="딜 정보 제출"
              description="사업 개요, 투자 조건, 재무 정보를 제출합니다. 기업명은 투자자에게 공개되지 않습니다."
            />
            <ProcessCard
              step="02"
              icon={<CheckCircle2 className="h-5 w-5 text-[#1B3A6B]" />}
              title="더페트론 심사"
              description="VC Route 데이터와 제출 서류를 바탕으로 더페트론이 2차 심사를 진행합니다."
            />
            <ProcessCard
              step="03"
              icon={<TrendingUp className="h-5 w-5 text-[#1B3A6B]" />}
              title="패트론 매칭"
              description="심사 통과 후 플랫폼 등재. 더페트론 매니저가 패트론 투자자와의 매칭을 중개합니다."
            />
          </div>
        </div>
      </section>

      {/* 중요 안내 */}
      <section className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h3 className="mb-4 text-lg font-semibold text-[#1B3A6B]">중요 안내</h3>
          <div className="space-y-2 text-sm text-[#64748B]">
            <p>• 딜 등재 승인 시 중계료 <strong className="text-[#0F172A]">100만원</strong>이 발생합니다</p>
            <p>• 투자자(패트론) 신원은 절대 공개되지 않습니다</p>
            <p>• NDA 체결 후 미팅 시 기업명과 연락처가 투자자에게 공개됩니다</p>
            <p>• 더페트론이 투자자와 스타트업 사이를 중개하며 성사 수수료는 없습니다</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E2E8F0] py-6 text-center text-sm text-[#94A3B8]">
        © 2024 주식회사 벤처플랫폼 | THE PATRON
      </footer>
    </div>
  )
}

function ProcessCard({
  step,
  icon,
  title,
  description,
}: {
  step: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-bold text-[#94A3B8]">STEP {step}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B3A6B]/10">
          {icon}
        </div>
      </div>
      <h3 className="mb-2 font-semibold text-[#0F172A]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#64748B]">{description}</p>
    </div>
  )
}
