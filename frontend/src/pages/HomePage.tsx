import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, ButtonGroup, Alert } from 'react-bootstrap';
import {
  Play,
  Stop,
  ExclamationTriangle,
  Download,
  FileEarmarkPdf,
  Activity,
  Power,
  GearFill,
  Shield,
  ShieldFill,
  Thermometer,
  CloudRain
} from 'react-bootstrap-icons';
import KPICard from '../components/KPICard';
import { subscribeToLiveData } from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const [plantStatus, setPlantStatus] = useState<'Running' | 'Stopped' | 'Maintenance'>('Running');
  const [isLive, setIsLive] = useState(true);
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);
  const { currentUser } = useAuth();
  // Find this state in HomePage.tsx
  const [kpiData, setKpiData] = useState({
    spc: { value: 0, target: 875.0 }, // Remove status and color
    tsr: { value: 0, target: 28.0 },
    clinkerQuality: { value: 0, target: 45.0 },
    co2Emissions: { value: 0, target: 15.0 },
  });

  useEffect(() => {
    if (isLive) {
      const unsubscribe = subscribeToLiveData((payload) => {
        if (payload && payload.kpi_data) {
          const liveData = payload.kpi_data;
          setKpiData(prevData => ({
            spc: { ...prevData.spc, value: liveData.spc || 0 },
            tsr: { ...prevData.tsr, value: liveData.tsr || 0 },
            clinkerQuality: { ...prevData.clinkerQuality, value: liveData.clinker_quality || 0 },
            co2Emissions: { ...prevData.co2Emissions, value: liveData.co2 || 0 },
          }));
        }
      });
      return () => unsubscribe();
    }
  }, [isLive]);

  const handleRun = () => {
    setIsLive(true);
    setPlantStatus('Running');
    setEmergencyMessage(null);
  };

  const handleStop = () => {
    setIsLive(false);
    setPlantStatus('Stopped');
  };

  const handleEmergency = () => {
    setIsLive(false);
    setPlantStatus('Stopped');
    const message = 'Emergency Stop Activated! System updates are paused.';
    setEmergencyMessage(message);
    window.alert('EMERGENCY STOP ACTIVATED!');
  };

  const handleExportCSV = () => {
    window.open('/api/reports/csv');
  };

  const handleGenerateReport = () => {
    window.open('/api/reports/pdf');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Running':
        return {
          variant: 'success',
          icon: <Activity size={20} />,
          color: 'var(--accent-primary)',
          bgColor: 'rgba(0, 255, 136, 0.1)',
          textColor: 'var(--accent-primary)',
        };
      case 'Stopped':
        return {
          variant: 'danger',
          icon: <Power size={20} />,
          color: 'var(--accent-error)',
          bgColor: 'rgba(255, 71, 87, 0.1)',
          textColor: 'var(--accent-error)',
        };
      case 'Maintenance':
        return {
          variant: 'warning',
          icon: <GearFill size={20} />,
          color: 'var(--accent-warning)',
          bgColor: 'rgba(255, 149, 0, 0.1)',
          textColor: 'var(--accent-warning)',
        };
      default:
        return {
          variant: 'secondary',
          icon: <Activity size={20} />,
          color: 'var(--text-tertiary)',
          bgColor: 'var(--bg-tertiary)',
          textColor: 'var(--text-tertiary)',
        };
    }
  };

  const statusConfig = getStatusConfig(plantStatus);

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <p className="welcome-subtitle">
            Welcome back, <span className="user-name">{currentUser?.username || 'Operator'}</span>
          </p>
        </div>
      </div>

      {/* Emergency Alert */}
      {emergencyMessage && (
        <Alert variant="danger" className="mb-4 d-flex align-items-center">
          <ExclamationTriangle size={20} className="me-3" />
          {emergencyMessage}
        </Alert>
      )}

      {/* Plant Status Section */}
      <div className="status-section mb-4">
        <div className="status-card">
          <div className="status-header">
            <div className="status-info">
              <h4 className="status-title">Plant Operation Status</h4>
              <div
                className="status-badge"
                style={{
                  color: statusConfig.textColor,
                  background: statusConfig.bgColor
                }}
              >
                {statusConfig.icon}
                <span>{plantStatus}</span>
              </div>
            </div>

            <div className="control-panel">
              <ButtonGroup className="control-buttons">
                <Button
                  className="control-btn btn-success"
                  onClick={handleRun}
                  disabled={isLive}
                >
                  <Play size={16} />
                  <span>Run</span>
                </Button>
                <Button
                  className="control-btn btn-warning"
                  onClick={handleStop}
                  disabled={!isLive}
                >
                  <Stop size={16} />
                  <span>Stop</span>
                </Button>
                <Button
                  className="control-btn btn-emergency"
                  onClick={handleEmergency}
                  disabled={!isLive}
                >
                  <ExclamationTriangle size={16} />
                  <span>Emergency</span>
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-section mb-4">
        <div className="section-header mb-3">
          <h3 className="section-title">Key Performance Indicators</h3>
          {isLive && (
            <div className="live-indicator">
              <div className="pulse-dot"></div>
              <span>Live Data</span>
            </div>
          )}
        </div>

        <Row>
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <div className="kpi-wrapper">
              <KPICard
                title="Specific Power Consumption"
                data={kpiData.spc}
                unit="kWh/t"
                // Add these required props 👇
                icon={<ShieldFill size={24} />}
                higherIsBetter={false} // Lower is better for consumption
              />
            </div>
          </Col>
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <div className="kpi-wrapper">
              <KPICard
                title="Thermal Substitution Rate"
                data={kpiData.tsr}
                unit="%"
                // Add these required props 👇
                icon={<Thermometer size={24} />}
                higherIsBetter={true} // Higher is better for this rate
              />
            </div>
          </Col>
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <div className="kpi-wrapper">
              <KPICard
                title="Clinker Quality Index"
                data={kpiData.clinkerQuality}
                unit="%"
                // Add these required props 👇
                icon={<ShieldFill size={24} />}
                higherIsBetter={true}
              />
            </div>
          </Col>
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <div className="kpi-wrapper">
              <KPICard
                title="Clinker Quality Index"
                data={kpiData.clinkerQuality}
                unit="%"
                // Add these required props 👇
                icon={<ShieldFill size={24} />}
                higherIsBetter={true} // Higher is better for quality
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Reports Section - Only for Managers */}
      {currentUser?.role === 'Manager' && (
        <div className="reports-section">
          <div className="reports-card">
            <div className="reports-header">
              <div className="reports-info">
                <h5 className="reports-title">Data Export & Reporting</h5>
                <p className="reports-subtitle">Generate comprehensive reports and export data</p>
              </div>

              <div className="reports-actions">
                <Button
                  className="export-btn btn-outline"
                  onClick={handleExportCSV}
                >
                  <Download size={16} />
                  <span>Export CSV</span>
                </Button>
                <Button
                  className="export-btn btn-primary"
                  onClick={handleGenerateReport}
                >
                  <FileEarmarkPdf size={16} />
                  <span>Generate PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-container {
          padding: 0;
          color: var(--text-primary);
        }

        /* ===== DASHBOARD HEADER ===== */
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .welcome-section {
          flex: 1;
        }

        .welcome-title {
          font-size: 32px;
          font-weight: 300;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          letter-spacing: -0.8px;
        }

        .welcome-subtitle {
          font-size: 20px;
          color: var(--text-secondary);
          margin: 0;
        }

        .user-name {
          color: var(--accent-primary);
          font-weight: 500;
        }
        
        /* ===== STATUS SECTION ===== */
        .status-section {
          margin-bottom: 2rem;
        }

        .status-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }

        .status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-card) 100%);
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-title {
          font-size: 18px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-lg);
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: var(--shadow-sm);
        }

        .control-panel {
          display: flex;
          align-items: center;
        }

        .control-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          font-size: 14px;
          font-weight: 500;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          border: 1px solid transparent;
          min-width: 100px;
          justify-content: center;
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .btn-success {
          background: var(--accent-primary);
          color: var(--bg-primary);
          border-color: var(--accent-primary);
        }

        .btn-success:hover:not(:disabled) {
          background: var(--accent-secondary);
          border-color: var(--accent-secondary);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
        }

        .btn-warning {
          background: var(--accent-warning);
          color: var(--bg-primary);
          border-color: var(--accent-warning);
        }

        .btn-warning:hover:not(:disabled) {
          background: #ffad33;
          border-color: #ffad33;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(255, 149, 0, 0.3);
        }

        .btn-emergency {
          background: var(--accent-error);
          color: var(--text-primary);
          border-color: var(--accent-error);
        }

        .btn-emergency:hover:not(:disabled) {
          background: #ff6b7a;
          border-color: #ff6b7a;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4);
        }

        /* ===== KPI SECTION ===== */
        .kpi-section {
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-size: 20px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: var(--radius-md);
          font-size: 12px;
          color: var(--accent-primary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: var(--accent-primary);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .kpi-wrapper {
          position: relative;
          height: 100%;
        }

        .kpi-icon {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          z-index: 10;
        }

        /* ===== REPORTS SECTION ===== */
        .reports-section {
          margin-bottom: 2rem;
        }

        .reports-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .reports-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.02) 0%, var(--bg-card) 100%);
        }

        .reports-info {
          flex: 1;
        }

        .reports-title {
          font-size: 18px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .reports-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .reports-actions {
          display: flex;
          gap: 0.75rem;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          font-size: 14px;
          font-weight: 500;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          min-width: 140px;
          justify-content: center;
        }

        .btn-outline {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-secondary);
        }

        .btn-outline:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--accent-primary);
          transform: translateY(-1px);
        }

        .btn-primary {
          background: var(--accent-primary);
          color: var(--bg-primary);
          border: 1px solid var(--accent-primary);
        }

        .btn-primary:hover {
          background: var(--accent-secondary);
          border-color: var(--accent-secondary);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
        }
        
        /* ===== RESPONSIVE ===== */
        @media (max-width: 991.98px) {
          .status-header {
            flex-direction: column;
            gap: 1.5rem;
            align-items: flex-start;
          }

          .control-panel {
            width: 100%;
          }

          .control-buttons {
            width: 100%;
            flex-wrap: wrap;
          }

          .control-btn {
            flex: 1;
            min-width: auto;
          }
        }

        @media (max-width: 767.98px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .welcome-title {
            font-size: 28px;
          }
          
          .welcome-subtitle {
            font-size: 18px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .reports-header {
            flex-direction: column;
            gap: 1.5rem;
            align-items: flex-start;
          }

          .reports-actions {
            width: 100%;
            flex-direction: column;
          }

          .export-btn {
            width: 100%;
          }

          .kpi-icon {
            top: 0.75rem;
            right: 0.75rem;
            width: 32px;
            height: 32px;
          }
        }

        @media (max-width: 575.98px) {
          .control-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;