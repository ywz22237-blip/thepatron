-- ============================================================
-- THE PATRON — 로컬 개발용 시드 데이터
-- ============================================================
-- 주의: 로컬 개발 전용. 프로덕션에 절대 사용하지 말 것.

-- ─── 관리자 계정 (Supabase Auth user는 수동 생성 필요) ────────────────────────
-- Supabase Studio → Authentication → Users 에서 생성 후 userId 업데이트

-- 샘플 관리자 (userId는 로컬 Auth에서 생성 후 교체)
insert into "AdminProfile" ("id", "userId", "name", "email", "role")
values
  ('admin-001', 'placeholder-admin-uid', '더페트론 관리자', 'admin@thepatron.co.kr', 'SUPER_ADMIN')
on conflict do nothing;

-- ─── 샘플 기업 프로필 ─────────────────────────────────────────────────────────

insert into "CompanyProfile" ("id", "userId", "name", "ceoName", "email", "phone", "website")
values
  ('company-001', 'placeholder-company-uid-1', '테크스타트 주식회사', '김스타트', 'ceo@techstart.co.kr', '02-1234-5678', 'https://techstart.co.kr'),
  ('company-002', 'placeholder-company-uid-2', '바이오이노베이션 주식회사', '박이노', 'ceo@bioinno.co.kr', '02-2345-6789', 'https://bioinno.co.kr'),
  ('company-003', 'placeholder-company-uid-3', '핀테크솔루션 주식회사', '이핀테', 'ceo@fintechsol.co.kr', '02-3456-7890', null)
on conflict do nothing;

-- ─── 샘플 딜 ─────────────────────────────────────────────────────────────────

insert into "Deal" (
  "id", "companyId", "briefTitle", "category", "stage",
  "targetAmount", "minInvestment", "maxInvestment", "valuation", "equity",
  "description", "feePaid", "status", "viewCount", "interestCount"
)
values
  (
    'deal-001', 'company-001',
    '국내 1위 B2B SaaS 플랫폼 — 연 ARR 50억 Pre-A',
    'IT/SaaS', 'Pre-A',
    30000, 1000, 5000, 300000, 10.0,
    '국내 중소기업 대상 ERP SaaS 솔루션으로 현재 가입 기업 1,200개, 연 ARR 50억원을 달성했습니다. 2024년 해외 진출을 위한 Pre-A 라운드를 진행 중입니다. 주요 투자 사용처: 개발팀 확장(30%), 영업팀 강화(40%), 해외 법인 설립(30%).',
    true, 'ACTIVE', 47, 12
  ),
  (
    'deal-002', 'company-002',
    '항암 신약 후보물질 임상 2상 진입 바이오 — Seed',
    '바이오/헬스케어', 'Seed',
    50000, 3000, 10000, 500000, null,
    '대학병원과의 공동연구로 개발된 3세대 항암 신약 후보물질이 임상 1상을 성공적으로 완료하고 임상 2상 진입을 앞두고 있습니다. 글로벌 기술이전 계약 협의 중.',
    true, 'ACTIVE', 31, 8
  ),
  (
    'deal-003', 'company-003',
    '법인 자금관리 핀테크 — 가맹점 3,000개 돌파 Pre-A',
    '핀테크', 'Pre-A',
    20000, 1000, 3000, 150000, 13.0,
    '중소기업 법인 자금관리를 자동화하는 핀테크 플랫폼. 가맹점 3,000개, 월 거래액 200억원 달성. 금융위원회 마이데이터 사업자 본인가 취득.',
    false, 'REVIEWING', 0, 0
  ),
  (
    'deal-004', 'company-001',
    'AI 기반 법률문서 자동화 SaaS — Seed',
    'IT/SaaS', 'Seed',
    15000, 1000, 2000, 100000, 15.0,
    '법무법인과 협력하여 개발된 AI 법률문서 자동화 플랫폼. 계약서 검토 시간을 80% 단축. 현재 로펌 50개사 파일럿 운영 중.',
    false, 'DRAFT', 0, 0
  )
on conflict do nothing;

-- ─── 샘플 멤버십 신청 ─────────────────────────────────────────────────────────

insert into "MembershipApplication" (
  "id", "name", "email", "phone", "profession",
  "annualIncome", "simulatedInvestment", "simulatedTaxSaving", "status"
)
values
  ('app-001', '김의사', 'dr.kim@hospital.co.kr', '010-1234-5678', '의사', 30000, 3000, 1320, 'PENDING'),
  ('app-002', '이변호사', 'lawyer.lee@lawfirm.co.kr', '010-2345-6789', '변호사', 20000, 2000, 880, 'PENDING'),
  ('app-003', '박회계사', 'cpa.park@accounting.co.kr', '010-3456-7890', '회계사', 15000, 1500, 510, 'APPROVED'),
  ('app-004', '최임원', 'exec.choi@corp.co.kr', '010-4567-8901', '대기업 임원', 50000, 5000, 1820, 'REJECTED')
on conflict do nothing;

-- ─── 샘플 PatronCircle ────────────────────────────────────────────────────────

insert into "PatronCircle" (
  "id", "name", "managerId", "targetAmount", "currentAmount", "managementFeeRate", "status"
)
values
  ('circle-001', '더페트론 바이오 1호 조합', 'admin-001', 100000, 45000, 0.02, 'FORMING'),
  ('circle-002', '더페트론 IT 1호 조합', 'admin-001', 50000, 50000, 0.02, 'ACTIVE')
on conflict do nothing;
