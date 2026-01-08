import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ApiService from '../services/ApiService';
import CreateCandidateModal from '../components/CreateCandidateModal';
import UploadTaskModal from '../components/UploadTaskModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [candidates, setCandidates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateCandidate, setShowCreateCandidate] = useState(false);
  const [showUploadTask, setShowUploadTask] = useState(false);

  const { user, logout } = useAuth();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [candidatesData, tasksData] = await Promise.all([
        ApiService.getCandidates(),
        ApiService.getAdminTasks()
      ]);
      setCandidates(candidatesData);
      setTasks(tasksData);
    } catch (error) {
      showError('Failed to load dashboard data');
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateCreated = (newCandidate) => {
    setCandidates(prev => [newCandidate, ...prev]);
    setShowCreateCandidate(false);
    showSuccess('Candidate created successfully!');
  };

  const handleTaskUploaded = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    setShowUploadTask(false);
    showSuccess('Task uploaded and assigned successfully!');
  };

  const handleDeleteCandidate = async (candidateId, candidateName) => {
    if (window.confirm(`Are you sure you want to delete candidate "${candidateName}"? This action cannot be undone.`)) {
      try {
        await ApiService.deleteCandidate(candidateId);
        setCandidates(prev => prev.filter(candidate => candidate.id !== candidateId));
        showSuccess('Candidate deleted successfully!');
      } catch (error) {
        showError('Failed to delete candidate');
        console.error('Delete candidate error:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      assigned: { class: 'badge-info', text: 'Assigned' },
      downloaded: { class: 'badge-warning', text: 'Downloaded' },
      submitted: { class: 'badge-success', text: 'Submitted' },
      completed: { class: 'badge-success', text: 'Completed' },
    };
    const statusInfo = statusMap[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDashboardStats = () => {
    const totalCandidates = candidates.length;
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => task.current_status !== 'submitted').length;
    const completedTasks = tasks.filter(task => task.current_status === 'submitted').length;

    return {
      totalCandidates,
      totalTasks,
      pendingTasks,
      completedTasks
    };
  };

  const stats = getDashboardStats();

  if (loading && candidates.length === 0 && tasks.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Admin Portal</h1>
            <p>Welcome back, {user?.username}</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-outline"
              onClick={() => setShowCreateCandidate(true)}
            >
              Create Candidate
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowUploadTask(true)}
            >
              Upload Task
            </button>
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`nav-btn ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          Candidates ({candidates.length})
        </button>
        <button
          className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks ({tasks.length})
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalCandidates}</div>
                <div className="stat-label">Total Candidates</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalTasks}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.pendingTasks}</div>
                <div className="stat-label">Pending Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.completedTasks}</div>
                <div className="stat-label">Completed Tasks</div>
              </div>
            </div>

            <div className="overview-cards">
              <div className="card">
                <h3>Recent Tasks</h3>
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="overview-item">
                    <div className="item-info">
                      <div className="item-title">{task.task_name}</div>
                      <div className="item-subtitle">
                        Assigned to: {task.assigned_to_name || 'Unassigned'}
                      </div>
                    </div>
                    <div className="item-status">
                      {getStatusBadge(task.current_status)}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-muted">No tasks created yet.</p>
                )}
              </div>

              <div className="card">
                <h3>Recent Candidates</h3>
                {candidates.slice(0, 5).map(candidate => (
                  <div key={candidate.id} className="overview-item">
                    <div className="item-info">
                      <div className="item-title">{candidate.username}</div>
                      <div className="item-subtitle">{candidate.email}</div>
                    </div>
                    <div className="item-status">
                      <span className="badge badge-info">Active</span>
                    </div>
                  </div>
                ))}
                {candidates.length === 0 && (
                  <p className="text-muted">No candidates created yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="candidates-section">
            <div className="section-header">
              <h2>Candidates</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateCandidate(true)}
              >
                Create New Candidate
              </button>
            </div>

            <div className="card">
              {candidates.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(candidate => (
                      <tr key={candidate.id}>
                        <td>{candidate.username}</td>
                        <td>{candidate.email}</td>
                        <td>{candidate.mobile}</td>
                        <td>{formatDate(candidate.created_at)}</td>
                        <td>
                          <span className="badge badge-success">Active</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCandidate(candidate.id, candidate.username)}
                            title="Delete candidate"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No candidates found.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateCandidate(true)}
                  >
                    Create Your First Candidate
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <div className="section-header">
              <h2>Tasks</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowUploadTask(true)}
              >
                Upload New Task
              </button>
            </div>

            <div className="card">
              {tasks.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Assigned To</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <div className="task-title">{task.task_name}</div>
                          {task.description && (
                            <div className="task-description">{task.description}</div>
                          )}
                        </td>
                        <td>{task.assigned_to_name || 'Unassigned'}</td>
                        <td>{formatDate(task.deadline)}</td>
                        <td>{getStatusBadge(task.current_status)}</td>
                        <td>{formatDate(task.created_at)}</td>
                        <td>
                          {task.submitted_at ? formatDate(task.submitted_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No tasks found.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowUploadTask(true)}
                  >
                    Upload Your First Task
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateCandidate && (
        <CreateCandidateModal
          onClose={() => setShowCreateCandidate(false)}
          onCandidateCreated={handleCandidateCreated}
        />
      )}

      {showUploadTask && (
        <UploadTaskModal
          candidates={candidates}
          onClose={() => setShowUploadTask(false)}
          onTaskUploaded={handleTaskUploaded}
        />
      )}
    </div>
  );
};

export default AdminDashboard;