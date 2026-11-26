export type Role = 'MANAGER' | 'CASHIER' | 'RIDE_OPERATOR' | 'CUSTOMER';
export type DutyStatus = 'ON_DUTY' | 'OFF_DUTY';
export type PassType = 'REGULAR' | 'VIP_FASTPASS' | 'FAMILY';
export type PaymentMethod = 'WRISTBAND' | 'CASH';
export type TransactionType = 'TOPUP' | 'TICKET' | 'FOOD';
export type RideCategory = 'ROLLER_COASTER' | 'HORROR' | 'KIDS' | 'WATER' | 'FAMILY';
export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED';
export type Tab =
  | 'DASHBOARD'
  | 'CUSTOMERS'
  | 'POS'
  | 'FOOD_POS'
  | 'TRANSACTIONS'
  | 'RIDES'
  | 'STAFF'
  | 'CATALOG';

export interface AuthUser {
  token: string | null;
  userId: number;
  accountId?: number;    // customer portal account id
  customerId?: number;   // wallet profile id (CUSTOMER role)
  fullName: string;
  email: string;
  role: Role;
  assignedStation?: string;
  assignedRideId?: number | null;
  dutyStatus?: DutyStatus;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  wristbandBalance: number;
  loyaltyPoints: number;
  createdAt: string;
}

export interface TicketSummary {
  id: number;
  ticketCode: string;
  passType: PassType;
  status: TicketStatus;
  pricePaid: number;
  validDate: string;
  boardingsCount: number;
  issuedAt: string;
}

export interface Transaction {
  id: number;
  customerId: number;
  customerName: string;
  txType: TransactionType;
  paymentMethod: PaymentMethod;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  pointsEarned: number;
  updatedBalance: number;
  updatedLoyaltyPoints: number;
  ticketCode: string | null;
  processedByEmail: string | null;
  promoCode: string | null;
  referenceNote: string | null;
  createdAt: string;
}

export interface CustomerDetail {
  profile: Customer;
  tickets: TicketSummary[];
  recentTransactions: Transaction[];
}

export interface FoodReceiptLine {
  menuItemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface TransactionReceipt {
  transaction: Transaction;
  ticket: TicketSummary | null;
  foodItems: FoodReceiptLine[];
}

export interface Ride {
  id: number;
  name: string;
  category: RideCategory;
  capacity: number;
  minAge: number;
  minHeightM: number;
  needMaintenance: boolean;
  operational: boolean;
  maintenanceReason: string | null;
  specificDetails: string | null;
  totalBoardings: number;
}

export interface RideBoarding {
  id: number;
  rideId: number;
  rideName: string;
  ticketCode: string;
  customerName: string;
  passType: PassType;
  guestAge: number;
  guestHeightM: number;
  operatorEmail: string;
  boardedAt: string;
}

export interface TicketLookup {
  id: number;
  ticketCode: string;
  customerName: string;
  passType: PassType;
  status: TicketStatus;
  validDate: string;
  boardingsCount: number;
}

export interface MenuItem {
  id: number;
  name: string;
  itemType: 'FOOD' | 'DRINK';
  subCategory: string;
  price: number;
  available: boolean;
}

export interface Offer {
  id: number;
  code: string;
  title: string;
  discountPercent: number;
  active: boolean;
  minSpend: number;
  expiresAt: string | null;
}

export interface PromoQuote {
  code: string;
  title: string;
  discountPercent: number;
  minSpend: number;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
}

export interface PassCatalogItem {
  passType: PassType;
  label: string;
  basePrice: number;
  perks: string;
}

export interface PosCatalog {
  passes: PassCatalogItem[];
  activeOffers: Offer[];
  loyaltyPointsPerCreditUnit: number;
  loyaltyCreditPer100Points: number;
}

export interface LoyaltyRedeemResponse {
  redemptionId: number;
  customerId: number;
  customerName: string;
  pointsRedeemed: number;
  creditAmount: number;
  updatedBalance: number;
  remainingPoints: number;
  createdAt: string;
}

export interface StaffMember {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  assignedStation: string;
  assignedRideId: number | null;
  assignedRideName: string | null;
  dutyStatus: DutyStatus;
}

export interface AuditLog {
  id: number;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface RevenueBreakdown {
  ticketRevenue: number;
  foodRevenue: number;
  topupRevenue: number;
  wristbandPaidRevenue: number;
  cashPaidRevenue: number;
}

export interface PersonalDashboard {
  userId: number;
  fullName: string;
  email: string;
  role: Role;
  assignedStation: string;
  assignedRideId: number | null;
  dutyStatus: DutyStatus;
  totalRevenue: number | null;
  revenueBreakdown: RevenueBreakdown | null;
  registeredCustomers: number | null;
  myTransactionsCount: number | null;
  myProcessedVolume: number | null;
  operationalRides: number;
  totalRides: number;
  myBoardingsCount: number | null;
  activeStaffCount: number | null;
  totalStaffCount: number | null;
  recentLogs: AuditLog[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
