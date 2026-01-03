import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [userData, setUserData] = useState({
    serialNo: 1,
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
  const [records, setRecords] = useState([]);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({
    username: '',
    phone: '',
    password: '',
    otp: ''
  });
  const [showOtpField, setShowOtpField] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!showOtpField) {
      setShowOtpField(true);
      // Simulate OTP sent
      alert('OTP sent to +91-' + loginData.phone + '. Please check.');
    } else {
      // Simulate successful login
      setShowLogin(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateInstallment = () => {
    const contractValue = parseFloat(userData.contractValue) || 0;
    const months = 36; // Standard 3 years
    const installment = contractValue / months;
    setUserData(prev => ({
      ...prev,
      installment: installment.toFixed(2)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      ...userData,
      id: Date.now(),
      serialNo: records.length + 1
    };
    setRecords(prev => [...prev, newRecord]);
    alert('Form submitted successfully!');
    
    // Reset form
    setUserData({
      serialNo: records.length + 2,
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
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File "${file.name}" uploaded successfully!`);
    }
  };

  if (showLogin) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Login as User</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleLoginInputChange}
                placeholder="Test002710520"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={loginData.phone}
                onChange={handleLoginInputChange}
                placeholder="9876543210"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                placeholder="work@121"
                required
              />
            </div>
            {showOtpField && (
              <div className="form-group">
                <label>OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={loginData.otp}
                  onChange={handleLoginInputChange}
                  placeholder="Enter OTP"
                  required
                />
                <button type="button" className="resend-otp">Resend OTP</button>
              </div>
            )}
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="user-info">Testt</div>
      </header>

      <div className="module-grid">
        <div 
          className={`module-card ${activeModule === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveModule('upload')}
        >
          <div className="module-icon">📁</div>
          <div className="module-title">Upload File</div>
        </div>
        <div 
          className={`module-card ${activeModule === 'filelist' ? 'active' : ''}`}
          onClick={() => setActiveModule('filelist')}
        >
          <div className="module-icon">📋</div>
          <div className="module-title">File List</div>
        </div>
        <div 
          className={`module-card ${activeModule === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveModule('calculator')}
        >
          <div className="module-icon">🧮</div>
          <div className="module-title">Calculator</div>
        </div>
        <div 
          className={`module-card ${activeModule === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveModule('dashboard')}
        >
          <div className="module-icon">📊</div>
          <div className="module-title">Dashboard</div>
        </div>
      </div>

      <div className="main-content">
        {activeModule === 'upload' && (
          <div className="upload-section">
            <h2>Upload File</h2>
            <div className="upload-area">
              <input type="file" onChange={handleFileUpload} />
              <p>Select a file to upload</p>
            </div>
          </div>
        )}

        {activeModule === 'filelist' && (
          <div className="file-list-section">
            <h2>File List</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Serial No</th>
                  <th>Title</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Initial</th>
                  <th>Email</th>
                  <th>Father Name</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td>
                    <td>{record.serialNo}</td>
                    <td>{record.title}</td>
                    <td>{record.firstName}</td>
                    <td>{record.lastName}</td>
                    <td>{record.initial}</td>
                    <td>{record.email}</td>
                    <td>{record.fatherName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeModule === 'calculator' && (
          <div className="calculator-section">
            <h2>Installment Calculator</h2>
            <div className="calc-container">
              <div className="calc-input">
                <label>Contract Value:</label>
                <input
                  type="number"
                  value={userData.contractValue}
                  onChange={(e) => setUserData(prev => ({...prev, contractValue: e.target.value}))}
                  placeholder="Enter contract value"
                />
              </div>
              <button onClick={calculateInstallment} className="calc-btn">
                Calculate Installment (36 months)
              </button>
              {userData.installment && (
                <div className="calc-result">
                  <h3>Monthly Installment: ${userData.installment}</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {activeModule === 'dashboard' && (
          <div className="dashboard-section">
            <div className="form-container">
              <div className="details-section">
                <h3>Details</h3>
                <div className="detail-item">
                  <span className="label">Serial No:</span>
                  <span className="value">{userData.serialNo}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Title:</span>
                  <span className="value">{userData.title}</span>
                </div>
                <div className="detail-item">
                  <span className="label">First Name:</span>
                  <span className="value">{userData.firstName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Last Name:</span>
                  <span className="value">{userData.lastName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Initial:</span>
                  <span className="value">{userData.initial}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{userData.email}</span>
                </div>
              </div>

              <div className="form-section">
                <h3>Form Details</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Serial No</label>
                      <input
                        type="number"
                        name="serialNo"
                        value={userData.serialNo}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label>Title</label>
                      <select name="title" value={userData.title} onChange={handleInputChange}>
                        <option value="">Select</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={userData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter First Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={userData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter Last Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Initial</label>
                      <input
                        type="text"
                        name="initial"
                        value={userData.initial}
                        onChange={handleInputChange}
                        placeholder="Enter Initial"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        placeholder="Enter Email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Father Name</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={userData.fatherName}
                        onChange={handleInputChange}
                        placeholder="Enter Father Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>DOB</label>
                      <input
                        type="date"
                        name="dob"
                        value={userData.dob}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select name="gender" value={userData.gender} onChange={handleInputChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Profession</label>
                      <input
                        type="text"
                        name="profession"
                        value={userData.profession}
                        onChange={handleInputChange}
                        placeholder="Enter Profession"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contract Value</label>
                      <input
                        type="number"
                        name="contractValue"
                        value={userData.contractValue}
                        onChange={handleInputChange}
                        placeholder="Enter Contract Value"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Issue</label>
                      <input
                        type="date"
                        name="dateOfIssue"
                        value={userData.dateOfIssue}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Installment</label>
                      <input
                        type="text"
                        name="installment"
                        value={userData.installment}
                        onChange={handleInputChange}
                        placeholder="Enter Installment"
                      />
                    </div>
                    <div className="form-group">
                      <label>Amount in Words</label>
                      <input
                        type="text"
                        name="amountInWords"
                        value={userData.amountInWords}
                        onChange={handleInputChange}
                        placeholder="Enter Amount in Words"
                      />
                    </div>
                    <div className="form-group">
                      <label>Remarks</label>
                      <input
                        type="text"
                        name="remarks"
                        value={userData.remarks}
                        onChange={handleInputChange}
                        placeholder="Enter Remarks"
                      />
                    </div>
                  </div>

                  <button type="submit" className="submit-btn">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;