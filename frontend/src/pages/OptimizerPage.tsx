import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { 
  Lightbulb, 
  CheckCircleFill, 
  Cpu, 
  Bullseye, 
  GraphUp,
  GearFill,
  BarChart,
  ShieldFill,
  Shield,
  Thermometer
} from 'react-bootstrap-icons';
import { getHistory, updateOptimizerState } from '../services/websocket';
import { getOptimizerRecommendation } from '../services/api';

const OptimizerPage: React.FC = () => {
  const initialOptimizerState = getHistory().optimizer;
  const [inputs, setInputs] = useState(initialOptimizerState.inputs);
  const [result, setResult] = useState(initialOptimizerState.result);
  const [isLoading, setIsLoading] = useState(initialOptimizerState.isLoading);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    updateOptimizerState({ inputs, result, isLoading });
  }, [inputs, result, isLoading]);

  const handleOptimize = async () => {
    setIsLoading(true);
    setResult('');
    try {
      const payload = {
        targetSPC: parseFloat(inputs.targetSPC),
        targetQuality: parseFloat(inputs.targetQuality),
        maxTSR: parseFloat(inputs.maxTSR),
      };
      const response = await getOptimizerRecommendation(payload);
      setResult(response.data.recommendation);
    } catch (error) {
      console.error("Failed to get optimizer recommendation:", error);
      setResult("Neural network connectivity error. Please verify backend services are operational and retry the optimization request.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    {
      name: 'targetSPC',
      label: 'Target SPC',
      unit: 'kWh/t',
      icon: <ShieldFill size={16} />,
      placeholder: '875.0',
      description: 'Specific power consumption target'
    },
    {
      name: 'targetQuality',
      label: 'Target Clinker Quality',
      unit: '%',
      icon: <Shield size={16} />,
      placeholder: '45.0',
      description: 'Quality index target'
    },
    {
      name: 'maxTSR',
      label: 'Maximum TSR',
      unit: '%',
      icon: <Thermometer size={16} />,
      placeholder: '28.0',
      description: 'Thermal substitution rate limit'
    }
  ];

  return (
    <div className="optimizer-container">
      {/* Page Header */}
      <div className="optimizer-header">
        <div className="header-content">
          <h1 className="page-title">Process Optimizer</h1>
          <p className="page-subtitle">
            AI-powered optimization engine for plant performance enhancement
          </p>
        </div>
        
        <div className="ai-status">
          <div className="status-indicator">
            <Cpu size={16} />
            <span>AI Engine Ready</span>
          </div>
        </div>
      </div>

      <Row>
        {/* Input Panel */}
        <Col lg={4}>
          <div className="input-panel">
            <div className="panel-header">
              <div className="header-icon">
                <Bullseye size={20} />
              </div>
              <div className="header-text">
                <h5 className="panel-title">Optimization Targets</h5>
                <p className="panel-subtitle">Define operational parameters</p>
              </div>
            </div>

            <div className="panel-body">
              <Form onSubmit={(e) => { e.preventDefault(); handleOptimize(); }}>
                {inputFields.map((field) => (
                  <div key={field.name} className="input-group">
                    <Form.Label className="input-label">
                      <div className="label-content">
                        <div className="label-icon">
                          {field.icon}
                        </div>
                        <div className="label-text">
                          <span className="label-title">{field.label}</span>
                          <span className="label-unit">({field.unit})</span>
                        </div>
                      </div>
                    </Form.Label>
                    
                    <div className="input-wrapper">
                      <Form.Control
                        type="number"
                        name={field.name}
                        value={inputs[field.name as keyof typeof inputs]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className="parameter-input"
                        step="0.1"
                        required
                      />
                      <div className="input-unit">{field.unit}</div>
                    </div>
                    
                    <div className="input-description">
                      {field.description}
                    </div>
                  </div>
                ))}

                <div className="optimization-actions">
                  <Button 
                    type="submit" 
                    className="optimize-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Cpu size={16} />
                        <span>Generate Optimization</span>
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Col>

        {/* Results Panel */}
        <Col lg={8}>
          <div className="results-panel">
            <div className="panel-header">
              <div className="header-icon">
                <BarChart size={20} />
              </div>
              <div className="header-text">
                <h5 className="panel-title">AI Recommendations</h5>
                <p className="panel-subtitle">Optimized operational strategy</p>
              </div>
              
              {result && !isLoading && (
                <div className="result-status">
                  <CheckCircleFill size={16} />
                  <span>Analysis Complete</span>
                </div>
              )}
            </div>

            <div className="panel-body">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-animation">
                    <div className="neural-network">
                      <div className="node"></div>
                      <div className="node"></div>
                      <div className="node"></div>
                      <div className="connection"></div>
                      <div className="connection"></div>
                    </div>
                  </div>
                  <div className="loading-text">
                    <h6>AI Processing</h6>
                    <p>Analyzing operational parameters and generating optimal control strategy...</p>
                    <div className="progress-indicator">
                      <div className="progress-bar"></div>
                    </div>
                  </div>
                </div>
              ) : result ? (
                <div className="results-content">
                  <div className="result-header">
                    <div className="success-indicator">
                      <CheckCircleFill size={24} />
                      <div className="success-text">
                        <h6>Optimization Complete</h6>
                        <p>AI has generated your customized operational strategy</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="recommendation-text">
                    {result}
                  </div>
                  
                  <div className="result-actions">
                    <Button 
                      variant="outline-primary"
                      className="action-btn"
                      onClick={() => navigator.clipboard.writeText(result)}
                    >
                      Copy Recommendation
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      className="action-btn"
                      onClick={handleOptimize}
                    >
                      Re-analyze
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Cpu size={48} />
                    <div className="icon-glow"></div>
                  </div>
                  <h6 className="empty-title">Ready for Optimization</h6>
                  <p className="empty-description">
                    Set your target parameters and generate an AI-powered optimization strategy 
                    tailored to your plant's operational requirements.
                  </p>
                  
                  <div className="feature-highlights">
                    <div className="feature">
                      <GraphUp size={16} />
                      <span>Performance Analysis</span>
                    </div>
                    <div className="feature">
                      <GearFill size={16} />
                      <span>Parameter Optimization</span>
                    </div>
                    <div className="feature">
                      <Lightbulb size={16} />
                      <span>Smart Recommendations</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <style>{`
        .optimizer-container {
          color: var(--text-primary);
          padding: 0;
        }

        /* ===== PAGE HEADER ===== */
        .optimizer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .header-content {
          flex: 1;
        }

        .page-title {
          font-size: 32px;
          font-weight: 300;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          letter-spacing: -0.8px;
        }

        .page-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0;
        }

        .ai-status {
          display: flex;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: var(--radius-lg);
          font-size: 14px;
          color: var(--accent-primary);
          font-weight: 500;
        }

        /* ===== PANELS ===== */
        .input-panel, .results-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          height: calc(100vh - 240px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-card) 100%);
          border-bottom: 1px solid var(--border-primary);
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--bg-primary);
          box-shadow: var(--shadow-glow);
        }

        .header-text {
          flex: 1;
        }

        .panel-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .panel-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .result-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: var(--radius-md);
          font-size: 12px;
          color: var(--accent-primary);
          font-weight: 500;
        }

        .panel-body {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        /* ===== INPUT SECTION ===== */
        .input-group {
          margin-bottom: 2rem;
        }

        .input-label {
          display: block;
          margin-bottom: 0.75rem;
        }

        .label-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .label-icon {
          width: 32px;
          height: 32px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
        }

        .label-text {
          display: flex;
          flex-direction: column;
        }

        .label-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .label-unit {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .input-wrapper:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
        }

        .parameter-input {
          background: transparent !important;
          border: none !important;
          color: var(--text-primary) !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          padding: 1rem !important;
          flex: 1 !important;
          font-family: var(--font-primary) !important;
        }

        .parameter-input:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        .input-unit {
          padding: 0 1rem;
          color: var(--text-tertiary);
          font-size: 14px;
          font-weight: 500;
          border-left: 1px solid var(--border-primary);
        }

        .input-description {
          margin-top: 0.5rem;
          font-size: 12px;
          color: var(--text-tertiary);
          line-height: 1.4;
        }

        .optimization-actions {
          margin-top: 2rem;
        }

        .optimize-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          border: none !important;
          color: var(--bg-primary) !important;
          padding: 1rem 1.5rem !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          border-radius: var(--radius-md) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.75rem !important;
          transition: all var(--transition-fast) !important;
        }

        .optimize-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
        }

        .optimize-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid var(--bg-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ===== RESULTS SECTION ===== */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          gap: 2rem;
        }

        .loading-animation {
          position: relative;
        }

        .neural-network {
          width: 80px;
          height: 60px;
          position: relative;
        }

        .node {
          width: 12px;
          height: 12px;
          background: var(--accent-primary);
          border-radius: 50%;
          position: absolute;
          animation: pulse 2s ease-in-out infinite;
        }

        .node:nth-child(1) { top: 0; left: 0; animation-delay: 0s; }
        .node:nth-child(2) { top: 0; right: 0; animation-delay: 0.5s; }
        .node:nth-child(3) { bottom: 0; left: 50%; transform: translateX(-50%); animation-delay: 1s; }

        .connection {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-primary), transparent);
          animation: flow 2s ease-in-out infinite;
        }

        .connection:nth-child(1) {
          top: 6px;
          left: 12px;
          right: 12px;
          transform: rotate(-30deg);
        }

        .connection:nth-child(2) {
          top: 6px;
          left: 12px;
          right: 12px;
          transform: rotate(30deg);
        }

        @keyframes flow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .loading-text h6 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .loading-text p {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          max-width: 400px;
        }

        .progress-indicator {
          width: 200px;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          animation: progress 3s ease-in-out infinite;
        }

        @keyframes progress {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }

        .results-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .result-header {
          margin-bottom: 1.5rem;
        }

        .success-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: var(--radius-lg);
          color: var(--accent-primary);
        }

        .success-text h6 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .success-text p {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .recommendation-text {
          flex: 1;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary);
          white-space: pre-wrap;
          overflow-y: auto;
          margin-bottom: 1.5rem;
        }

        .result-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem 1rem !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          border-radius: var(--radius-md) !important;
          transition: all var(--transition-fast) !important;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          gap: 1.5rem;
        }

        .empty-icon {
          position: relative;
          color: var(--accent-primary);
        }

        .empty-icon .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: glow-pulse 3s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        .empty-title {
          font-size: 20px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
        }

        .empty-description {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 400px;
          margin: 0;
          line-height: 1.5;
        }

        .feature-highlights {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          color: var(--accent-primary);
          font-size: 12px;
          font-weight: 500;
        }

        /* ===== SCROLLBARS ===== */
        .panel-body::-webkit-scrollbar,
        .recommendation-text::-webkit-scrollbar {
          width: 6px;
        }

        .panel-body::-webkit-scrollbar-track,
        .recommendation-text::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        .panel-body::-webkit-scrollbar-thumb,
        .recommendation-text::-webkit-scrollbar-thumb {
          background: var(--border-secondary);
          border-radius: 3px;
        }

        .panel-body::-webkit-scrollbar-thumb:hover,
        .recommendation-text::-webkit-scrollbar-thumb:hover {
          background: var(--accent-primary);
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 991.98px) {
          .optimizer-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .input-panel, .results-panel {
            height: auto;
            margin-bottom: 2rem;
          }

          .feature-highlights {
            flex-direction: column;
            gap: 0.75rem;
          }
        }

        @media (max-width: 767.98px) {
          .page-title {
            font-size: 28px;
          }

          .panel-header {
            padding: 1rem;
          }

          .panel-body {
            padding: 1rem;
          }

          .result-actions {
            flex-direction: column;
          }

          .feature-highlights {
            flex-direction: column;
          }

          .feature {
            flex-direction: row;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default OptimizerPage;