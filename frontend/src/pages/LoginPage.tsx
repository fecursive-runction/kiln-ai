import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Tabs, Tab, Form, Button, InputGroup, Row, Col, Alert, Modal } from 'react-bootstrap';
import { Eye, EyeSlash, Cpu, Gear, Google } from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const { signUp, logIn, signInWithGoogle, finalizeGoogleSignUp } = useAuth();
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpRole, setSignUpRole] = useState<'Operator' | 'Manager'>('Operator');

  // State for the Google Sign-Up flow
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'Operator' | 'Manager'>('Operator');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await logIn(loginEmail, loginPassword);
      navigate('/');
    } catch {
      setError('Failed to log in. Please check your email and password.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signUp(signUpEmail, signUpPassword, signUpUsername, signUpRole);
      navigate('/');
    } catch {
      setError('Failed to create an account. The email may already be in use.');
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const newUserCredential = await signInWithGoogle();
      if (newUserCredential) {
        setPendingGoogleUser(newUserCredential.user);
        setShowRoleModal(true);
      } else {
        navigate('/');
      }
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleRoleSelectionSubmit = async () => {
    if (!pendingGoogleUser) return;
    setError('');
    try {
      await finalizeGoogleSignUp(pendingGoogleUser, selectedRole);
      setShowRoleModal(false);
      navigate('/');
    } catch (error) {
      setError('Failed to save role. Please try again.');
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-background">
          <div className="grid-overlay"></div>
          <div className="floating-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
        </div>
        
        <Container fluid className="login-content d-flex align-items-center justify-content-center vh-100">
          <div className="login-wrapper">
            {/* Branding Section */}
            <div className="login-header text-center mb-4">
              <div className="brand-icon-container mb-3">
                <div className="brand-icon">
                  <Gear size={28} className="gear-icon" />
                  <Cpu size={24} className="cpu-icon" />
                </div>
                <div className="brand-glow"></div>
              </div>
              <h1 className="brand-title">Plant Control System</h1>
              <p className="brand-subtitle">Advanced Industrial Automation Platform</p>
            </div>

            {/* Login Card */}
            <Card className="login-card">
              <Card.Body className="p-0">
                {error && (
                  <Alert variant="danger" className="login-alert mb-0">
                    <div className="alert-content">
                      <i className="alert-icon">⚠</i>
                      <span>{error}</span>
                    </div>
                  </Alert>
                )}
                
                <div className="login-tabs-container">
                  <Tabs 
                    activeKey={activeTab} 
                    onSelect={(k) => setActiveTab(k || 'login')} 
                    className="login-tabs"
                  >
                    <Tab eventKey="login" title="Sign In">
                      <div className="tab-content-wrapper">
                        <Form onSubmit={handleLoginSubmit} className="login-form">
                          <div className="form-group">
                            <Form.Label className="form-label">Email Address</Form.Label>
                            <Form.Control 
                              type="email" 
                              placeholder="Enter your email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              className="form-control"
                              required 
                            />
                          </div>
                          
                          <div className="form-group">
                            <Form.Label className="form-label">Password</Form.Label>
                            <InputGroup className="password-group">
                              <Form.Control 
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="form-control password-input"
                                required 
                              />
                              <Button 
                                variant="outline-secondary" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                              </Button>
                            </InputGroup>
                          </div>
                          
                          <Button type="submit" className="btn btn-primary btn-login">
                            <span>Sign In</span>
                            <div className="btn-shine"></div>
                          </Button>
                        </Form>
                        
                        <div className="divider">
                          <span>OR</span>
                        </div>
                        
                        <Button 
                          variant="outline-light" 
                          className="btn btn-secondary btn-google"
                          onClick={handleGoogleSignIn}
                        >
                          <Google size={18} className="me-2" />
                          <span>Continue with Google</span>
                        </Button>
                      </div>
                    </Tab>
                    
                    <Tab eventKey="signup" title="Sign Up">
                      <div className="tab-content-wrapper">
                        <Form onSubmit={handleSignUpSubmit} className="login-form">
                          <div className="form-group">
                            <Form.Label className="form-label">Username</Form.Label>
                            <Form.Control 
                              type="text"
                              placeholder="Choose a username"
                              value={signUpUsername}
                              onChange={(e) => setSignUpUsername(e.target.value)}
                              className="form-control"
                              required 
                            />
                          </div>
                          
                          <div className="form-group">
                            <Form.Label className="form-label">Email Address</Form.Label>
                            <Form.Control 
                              type="email"
                              placeholder="Enter your email"
                              value={signUpEmail}
                              onChange={(e) => setSignUpEmail(e.target.value)}
                              className="form-control"
                              required 
                            />
                          </div>
                          
                          <div className="form-group">
                            <Form.Label className="form-label">Password</Form.Label>
                            <InputGroup className="password-group">
                              <Form.Control 
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password (min. 6 characters)"
                                value={signUpPassword}
                                onChange={(e) => setSignUpPassword(e.target.value)}
                                className="form-control password-input"
                                required 
                              />
                              <Button 
                                variant="outline-secondary" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                              </Button>
                            </InputGroup>
                          </div>
                          
                          <div className="form-group">
                            <Form.Label className="form-label">Access Level</Form.Label>
                            <Form.Select 
                              value={signUpRole}
                              onChange={(e) => setSignUpRole(e.target.value as any)}
                              className="form-control role-select"
                              required
                            >
                              <option value="Operator">Operator</option>
                              <option value="Manager">Manager</option>
                            </Form.Select>
                          </div>
                          
                          <Button type="submit" className="btn btn-primary btn-login">
                            <span>Create Account</span>
                            <div className="btn-shine"></div>
                          </Button>
                        </Form>
                      </div>
                    </Tab>
                  </Tabs>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
      
      {/* Role Selection Modal */}
      <Modal 
        show={showRoleModal} 
        onHide={() => setShowRoleModal(false)} 
        centered 
        className="role-modal"
      >
        <div className="modal-overlay">
          <Modal.Header className="modal-header">
            <Modal.Title className="modal-title">Complete Setup</Modal.Title>
            <Button 
              variant="link" 
              className="modal-close"
              onClick={() => setShowRoleModal(false)}
            >
              ×
            </Button>
          </Modal.Header>
          
          <Modal.Body className="modal-body">
            <div className="welcome-message">
              <div className="welcome-icon">👋</div>
              <p>Welcome, <strong>{pendingGoogleUser?.displayName}</strong>!</p>
              <p className="welcome-subtitle">Please select your access level to complete the setup.</p>
            </div>
            
            <div className="role-selection">
              <Form.Label className="form-label">Access Level</Form.Label>
              <Form.Select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="form-control role-select"
                required
              >
                <option value="Operator">Operator</option>
                <option value="Manager">Manager</option>
              </Form.Select>
            </div>
          </Modal.Body>
          
          <Modal.Footer className="modal-footer">
            <Button 
              variant="secondary" 
              className="btn btn-secondary"
              onClick={() => setShowRoleModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="btn btn-primary"
              onClick={handleRoleSelectionSubmit}
            >
              <span>Complete Setup</span>
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <style>{`
        .login-container {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
          overflow: hidden;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
        }

        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }

        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .floating-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--accent-primary);
          border-radius: 50%;
          opacity: 0.6;
          animation: float 8s ease-in-out infinite;
        }

        .particle:nth-child(1) {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .particle:nth-child(2) {
          top: 60%;
          left: 80%;
          animation-delay: 2s;
        }

        .particle:nth-child(3) {
          top: 80%;
          left: 30%;
          animation-delay: 4s;
        }

        .particle:nth-child(4) {
          top: 30%;
          left: 70%;
          animation-delay: 6s;
        }

        .particle:nth-child(5) {
          top: 70%;
          left: 10%;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 1; }
        }

        .login-content {
          position: relative;
          z-index: 1;
        }

        .login-wrapper {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .login-header {
          margin-bottom: 2rem;
        }

        .brand-icon-container {
          position: relative;
          display: inline-block;
        }

        .brand-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%);
          border: 2px solid var(--border-accent);
          border-radius: var(--radius-lg);
          margin: 0 auto;
          box-shadow: var(--shadow-glow);
        }

        .gear-icon {
          color: var(--accent-primary);
          animation: rotate 8s linear infinite;
        }

        .cpu-icon {
          color: var(--accent-secondary);
          position: absolute;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .brand-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: glow-pulse 3s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        .brand-title {
          font-size: 28px;
          font-weight: 300;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .brand-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
          font-weight: 400;
        }

        .login-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .login-alert {
          background: rgba(255, 71, 87, 0.1);
          border: none;
          border-bottom: 1px solid var(--border-primary);
          border-radius: 0;
          padding: 1rem 1.5rem;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--accent-error);
          font-size: 14px;
        }

        .alert-icon {
          font-size: 16px;
        }

        .login-tabs-container {
          padding: 0;
        }

        .login-tabs {
          border-bottom: 1px solid var(--border-primary);
        }

        .login-tabs .nav-link {
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          border-radius: 0;
          color: var(--text-secondary);
          font-weight: 500;
          padding: 1rem 1.5rem;
          transition: all var(--transition-fast);
        }

        .login-tabs .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .login-tabs .nav-link.active {
          color: var(--accent-primary);
          background: rgba(0, 255, 136, 0.05);
          border-bottom-color: var(--accent-primary);
        }

        .tab-content-wrapper {
          padding: 2rem 1.5rem;
        }

        .login-form {
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-control {
          width: 100%;
          padding: 0.875rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          transition: all var(--transition-fast);
          font-family: var(--font-primary);
        }

        .form-control:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
          background: var(--bg-secondary);
        }

        .form-control::placeholder {
          color: var(--text-tertiary);
        }

        .password-group {
          position: relative;
        }

        .password-input {
          padding-right: 3rem;
        }

        .password-toggle {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          padding: 0 1rem;
          z-index: 10;
          transition: color var(--transition-fast);
        }

        .password-toggle:hover {
          color: var(--text-primary);
        }

        .role-select {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 16px;
          padding-right: 3rem;
          appearance: none;
        }

        .btn-login, .btn-google {
          width: 100%;
          padding: 0.875rem 1.5rem;
          font-size: 14px;
          font-weight: 500;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: var(--accent-primary);
          border: 1px solid var(--accent-primary);
          color: var(--bg-primary);
        }

        .btn-primary:hover {
          background: var(--accent-secondary);
          border-color: var(--accent-secondary);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-secondary);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          background: var(--bg-hover);
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        .btn-shine {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .btn-primary:hover .btn-shine {
          transform: translateX(100%);
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          color: var(--text-tertiary);
          font-size: 12px;
          font-weight: 500;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-primary);
        }

        .divider span {
          padding: 0 1rem;
        }

        .role-modal .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
        }

        .modal-overlay {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .modal-header {
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-primary);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 24px;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .modal-close:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .welcome-message {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .welcome-icon {
          font-size: 32px;
          margin-bottom: 1rem;
        }

        .welcome-message p {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .welcome-subtitle {
          color: var(--text-secondary) !important;
          font-size: 14px;
        }

        .role-selection {
          margin-top: 1rem;
        }

        .modal-footer {
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border-primary);
          padding: 1rem 1.5rem;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .modal-footer .btn {
          padding: 0.5rem 1.5rem;
          font-size: 14px;
          border-radius: var(--radius-md);
        }

        @media (max-width: 768px) {
          .login-wrapper {
            padding: 0 1rem;
          }

          .brand-title {
            font-size: 24px;
          }

          .tab-content-wrapper {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default LoginPage;