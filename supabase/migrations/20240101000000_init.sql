-- ============================================================
-- THE PATRON — 초기 스키마 마이그레이션
-- Prisma schema → Supabase PostgreSQL
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────

create type "AdminRole" as enum ('SUPER_ADMIN', 'MANAGER');

create type "InvestorStatus" as enum (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ACTIVE',
  'SUSPENDED'
);

create type "InvestmentType" as enum ('SOLO_PATRON', 'PATRON_CIRCLE');

create type "DealStatus" as enum (
  'DRAFT',
  'REVIEWING',
  'ACTIVE',
  'CLOSED',
  'REJECTED'
);

create type "MatchStatus" as enum (
  'REQUESTED',
  'REVIEWING',
  'DELIVERED',
  'MEETING',
  'DEAL_ROOM',
  'CONTRACT',
  'COMPLETED'
);

create type "ApplicationStatus" as enum ('PENDING', 'APPROVED', 'REJECTED');

create type "SubscriptionStatus" as enum ('ACTIVE', 'PAST_DUE', 'CANCELLED');

create type "CircleStatus" as enum ('FORMING', 'ACTIVE', 'CLOSED');

create type "NotificationType" as enum (
  'NEW_APPLICATION',
  'NEW_DEAL',
  'NEW_MATCH_REQUEST',
  'MATCH_UPDATE',
  'SUBSCRIPTION_EVENT'
);

-- ─── Helper: updated_at 자동 갱신 함수 ───────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

-- ─── InvestorProfile ──────────────────────────────────────────────────────────

create table "InvestorProfile" (
  "id"                   text        not null default gen_random_uuid()::text,
  "userId"               text        not null,
  "name"                 text        not null,
  "email"                text        not null,
  "phone"                text,
  "profession"           text        not null,
  "annualIncome"         integer,
  "status"               "InvestorStatus" not null default 'PENDING',
  "inviteCode"           text,
  "inviteCodeExpiresAt"  timestamptz,
  "createdAt"            timestamptz not null default now(),
  "updatedAt"            timestamptz not null default now(),
  constraint "InvestorProfile_pkey" primary key ("id"),
  constraint "InvestorProfile_userId_key" unique ("userId"),
  constraint "InvestorProfile_email_key" unique ("email"),
  constraint "InvestorProfile_inviteCode_key" unique ("inviteCode")
);
create index "InvestorProfile_status_idx" on "InvestorProfile"("status");
create index "InvestorProfile_email_idx" on "InvestorProfile"("email");
create trigger "InvestorProfile_updatedAt"
  before update on "InvestorProfile"
  for each row execute function update_updated_at();

-- ─── CompanyProfile ───────────────────────────────────────────────────────────

create table "CompanyProfile" (
  "id"        text        not null default gen_random_uuid()::text,
  "userId"    text        not null,
  "name"      text        not null,
  "bizNumber" text,
  "ceoName"   text,
  "email"     text        not null,
  "phone"     text,
  "website"   text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "CompanyProfile_pkey" primary key ("id"),
  constraint "CompanyProfile_userId_key" unique ("userId"),
  constraint "CompanyProfile_bizNumber_key" unique ("bizNumber"),
  constraint "CompanyProfile_email_key" unique ("email")
);
create index "CompanyProfile_email_idx" on "CompanyProfile"("email");
create trigger "CompanyProfile_updatedAt"
  before update on "CompanyProfile"
  for each row execute function update_updated_at();

-- ─── AdminProfile ─────────────────────────────────────────────────────────────

create table "AdminProfile" (
  "id"        text        not null default gen_random_uuid()::text,
  "userId"    text        not null,
  "name"      text        not null,
  "email"     text        not null,
  "role"      "AdminRole" not null default 'MANAGER',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "AdminProfile_pkey" primary key ("id"),
  constraint "AdminProfile_userId_key" unique ("userId"),
  constraint "AdminProfile_email_key" unique ("email")
);
create trigger "AdminProfile_updatedAt"
  before update on "AdminProfile"
  for each row execute function update_updated_at();

-- ─── MembershipApplication ────────────────────────────────────────────────────

