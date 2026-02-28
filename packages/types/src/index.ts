// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'INVESTOR' | 'COMPANY' | 'MANAGER' | 'SUPER_ADMIN'

export type AdminRole = 'SUPER_ADMIN' | 'MANAGER'

export type InvestorStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'SUSPENDED'

export type InvestmentType = 'SOLO_PATRON' | 'PATRON_CIRCLE'

export type DealStatus = 'DRAFT' | 'REVIEWING' | 'ACTIVE' | 'CLOSED' | 'REJECTED'

export type MatchStatus =
  | 'REQUESTED'
  | 'REVIEWING'
  | 'DELIVERED'
  | 'MEETING'
  | 'DEAL_ROOM'
  | 'CONTRACT'
  | 'COMPLETED'

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED'

export type CircleStatus = 'FORMING' | 'ACTIVE' | 'CLOSED'

export type NotificationType =
  | 'NEW_APPLICATION'
  | 'NEW_DEAL'
  | 'NEW_MATCH_REQUEST'
  | 'MATCH_UPDATE'
  | 'SUBSCRIPTION_EVENT'

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface InvestorProfile {
  id: string
  userId: string
  name: string
  email: string
  phone: string | null
  profession: string
  annualIncome: number | null
  status: InvestorStatus
  inviteCode: string | null
  inviteCodeExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CompanyProfile {
  id: string
  userId: string
  /** 기업명 — 관리자 및 NDA 체결 투자자에게만 노출 */
  name: string
  bizNumber: string | null
  ceoName: string | null
  email: string
  phone: string | null
  website: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminProfile {
  id: string
  userId: string
  name: string
  email: string
  role: AdminRole
  createdAt: string
  updatedAt: string
}

/** 투자자에게 노출되는 딜 카드 (기업명 없음, briefTitle만) */
export interface DealCard {
  id: string
  briefTitle: string
  category: string
  stage: string
  targetAmount: number
  minInvestment: number
  maxInvestment: number | null
  valuation: number | null
  equity: number | null
  status: DealStatus
  viewCount: number
  interestCount: number
  createdAt: string
  closedAt: string | null
}

/** 관리자 전용 딜 (기업명 포함) */
export interface DealAdmin extends DealCard {
  companyId: string
  company: Pick<CompanyProfile, 'id' | 'name' | 'email'>
  description: string
}

export interface MatchRequest {
  id: string
  investorId: string
  dealId: string
  deal: DealCard
  investmentAmount: number
  investmentType: InvestmentType
  circleId: string | null
  status: MatchStatus
  ndaSigned: boolean
  ndaSignedAt: string | null
  investorNote: string | null
  createdAt: string
  updatedAt: string
}

/** 관리자 전용 매칭 (adminNote 포함) */
export interface MatchRequestAdmin extends MatchRequest {
  investor: Pick<InvestorProfile, 'id' | 'name' | 'email' | 'profession'>
  adminNote: string | null
}

export interface Subscription {
  id: string
  investorId: string
  status: SubscriptionStatus
  amount: number
  tossOrderId: string | null
  startedAt: string
  nextBillingAt: string
  cancelledAt: string | null
  createdAt: string
}

export interface MembershipApplication {
  id: string
  name: string
  email: string
  phone: string
  profession: string
  annualIncome: number | null
  simulatedInvestment: number | null
  simulatedTaxSaving: number | null
  status: ApplicationStatus
  reviewNote: string | null
  notionPageId: string | null
  createdAt: string
  updatedAt: string
}

export interface PatronCircle {
  id: string
  name: string
  managerId: string
  targetAmount: number
  currentAmount: number
  status: CircleStatus
  createdAt: string
  updatedAt: string
}

export interface AdminNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown> | null
  isRead: boolean
  createdAt: string
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiError {
  code: string
  message: string
}

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError }

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  error: null
}

// ─── Tax Calculator ────────────────────────────────────────────────────────────

export interface TaxCalculatorInput {
  investmentAmount: number  // 투자금 (만원)
  annualIncome: number      // 연간 소득 (만원)
}

export interface TaxCalculatorResult {
  investmentAmount: number
  deductionRate: number     // 소득공제율 (0.3 | 0.7 | 1.0)
  deductionAmount: number   // 공제 금액 (만원)
  effectiveDeduction: number // 실제 적용 공제액 (소득 50% 한도 적용)
  estimatedTaxSaving: number // 예상 절세액 (만원)
  incomeTaxRate: number     // 적용 소득세율
}

// ─── Matching State Machine ──────────────────────────────────────────────────

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  REQUESTED: '신청 접수',
  REVIEWING: '검토 중',
  DELIVERED: '기업 전달',
  MEETING: '미팅 조율',
  DEAL_ROOM: 'NDA 완료',
  CONTRACT: '계약 진행',
  COMPLETED: '투자 완료',
}

export const MATCH_STATUS_ORDER: MatchStatus[] = [
  'REQUESTED',
  'REVIEWING',
  'DELIVERED',
  'MEETING',
  'DEAL_ROOM',
  'CONTRACT',
  'COMPLETED',
]
