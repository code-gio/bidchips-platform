export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  changes: Record<string, any> | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

