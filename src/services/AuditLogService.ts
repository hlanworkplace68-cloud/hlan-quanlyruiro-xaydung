'use client';

import { AuditLog } from '@/types';

const STORAGE_KEY = 'auditLogs';

export class AuditLogService {
  static addLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const logs = this.getAllLogs();
    const newLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return newLog;
  }

  static getAllLogs(): AuditLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const logs = localStorage.getItem(STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  static getProjectLogs(projectId: string): AuditLog[] {
    return this.getAllLogs().filter(log => log.projectId === projectId);
  }

  static getRiskLogs(riskId: number): AuditLog[] {
    return this.getAllLogs().filter(log => log.riskId === riskId);
  }

  static getUserLogs(userId: string): AuditLog[] {
    return this.getAllLogs().filter(log => log.userId === userId);
  }

  static getRecentLogs(limit: number = 10): AuditLog[] {
    const logs = this.getAllLogs();
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  }

  static clearOldLogs(days: number = 90): void {
    const logs = this.getAllLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredLogs = logs.filter(
      log => new Date(log.timestamp).getTime() > cutoffDate.getTime()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLogs));
  }
}
