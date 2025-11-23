'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import ProjectList from '@/components/ProjectList';
import RiskDashboard from '@/components/RiskDashboard';
import { Project, Risk } from '@/types';
import { LogOut, Lock, User, AlertTriangle, Bell, Download, Plus, Edit2, Trash2, Save, X, TrendingUp, BarChart3 } from 'lucide-react';

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
