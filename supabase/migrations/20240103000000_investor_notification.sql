-- ============================================================
-- THE PATRON — InvestorNotification 테이블 추가
-- ============================================================

create table "InvestorNotification" (
  "id"         text                not null default gen_random_uuid()::text,
  "investorId" text                not null,
  "type"       "NotificationType"  not null,
  "title"      text                not null,
  "body"       text                not null,
  "data"       jsonb,
  "isRead"     boolean             not null default false,
  "createdAt"  timestamptz         not null default now(),
  constraint "InvestorNotification_pkey" primary key ("id"),
  constraint "InvestorNotification_investorId_fkey"
    foreign key ("investorId") references "InvestorProfile"("id") on delete cascade
);

create index "InvestorNotification_investorId_idx" on "InvestorNotification"("investorId");
create index "InvestorNotification_isRead_idx"     on "InvestorNotification"("isRead");
create index "InvestorNotification_createdAt_idx"  on "InvestorNotification"("createdAt" desc);

-- RLS
alter table "InvestorNotification" enable row level security;

-- 자신의 알림만 조회/수정
create policy "investor_notification_select" on "InvestorNotification"
  for select using (
    "investorId" in (
      select id from "InvestorProfile" where "userId" = auth.uid()::text
    )
  );

create policy "investor_notification_update" on "InvestorNotification"
  for update using (
    "investorId" in (
      select id from "InvestorProfile" where "userId" = auth.uid()::text
    )
  );

-- 서버 사이드(service role)만 insert
create policy "investor_notification_insert_service" on "InvestorNotification"
  for insert with check (true);
