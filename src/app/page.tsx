'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import ProjectList from '@/components/ProjectList';
import RiskDashboard from '@/components/RiskDashboard';
import NotificationCenter from '@/components/NotificationCenter';
import AuditLogViewer from '@/components/AuditLogViewer';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { Project, Risk } from '@/types';
import { LogOut, Lock, User, AlertTriangle, Bell, Download, Plus, Edit2, Trash2, Save, X, TrendingUp, BarChart3 } from 'lucide-react';

const MainDashboard: React.FC = () => {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [activeTab, setActiveTab] = useState<'risks' | 'analytics' | 'audit'>('risks');
  const [notificationCount, setNotificationCount] = useState(0);

  // Initialize demo data if empty
  const initializeDemo = (): void => {
    const demoProjects: Project[] = [
      {
        id: '1',
        name: 'Dự án Xây dựng Cao ốc A',
        description: 'Dự án xây dựng tòa nhà 30 tầng tại khu đô thị mới',
        location: 'Quận Thanh Xuân, Hà Nội',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2025-12-31',
        manager: 'Nguyễn Văn A',
        budget: 500000000,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Dự án Khu Công Nghiệp B',
        description: 'Xây dựng cơ sở hạ tầng cho khu công nghiệp 150ha',
        location: 'Hưng Yên',
        status: 'planning',
        startDate: '2025-03-01',
        endDate: '2027-06-30',
        manager: 'Trần Thị B',
        budget: 800000000,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const demoRisks: Risk[] = [
      {
        id: 1,
        projectId: '1',
        stt: 1,
        name: 'Thiếu lao động',
        what: 'Không đủ nhân công để thực hiện công tác xây dựng',
        when: 'Giai đoạn thi công chính (tháng 3-9)',
        how: 'Nhu cầu nhân công cao, thị trường lao động khan hiếm, điều kiện sống khó khăn',
        solution: 'Ký kết hợp đồng lâu dài với các đơn vị cung cấp lao động, cải thiện điều kiện ăn ở',
        severity: 'high',
        probability: 0.7,
        impact: 8,
        riskScore: 5.6,
        status: 'active',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'admin',
        lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        projectId: '1',
        stt: 2,
        name: 'Vật liệu xây dựng giá cao',
        what: 'Chi phí vật liệu tăng đột ngột, vượt quá dự toán',
        when: 'Bất kỳ lúc nào trong quá trình xây dựng',
        how: 'Biến động thị trường, biến động tỷ giá, chi phí vận chuyển tăng',
        solution: 'Ký kết hợp đồng cung cấp vật liệu có giá cố định, tìm nhà cung cấp dự phòng',
        severity: 'medium',
        probability: 0.6,
        impact: 7,
        riskScore: 4.2,
        status: 'monitored',
        createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'manager',
        lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        projectId: '1',
        stt: 3,
        name: 'Sự cố an toàn lao động',
        what: 'Tai nạn lao động có thể xảy ra tại công trường',
        when: 'Trong suốt giai đoạn xây dựng',
        how: 'Không tuân thủ quy định an toàn, thiết bị bảo vệ không đầy đủ',
        solution: 'Đào tạo kỹ năng an toàn, kiểm tra quy trình thường xuyên, cấu trang bị bảo vệ đầy đủ',
        severity: 'critical',
        probability: 0.3,
        impact: 10,
        riskScore: 3.0,
        status: 'active',
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'admin',
        lastUpdated: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        projectId: '1',
        stt: 4,
        name: 'Vấn đề môi trường',
        what: 'Ô nhiễm môi trường từ hoạt động xây dựng',
        when: 'Giai đoạn thi công',
        how: 'Khí thải từ máy móc, tiếng ồn, bụi từ quá trình xây dựng',
        solution: 'Sử dụng máy móc hiện đại, che chắn công trường, dùng nước phun bụi',
        severity: 'medium',
        probability: 0.8,
        impact: 5,
        riskScore: 4.0,
        status: 'resolved',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'manager',
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        projectId: '1',
        stt: 5,
        name: 'Thiết kế không phù hợp',
        what: 'Thiết kế ban đầu không phù hợp với điều kiện thực tế',
        when: 'Phát hiện trong quá trình thi công',
        how: 'Điều tra địa chất chưa kỹ, thiết kế không tính đến yếu tố địa phương',
        solution: 'Tư vấn thiết kế lại, phân tích kỹ lưỡng trước khi thi công',
        severity: 'high',
        probability: 0.4,
        impact: 9,
        riskScore: 3.6,
        status: 'active',
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'admin',
        lastUpdated: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 6,
        projectId: '2',
        stt: 1,
        name: 'Điều kiện thời tiết',
        what: 'Thời tiết xấu ảnh hưởng đến tiến độ xây dựng',
        when: 'Mùa mưa bão (tháng 7-10)',
        how: 'Mưa lớn, gió mạnh làm ngừng thi công',
        solution: 'Lên kế hoạch thi công tránh mùa mưa, xây dựng hệ thống thoát nước',
        severity: 'medium',
        probability: 0.7,
        impact: 6,
        riskScore: 4.2,
        status: 'active',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'manager',
        lastUpdated: new Date().toISOString()
      }
    ];

    localStorage.setItem('projects', JSON.stringify(demoProjects));
    localStorage.setItem('risks', JSON.stringify(demoRisks));
    setProjects(demoProjects);
    setRisks(demoRisks);
    setSelectedProject(demoProjects[0]);
    localStorage.setItem('selectedProject', demoProjects[0].id);
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const savedRisks = localStorage.getItem('risks');
    const savedSelectedProject = localStorage.getItem('selectedProject');

    if (!savedProjects || JSON.parse(savedProjects).length === 0) {
      // Initialize demo data if empty
      initializeDemo();
    } else {
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
              <NotificationCenter onNotificationsLoad={setNotificationCount} />
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
              {user.role === 'admin' && (
                <div className="flex gap-2 pl-4 border-l border-slate-300">
                  <button
                    onClick={() => switchRole('admin' as any)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      (user.role as string) === 'admin'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => switchRole('manager' as any)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      (user.role as string) === 'manager'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    Manager
                  </button>
                  <button
                    onClick={() => switchRole('viewer' as any)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      (user.role as string) === 'viewer'
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
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setActiveTab('risks')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
                activeTab === 'risks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <AlertTriangle size={18} className="inline mr-2" />
              Quản lý rủi ro
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <BarChart3 size={18} className="inline mr-2" />
              Phân tích & Báo cáo
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
                activeTab === 'audit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <TrendingUp size={18} className="inline mr-2" />
              Lịch sử thay đổi
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'risks' && (
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
        )}

        {activeTab === 'analytics' && (
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

            {/* Analytics Dashboard */}
            <div className="lg:col-span-3">
              <AnalyticsDashboard risks={projectRisks} project={selectedProject} />
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
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

            {/* Audit Log Viewer */}
            <div className="lg:col-span-3">
              <AuditLogViewer projectId={selectedProject?.id} limit={50} />
            </div>
          </div>
        )}
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