create table "MembershipApplication" (
  "id"                  text                not null default gen_random_uuid()::text,
  "name"                text                not null,
  "email"               text                not null,
  "phone"               text                not null,
  "profession"          text                not null,
  "annualIncome"        integer,
  "simulatedInvestment" integer,
  "simulatedTaxSaving"  integer,
  "status"              "ApplicationStatus" not null default 'PENDING',
  "reviewNote"          text,
  "notionPageId"        text,
  "createdAt"           timestamptz         not null default now(),
  "updatedAt"           timestamptz         not null default now(),
  constraint "MembershipApplication_pkey" primary key ("id")
);
create index "MembershipApplication_status_idx" on "MembershipApplication"("status");
create index "MembershipApplication_email_idx" on "MembershipApplication"("email");
create trigger "MembershipApplication_updatedAt"
  before update on "MembershipApplication"
  for each row execute function update_updated_at();

-- ─── Deal ─────────────────────────────────────────────────────────────────────

create table "Deal" (
  "id"            text        not null default gen_random_uuid()::text,
  "companyId"     text        not null,
  "briefTitle"    text        not null,
  "category"      text        not null,
  "stage"         text        not null,
  "targetAmount"  integer     not null,
  "minInvestment" integer     not null,
  "maxInvestment" integer,
  "valuation"     integer,
  "equity"        double precision,
  "description"   text        not null,
  "feePaid"       boolean     not null default false,
  "feeAmount"     integer     not null default 1000000,
  "status"        "DealStatus" not null default 'DRAFT',
  "viewCount"     integer     not null default 0,
  "interestCount" integer     not null default 0,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now(),
  "closedAt"      timestamptz,
  constraint "Deal_pkey" primary key ("id"),
  constraint "Deal_companyId_fkey" foreign key ("companyId") references "CompanyProfile"("id")
);
create index "Deal_status_idx" on "Deal"("status");
create index "Deal_companyId_idx" on "Deal"("companyId");
create index "Deal_category_idx" on "Deal"("category");
create index "Deal_stage_idx" on "Deal"("stage");
create trigger "Deal_updatedAt"
  before update on "Deal"
  for each row execute function update_updated_at();

-- ─── MatchRequest ─────────────────────────────────────────────────────────────

create table "MatchRequest" (
  "id"               text              not null default gen_random_uuid()::text,
  "investorId"       text              not null,
  "dealId"           text              not null,
  "investmentAmount" integer           not null,
  "investmentType"   "InvestmentType"  not null default 'SOLO_PATRON',
  "circleId"         text,
  "status"           "MatchStatus"     not null default 'REQUESTED',
  "ndaSigned"        boolean           not null default false,
  "ndaSignedAt"      timestamptz,
  "investorNote"     text,
  "adminNote"        text,
  "createdAt"        timestamptz       not null default now(),
  "updatedAt"        timestamptz       not null default now(),
  constraint "MatchRequest_pkey" primary key ("id"),
  constraint "MatchRequest_investorId_dealId_key" unique ("investorId", "dealId"),
  constraint "MatchRequest_investorId_fkey" foreign key ("investorId") references "InvestorProfile"("id"),
  constraint "MatchRequest_dealId_fkey" foreign key ("dealId") references "Deal"("id")
);
create index "MatchRequest_status_idx" on "MatchRequest"("status");
create index "MatchRequest_investorId_idx" on "MatchRequest"("investorId");
create index "MatchRequest_dealId_idx" on "MatchRequest"("dealId");
create trigger "MatchRequest_updatedAt"
  before update on "MatchRequest"
  for each row execute function update_updated_at();

-- ─── MatchStatusHistory ───────────────────────────────────────────────────────

create table "MatchStatusHistory" (
  "id"             text          not null default gen_random_uuid()::text,
  "matchRequestId" text          not null,
  "fromStatus"     "MatchStatus",
  "toStatus"       "MatchStatus" not null,
  "changedById"    text          not null,
  "note"           text,
  "createdAt"      timestamptz   not null default now(),
  constraint "MatchStatusHistory_pkey" primary key ("id"),
  constraint "MatchStatusHistory_matchRequestId_fkey" foreign key ("matchRequestId") references "MatchRequest"("id")
);
create index "MatchStatusHistory_matchRequestId_idx" on "MatchStatusHistory"("matchRequestId");

-- ─── Subscription ─────────────────────────────────────────────────────────────

