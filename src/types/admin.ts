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

export type DashboardSnapshot = {
  salons: Salon[];
  users: AdminUser[];
};
