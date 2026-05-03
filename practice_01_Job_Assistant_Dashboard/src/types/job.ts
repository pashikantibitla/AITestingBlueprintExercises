export type JobStatus = 
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'accepted';

export interface Job {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  whereApplied: string;
  howFound: string;
  resumeUsed: string;
  jobDescription: string;
  salary?: string;
  status: JobStatus;
  dateApplied: string;
  applicationUrl?: string;
  contactName?: string;
  contactEmail?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnType {
  id: JobStatus;
  title: string;
  color: string;
}

export const COLUMNS: ColumnType[] = [
  { id: 'wishlist', title: 'Wishlist', color: 'bg-gray-100 border-gray-300' },
  { id: 'applied', title: 'Applied', color: 'bg-blue-50 border-blue-300' },
  { id: 'screening', title: 'Screening', color: 'bg-yellow-50 border-yellow-300' },
  { id: 'interview', title: 'Interview', color: 'bg-purple-50 border-purple-300' },
  { id: 'offer', title: 'Offer', color: 'bg-green-50 border-green-300' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-50 border-red-300' },
  { id: 'accepted', title: 'Accepted', color: 'bg-emerald-50 border-emerald-300' },
];

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
] as const;

export const WHERE_APPLIED_OPTIONS = [
  'LinkedIn',
  'Indeed',
  'Company Website',
  'Glassdoor',
  'Naukri',
  'Monster',
  'AngelList',
  'Referral',
  'Email',
  'Job Fair',
  'Recruiter',
  'Other',
] as const;

export const HOW_FOUND_OPTIONS = [
  'Job Board',
  'Company Website',
  'LinkedIn Post',
  'Referral',
  'Recruiter',
  'Networking Event',
  'Social Media',
  'Friend/Family',
  'Cold Email',
  'Other',
] as const;
