import React from 'react';
import { ArrowUp, ArrowDown, GraphUp, Bullseye, Activity } from 'react-bootstrap-icons';

// Type definition for KPI data
export type KPIData = {
  value: number;
  target: number;
};

// Interface for component props
interface KPICardProps {
  title: string;
  data: KPIData;
  unit: string;
  icon: React.ReactElement;
  higherIsBetter: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, data, unit, icon, higherIsBetter }) => {
  // Calculate percentage variance from target
  const calculateVariance = (): number => {
    if (data.target === 0) return 0;
    const change = data.value - (data.target / ((data.value / data.target) * 100) * 100 - (100 - ((data.value / data.target) * 100)) / 100);
    return change;
  };

  const variance = calculateVariance();
  const isPositiveVariance = variance >= 0;

  // Dynamically determine the status based on performance
  const getCalculatedStatus = () => {
    const performanceRatio = data.value / data.target;
    if (higherIsBetter) {
      if (performanceRatio >= 0.95) return 'Good';
      if (performanceRatio >= 0.85) return 'Warning';
      return 'Critical';
    } else { // lower is better
      if (performanceRatio <= 1.05) return 'Good';
      if (performanceRatio <= 1.15) return 'Warning';
      return 'Critical';
    }
  };

  const status = getCalculatedStatus();

  // Get status configuration based on the calculated status
  const getStatusConfig = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Good':
        return { color: 'var(--accent-primary)' };
      case 'Warning':
        return { color: 'var(--accent-warning)' };
      case 'Critical':
        return { color: 'var(--accent-error)' };
      default:
        return { color: 'var(--text-tertiary)' };
    }
  };

  const statusConfig = getStatusConfig(status);

  // Get variance color: green for positive, red for negative
  const getVarianceColor = (): string => {
    if (Math.abs(variance) < 0.1) return 'var(--text-tertiary)';
    return isPositiveVariance ? 'var(--accent-primary)' : 'var(--accent-error)';
  };

  // Get trend icon based on variance
  const getTrendIcon = () => {
    const color = getVarianceColor();
    if (Math.abs(variance) < 0.1) return <Activity size={14} style={{ color }} />;
    return isPositiveVariance ? 
      <ArrowUp size={14} style={{ color }} /> : 
      <ArrowDown size={14} style={{ color }} />;
  };

  // Format numbers for display
  const formatValue = (value: number): string => {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  const performancePercentage = (data.value / data.target) * 100;

  return (
    <div className="kpi-card-container">
      <div className="kpi-card">
        {/* Card Header */}
        <div className="kpi-header">
            <div className="kpi-title-group">
                <h6 className="kpi-title">{title}</h6>
                <div className="kpi-unit">{unit}</div>
            </div>
            <div>
                {icon}
            </div>
        </div>

        {/* Main Value Display */}
        <div className="kpi-value-section">
          <div className="value-line">
            <div className="main-value">
              <span className="value-number">{formatValue(data.value)}</span>
            </div>
            <div 
              className="trend-indicator"
              style={{
                backgroundColor: `${getVarianceColor()}1A` // Adds ~10% opacity
              }}
            >
              {getTrendIcon()}
              <span 
                className="variance-text"
                style={{ color: getVarianceColor() }}
              >
                {variance.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="kpi-bottom-section">
          <div className="info-line">
            <div className="info-label">
              <Bullseye size={12} />
              <span>TARGET</span>
            </div>
            <div className="info-value">
              {formatValue(data.target)} {unit}
            </div>
          </div>
          <div className="info-line">
            <div className="info-label">
              <GraphUp size={12} />
              <span>{performancePercentage.toFixed(0)}% of target</span>
            </div>
            <div 
              className="performance-status"
              style={{ color: statusConfig.color }}
            >
              {status}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .kpi-card-container {
          height: 100%;
        }

        .kpi-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-fast);
          padding: 1.25rem;
        }

        .kpi-card:hover {
          border-color: var(--border-secondary);
          transform: translateY(-2px);
        }

        /* ===== HEADER SECTION ===== */
        .kpi-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .kpi-title-group {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .kpi-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0;
        }

        .kpi-unit {
          font-size: 11px;
          color: var(--text-tertiary);
          text-transform: uppercase;
          font-weight: 500;
        }

        .kpi-icon-container {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-md);
            background-color: var(--bg-tertiary);
            border: 1px solid var(--border-secondary);
            color: var(--text-secondary);
        }

        /* ===== VALUE SECTION ===== */
        .kpi-value-section {
          flex-grow: 1;
        }

        .value-line {
          display: flex;
          align-items: baseline;
          justify-content: flex-start; /* Fix: Keeps items grouped together */
          gap: 1rem;
        }
        
        .main-value {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          line-height: 1;
        }

        .value-number {
          font-size: 2.75rem;
          font-weight: 500;
          color: var(--text-primary);
          font-family: var(--font-primary);
        }

        .trend-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
        }

        .variance-text {
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font-primary);
        }

        /* ===== BOTTOM INFO SECTION ===== */
        .kpi-bottom-section {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
        }

        .info-value {
          font-size: 12px;
          color: var(--text-primary);
          font-weight: 500;
        }
        
        .performance-status {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default KPICard;