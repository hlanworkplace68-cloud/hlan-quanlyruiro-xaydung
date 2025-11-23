'use client';

import React, { useState, useEffect } from 'react';
import { Risk, Project } from '@/types';
import { BarChart3, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { AnalyticsService, DashboardMetrics, RiskTrend } from '@/services/AnalyticsService';

interface AnalyticsDashboardProps {
  risks: Risk[];
  project: Project | null;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ risks, project }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<RiskTrend[]>([]);
  const [severityDist, setSeverityDist] = useState<Record<string, number>>({});
  const [statusDist, setStatusDist] = useState<Record<string, number>>({});

  useEffect(() => {
    const newMetrics = AnalyticsService.calculateMetrics(risks);
    setMetrics(newMetrics);

    const newTrends = AnalyticsService.generateTrends(risks, 30);
    setTrends(newTrends);

    setSeverityDist(AnalyticsService.getSeverityDistribution(risks));
    setStatusDist(AnalyticsService.getStatusDistribution(risks));
  }, [risks]);

  if (!project || !metrics) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-slate-600 text-lg">Vui lòng chọn một dự án để xem phân tích</p>
      </div>
    );
  }

  const handleExportCSV = (): void => {
    AnalyticsService.downloadCSV(risks, project);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-blue-600" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Phân tích rủi ro</h2>
            <p className="text-slate-600">Dashboard thời gian thực cho {project.name}</p>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          <Download size={20} />
          Xuất CSV
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Risks */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-semibold text-sm">Tổng số rủi ro</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{metrics.totalRisks}</p>
            </div>
            <AlertTriangle className="text-blue-400" size={40} />
          </div>
        </div>

        {/* Critical Risks */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6 border-l-4 border-red-500">
          <div>
            <p className="text-red-600 font-semibold text-sm">Rủi ro nghiêm trọng</p>
            <p className="text-3xl font-bold text-red-900 mt-2">{metrics.criticalRisks}</p>
            <p className="text-xs text-red-600 mt-2">
              {metrics.totalRisks > 0 ? ((metrics.criticalRisks / metrics.totalRisks) * 100).toFixed(0) : 0}% tổng số
            </p>
          </div>
        </div>

        {/* Avg Risk Score */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div>
            <p className="text-purple-600 font-semibold text-sm">Điểm rủi ro TB</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">{metrics.avgRiskScore}</p>
            <p className="text-xs text-purple-600 mt-2">Tính trên thang 0-10</p>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-l-4 border-green-500">
          <div>
            <p className="text-green-600 font-semibold text-sm">Tỉ lệ giải quyết</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{metrics.resolutionRate}%</p>
            <p className="text-xs text-green-600 mt-2">{metrics.resolvedRisks} đã giải quyết</p>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Phân bố theo mức độ</h3>
          <div className="space-y-3">
            {Object.entries(severityDist).map(([severity, count]) => {
              const percentage = metrics.totalRisks > 0 ? (count / metrics.totalRisks) * 100 : 0;
              const colors: Record<string, string> = {
                critical: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500'
              };
              const labels: Record<string, string> = {
                critical: 'Nghiêm trọng',
                high: 'Cao',
                medium: 'Trung bình',
                low: 'Thấp'
              };

              return (
                <div key={severity}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-700">{labels[severity]}</p>
                    <p className="text-sm font-bold text-slate-900">{count}</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${colors[severity]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{percentage.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Phân bố theo trạng thái</h3>
          <div className="space-y-3">
            {Object.entries(statusDist).map(([status, count]) => {
              const percentage = metrics.totalRisks > 0 ? (count / metrics.totalRisks) * 100 : 0;
              const colors: Record<string, string> = {
                active: 'bg-blue-500',
                monitored: 'bg-yellow-500',
                resolved: 'bg-green-500'
              };
              const labels: Record<string, string> = {
                active: 'Hoạt động',
                monitored: 'Đang theo dõi',
                resolved: 'Đã giải quyết'
              };

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-700">{labels[status]}</p>
                    <p className="text-sm font-bold text-slate-900">{count}</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${colors[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{percentage.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Xu hướng 30 ngày</h3>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="flex gap-1" style={{ minWidth: '1200px' }}>
              {trends.map((trend, idx) => {
                const maxRisks = Math.max(...trends.map(t => t.totalRisks));
                const height = (trend.totalRisks / Math.max(maxRisks, 1)) * 200;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative h-40 w-full flex items-end justify-center">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all hover:from-blue-600 hover:to-blue-400"
                        style={{ height: `${height}px`, minHeight: '4px' }}
                        title={`${trend.date}: ${trend.totalRisks} rủi ro`}
                      />
                    </div>
                    <p className="text-xs text-slate-600 text-center">
                      {new Date(trend.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-slate-600">Cao nhất</p>
            <p className="text-2xl font-bold text-slate-800">
              {Math.max(...trends.map(t => t.totalRisks), 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">Trung bình</p>
            <p className="text-2xl font-bold text-slate-800">
              {(trends.reduce((sum, t) => sum + t.totalRisks, 0) / Math.max(trends.length, 1)).toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">Điểm rủi ro TB</p>
            <p className="text-2xl font-bold text-slate-800">
              {(trends.reduce((sum, t) => sum + t.avgRiskScore, 0) / Math.max(trends.length, 1)).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg shadow p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Tóm tắt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">📊 Tình hình chung</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Tổng rủi ro: <span className="font-bold text-slate-800">{metrics.totalRisks}</span></li>
              <li>• Đang hoạt động: <span className="font-bold text-slate-800">{metrics.activeRisks}</span></li>
              <li>• Đã giải quyết: <span className="font-bold text-slate-800">{metrics.resolvedRisks}</span></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">⚠️ Nguy hiểm</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Nghiêm trọng: <span className="font-bold text-red-700">{metrics.criticalRisks}</span></li>
              <li>• Cao: <span className="font-bold text-orange-700">{metrics.highRisks}</span></li>
              <li>• Điểm trung bình: <span className="font-bold text-slate-800">{metrics.avgRiskScore}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
