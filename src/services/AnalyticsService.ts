'use client';

import { Risk, Project } from '@/types';

export interface RiskTrend {
  date: string;
  totalRisks: number;
  activeRisks: number;
  resolvedRisks: number;
  avgRiskScore: number;
}

export interface DashboardMetrics {
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  resolvedRisks: number;
  activeRisks: number;
  avgRiskScore: number;
  resolutionRate: number;
}

export class AnalyticsService {
  static calculateMetrics(risks: Risk[]): DashboardMetrics {
    const severities = {
      critical: risks.filter(r => r.severity === 'critical').length,
      high: risks.filter(r => r.severity === 'high').length,
      medium: risks.filter(r => r.severity === 'medium').length,
      low: risks.filter(r => r.severity === 'low').length
    };

    const resolved = risks.filter(r => r.status === 'resolved').length;
    const active = risks.filter(r => r.status === 'active').length;
    const avgScore = risks.length > 0
      ? risks.reduce((sum, r) => sum + (r.riskScore ?? 0), 0) / risks.length
      : 0;

    return {
      totalRisks: risks.length,
      criticalRisks: severities.critical,
      highRisks: severities.high,
      mediumRisks: severities.medium,
      lowRisks: severities.low,
      resolvedRisks: resolved,
      activeRisks: active,
      avgRiskScore: Number(avgScore.toFixed(2)),
      resolutionRate: risks.length > 0 ? Number(((resolved / risks.length) * 100).toFixed(1)) : 0
    };
  }

  static generateTrends(risks: Risk[], days: number = 30): RiskTrend[] {
    const trends: RiskTrend[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Simulate trend data by adding some randomness
      const baseCount = Math.max(2, Math.floor(risks.length * (1 - i / days)));
      const variation = Math.floor(Math.random() * 3) - 1;

      trends.push({
        date: dateStr,
        totalRisks: baseCount + variation,
        activeRisks: Math.floor(baseCount * 0.6),
        resolvedRisks: Math.floor(baseCount * 0.4),
        avgRiskScore: Number((4 + Math.random() * 3).toFixed(2))
      });
    }

    return trends;
  }

  static exportToCSV(risks: Risk[], project: Project): string {
    const headers = ['STT', 'Tên rủi ro', 'Nội dung', 'Khi nào', 'Nguyên nhân', 'Giải pháp', 'Mức độ', 'Risk Score', 'Trạng thái'];
    const rows = risks.map(r => [
      r.stt,
      r.name,
      r.what,
      r.when,
      r.how,
      r.solution,
      r.severity || 'N/A',
      r.riskScore || 'N/A',
      r.status || 'N/A'
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csv;
  }

  static downloadCSV(risks: Risk[], project: Project): void {
    const csv = this.exportToCSV(risks, project);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `risk_report_${project.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  static getSeverityDistribution(risks: Risk[]): Record<string, number> {
    return {
      critical: risks.filter(r => r.severity === 'critical').length,
      high: risks.filter(r => r.severity === 'high').length,
      medium: risks.filter(r => r.severity === 'medium').length,
      low: risks.filter(r => r.severity === 'low').length
    };
  }

  static getStatusDistribution(risks: Risk[]): Record<string, number> {
    return {
      active: risks.filter(r => r.status === 'active').length,
      monitored: risks.filter(r => r.status === 'monitored').length,
      resolved: risks.filter(r => r.status === 'resolved').length
    };
  }

  static getMostRecentChanges(risks: Risk[], limit: number = 5): Risk[] {
    return risks
      .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, limit);
  }
}