create table "Subscription" (
  "id"             text                 not null default gen_random_uuid()::text,
  "investorId"     text                 not null,
  "status"         "SubscriptionStatus" not null default 'ACTIVE',
  "amount"         integer              not null default 59000,
  "tossPaymentKey" text,
  "tossOrderId"    text,
  "tossBillingKey" text,
  "startedAt"      timestamptz          not null default now(),
  "nextBillingAt"  timestamptz          not null,
  "cancelledAt"    timestamptz,
  "createdAt"      timestamptz          not null default now(),
  "updatedAt"      timestamptz          not null default now(),
  constraint "Subscription_pkey" primary key ("id"),
  constraint "Subscription_tossOrderId_key" unique ("tossOrderId"),
  constraint "Subscription_investorId_fkey" foreign key ("investorId") references "InvestorProfile"("id")
);
create index "Subscription_investorId_idx" on "Subscription"("investorId");
create index "Subscription_status_idx" on "Subscription"("status");
create trigger "Subscription_updatedAt"
  before update on "Subscription"
  for each row execute function update_updated_at();

-- ─── SubscriptionPayment ──────────────────────────────────────────────────────

create table "SubscriptionPayment" (
  "id"             text        not null default gen_random_uuid()::text,
  "subscriptionId" text        not null,
  "amount"         integer     not null,
  "status"         text        not null,
  "tossPaymentKey" text,
  "tossOrderId"    text,
  "paidAt"         timestamptz,
  "failReason"     text,
  "createdAt"      timestamptz not null default now(),
  constraint "SubscriptionPayment_pkey" primary key ("id"),
  constraint "SubscriptionPayment_tossOrderId_key" unique ("tossOrderId"),
  constraint "SubscriptionPayment_subscriptionId_fkey" foreign key ("subscriptionId") references "Subscription"("id")
);

-- ─── PatronCircle ─────────────────────────────────────────────────────────────

create table "PatronCircle" (
  "id"                text          not null default gen_random_uuid()::text,
  "name"              text          not null,
  "managerId"         text          not null,
  "targetAmount"      integer       not null,
  "currentAmount"     integer       not null default 0,
  "managementFeeRate" double precision not null default 0.02,
  "status"            "CircleStatus" not null default 'FORMING',
  "createdAt"         timestamptz   not null default now(),
  "updatedAt"         timestamptz   not null default now(),
  constraint "PatronCircle_pkey" primary key ("id")
);
create index "PatronCircle_status_idx" on "PatronCircle"("status");
create trigger "PatronCircle_updatedAt"
  before update on "PatronCircle"
  for each row execute function update_updated_at();

-- PatronCircle ↔ MatchRequest FK (순환 의존 때문에 나중에 추가)
alter table "MatchRequest"
  add constraint "MatchRequest_circleId_fkey"
  foreign key ("circleId") references "PatronCircle"("id");

-- ─── PatronCircleMember ───────────────────────────────────────────────────────

create table "PatronCircleMember" (
  "id"         text        not null default gen_random_uuid()::text,
  "circleId"   text        not null,
  "investorId" text        not null,
  "amount"     integer     not null,
  "joinedAt"   timestamptz not null default now(),
  constraint "PatronCircleMember_pkey" primary key ("id"),
  constraint "PatronCircleMember_circleId_investorId_key" unique ("circleId", "investorId"),
  constraint "PatronCircleMember_circleId_fkey" foreign key ("circleId") references "PatronCircle"("id"),
  constraint "PatronCircleMember_investorId_fkey" foreign key ("investorId") references "InvestorProfile"("id")
);
create index "PatronCircleMember_investorId_idx" on "PatronCircleMember"("investorId");

-- ─── AdminNotification ────────────────────────────────────────────────────────

create table "AdminNotification" (
  "id"        text                not null default gen_random_uuid()::text,
  "type"      "NotificationType"  not null,
  "title"     text                not null,
  "body"      text                not null,
  "data"      jsonb,
  "isRead"    boolean             not null default false,
  "createdAt" timestamptz         not null default now(),
  constraint "AdminNotification_pkey" primary key ("id")
);
create index "AdminNotification_isRead_idx" on "AdminNotification"("isRead");
create index "AdminNotification_createdAt_idx" on "AdminNotification"("createdAt");
