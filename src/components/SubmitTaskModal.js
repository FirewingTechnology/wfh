import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import ApiService from '../services/ApiService';

const SubmitTaskModal = ({ task, onClose, onTaskSubmitted }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { showError, showInfo } = useNotification();

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/zip') {
      setSelectedFile(file);
      showInfo(`Selected file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      showError('Please select a valid ZIP file');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showError('Please select a ZIP file to submit');
      return;
    }

    // Check deadline
    const now = new Date();
    const deadline = new Date(task.deadline);
    if (now > deadline) {
      showError('Cannot submit task: deadline has passed');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('submission', selectedFile);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      await ApiService.submitTask(task.id, formData);
      onTaskSubmitted();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit task';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlineNear = () => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const hoursDiff = (deadline - now) / (1000 * 60 * 60);
    return hoursDiff <= 24 && hoursDiff > 0;
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" style={{ minWidth: '500px' }}>
        <div className="modal-header">
          <h3>Submit Task: {task.task_name}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="task-info" style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '500' }}>Task Name:</span>
            <span>{task.task_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '500' }}>Deadline:</span>
            <span style={{ color: isDeadlineNear() ? '#ffc107' : '#333' }}>
              {formatDate(task.deadline)}
              {isDeadlineNear() && ' (Due Soon!)'}
            </span>
          </div>
          {task.description && (
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>Description:</span>
              <span style={{ color: '#6c757d' }}>{task.description}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Submission File (ZIP) *</label>
            <div
              className={`file-upload-area ${dragOver ? 'dragover' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !loading && document.getElementById('submissionFile').click()}
            >
              <input
                type="file"
                id="submissionFile"
                accept=".zip"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                disabled={loading}
              />
              {selectedFile ? (
                <div>
                  <strong>{selectedFile.name}</strong><br />
                  <small>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
              ) : (
                <div>
                  <p><strong>Drop your completed work here or click to browse</strong></p>
                  <small>Only ZIP files are allowed. Maximum size: 50MB</small>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Submission Notes (Optional)</label>
            <textarea
              id="notes"
              className="form-control"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              placeholder="Add any notes about your submission (optional)..."
            />
          </div>

          {isDeadlineNear() && (
            <div className="alert alert-warning">
              <strong>Warning:</strong> The deadline is approaching! 
              Please ensure your work is complete before submitting.
            </div>
          )}

          <div className="alert alert-info">
            <strong>Important:</strong> Once submitted, you cannot resubmit this task. 
            Please ensure your work is complete and the correct file is selected.
          </div>

          <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  Submitting...
                </>
              ) : (
                'Submit Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitTaskModal;