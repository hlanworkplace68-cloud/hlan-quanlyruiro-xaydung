'use client';

import React, { useState, useEffect } from 'react';
import { AuditLog } from '@/types';
import { History, Filter } from 'lucide-react';
import { AuditLogService } from '@/services/AuditLogService';

interface AuditLogViewerProps {
  projectId?: string;
  riskId?: number;
  limit?: number;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ projectId, riskId, limit = 20 }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    let filteredLogs: AuditLog[] = [];

    if (riskId) {
      filteredLogs = AuditLogService.getRiskLogs(riskId);
    } else if (projectId) {
      filteredLogs = AuditLogService.getProjectLogs(projectId);
    } else {
      filteredLogs = AuditLogService.getRecentLogs(limit);
    }

    if (filterType !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.action === filterType);
    }

    setLogs(filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }, [projectId, riskId, limit, filterType]);

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string): string => {
    switch (action) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      default: return '📝';
    }
  };

  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'create': return 'Tạo mới';
      case 'update': return 'Cập nhật';
      case 'delete': return 'Xóa';
      default: return 'Thay đổi';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="text-slate-600" size={24} />
          <div>
            <h3 className="text-lg font-bold text-slate-800">Lịch sử thay đổi</h3>
            <p className="text-sm text-slate-600">Theo dõi tất cả các thay đổi</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-600" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="create">Tạo mới</option>
            <option value="update">Cập nhật</option>
            <option value="delete">Xóa</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="text-center py-12">
          <History size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-slate-600">Không có lịch sử thay đổi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="border border-slate-200 rounded-lg hover:shadow-md transition">
              {/* Log Item */}
              <button
                onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                className="w-full p-4 flex items-start justify-between hover:bg-slate-50 transition text-left"
              >
                <div className="flex-1 flex items-start gap-4">
                  <div className={`px-3 py-1 rounded font-semibold text-sm ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)} {getActionLabel(log.action)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{log.entityName}</p>
                    <p className="text-sm text-slate-600">
                      Bởi <span className="font-medium">{log.username}</span> • {log.entityType === 'risk' ? 'Rủi ro' : 'Dự án'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="text-slate-400">{showDetails === log.id ? '▼' : '▶'}</div>
              </button>

              {/* Detailed Changes */}
              {showDetails === log.id && log.changes && log.changes.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-2">
                  <p className="font-semibold text-sm text-slate-700 mb-3">Chi tiết thay đổi:</p>
                  {log.changes.map((change, idx) => (
                    <div key={idx} className="bg-white rounded p-3 text-sm">
                      <p className="font-medium text-slate-800">{change.field}</p>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <p className="text-xs text-slate-600">Cũ:</p>
                          <p className="text-slate-700 line-clamp-2">{change.oldValue}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Mới:</p>
                          <p className="text-slate-700 line-clamp-2">{change.newValue}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
