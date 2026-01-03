import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import ApiService from '../services/ApiService';

const CreateCandidateModal = ({ onClose, onCandidateCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(false);

  const { showError } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mobile) {
      showError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.createCandidate({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
      });

      onCandidateCreated(response.candidate);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create candidate';
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

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Candidate</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter candidate's full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter candidate's email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number *</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              className="form-control"
              value={formData.mobile}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter candidate's mobile number"
            />
          </div>

          <div className="alert alert-info">
            <strong>Note:</strong> Username and password will be automatically generated 
            and displayed after creation. The candidate will receive their credentials via email.
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  Creating...
                </>
              ) : (
                'Create Candidate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCandidateModal;