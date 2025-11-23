'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import ProjectList from '@/components/ProjectList';
import RiskDashboard from '@/components/RiskDashboard';
import { Project, Risk } from '@/types';
import { LogOut, Lock, User } from 'lucide-react';

const MainDashboard: React.FC = () => {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const savedRisks = localStorage.getItem('risks');
    const savedSelectedProject = localStorage.getItem('selectedProject');

    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
        
        if (savedSelectedProject) {
          const selected = parsedProjects.find((p: Project) => p.id === savedSelectedProject);
          if (selected) {
            setSelectedProject(selected);
          }
        }
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    }

    if (savedRisks) {
      try {
        setRisks(JSON.parse(savedRisks));
      } catch (e) {
        console.error('Failed to load risks', e);
      }
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Save risks to localStorage
  useEffect(() => {
    localStorage.setItem('risks', JSON.stringify(risks));
  }, [risks]);

  // Save selected project
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProject', selectedProject.id);
    }
  }, [selectedProject]);

  // Get risks for selected project
  const projectRisks = selectedProject ? risks.filter(r => r.projectId === selectedProject.id) : [];

  // Check permissions
  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  // Project operations
  const handleAddProject = (project: Project): void => {
    setProjects([...projects, project]);
    setSelectedProject(project);
  };

  const handleUpdateProject = (project: Project): void => {
    setProjects(projects.map(p => (p.id === project.id ? project : p)));
    if (selectedProject?.id === project.id) {
      setSelectedProject(project);
    }
  };

  const handleDeleteProject = (id: string): void => {
    if (!canDelete) {
      alert('Bạn không có quyền xóa dự án');
      return;
    }
    setProjects(projects.filter(p => p.id !== id));
    setRisks(risks.filter(r => r.projectId !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(projects.length > 0 ? projects[0] : null);
    }
  };

  // Risk operations
  const handleAddRisk = (risk: Risk): void => {
    setRisks([...risks, risk]);
  };

  const handleUpdateRisk = (risk: Risk): void => {
    setRisks(risks.map(r => (r.id === risk.id ? risk : r)));
  };

  const handleDeleteRisk = (id: number): void => {
    setRisks(risks.filter(r => r.id !== id));
  };

  const handleSelectProject = (project: Project): void => {
    setSelectedProject(project);
  };

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      admin: 'Quản trị viên',
      manager: 'Quản lý dự án',
      viewer: 'Xem chỉ'
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                🏗️ Risk Management System
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Construction Project Risk & CRUD Management Dashboard
              </p>
            </div>

            {/* User Info & Controls */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <User size={20} />
                  {user.username}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>

              {/* Role Switcher */}
              {(user.role === 'admin' || user.role === 'manager') && (
                <div className="flex gap-2 pl-4 border-l border-slate-300">
                  <button
                    onClick={() => switchRole('admin')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      user.role === 'admin'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => switchRole('manager')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      user.role === 'manager'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    Manager
                  </button>
                  <button
                    onClick={() => switchRole('viewer')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      user.role === 'viewer'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Viewer
                  </button>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition ml-4"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Permissions Notice */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-3">
            <Lock className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-blue-700">
              <strong>Quyền hạn của bạn:</strong>
              {user.role === 'admin' && ' Toàn quyền - Quản lý dự án, rủi ro, xóa dữ liệu'}
              {user.role === 'manager' && ' Quản lý dự án và rủi ro, nhưng không thể xóa dự án'}
              {user.role === 'viewer' && ' Chỉ xem thông tin, không thể chỉnh sửa hay xóa'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Project Sidebar */}
          <div className="lg:col-span-1">
            <ProjectList
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={handleSelectProject}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              canEdit={canEdit}
            />
          </div>

          {/* Risk Dashboard */}
          <div className="lg:col-span-3">
            <RiskDashboard
              project={selectedProject}
              risks={projectRisks}
              onAddRisk={handleAddRisk}
              onUpdateRisk={handleUpdateRisk}
              onDeleteRisk={handleDeleteRisk}
              canEdit={canEdit}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          <p>Construction Risk Management System with Project CRUD & Role-Based Access Control</p>
          <p className="text-xs mt-2 text-slate-500">
            Demo Data • No Backend Required • Local Storage • Role-Based: Admin, Manager, Viewer
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainDashboard;

// Types
interface Risk {
  id: number;
  name: string;
  category: string;
  description: string;
  phase: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  status: 'active' | 'monitored' | 'critical' | 'resolved';
  lastUpdated: string;
}

interface Alert {
  id: number;
  message: string;
  timestamp: string;
}

interface Stats {
  total: number;
  critical: number;
  high: number;
  avgRiskScore: string;
}

interface FormData {
  name: string;
  category: string;
  description: string;
  phase: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  status: 'active' | 'monitored' | 'critical' | 'resolved';
}

// Initial risk data from the document
const INITIAL_RISKS: Risk[] = [
  {
    id: 1,
    name: "Rủi ro thiết kế",
    category: "Design Risk",
    description: "Sai sót trong hồ sơ thiết kế, bản vẽ, không phù hợp điều kiện thực tế",
    phase: "Giai đoạn khảo sát, thiết kế kỹ thuật",
    severity: "high",
    probability: 0.6,
    impact: 8,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: 2,
    name: "Rủi ro tiến độ",
    category: "Schedule Risk",
    description: "Chậm tiến độ, ảnh hưởng chi phí và hiệu quả dự án",
    phase: "Suốt quá trình thi công",
    severity: "high",
    probability: 0.7,
    impact: 9,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: 3,
    name: "Rủi ro chi phí & tài chính",
    category: "Cost & Financing Risk",
    description: "Vượt chi phí, thiếu vốn, đình trệ thi công",
    phase: "Từ dự toán đến thanh toán",
    severity: "critical",
    probability: 0.65,
    impact: 10,
    status: "critical",
    lastUpdated: new Date().toISOString()
  },
  {
    id: 4,
    name: "Rủi ro an toàn lao động",
    category: "Safety Risk",
    description: "Tai nạn lao động, ảnh hưởng sức khỏe & tiến độ",
    phase: "Trong thi công",
    severity: "critical",
    probability: 0.5,
    impact: 10,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: 5,
    name: "Rủi ro môi trường",
    category: "Environmental Risk",
    description: "Ô nhiễm, tiếng ồn, nước thải, ảnh hưởng cư dân",
    phase: "Giai đoạn thi công",
    severity: "medium",
    probability: 0.4,
    impact: 6,
    status: "monitored",
    lastUpdated: new Date().toISOString()
  },
  {
    id: 6,
    name: "Rủi ro địa chất & nền móng",
    category: "Geotechnical Risk",
    description: "Điều kiện địa chất phức tạp, phát sinh chi phí xử lý nền",
    phase: "Khảo sát và thi công móng",
    severity: "high",
    probability: 0.55,
    impact: 8,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: 7,
    name: "Rủi ro thiên tai & bất khả kháng",
    category: "Force Majeure Risk",
    description: "Bão, lũ, động đất, dịch bệnh",
    phase: "Bất kỳ giai đoạn nào",
    severity: "medium",
    probability: 0.3,
    impact: 9,
    status: "monitored",
    lastUpdated: new Date().toISOString()
  }
];

const ConstructionRiskDashboard: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>(INITIAL_RISKS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    description: '',
    phase: '',
    severity: 'medium',
    probability: 0.5,
    impact: 5,
    status: 'active'
  });

  // Calculate risk score
  const calculateRiskScore = (probability: number, impact: number): string => {
    return (probability * impact).toFixed(2);
  };

  // Check for critical risks and generate alerts
  useEffect(() => {
    const criticalRisks = risks.filter(r => {
      const score = parseFloat(calculateRiskScore(r.probability, r.impact));
      return score > 7 || r.severity === 'critical';
    });
    
    const newAlerts: Alert[] = criticalRisks.map(r => ({
      id: r.id,
      message: `⚠️ ${r.name}: Risk score ${calculateRiskScore(r.probability, r.impact)} - Cần theo dõi chặt chẽ!`,
      timestamp: new Date().toLocaleString('vi-VN')
    }));
    
    setAlerts(newAlerts);
  }, [risks]);

  // CRUD Operations
  const handleAdd = (): void => {
    const newRisk: Risk = {
      ...formData,
      id: Math.max(...risks.map(r => r.id), 0) + 1,
      lastUpdated: new Date().toISOString()
    };
    setRisks([...risks, newRisk]);
    setShowAddForm(false);
    resetForm();
  };

  const handleEdit = (id: number): void => {
    const risk = risks.find(r => r.id === id);
    if (risk) {
      setFormData(risk);
      setEditingId(id);
    }
  };

  const handleUpdate = (): void => {
    setRisks(risks.map(r => 
      r.id === editingId 
        ? { ...formData, id: editingId, lastUpdated: new Date().toISOString() }
        : r
    ));
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: number): void => {
    if (confirm('Bạn có chắc muốn xóa rủi ro này?')) {
      setRisks(risks.filter(r => r.id !== id));
    }
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      category: '',
      description: '',
      phase: '',
      severity: 'medium',
      probability: 0.5,
      impact: 5,
      status: 'active'
    });
  };

  // Export to CSV
  const exportToCSV = (): void => {
    const headers = ['ID', 'Tên rủi ro', 'Loại', 'Mô tả', 'Giai đoạn', 'Mức độ', 'Xác suất', 'Tác động', 'Risk Score', 'Trạng thái'];
    const rows = risks.map(r => [
      r.id,
      r.name,
      r.category,
      r.description,
      r.phase,
      r.severity,
      r.probability,
      r.impact,
      calculateRiskScore(r.probability, r.impact),
      r.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `risk_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Statistics
  const stats: Stats = {
    total: risks.length,
    critical: risks.filter(r => r.severity === 'critical').length,
    high: risks.filter(r => r.severity === 'high').length,
    avgRiskScore: (risks.reduce((sum, r) => sum + parseFloat(calculateRiskScore(r.probability, r.impact)), 0) / risks.length).toFixed(2)
  };

  const getSeverityColor = (severity: Risk['severity']): string => {
    const colors: Record<Risk['severity'], string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[severity];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <BarChart3 className="text-blue-600" />
                Construction Risk Management Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Hệ thống quản lý rủi ro dự án xây dựng - Manager View</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Download size={20} />
                Xuất báo cáo CSV
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Thêm rủi ro
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-slate-600 text-sm">Tổng số rủi ro</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="text-red-600 text-sm">Rủi ro nghiêm trọng</div>
            <div className="text-3xl font-bold text-red-700 mt-2">{stats.critical}</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="text-orange-600 text-sm">Rủi ro cao</div>
            <div className="text-3xl font-bold text-orange-700 mt-2">{stats.high}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-blue-600 text-sm">Risk Score trung bình</div>
            <div className="text-3xl font-bold text-blue-700 mt-2">{stats.avgRiskScore}</div>
          </div>
        </div>

        {/* Real-time Alerts */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800 font-semibold mb-3">
              <Bell className="animate-pulse" />
              Cảnh báo thời gian thực ({alerts.length})
            </div>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="text-sm text-red-700 bg-white p-3 rounded">
                  {alert.message}
                  <span className="text-xs text-slate-500 ml-2">- {alert.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {editingId ? 'Chỉnh sửa rủi ro' : 'Thêm rủi ro mới'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Tên rủi ro"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="border border-slate-300 rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Loại rủi ro (Risk category)"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="border border-slate-300 rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Giai đoạn"
                value={formData.phase}
                onChange={(e) => setFormData({...formData, phase: e.target.value})}
                className="border border-slate-300 rounded-lg px-4 py-2"
              />
              <select
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value as Risk['severity']})}
                className="border border-slate-300 rounded-lg px-4 py-2"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="critical">Nghiêm trọng</option>
              </select>
              <div>
                <label className="text-sm text-slate-600">Xác suất: {formData.probability}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.probability}
                  onChange={(e) => setFormData({...formData, probability: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Tác động: {formData.impact}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.impact}
                  onChange={(e) => setFormData({...formData, impact: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as Risk['status']})}
                className="border border-slate-300 rounded-lg px-4 py-2"
              >
                <option value="active">Đang hoạt động</option>
                <option value="monitored">Theo dõi</option>
                <option value="critical">Cần xử lý ngay</option>
                <option value="resolved">Đã giải quyết</option>
              </select>
              <textarea
                placeholder="Mô tả rủi ro"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="border border-slate-300 rounded-lg px-4 py-2 md:col-span-2"
                rows={3}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={editingId ? handleUpdate : handleAdd}
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

        {/* Risk Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Tên rủi ro</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Giai đoạn</th>
                  <th className="px-4 py-3 text-center">Mức độ</th>
                  <th className="px-4 py-3 text-center">Risk Score</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {risks.map(risk => (
                  <tr key={risk.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono text-sm">{risk.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{risk.name}</div>
                      <div className="text-sm text-slate-600">{risk.description}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{risk.category}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{risk.phase}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(risk.severity)}`}>
                        {risk.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-lg text-slate-800">
                        {calculateRiskScore(risk.probability, risk.impact)}
                      </div>
                      <div className="text-xs text-slate-500">
                        P: {risk.probability} × I: {risk.impact}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{risk.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(risk.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(risk.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>Construction Risk Management System - Manager Dashboard</p>
          <p className="text-xs mt-1">Dữ liệu được lưu trữ trong memory, reset khi refresh trang</p>
        </div>
      </div>
    </div>
  );
};

export default ConstructionRiskDashboard;