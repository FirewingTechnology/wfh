import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ApiService from '../services/ApiService';
import SubmitTaskModal from '../components/SubmitTaskModal';
import './CandidateDashboard.css';

const CandidateDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const { user, logout } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const tasksData = await ApiService.getCandidateTasks();
      setTasks(tasksData);
    } catch (error) {
      showError('Failed to load tasks');
      console.error('Tasks load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTask = async (task) => {
    try {
      showInfo('Downloading task...');
      const response = await ApiService.downloadTask(task.id);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `${task.task_name.replace(/[^a-z0-9]/gi, '_')}_task.zip`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Task downloaded successfully!');
      
      // Refresh tasks to update status
      await loadTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to download task';
      showError(errorMessage);
    }
  };

  const handleSubmitTask = (task) => {
    setSelectedTask(task);
    setShowSubmitModal(true);
  };

  const handleTaskSubmitted = () => {
    setShowSubmitModal(false);
    setSelectedTask(null);
    loadTasks(); // Refresh tasks
    showSuccess('Task submitted successfully!');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      assigned: { class: 'badge-info', text: 'New Task' },
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

  const isDeadlineNear = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursDiff = (deadlineDate - now) / (1000 * 60 * 60);
    return hoursDiff <= 24 && hoursDiff > 0;
  };

  const isDeadlinePassed = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < now;
  };

  const getTaskCardClass = (task) => {
    let className = 'task-card';
    if (task.status === 'submitted') {
      className += ' submitted';
    } else if (isDeadlinePassed(task.deadline)) {
      className += ' overdue';
    } else if (isDeadlineNear(task.deadline)) {
      className += ' due-soon';
    }
    return className;
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Candidate Dashboard</h1>
            <p>Welcome, {user?.username}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="card">
              <h2>No Tasks Assigned</h2>
              <p>You don't have any tasks assigned yet. Please check back later or contact your administrator.</p>
            </div>
          </div>
        ) : (
          <div className="tasks-section">
            <div className="section-header">
              <h2>Your Tasks ({tasks.length})</h2>
              <button 
                className="btn btn-outline" 
                onClick={loadTasks}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            <div className="tasks-grid">
              {tasks.map(task => (
                <div key={task.id} className={getTaskCardClass(task)}>
                  <div className="task-header">
                    <h3 className="task-title">{task.task_name}</h3>
                    {getStatusBadge(task.status)}
                  </div>

                  {task.description && (
                    <div className="task-description">
                      <p>{task.description}</p>
                    </div>
                  )}

                  <div className="task-details">
                    <div className="task-detail-item">
                      <span className="detail-label">Assigned Date:</span>
                      <span className="detail-value">
                        {formatDate(task.created_at)}
                      </span>
                    </div>
                    <div className="task-detail-item">
                      <span className="detail-label">Deadline:</span>
                      <span className={`detail-value ${
                        isDeadlinePassed(task.deadline) ? 'text-danger' : 
                        isDeadlineNear(task.deadline) ? 'text-warning' : ''
                      }`}>
                        {formatDate(task.deadline)}
                        {isDeadlinePassed(task.deadline) && ' (Overdue)'}
                        {isDeadlineNear(task.deadline) && !isDeadlinePassed(task.deadline) && ' (Due Soon)'}
                      </span>
                    </div>
                  </div>

                  <div className="task-actions">
                    {task.status === 'assigned' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleDownloadTask(task)}
                        disabled={isDeadlinePassed(task.deadline)}
                      >
                        Download Task
                      </button>
                    )}
                    
                    {task.status === 'downloaded' && !isDeadlinePassed(task.deadline) && (
                      <>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleDownloadTask(task)}
                        >
                          Download Again
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={() => handleSubmitTask(task)}
                        >
                          Submit Task
                        </button>
                      </>
                    )}

                    {task.status === 'downloaded' && isDeadlinePassed(task.deadline) && (
                      <div className="alert alert-error">
                        <small>Submission deadline has passed</small>
                      </div>
                    )}
                    
                    {task.status === 'submitted' && (
                      <div className="submitted-info">
                        <span className="text-success">
                          ✓ Task submitted successfully
                        </span>
                      </div>
                    )}

                    {task.status === 'assigned' && isDeadlinePassed(task.deadline) && (
                      <div className="alert alert-error">
                        <small>Task deadline has passed</small>
                      </div>
                    )}
                  </div>

                  {isDeadlineNear(task.deadline) && !isDeadlinePassed(task.deadline) && (
                    <div className="deadline-warning">
                      ⚠️ Deadline is approaching! Please submit your work soon.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Submit Task Modal */}
      {showSubmitModal && selectedTask && (
        <SubmitTaskModal
          task={selectedTask}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedTask(null);
          }}
          onTaskSubmitted={handleTaskSubmitted}
        />
      )}
    </div>
  );
};

export default CandidateDashboard;