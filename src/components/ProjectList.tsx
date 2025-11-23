'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectFormData } from '@/types';
import { Plus, Edit2, Trash2, Save, X, MoreVertical } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  selectedProject: Project | null;
  canEdit: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  selectedProject,
  canEdit
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    location: '',
    status: 'planning',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    manager: '',
    budget: 0
  });

  const handleAddProject = (): void => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên dự án');
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddProject(newProject);
    resetForm();
    setShowAddForm(false);
  };

  const handleUpdateProject = (): void => {
    if (!formData.name.trim() || !editingId) return;

    const updatedProject: Project = {
      id: editingId,
      ...formData,
      createdAt: projects.find(p => p.id === editingId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdateProject(updatedProject);
    resetForm();
    setEditingId(null);
  };

  const handleDeleteProject = (id: string): void => {
    if (confirm('Bạn có chắc muốn xóa dự án này? Tất cả rủi ro liên quan cũng sẽ bị xóa.')) {
      onDeleteProject(id);
      if (selectedProject?.id === id) {
        onSelectProject(projects[0] || null as any);
      }
    }
  };

  const handleEditProject = (project: Project): void => {
    setFormData({
      name: project.name,
      description: project.description,
      location: project.location,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate || '',
      manager: project.manager,
      budget: project.budget
    });
    setEditingId(project.id);
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      description: '',
      location: '',
      status: 'planning',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      manager: '',
      budget: 0
    });
  };

  const getStatusColor = (status: Project['status']): string => {
    const colors: Record<Project['status'], string> = {
      planning: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-slate-100 text-slate-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Project['status']): string => {
    const labels: Record<Project['status'], string> = {
      planning: 'Lập kế hoạch',
      active: 'Đang thực hiện',
      paused: 'Tạm dừng',
      completed: 'Hoàn thành'
    };
    return labels[status];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Danh sách dự án</h2>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Thêm dự án
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && canEdit && (
        <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tên dự án</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Nhập tên dự án"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Địa điểm</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Địa điểm dự án"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quản lý dự án</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Tên người quản lý"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ngân sách (VNĐ)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Ngân sách dự án"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium"
              >
                <option value="planning">Lập kế hoạch</option>
                <option value="active">Đang thực hiện</option>
                <option value="paused">Tạm dừng</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Mô tả dự án"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={editingId ? handleUpdateProject : handleAddProject}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
              className="flex items-center gap-2 bg-slate-400 text-white px-4 py-2 rounded-lg hover:bg-slate-500"
            >
              <X size={20} />
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Project List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <p>Chưa có dự án nào. Hãy tạo dự án mới để bắt đầu.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => !editingId && onSelectProject(project)}
              className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                selectedProject?.id === project.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-800">{project.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>📍 {project.location}</span>
                    <span>👤 {project.manager}</span>
                    <span>💰 {project.budget.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectList;
