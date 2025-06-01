import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

// Activity schema
export const activitySchema = z.object({
  title: z.string().min(1, 'Activity title is required'),
  type: z.enum(['MEETING', 'CALL', 'EMAIL', 'NETWORKING', 'PRESENTATION', 'NEGOTIATION', 'PARTNERSHIP', 'DEAL']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  picture: z.string().optional(),
});

// Contact schema
export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  employer: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED']).optional(),
  relation: z.enum(['FRIEND', 'RELATIVE', 'CONTACT']).optional(),
  category: z.string().optional(),
  rating: z.number().min(1).max(3).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  picture: z.string().optional(),
});

// Business schema
export const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  revenue: z.string().optional(),
  founded: z.string().optional(),
  status: z.enum(['PROSPECT', 'PARTNER', 'NEGOTIATING', 'INACTIVE']).optional(),
  partnership: z.enum(['STRATEGIC_ALLIANCE', 'INVESTMENT_OPPORTUNITY', 'CO_INVESTMENT', 'JOINT_VENTURE', 'STRATEGIC_INVESTMENT', 'SERVICE_PARTNERSHIP']).optional(),
  dealValue: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  picture: z.string().optional(),
});

// Employer schema
export const employerSchema = z.object({
  nameArabic: z.string().optional(),
  nameEnglish: z.string().min(1, 'English name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  founded: z.string().optional(),
  status: z.enum(['NEW', 'ACTIVE', 'PREMIUM', 'INACTIVE']).optional(),
  partnership: z.string().optional(),
  openPositions: z.number().optional(),
  placementRate: z.number().optional(),
  avgSalary: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  picture: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type BusinessInput = z.infer<typeof businessSchema>;
export type EmployerInput = z.infer<typeof employerSchema>; 