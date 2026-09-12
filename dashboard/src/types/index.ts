export interface FamilyMember {
  id: string;
  registrationId: string;
  srNo: number;
  name: string;
  relation: string;
  dob: string;
  occupation: string;
  mobile: string;
}

export interface MainMember {
  id: string;
  registrationId: string;
  srNo: number;
  memberNo: string;
  fullName: string;
  mobileNo: string;
  prabhagNo: string;
}

export interface MemberRegistration {
  id: string;
  receiptNo: string;
  date: string;
  registrationFee: number;
  amountInWords: string;
  address: string;
  paymentMethod: string;
  paymentScreenshot?: string | null;
  referredBy?: string | null;
  createdAt: string;
  updatedAt: string;
  mainMembers: MainMember[];
  familyMembers: FamilyMember[];
}

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  city?: string;
  date: string;
  time?: string;
  status: "VERIFIED" | "PENDING";
  role: string;
  createdAt: string;
}

export interface CareerApplicationItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  message?: string;
  resumeName?: string;
  resumeData?: string;
  status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED";
  createdAt: string;
}

export interface DonationItem {
  id: string;
  receiptNo: string;
  name: string;
  mobileNo: string;
  city: string;
  amount: number;
  amountInWords: string;
  paymentScreenshot?: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveMemberItem {
  id: string;
  fullName: string;
  designation: string;
  mobileNo: string;
  city: string;
  district: string;
  photoUrl?: string | null;
  status: string;
  receiptNo?: string | null;
  registrationFee?: number | string | null;
  paymentMethod?: string | null;
  paymentScreenshot?: string | null;
  transactionId?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinks {
  phone?: string;
  visitUs?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  website?: string;
}

export interface AdItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: "image" | "video";
  adLink?: string;
  socialLinks?: SocialLinks;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

