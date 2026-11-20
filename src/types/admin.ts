export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type SalonStatus = "Inactive" | "Requested" | "Accepted" | "Rejected" | "DELETED";
export type UserStatus = "Active" | "Blocked" | "Deleted";
export type UserRole = "USER" | "OWNER" | "ADMIN" | "Employee";

export type Salon = {
  id: number;
  name: string;
  salonPhoneNumber: string | null;
  email: string | null;
  location: string | null;
  googleMapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  ownerId: number | null;
  ownerName: string | null;
  ownerPhoneNumber: string | null;
  currentEmployeesNumber: number | null;
  maxEmployeesNumber: number | null;
  createdAt: string | null;
  openingTime: string | null;
  closingTime: string | null;
  profilePictureUrl: string | null;
  status: SalonStatus;
  openningStatus: string | null;
  blockedByAdmin: boolean;
  blockedByOwner: boolean;
  rejectionReason: string | null;
  resubmissionCount: number;
  remainingResubmissions: number;
};

export type AdminUser = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  userName: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;
  salonId: number | null;
  salonName: string | null;
  careerProfileEnabled: boolean;
};

export type UserProfile = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;
  salonId: number | null;
  salonName: string | null;
  ownedSalonId: number | null;
  ownedSalonName: string | null;
  ownedSalonStatus: SalonStatus | null;
  careerProfileEnabled: boolean;
  dateOfBirth: string | null;
  yearsOfExperience: number | null;
  skills: string[];
  preferredWorkLocations: string[];
  resumeUrl: string | null;
  resumeUploaded: boolean;
  portfolioUrl: string | null;
  professionalBio: string | null;
  careerProfileCompletionPercentage: number;
};

export type DashboardSnapshot = {
  salons: Salon[];
  users: AdminUser[];
};

export type AdminMonthlyTrend = {
  month: string;
  bookings: number;
  completedBookings: number;
  grossBookingValue: number;
};

export type AdminAnalytics = {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  owners: number;
  employees: number;
  careerProfiles: number;
  totalSalons: number;
  acceptedSalons: number;
  requestedSalons: number;
  rejectedSalons: number;
  inactiveSalons: number;
  blockedSalons: number;
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  completedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  grossBookingValue: number;
  completedBookingValue: number;
  monthlyTrend: AdminMonthlyTrend[];
  generatedAt: string;
};

export type UserActivity = {
  userId: number;
  fullName: string | null;
  userName: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  online: boolean;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  totalLogins: number;
  loginsToday: number;
  loginsThisWeek: number;
  loginsThisMonth: number;
  loginsThisYear: number;
  activityToday: number;
  activityThisWeek: number;
  activityThisMonth: number;
  activityThisYear: number;
};

export type UserActivityDashboard = {
  totalUsers: number;
  onlineUsers: number;
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  generatedAt: string;
  users: UserActivity[];
};

export type ReportTargetType = "POST" | "COMMENT" | "SALON" | "USER";
export type ReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";
export type ModerationReport = {
  id: number;
  reporter: { id: number; userName: string | null; displayName: string | null };
  targetType: ReportTargetType;
  targetId: number;
  targetLabel: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  adminNote: string | null;
  reviewedBy: { id: number; userName: string | null; displayName: string | null } | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type PlanCode = "FREE" | "PRO" | "BUSINESS";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "GRACE" | "ENDED";
export type PlanPaymentStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
export type PlanPaymentMethod = "CLIQ" | "CASH" | "COMPLIMENTARY";

export type PlanRequest = {
  id: number;
  plan: PlanCode;
  billingCycle: BillingCycle;
  amountFils: number;
  currency: string;
  method: PlanPaymentMethod;
  reference: string | null;
  status: PlanPaymentStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  periodEnd: string | null;
};

export type AdminPlanRequest = {
  salonId: number;
  salonName: string;
  ownerName: string;
  ownerEmail: string | null;
  ownerPhone: string | null;
  currentPlan: PlanCode;
  request: PlanRequest;
};

export type AdminSalonPlan = {
  salonId: number;
  salonName: string;
  ownerName: string;
  plan: PlanCode;
  subscribedPlan: PlanCode;
  status: SubscriptionStatus;
  billingCycle: BillingCycle | null;
  accessEndsAt: string | null;
  daysLeft: number | null;
  openRequest: boolean;
};
