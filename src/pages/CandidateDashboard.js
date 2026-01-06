import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './CandidateDashboard.css';

const CandidateDashboard = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    serialNo: '',
    title: '',
    firstName: '',
    lastName: '',
    initial: '',
    email: '',
    fatherName: '',
    dob: '',
    gender: '',
    profession: '',
    mailingStreet: '',
    mailingCity: '',
    mailingPostalCode: '',
    mailingCountry: '',
    serviceProvider: '',
    fileNo: '',
    referenceNo: '',
    simNo: '',
    typeOfNetwork: '',
    cellModelNo: '',
    imei1: '',
    imei2: '',
    typeOfPlan: '',
    creditCardType: '',
    contractValue: '',
    dateOfIssue: '',
    dateOfRenewal: '',
    installment: '',
    amountInWords: '',
    remarks: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchSubmissions();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/candidate/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : (data.tasks || []));
      } else {
        showError('Failed to load tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showError('Error loading tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/candidate/my-submissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleDownloadTask = async (taskId) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/candidate/download/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `task-${taskId}.zip`;
        a.click();
        showSuccess('Task downloaded successfully');
      } else {
        showError('Failed to download task');
      }
    } catch (error) {
      console.error('Error downloading task:', error);
      showError('Error downloading task');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadFile) {
      showError('Please select a file to upload');
      return;
    }

    if (!selectedTask) {
      showError('Please select a task');
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken');
      const submitFormData = new FormData();
      submitFormData.append('taskId', selectedTask.id);
      submitFormData.append('file', uploadFile);
      submitFormData.append('notes', formData.remarks || '');

      const response = await fetch(`http://localhost:5000/api/candidate/submit/${selectedTask.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitFormData
      });

      if (response.ok) {
        showSuccess('File uploaded successfully');
        setUploadFile(null);
        setSelectedTask(null);
        fetchTasks();
        fetchSubmissions();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Error uploading file');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    showSuccess('Form details saved. You can now upload your file.');
  };

  if (!isAuthenticated || !user || user.role !== 'candidate') {
    return <Navigate to="/candidate" replace />;
  }

  return (
    <div className="candidate-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Candidate Dashboard</h1>
        <p>Welcome, {user.username}</p>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload File
        </button>
        <button 
          className={`tab-btn ${activeTab === 'filelist' ? 'active' : ''}`}
          onClick={() => setActiveTab('filelist')}
        >
          📋 File List
        </button>
        <button 
          className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          🧮 Calculator
        </button>
      </nav>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <section className="tab-content">
          <div className="dashboard-grid">
            <div className="grid-item">
              <div className="icon">📤</div>
              <h3>Upload File</h3>
              <p>Submit your task files</p>
            </div>
            <div className="grid-item">
              <div className="icon">📋</div>
              <h3>File List</h3>
              <p>View assigned tasks</p>
            </div>
            <div className="grid-item">
              <div className="icon">🧮</div>
              <h3>Calculator</h3>
              <p>Calculation tools</p>
            </div>
            <div className="grid-item">
              <div className="icon">📊</div>
              <h3>Dashboard</h3>
              <p>Task overview</p>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <h2>No Tasks Assigned</h2>
              <p>You don't have any tasks assigned yet. Please check back later or contact your administrator.</p>
            </div>
          ) : (
            <div className="tasks-section">
              <h2>Assigned Tasks</h2>
              <div className="tasks-grid">
                {tasks.map(task => (
                  <div key={task.id} className="task-card">
                    <h3>{task.task_name}</h3>
                    <p>{task.description}</p>
                    <div className="task-details">
                      <span className={`status ${task.status}`}>{task.status}</span>
                      <span className="deadline">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="task-actions">
                      <button 
                        onClick={() => handleDownloadTask(task.id)}
                        className="btn btn-primary"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Upload File Tab */}
      {activeTab === 'upload' && (
        <section className="tab-content upload-section">
          <div className="upload-container">
            <div className="details-panel">
              <h2>Details</h2>
              <div className="details-info">
                <div className="detail-item"><label>Serial No</label><span>: {formData.serialNo || '-'}</span></div>
                <div className="detail-item"><label>First Name</label><span>: {formData.firstName || '-'}</span></div>
                <div className="detail-item"><label>Initial</label><span>: {formData.initial || '-'}</span></div>
                <div className="detail-item"><label>Father Name</label><span>: {formData.fatherName || '-'}</span></div>
                <div className="detail-item"><label>Gender</label><span>: {formData.gender || '-'}</span></div>
                <div className="detail-item"><label>Profession</label><span>: {formData.profession || '-'}</span></div>
                <div className="detail-item"><label>Mailing Street</label><span>: {formData.mailingStreet || '-'}</span></div>
                <div className="detail-item"><label>Mailing City</label><span>: {formData.mailingCity || '-'}</span></div>
                <div className="detail-item"><label>Mailing Postal Code</label><span>: {formData.mailingPostalCode || '-'}</span></div>
                <div className="detail-item"><label>Mailing Country</label><span>: {formData.mailingCountry || '-'}</span></div>
                <div className="detail-item"><label>Service Provider</label><span>: {formData.serviceProvider || '-'}</span></div>
                <div className="detail-item"><label>File No</label><span>: {formData.fileNo || '-'}</span></div>
                <div className="detail-item"><label>Reference No</label><span>: {formData.referenceNo || '-'}</span></div>
                <div className="detail-item"><label>Sim No</label><span>: {formData.simNo || '-'}</span></div>
                <div className="detail-item"><label>Type Of Network</label><span>: {formData.typeOfNetwork || '-'}</span></div>
                <div className="detail-item"><label>Cell Model No</label><span>: {formData.cellModelNo || '-'}</span></div>
                <div className="detail-item"><label>IMEI 1</label><span>: {formData.imei1 || '-'}</span></div>
                <div className="detail-item"><label>IMEI 2</label><span>: {formData.imei2 || '-'}</span></div>
                <div className="detail-item"><label>Type Of Plan</label><span>: {formData.typeOfPlan || '-'}</span></div>
                <div className="detail-item"><label>Credit Card Type</label><span>: {formData.creditCardType || '-'}</span></div>
                <div className="detail-item"><label>Contract Value</label><span>: {formData.contractValue || '-'}</span></div>
                <div className="detail-item"><label>Date Of Issue</label><span>: {formData.dateOfIssue || '-'}</span></div>
                <div className="detail-item"><label>Date Of Renewal</label><span>: {formData.dateOfRenewal || '-'}</span></div>
                <div className="detail-item"><label>Installment</label><span>: {formData.installment || '-'}</span></div>
              </div>
            </div>

            <div className="form-panel">
              <h2>Form Details</h2>
              <form onSubmit={handleFormSubmit} className="form-grid">
                <div className="form-group"><label>Serial No</label><input type="text" name="serialNo" value={formData.serialNo} onChange={handleFormChange} placeholder="Enter Serial No" /></div>
                <div className="form-group"><label>Title</label><input type="text" name="title" value={formData.title} onChange={handleFormChange} placeholder="Enter Title" /></div>
                <div className="form-group"><label>First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} placeholder="Enter First Name" /></div>
                <div className="form-group"><label>Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleFormChange} placeholder="Enter Last Name" /></div>
                <div className="form-group"><label>Initial</label><input type="text" name="initial" value={formData.initial} onChange={handleFormChange} placeholder="Enter Initial" /></div>
                <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Enter Email" /></div>
                <div className="form-group"><label>Father Name</label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleFormChange} placeholder="Enter Father Name" /></div>
                <div className="form-group"><label>DOB</label><input type="date" name="dob" value={formData.dob} onChange={handleFormChange} /></div>
                <div className="form-group"><label>Gender</label><select name="gender" value={formData.gender} onChange={handleFormChange}><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                <div className="form-group"><label>Profession</label><input type="text" name="profession" value={formData.profession} onChange={handleFormChange} placeholder="Enter Profession" /></div>
                <div className="form-group"><label>Mailing Street</label><input type="text" name="mailingStreet" value={formData.mailingStreet} onChange={handleFormChange} placeholder="Enter Mailing Street" /></div>
                <div className="form-group"><label>Mailing City</label><input type="text" name="mailingCity" value={formData.mailingCity} onChange={handleFormChange} placeholder="Enter Mailing City" /></div>
                <div className="form-group"><label>Mailing Postal Code</label><input type="text" name="mailingPostalCode" value={formData.mailingPostalCode} onChange={handleFormChange} placeholder="Enter Postal Code" /></div>
                <div className="form-group"><label>Mailing Country</label><input type="text" name="mailingCountry" value={formData.mailingCountry} onChange={handleFormChange} placeholder="Enter Country" /></div>
                <div className="form-group"><label>Service Provider</label><input type="text" name="serviceProvider" value={formData.serviceProvider} onChange={handleFormChange} placeholder="Enter Service Provider" /></div>
                <div className="form-group"><label>File No</label><input type="text" name="fileNo" value={formData.fileNo} onChange={handleFormChange} placeholder="Enter File No" /></div>
                <div className="form-group"><label>Reference No</label><input type="text" name="referenceNo" value={formData.referenceNo} onChange={handleFormChange} placeholder="Enter Reference No" /></div>
                <div className="form-group"><label>Sim No</label><input type="text" name="simNo" value={formData.simNo} onChange={handleFormChange} placeholder="Enter Sim No" /></div>
                <div className="form-group"><label>Type Of Network</label><input type="text" name="typeOfNetwork" value={formData.typeOfNetwork} onChange={handleFormChange} placeholder="Enter Type Of Network" /></div>
                <div className="form-group"><label>Cell Model No</label><input type="text" name="cellModelNo" value={formData.cellModelNo} onChange={handleFormChange} placeholder="Enter Cell Model No" /></div>
                <div className="form-group"><label>IMEI 1</label><input type="text" name="imei1" value={formData.imei1} onChange={handleFormChange} placeholder="Enter IMEI 1" /></div>
                <div className="form-group"><label>IMEI 2</label><input type="text" name="imei2" value={formData.imei2} onChange={handleFormChange} placeholder="Enter IMEI 2" /></div>
                <div className="form-group"><label>Type Of Plan</label><input type="text" name="typeOfPlan" value={formData.typeOfPlan} onChange={handleFormChange} placeholder="Enter Type Of Plan" /></div>
                <div className="form-group"><label>Credit Card Type</label><input type="text" name="creditCardType" value={formData.creditCardType} onChange={handleFormChange} placeholder="Enter Credit Card Type" /></div>
                <div className="form-group"><label>Contract Value</label><input type="text" name="contractValue" value={formData.contractValue} onChange={handleFormChange} placeholder="Enter Contract Value" /></div>
                <div className="form-group"><label>Date Of Issue</label><input type="date" name="dateOfIssue" value={formData.dateOfIssue} onChange={handleFormChange} /></div>
                <div className="form-group"><label>Date Of Renewal</label><input type="date" name="dateOfRenewal" value={formData.dateOfRenewal} onChange={handleFormChange} /></div>
                <div className="form-group"><label>Installment</label><input type="text" name="installment" value={formData.installment} onChange={handleFormChange} placeholder="Enter Installment" /></div>
                <div className="form-group"><label>Amount In Words</label><input type="text" name="amountInWords" value={formData.amountInWords} onChange={handleFormChange} placeholder="Enter Amount In Words" /></div>
                <div className="form-group full-width"><label>Remarks</label><textarea name="remarks" value={formData.remarks} onChange={handleFormChange} placeholder="Enter Remarks" rows="4"></textarea></div>
                <button type="submit" className="btn btn-submit">Submit Form</button>
              </form>
            </div>
          </div>

          <div className="file-upload-section">
            <h2>Upload Your Work File</h2>
            <form onSubmit={handleFileUpload} className="upload-form">
              <div className="form-group">
                <label htmlFor="task-select">Select Task *</label>
                <select id="task-select" value={selectedTask ? selectedTask.id : ''} onChange={(e) => { const task = tasks.find(t => t.id === parseInt(e.target.value)); setSelectedTask(task); }} required>
                  <option value="">Choose a task</option>
                  {tasks.map(task => (<option key={task.id} value={task.id}>{task.task_name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="file-input">Select File *</label>
                <div className="file-input-wrapper">
                  <input id="file-input" type="file" onChange={(e) => setUploadFile(e.target.files[0])} required />
                  <span className="file-name">{uploadFile ? uploadFile.name : 'No file selected'}</span>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-large">📤 Upload File</button>
            </form>
          </div>
        </section>
      )}

      {/* File List Tab */}
      {activeTab === 'filelist' && (
        <section className="tab-content">
          <h2>File List</h2>
          {submissions.length === 0 ? (
            <div className="empty-state"><p>No files uploaded yet</p></div>
          ) : (
            <table className="files-table">
              <thead><tr><th>File Name</th><th>Task</th><th>Submitted Date</th><th>Status</th></tr></thead>
              <tbody>
                {submissions.map(submission => (
                  <tr key={submission.id}>
                    <td>{submission.file_path}</td>
                    <td>{tasks.find(t => t.id === submission.task_id)?.task_name || 'Unknown'}</td>
                    <td>{new Date(submission.submitted_at).toLocaleDateString()}</td>
                    <td><span className="status-badge">{submission.is_evaluated ? 'Evaluated' : 'Pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <section className="tab-content">
          <div className="calculator-container">
            <h2>Calculator Tool</h2>
            <iframe title="Calculator" style={{width: '100%', height: '500px', border: 'none', borderRadius: '8px'}} srcDoc={`<html><head><style>body{font-family:Arial;padding:20px;background:#f5f5f5}.calc{background:#fff;padding:20px;border-radius:8px;max-width:400px}input,button,select{padding:10px;margin:5px;width:100%;border:1px solid #ddd;box-sizing:border-box}button{background:#007bff;color:#fff;cursor:pointer;border:none;border-radius:4px}button:hover{background:#0056b3}</style></head><body><div class="calc"><h3>Simple Calculator</h3><input type="number" id="num1" placeholder="Enter first number"><select id="operation"><option>+</option><option>-</option><option>*</option><option>/</option></select><input type="number" id="num2" placeholder="Enter second number"><button onclick="calculate()">Calculate</button><input type="text" id="result" placeholder="Result" readonly></div><script>function calculate(){const n1=parseFloat(document.getElementById('num1').value);const n2=parseFloat(document.getElementById('num2').value);const op=document.getElementById('operation').value;let r;if(op==='+')r=n1+n2;else if(op==='-')r=n1-n2;else if(op==='*')r=n1*n2;else if(op==='/')r=n1/n2;document.getElementById('result').value=r;}</script></body></html>`} />
          </div>
        </section>
      )}
    </div>
  );
};

export default CandidateDashboard;