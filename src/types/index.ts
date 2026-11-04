export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  image_url: string | null;
  role: string;
  bio_info: string | null;
  status: number;
  roles: Role[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  name: string;
  email: string;
  phone?: string;
  bio_info?: string;
  image?: File | null;
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  phone?: string;
  bio_info?: string;
  role_id: number | string;
  status?: number;
  image?: File | null;
}



export interface Client {
  id: number;
  name: string;
  type: 'individual' | 'corporate';
  email: string;
  phone: string | null;
  registration_number: string | null;
  date_of_birth: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  notes: string | null;
  status: boolean | number;
  created_at: string;
}


export interface ActivityLog {
  id: number;
  log_name: string;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  causer_type: string | null;
  causer_id: number | null;
  properties: { old?: any, new?: any } | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  causer?: { id: number; name: string; email: string };
  subject?: { id: number; name: string };
}



export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}




export interface CaseCategory {
  id: number;
  name: string;
  color: string;
  description: string | null;
  status: boolean | number;
  created_at: string;
}

export interface CaseStatus {
  id: number;
  name: string;
  color: string;
  is_default: boolean | number;
  status: boolean | number;
  created_at: string;
}



export interface CaseModel {
  id: number;
  case_number: string;
  title: string;
  description: string | null;
  client_id: number;
  category_id: number;
  status_id: number;
  assigned_lawyer_id: number | null;
  opening_date: string | null;
  closing_date: string | null;
  status: boolean | number;
  created_at: string;
  client?: { id: number; name: string };
  category?: { id: number; name: string; color: string };
  status?: { id: number; name: string; color: string };
  lawyer?: { id: number; name: string };
}



export interface Hearing {
  id: number;
  case_id: number;
  hearing_date: string;
  hearing_time: string | null;
  court_name: string;
  judge_name: string | null;
  hearing_type: string;
  purpose: string | null;
  outcome: string | null;
  next_hearing_date: string | null;
  status: 'scheduled' | 'completed' | 'adjourned' | 'cancelled';
  is_active: boolean | number;
  created_at: string;
  case?: { id: number; case_number: string; title: string };
}



export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'to_do' | 'in_progress' | 'under_review' | 'done' | 'cancelled';
  case_id: number | null;
  assigned_to: number | null;
  created_by: number | null;
  deadline: string | null;
  is_active: boolean | number;
  created_at: string;
  case?: { id: number; case_number: string; title: string };
  assignee?: { id: number; name: string };
  creator?: { id: number; name: string };
}



export interface Document {
  id: number;
  name: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_size_human: string;
  category: 'evidence' | 'contract' | 'correspondence' | 'general';
  description: string | null;
  case_id: number | null;
  client_id: number | null;
  uploaded_by: number | null;
  is_active: boolean | number;
  created_at: string;
  case?: { id: number; case_number: string; title: string };
  client?: { id: number; name: string };
  uploader?: { id: number; name: string };
}




export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Payment {
  id: number;
  invoice_id: number;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'online' | 'other';
  reference_number: string | null;
  notes: string | null;
  recorded_by: number | null;
  created_at: string;
  recorder?: { id: number; name: string };
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  client_id: number;
  case_id: number | null;
  created_by: number | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  notes: string | null;
  is_active: boolean | number;
  created_at: string;
  client?: { id: number; name: string };
  case?: { id: number; case_number: string; title: string };
  creator?: { id: number; name: string };
  items?: InvoiceItem[];
  payments?: Payment[];
}



export interface TimeEntry {
  id: number;
  case_id: number | null;
  user_id: number;
  task_id: number | null;
  description: string;
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  billable_rate: number;
  total_amount: number;
  is_billable: boolean | number;
  status: 'draft' | 'submitted' | 'approved' | 'invoiced';
  is_active: boolean | number;
  created_at: string;
  case?: { id: number; case_number: string; title: string };
  user?: { id: number; name: string };
  task?: { id: number; title: string };
}

export interface TimeEntrySummary {
  total_entries: number;
  total_minutes: number;
  total_billable_minutes: number;
  total_amount: number;
}


export interface SummarizeResponse {
  summary: string;
}


export interface DocumentTemplate {
  id: number;
  name: string;
  content: string;
  category: string;
  description: string | null;
  variables: string[];
  is_active: boolean;
  created_by: number;
  creator?: { id: number; name: string };
}




export interface Setting {
  id: number;
  system_name: string | null;
  email: string | null;
  extra_email: string | null;
  phone: string | null;
  extra_phone: string | null;
  address: string | null;
  opening_hr: string | null;
  work_hours: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  open_api_key: string | null;
  logo: string | null;
  favicon: string | null;
  info1: string | null;
  info2: string | null;
  mail_transport: string | null;
  mail_host: string | null;
  mail_port: number | null;
  mail_username: string | null;
  mail_password: string | null; 
  mail_encryption: string | null;
  mail_from: string | null;
  mail_from_name: string | null;
  smtp_check: boolean | number;
  logo_url: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
}




export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'hearing' | 'task' | 'invoice' | 'case' | 'client' | 'system';
  link?: string;
  isRead: boolean;
  time: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  user?: User;
  users?: User[];
  roles?: Role[];
  data?: T | PaginatedResponse<T>;
}