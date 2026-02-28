-- ============================================================
-- THE PATRON — Row Level Security 정책
-- ============================================================

-- ─── RLS 활성화 ────────────────────────────────────────────────────────────────

alter table "InvestorProfile"       enable row level security;
alter table "CompanyProfile"        enable row level security;
alter table "AdminProfile"          enable row level security;
alter table "MembershipApplication" enable row level security;
alter table "Deal"                  enable row level security;
alter table "MatchRequest"          enable row level security;
alter table "MatchStatusHistory"    enable row level security;
alter table "Subscription"          enable row level security;
alter table "SubscriptionPayment"   enable row level security;
alter table "PatronCircle"          enable row level security;
alter table "PatronCircleMember"    enable row level security;
alter table "AdminNotification"     enable row level security;

-- ─── Helper 함수: 관리자 여부 확인 ────────────────────────────────────────────

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from "AdminProfile"
    where "userId" = auth.uid()::text
  );
$$ language sql security definer stable;

create or replace function is_active_investor()
returns boolean as $$
  select exists (
    select 1 from "InvestorProfile"
    where "userId" = auth.uid()::text
    and "status" = 'ACTIVE'
  );
$$ language sql security definer stable;

-- ─── InvestorProfile ──────────────────────────────────────────────────────────
-- 본인만 읽기 가능, 관리자는 전체 읽기/수정

create policy "investor_self_read" on "InvestorProfile"
  for select using (
    "userId" = auth.uid()::text or is_admin()
  );

create policy "investor_self_update" on "InvestorProfile"
  for update using ("userId" = auth.uid()::text or is_admin());

create policy "admin_insert_investor" on "InvestorProfile"
  for insert with check (is_admin());

-- ─── CompanyProfile ───────────────────────────────────────────────────────────

create policy "company_self_read" on "CompanyProfile"
  for select using (
    "userId" = auth.uid()::text or is_admin()
  );

create policy "company_self_update" on "CompanyProfile"
  for update using ("userId" = auth.uid()::text or is_admin());

create policy "company_self_insert" on "CompanyProfile"
  for insert with check ("userId" = auth.uid()::text);

-- ─── AdminProfile ─────────────────────────────────────────────────────────────

create policy "admin_read_own" on "AdminProfile"
  for select using ("userId" = auth.uid()::text or is_admin());

-- ─── MembershipApplication ───────────────────────────────────────────────────
-- 누구나 INSERT (비로그인 신청), 관리자만 SELECT/UPDATE

create policy "anyone_can_apply" on "MembershipApplication"
  for insert with check (true);

create policy "admin_read_applications" on "MembershipApplication"
  for select using (is_admin());

create policy "admin_update_applications" on "MembershipApplication"
  for update using (is_admin());

-- ─── Deal ─────────────────────────────────────────────────────────────────────
-- ACTIVE 딜: 구독 중인 투자자 열람 가능 (기업명 없음 보장은 앱 레벨에서)
-- 관리자: 전체 접근
-- 기업: 자신의 딜만

create policy "investor_read_active_deals" on "Deal"
  for select using (
    ("status" = 'ACTIVE' and is_active_investor())
    or is_admin()
    or exists (
      select 1 from "CompanyProfile"
      where "id" = "Deal"."companyId"
      and "userId" = auth.uid()::text
    )
  );

create policy "company_insert_deal" on "Deal"
  for insert with check (
    exists (
      select 1 from "CompanyProfile"
      where "id" = "companyId"
      and "userId" = auth.uid()::text
    )
  );

create policy "admin_update_deal" on "Deal"
  for update using (is_admin());

-- ─── MatchRequest ─────────────────────────────────────────────────────────────
-- 투자자: 본인 신청만 읽기/쓰기
-- 관리자: 전체

create policy "investor_read_own_match" on "MatchRequest"
  for select using (
    exists (
      select 1 from "InvestorProfile"
      where "id" = "MatchRequest"."investorId"
      and "userId" = auth.uid()::text
    )
    or is_admin()
  );

create policy "investor_insert_match" on "MatchRequest"
  for insert with check (
    exists (
      select 1 from "InvestorProfile"
      where "id" = "investorId"
      and "userId" = auth.uid()::text
      and "status" = 'ACTIVE'
    )
  );

create policy "admin_update_match" on "MatchRequest"
  for update using (is_admin());

-- ─── MatchStatusHistory ───────────────────────────────────────────────────────

create policy "investor_read_own_history" on "MatchStatusHistory"
  for select using (
    exists (
      select 1 from "MatchRequest" mr
      join "InvestorProfile" ip on ip."id" = mr."investorId"
      where mr."id" = "MatchStatusHistory"."matchRequestId"
      and ip."userId" = auth.uid()::text
    )
    or is_admin()
  );

create policy "admin_insert_history" on "MatchStatusHistory"
  for insert with check (is_admin());

-- ─── Subscription ─────────────────────────────────────────────────────────────

create policy "investor_read_own_sub" on "Subscription"
  for select using (
    exists (
      select 1 from "InvestorProfile"
      where "id" = "Subscription"."investorId"
      and "userId" = auth.uid()::text
    )
    or is_admin()
  );

create policy "admin_manage_sub" on "Subscription"
  for all using (is_admin());

-- ─── SubscriptionPayment ──────────────────────────────────────────────────────

create policy "investor_read_own_payments" on "SubscriptionPayment"
  for select using (
    exists (
      select 1 from "Subscription" s
      join "InvestorProfile" ip on ip."id" = s."investorId"
      where s."id" = "SubscriptionPayment"."subscriptionId"
      and ip."userId" = auth.uid()::text
    )
    or is_admin()
  );

create policy "admin_manage_payments" on "SubscriptionPayment"
  for all using (is_admin());

-- ─── PatronCircle ─────────────────────────────────────────────────────────────

create policy "anyone_read_forming_circles" on "PatronCircle"
  for select using (
    "status" = 'FORMING'
    or is_active_investor()
    or is_admin()
  );

create policy "admin_manage_circles" on "PatronCircle"
  for all using (is_admin());

-- ─── PatronCircleMember ───────────────────────────────────────────────────────

create policy "investor_read_own_memberships" on "PatronCircleMember"
  for select using (
    exists (
      select 1 from "InvestorProfile"
      where "id" = "PatronCircleMember"."investorId"
      and "userId" = auth.uid()::text
    )
    or is_admin()
  );

create policy "admin_manage_members" on "PatronCircleMember"
  for all using (is_admin());

-- ─── AdminNotification ────────────────────────────────────────────────────────

create policy "admin_only_notifications" on "AdminNotification"
  for all using (is_admin());
