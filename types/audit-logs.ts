export interface AuditLogActor {
  id: string;
  name: string;
  email: string;
}

export interface AuditLogEntry {
  id: string;
  churchId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  actor?: AuditLogActor;
}

export interface AuditLogPage {
  items: AuditLogEntry[];
  nextCursor: string | null;
  retentionDays: number;
}
