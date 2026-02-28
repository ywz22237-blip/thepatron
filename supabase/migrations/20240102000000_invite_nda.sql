-- ============================================================
-- THE PATRON — 2순위 기능 마이그레이션
-- 초대코드, NDA, 결제 보강
-- ============================================================

-- ─── InviteCode 테이블 ────────────────────────────────────────────────────────
-- MembershipApplication 승인 시 발급, 투자자 회원가입에 사용

create table "InviteCode" (
  "id"            text        not null default gen_random_uuid()::text,
  "code"          text        not null,
  "email"         text        not null,
  "applicationId" text        not null,
  "usedAt"        timestamptz,
  "expiresAt"     timestamptz not null default (now() + interval '7 days'),
  "createdAt"     timestamptz not null default now(),
  constraint "InviteCode_pkey" primary key ("id"),
  constraint "InviteCode_code_key" unique ("code"),
  constraint "InviteCode_applicationId_fkey" foreign key ("applicationId") references "MembershipApplication"("id")
);
create index "InviteCode_code_idx" on "InviteCode"("code");
create index "InviteCode_email_idx" on "InviteCode"("email");

-- ─── NdaRequest 테이블 ────────────────────────────────────────────────────────
-- DEAL_ROOM 진입 시 모두싸인 서명 요청 기록

create table "NdaRequest" (
  "id"            text        not null default gen_random_uuid()::text,
  "matchId"       text        not null,
  "investorId"    text        not null,
  "modusignDocId" text,
  "status"        text        not null default 'PENDING',  -- PENDING | SIGNED | EXPIRED
  "requestedAt"   timestamptz not null default now(),
  "signedAt"      timestamptz,
  "expiresAt"     timestamptz not null default (now() + interval '3 days'),
  "createdAt"     timestamptz not null default now(),
  constraint "NdaRequest_pkey" primary key ("id"),
  constraint "NdaRequest_matchId_fkey" foreign key ("matchId") references "MatchRequest"("id"),
  constraint "NdaRequest_investorId_fkey" foreign key ("investorId") references "InvestorProfile"("id")
);
create index "NdaRequest_matchId_idx" on "NdaRequest"("matchId");
create index "NdaRequest_status_idx" on "NdaRequest"("status");

-- ─── RLS 추가 ─────────────────────────────────────────────────────────────────

alter table "InviteCode" enable row level security;
alter table "NdaRequest" enable row level security;

-- InviteCode: 본인 이메일 조회, 어드민 전체
create policy "InviteCode: admins all" on "InviteCode"
  for all using (is_admin());

create policy "InviteCode: read by email" on "InviteCode"
  for select using (auth.email() = email);

-- NdaRequest: 본인 매칭 관련, 어드민 전체
create policy "NdaRequest: admins all" on "NdaRequest"
  for all using (is_admin());

create policy "NdaRequest: investor reads own" on "NdaRequest"
  for select using (
    "investorId" in (
      select id from "InvestorProfile" where "userId" = auth.uid()::text
    )
  );
