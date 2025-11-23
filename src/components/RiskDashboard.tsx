'use client';

import React, { useState, useEffect } from 'react';
import { Risk, FormData, Project } from '@/types';
import { AlertTriangle, Download, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuditLogService } from '@/services/AuditLogService';
import { NotificationService } from '@/services/NotificationService';
import { AnalyticsService } from '@/services/AnalyticsService';

interface RiskDashboardProps {
  project: Project | null;
  risks: Risk[];
  onAddRisk: (risk: Risk) => void;
  onUpdateRisk: (risk: Risk) => void;
  onDeleteRisk: (id: number) => void;
  canEdit: boolean;
}

const RiskDashboard: React.FC<RiskDashboardProps> = ({
  project,
  risks,
  onAddRisk,
  onUpdateRisk,
  onDeleteRisk,
  canEdit
}) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    stt: 0,
    name: '',
    what: '',
    when: '',
    how: '',
    solution: ''
  });

  // Export to CSV
  const exportToCSV = (): void => {
    const headers = ['STT', 'Tên rủi ro', 'WHAT - Nội dung', 'WHEN - Khi nào', 'HOW - Nguyên nhân', 'SOLUTION - Giải pháp'];
    const rows = risks.map(r => [
      r.stt,
      r.name,
      r.what,
      r.when,
      r.how,
      r.solution
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `risk_report_${project?.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // CRUD Operations
  const handleAdd = (): void => {
    if (!project || !user) return;
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên rủi ro');
      return;
    }

    const newRisk: Risk = {
      ...formData,
      id: Math.max(...risks.map(r => r.id), 0) + 1,
      projectId: project.id,
      createdAt: new Date().toISOString(),
      createdBy: user.username,
      lastUpdated: new Date().toISOString()
    };
    
    onAddRisk(newRisk);
    
    // Log to audit trail
    AuditLogService.addLog({
      projectId: project.id,
      riskId: newRisk.id,
      userId: user.id,
      username: user.username,
      action: 'create',
      entityType: 'risk',
      entityName: newRisk.name
    });

    // Create notification
    NotificationService.createNotification({
      userId: user.id,
      title: 'Rủi ro mới được thêm',
      message: `${user.username} vừa thêm rủi ro: ${newRisk.name}`,
      type: 'info',
      read: false,
      riskId: newRisk.id,
      projectId: project.id
    });

    setShowAddForm(false);
    resetForm();
  };

  const handleEdit = (id: number): void => {
    const risk = risks.find(r => r.id === id);
    if (risk) {
      const { id: _, projectId: __, lastUpdated: ___, ...formFields } = risk;
      setFormData(formFields as FormData);
      setEditingId(id);
    }
  };

  const handleUpdate = (): void => {
    if (!editingId || !project || !user) return;
    const risk = risks.find(r => r.id === editingId);
    if (risk) {
      const updatedRisk: Risk = {
        ...formData,
        id: editingId,
        projectId: risk.projectId,
        createdAt: risk.createdAt,
        createdBy: risk.createdBy,
        lastUpdated: new Date().toISOString()
      };
      onUpdateRisk(updatedRisk);

      // Log to audit trail
      AuditLogService.addLog({
        projectId: project.id,
        riskId: editingId,
        userId: user.id,
        username: user.username,
        action: 'update',
        entityType: 'risk',
        entityName: updatedRisk.name,
        changes: [
          { field: 'name', oldValue: risk.name, newValue: formData.name },
          { field: 'what', oldValue: risk.what, newValue: formData.what },
          { field: 'when', oldValue: risk.when, newValue: formData.when },
          { field: 'how', oldValue: risk.how, newValue: formData.how },
          { field: 'solution', oldValue: risk.solution, newValue: formData.solution }
        ]
      });

      // Create notification
      NotificationService.createNotification({
        userId: user.id,
        title: 'Rủi ro được cập nhật',
        message: `${user.username} vừa cập nhật rủi ro: ${updatedRisk.name}`,
        type: 'info',
        read: false,
        riskId: editingId,
        projectId: project.id
      });

      setEditingId(null);
      resetForm();
    }
  };

  const handleDelete = (id: number): void => {
    if (confirm('Bạn có chắc muốn xóa rủi ro này?')) {
      if (!user || !project) return;
      const risk = risks.find(r => r.id === id);
      if (risk) {
        onDeleteRisk(id);

        // Log to audit trail
        AuditLogService.addLog({
          projectId: project.id,
          riskId: id,
          userId: user.id,
          username: user.username,
          action: 'delete',
          entityType: 'risk',
          entityName: risk.name
        });

        // Create notification
        NotificationService.createNotification({
          userId: user.id,
          title: 'Rủi ro bị xóa',
          message: `${user.username} vừa xóa rủi ro: ${risk.name}`,
          type: 'warning',
          read: false,
          projectId: project.id
        });
      }
    }
  };

  const resetForm = (): void => {
    setFormData({
      stt: risks.length > 0 ? Math.max(...risks.map(r => r.stt)) + 1 : 1,
      name: '',
      what: '',
      when: '',
      how: '',
      solution: ''
    });
  };

  if (!project) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-slate-600 text-lg">Vui lòng chọn một dự án để quản lý rủi ro</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <AlertTriangle className="text-blue-600" />
              Quản lý rủi ro: {project.name}
            </h2>
            <p className="text-slate-600 mt-2">Theo dõi và quản lý rủi ro cho dự án này</p>
          </div>
          {canEdit && (
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Download size={20} />
                Xuất CSV
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(!showAddForm);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Thêm rủi ro
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="flex items-center gap-4">
          <AlertTriangle className="text-red-600" size={32} />
          <div>
            <div className="text-sm font-semibold text-red-600">Tổng số rủi ro</div>
            <div className="text-4xl font-bold text-red-700">{risks.length}</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && canEdit && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            {editingId ? 'Chỉnh sửa rủi ro' : 'Thêm rủi ro mới'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">STT</label>
              <input
                type="number"
                min="1"
                value={formData.stt}
                onChange={(e) => setFormData({ ...formData, stt: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Số thứ tự"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tên rủi ro</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="VD: Rủi ro thiết kế"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">WHAT - Nội dung rủi ro</label>
              <textarea
                value={formData.what}
                onChange={(e) => setFormData({ ...formData, what: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Mô tả chi tiết nội dung rủi ro là gì"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">WHEN - Khi nào xảy ra</label>
              <textarea
                value={formData.when}
                onChange={(e) => setFormData({ ...formData, when: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Giai đoạn hoặc thời gian có khả năng xảy ra rủi ro"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">HOW - Nguyên nhân</label>
              <textarea
                value={formData.how}
                onChange={(e) => setFormData({ ...formData, how: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Nguyên nhân gây ra rủi ro"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">SOLUTION - Giải pháp</label>
              <textarea
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Các giải pháp để giảm thiểu hoặc tránh rủi ro"
                rows={2}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Save size={20} />
              {editingId ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-slate-400 text-white px-4 py-2 rounded-lg hover:bg-slate-500 transition"
            >
              <X size={20} />
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Risk Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {risks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 text-lg">Chưa có rủi ro nào. Hãy thêm rủi ro để bắt đầu.</p>
            {canEdit && (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Thêm rủi ro đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-center w-12">STT</th>
                  <th className="px-4 py-3 text-left">Tên rủi ro</th>
                  <th className="px-4 py-3 text-left">WHAT - Nội dung</th>
                  <th className="px-4 py-3 text-left">WHEN - Khi nào</th>
                  <th className="px-4 py-3 text-left">HOW - Nguyên nhân</th>
                  <th className="px-4 py-3 text-left">SOLUTION - Giải pháp</th>
                  {canEdit && <th className="px-4 py-3 text-center w-24">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {risks.map(risk => (
                  <tr key={risk.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-center font-semibold text-slate-800">{risk.stt}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{risk.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700 line-clamp-2">{risk.what}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700 line-clamp-2">{risk.when}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700 line-clamp-2">{risk.how}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700 line-clamp-2">{risk.solution}</div>
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(risk.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(risk.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expandable Row View */}
      {risks.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Chi tiết rủi ro</h3>
          <div className="space-y-6">
            {risks.map(risk => (
              <div key={risk.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                        {risk.stt}
                      </span>
                      <h4 className="text-lg font-bold text-slate-800">{risk.name}</h4>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(risk.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(risk.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-blue-600 mb-2">WHAT - Nội dung rủi ro</h5>
                    <p className="text-sm text-slate-700">{risk.what}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-green-600 mb-2">WHEN - Khi nào xảy ra</h5>
                    <p className="text-sm text-slate-700">{risk.when}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-orange-600 mb-2">HOW - Nguyên nhân</h5>
                    <p className="text-sm text-slate-700">{risk.how}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-red-600 mb-2">SOLUTION - Giải pháp</h5>
                    <p className="text-sm text-slate-700">{risk.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDashboard;
