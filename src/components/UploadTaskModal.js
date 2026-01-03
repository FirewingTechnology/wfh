import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import ApiService from '../services/ApiService';

const UploadTaskModal = ({ candidates, onClose, onTaskUploaded }) => {
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    assignedTo: '',
    deadline: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { showError, showInfo } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    
    if (!formData.taskName || !formData.assignedTo || !formData.deadline || !selectedFile) {
      showError('Please fill in all required fields and select a ZIP file');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('taskName', formData.taskName.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('assignedTo', formData.assignedTo);
      formDataToSend.append('deadline', formData.deadline);
      formDataToSend.append('zipFile', selectedFile);

      const response = await ApiService.uploadTask(formDataToSend);
      onTaskUploaded(response.task);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to upload task';
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

  // Set minimum date to today
  const today = new Date();
  const minDateTime = today.toISOString().slice(0, 16);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" style={{ minWidth: '500px' }}>
        <div className="modal-header">
          <h3>Upload Task</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taskName">Task Name *</label>
            <input
              type="text"
              id="taskName"
              name="taskName"
              className="form-control"
              value={formData.taskName}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter task name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Enter task description (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assign to Candidate *</label>
            <select
              id="assignedTo"
              name="assignedTo"
              className="form-control"
              value={formData.assignedTo}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              <option value="">Select a candidate</option>
              {candidates.map(candidate => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.username} ({candidate.email})
                </option>
              ))}
            </select>
            {candidates.length === 0 && (
              <small className="form-text" style={{ color: '#dc3545' }}>
                No candidates available. Please create a candidate first.
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Deadline *</label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              className="form-control"
              value={formData.deadline}
              onChange={handleInputChange}
              required
              disabled={loading}
              min={minDateTime}
            />
          </div>

          <div className="form-group">
            <label>ZIP File *</label>
            <div
              className={`file-upload-area ${dragOver ? 'dragover' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !loading && document.getElementById('zipFile').click()}
            >
              <input
                type="file"
                id="zipFile"
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
                  <p><strong>Drop ZIP file here or click to browse</strong></p>
                  <small>Only ZIP files are allowed. Maximum size: 50MB</small>
                </div>
              )}
            </div>
          </div>

          <div className="alert alert-warning">
            <strong>Important:</strong> The ZIP file must contain at least 5 files. 
            The file will be validated before assignment.
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
              className="btn btn-primary"
              disabled={loading || candidates.length === 0}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  Uploading...
                </>
              ) : (
                'Upload Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadTaskModal;