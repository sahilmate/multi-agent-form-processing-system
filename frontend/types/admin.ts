// Define dashboard statistics types
export interface DashboardStats {
  total_submissions: number;
  department_submissions?: number;
  status_counts: {
    pending: number;
    processing: number;
    completed: number;
    rejected: number;
  };
  form_type_distribution: Record<string, number>;
  department_distribution: Record<string, number>;
  avg_processing_time: number;
  recent_activity: SubmissionEntry[];
}

// Define submission entry types
export interface SubmissionEntry {
  _id: string;
  original_filename?: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  form_type: string;
  department: string | {
    department_id: string;
    department_name: string;
  };
  processing_time?: number;
  extracted_fields?: Record<string, any>;
  ocr_text?: string;
  input_text?: string;
  filled_form?: Record<string, any>;
  notes?: string;
  status_history?: StatusHistoryEntry[];
}

// Define status history entry
export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  notes?: string;
  updated_by?: string;
}

// Define department statistics
export interface DepartmentStats {
  department_id: string;
  department_name: string;
  total_submissions: number;
  pending: number;
  processing: number;
  completed: number;
  rejected: number;
  avg_processing_time: number;
  form_types: Record<string, number>;
}

// Define system health
export interface SystemHealth {
  database: {
    status: string;
    response_time: number;
  };
  services: Record<string, boolean>;
  system: {
    version: string;
    environment: string;
    server_time: string;
  };
}

// Define pagination
export interface PaginationState {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// Define filters
export interface FiltersState {
  status: string;
  form_type: string;
  department: string;
  start_date: string;
  end_date: string;
}
