// src/pages/ControllerPage.tsx
import React, { useState, useEffect } from 'react';
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap';
import { Chart as ChartJS, ChartData, ChartOptions, Filler, Legend, LineElement, LinearScale, PointElement, TimeScale, Title, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
// --- ADDITION: Import the context hook ---
import { useController } from '../contexts/ControllerContext';

// --- Mock Data Service (Preserved as requested) ---
const createMockTimeSeriesData = (count = 30) => {
    const now = Date.now();
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            x: now - (count - i) * 20000,
            y: Math.random() * 30 + 40 + Math.sin(i * 0.2) * 15
        });
    }
    return data;
};

const historyData = {
    logs: [
        { id: new Date().toISOString(), level: 'Info' as const, message: 'System initialized successfully' },
        { id: new Date(Date.now() - 60000).toISOString(), level: 'Warning' as const, message: 'Temperature threshold exceeded' }
    ],
    spc: createMockTimeSeriesData(),
    tsr: createMockTimeSeriesData(),
    clinker_quality: createMockTimeSeriesData(),
    co2: createMockTimeSeriesData()
};

const getHistory = () => {
    return historyData;
};

const subscribeToLiveData = (callback: (payload: any) => void) => {
    const interval = setInterval(() => {
        const newSpc = Math.random() * 30 + 40 + Math.sin(Date.now() * 0.001) * 15;
        const newTsr = Math.random() * 20 + 50 + Math.cos(Date.now() * 0.001) * 10;
        const newClinker = Math.random() * 10 + 85;
        const newCo2 = Math.random() * 5 + 10;

        historyData.spc.push({ x: Date.now(), y: newSpc });
        if (historyData.spc.length > 30) historyData.spc.shift();
        
        historyData.tsr.push({ x: Date.now(), y: newTsr });
        if (historyData.tsr.length > 30) historyData.tsr.shift();

        historyData.clinker_quality.push({ x: Date.now(), y: newClinker });
        if (historyData.clinker_quality.length > 30) historyData.clinker_quality.shift();

        historyData.co2.push({ x: Date.now(), y: newCo2 });
        if (historyData.co2.length > 30) historyData.co2.shift();

        // --- ADDITION: Simulate a log entry with the live data ---
        let log_entry = null;
        if (newSpc > 85) {
            log_entry = { id: new Date().toISOString(), level: 'Alert', message: `Critical SPC: ${newSpc.toFixed(1)} kWh/t!` };
        } else if (newSpc > 70) {
            log_entry = { id: new Date().toISOString(), level: 'Warning', message: `High SPC: ${newSpc.toFixed(1)} kWh/t.` };
        }

        callback({
            kpi_data: {
                spc: newSpc,
                tsr: newTsr,
                clinker_quality: newClinker,
                co2: newCo2,
            },
            log_entry: log_entry // Pass the generated log entry
        });
    }, 2000);

    return () => clearInterval(interval);
};
// --- End Mock Data Service ---


// --- Icon Components (Preserved as requested) ---
const ExclamationTriangle = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
    </svg>
);
const Info = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
    </svg>
);
const ShieldFill = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887 1.17a1 1 0 0 1 .485.848v3.542a1 1 0 0 1-.293.707l-4.156 4.156a1 1 0 0 1-.707.293H7.83a1 1 0 0 1-.707-.293L2.967 7.825A1 1 0 0 1 2.674 7.118V3.576a1 1 0 0 1 .485-.848c.658-.515 1.777-.87 2.887-1.17z"/>
    </svg>
);
const Thermometer = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
        <path d="M8 0a2.5 2.5 0 0 0-2.5 2.5v7.55a3.5 3.5 0 1 0 5 0V2.5A2.5 2.5 0 0 0 8 0zM6.5 2.5a1.5 1.5 0 0 1 3 0v7.987l.167.15a2.5 2.5 0 1 1-3.334 0l.167-.15V2.5z"/>
    </svg>
);
const Shield = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887 1.17a1 1 0 0 1 .485.848v3.542a1 1 0 0 1-.293.707l-4.156 4.156a1 1 0 0 1-.707.293H7.83a1 1 0 0 1-.707-.293L2.967 7.825A1 1 0 0 1 2.674 7.118V3.576a1 1 0 0 1 .485-.848c.658-.515 1.777-.87 2.887-1.17zM14.326 3.576A2 2 0 0 0 13.05 2.45c-1.222-.51-2.613-.85-3.951-1.135C8.354 1.11 8.163 1 8 1c-.164 0-.354.01-.599.035c-1.338.286-2.73.626-3.951 1.135A2 2 0 0 0 2.674 3.576v3.542c0 .26.05.51.146.74l4.156 4.156c.195.195.45.293.707.293h.707a1 1 0 0 0 .707-.293l4.156-4.156a1.99 1.99 0 0 0 .146-.74V3.576z"/>
    </svg>
);
const CloudRain = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
        <path d="M4.158 12.025a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm2.547-7.05a.5.5 0 0 0-.293-.852H3.75a.5.5 0 0 0 0 1h8.507a.5.5 0 0 0 .293-.148z"/>
        <path d="M13.405 4.002a4.495 4.495 0 0 0-8.358.552 3.5 3.5 0 0 0-3.5 3.5c0 1.933 1.567 3.5 3.5 3.5h8.5a3.5 3.5 0 0 0 .095-6.985zM3.5 10.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 .5.025V5.51a3.5 3.5 0 0 1 6.574-1.026 3.503 3.503 0 0 1 3.426 3.426c.002.164.004.328.004.493a2.5 2.5 0 0 1-2.5 2.5h-8.5z"/>
    </svg>
);
// --- End Icon Components ---


ChartJS.register(Filler, Legend, LineElement, LinearScale, PointElement, TimeScale, Title, Tooltip);

interface LogEntry { 
  id: string; 
  level: 'Info' | 'Warning' | 'Alert'; 
  message: string; 
}

interface KpiInfo {
    title: string;
    value: number;
    unit: string;
    icon: React.ReactElement;
    color: string;
}

const createChartData = (initialData: any[], color: string): ChartData<'line'> => {
    const validData = Array.isArray(initialData) ? initialData.filter(item => 
        item && typeof item.x === 'number' && typeof item.y === 'number' && 
        !isNaN(item.x) && !isNaN(item.y)
    ) : [];

    return {
        datasets: [{ 
            data: [], // Start with an empty chart to "load from the left"
            borderColor: color, 
            fill: false,
            pointRadius: 2,
            pointHoverRadius: 6,
            borderWidth: 2,
            tension: 0.4,
        }],
    };
};

const chartColors = {
    primary: '#00FF88',
    error: '#FF4757',
    secondary: '#3742FA',
    warning: '#FFA500',
};

const ControllerPage: React.FC = () => {
    // --- ADDITION: Use the global state and dispatch from the context ---
    const { state: controllerState, dispatch } = useController();

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getInitialHistory = () => {
        try {
            return getHistory();
        } catch (err) {
            console.error('Error getting initial history:', err);
            return { logs: [], spc: [], tsr: [], clinker_quality: [], co2: [] };
        }
    };

    const initialHistory = getInitialHistory();
    
    // This local state is preserved as per the rule, but the view will now use the global state.
    const [controllerLogs, setControllerLogs] = useState<LogEntry[]>(initialHistory.logs);
    const [logFilter, setLogFilter] = useState<'All' | 'Alert' | 'Warning' | 'Info'>('All');
    
    const getLastValue = (dataArray: any[]) => {
        if (!Array.isArray(dataArray) || dataArray.length === 0) return 0;
        const lastItem = dataArray[dataArray.length - 1];
        if (typeof lastItem === 'object' && lastItem !== null && typeof lastItem.y === 'number') {
            return isNaN(lastItem.y) ? 0 : lastItem.y;
        }
        return 0;
    };
    
    // This local state is also preserved.
    const [kpiData, setKpiData] = useState({
        spc: getLastValue(initialHistory.spc),
        tsr: getLastValue(initialHistory.tsr),
        clinkerQuality: getLastValue(initialHistory.clinker_quality),
        co2Emissions: getLastValue(initialHistory.co2),
    });

    // These local chart data states are preserved.
    const [spcData, setSpcData] = useState(createChartData(initialHistory.spc, chartColors.primary));
    const [tsrData, setTsrData] = useState(createChartData(initialHistory.tsr, chartColors.error));
    const [clinkerData, setClinkerData] = useState(createChartData(initialHistory.clinker_quality, chartColors.secondary));
    const [co2Data, setCo2Data] = useState(createChartData(initialHistory.co2, chartColors.warning));

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;
        
        try {
            unsubscribe = subscribeToLiveData((payload) => {
                if (!payload) return;
                
                // --- ADDITION: Dispatch live data to the global context ---
                if (payload.kpi_data) {
                    dispatch({
                        type: 'ADD_KPI_DATA',
                        payload: { ...payload.kpi_data, timestamp: Date.now() }
                    });
                }
                if (payload.log_entry) {
                    dispatch({ type: 'ADD_LOG', payload: payload.log_entry });
                }
                // --- End of Addition ---
                
                // The original state updates are preserved below
                if (!payload.kpi_data) return;
                
                try {
                    const validatedKpiData = {
                        spc: typeof payload.kpi_data.spc === 'number' ? payload.kpi_data.spc : kpiData.spc,
                        tsr: typeof payload.kpi_data.tsr === 'number' ? payload.kpi_data.tsr : kpiData.tsr,
                        clinkerQuality: typeof payload.kpi_data.clinker_quality === 'number' ? payload.kpi_data.clinker_quality : kpiData.clinkerQuality,
                        co2Emissions: typeof payload.kpi_data.co2 === 'number' ? payload.kpi_data.co2 : kpiData.co2Emissions,
                    };
                    setKpiData(validatedKpiData);

                    const timestamp = Date.now();
                    
                    const updateChart = (setter: React.Dispatch<React.SetStateAction<ChartData<'line'>>>, y: number) => {
                        setter(prevData => {
                            const newData = [...prevData.datasets[0].data];
                            newData.push({ x: timestamp, y });
                            if (newData.length > 30) newData.shift();
                            return { datasets: [{ ...prevData.datasets[0], data: newData }] };
                        });
                    };

                    updateChart(setSpcData, validatedKpiData.spc);
                    updateChart(setTsrData, validatedKpiData.tsr);
                    updateChart(setClinkerData, validatedKpiData.clinkerQuality);
                    updateChart(setCo2Data, validatedKpiData.co2Emissions);

                } catch (err) {
                    console.error('Error processing live data payload:', err);
                }
            });
            
            setIsLoading(false);
            
        } catch (err) {
            console.error('Error setting up live data subscription:', err);
            setError(`Live data setup error: ${err}`);
            setIsLoading(false);
        }

        return () => {
            if (unsubscribe) {
                try {
                    unsubscribe();
                } catch (err) {
                    console.error('Error during live data cleanup:', err);
                }
            }
        };
    }, [dispatch]); // ADDITION: Added dispatch to dependency array

    if (error) {
        return (
            <div className="controller-container">
                <div className="error-state" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ff475740', border: '1px solid #ff4757', borderRadius: '8px', margin: '2rem' }}>
                    <h3 style={{ color: '#ff4757' }}>Controller Error</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} style={{ background: '#ff4757', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading && controllerState.spcHistory.length === 0) { // MODIFICATION: Check context state for initial load
        return (
            <div className="controller-container">
                <div className="loading-state" style={{ padding: '2rem', textAlign: 'center', margin: '2rem' }}>
                    <h3>Loading Controller...</h3>
                    <p>Initializing process monitoring systems...</p>
                </div>
            </div>
        );
    }

    const safeToFixed = (value: any, decimals: number = 2): string => {
        return Number(value || 0).toFixed(decimals);
    };

    // --- ADDITION: Create new chart data objects from the global state ---
    const globalSpcData = { datasets: [{ ...createChartData([], chartColors.primary).datasets[0], data: controllerState.spcHistory }] };
    const globalTsrData = { datasets: [{ ...createChartData([], chartColors.error).datasets[0], data: controllerState.tsrHistory }] };
    const globalClinkerData = { datasets: [{ ...createChartData([], chartColors.secondary).datasets[0], data: controllerState.clinkerQualityHistory }] };
    const globalCo2Data = { datasets: [{ ...createChartData([], chartColors.warning).datasets[0], data: controllerState.co2History }] };

    // --- ADDITION: Get the latest KPI values from the global state ---
    const latestGlobalKpi = {
        spc: getLastValue(controllerState.spcHistory),
        tsr: getLastValue(controllerState.tsrHistory),
        clinkerQuality: getLastValue(controllerState.clinkerQualityHistory),
        co2Emissions: getLastValue(controllerState.co2History),
    };

    const kpiCards: KpiInfo[] = [
        { title: 'Specific Power Consumption', value: latestGlobalKpi.spc, unit: 'kWh/t', icon: <ShieldFill />, color: chartColors.primary},
        { title: 'Thermal Substitution Rate', value: latestGlobalKpi.tsr, unit: '%', icon: <Thermometer />, color: chartColors.error},
        { title: 'Clinker Quality Index', value: latestGlobalKpi.clinkerQuality, unit: '%', icon: <Shield />, color: chartColors.secondary},
        { title: 'CO₂ Emissions', value: latestGlobalKpi.co2Emissions, unit: 't/t clinker', icon: <CloudRain />, color: chartColors.warning}
    ];

    const getLogConfig = (level: LogEntry['level']) => {
        switch (level) {
            case 'Info': return { icon: <Info size={14} />, color: '#3742FA' };
            case 'Warning': return { icon: <ExclamationTriangle size={14} />, color: '#FFA500' };
            case 'Alert': return { icon: <ExclamationTriangle size={14} />, color: '#FF4757' };
            default: return { icon: <Info size={14} />, color: 'var(--text-tertiary)' };
        }
    };

    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const getChartOptions = (unit: string, chartData: ChartData<'line'>): ChartOptions<'line'> => {
        const dataPoints = chartData.datasets[0]?.data as {x: number, y: number}[];
        const DURATION = 30 * 2000;

        let yMin, yMax;
        if (dataPoints && dataPoints.length > 1) {
            const yValues = dataPoints.map(p => p.y);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            const padding = (maxY - minY) * 0.15 || 5;
            yMin = minY - padding;
            yMax = maxY + padding;
        } else if (dataPoints && dataPoints.length === 1) {
             yMin = dataPoints[0].y - 10;
             yMax = dataPoints[0].y + 10;
        } else {
            yMin = 0;
            yMax = 100;
        }

        let xMin, xMax;
        const lastX = dataPoints && dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].x : Date.now();
        xMax = lastX;
        xMin = lastX - DURATION;
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, title: { display: false } },
            scales: {
                x: {
                    type: 'linear',
                    min: xMin,
                    max: xMax,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: {
                        color: '#ffffff',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 6,
                        font: { size: 10 },
                        callback: function(value) {
                            if (typeof value !== 'number' || value === 0) return '';
                            const date = new Date(Number(value));
                            return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        }
                    },
                },
                y: {
                    min: yMin,
                    max: yMax,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: {
                        color: '#ffffff',
                        font: { size: 10 },
                        callback: (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(Number(value))
                    },
                    title: {
                        display: true,
                        text: unit,
                        color: '#ffffff',
                        font: { size: 11 }
                    },
                }
            },
            interaction: { intersect: false, mode: 'index' },
            animation: { duration: 300, easing: 'easeInOutQuart' },
            elements: { line: { tension: 0.4 }, point: { radius: 2, hoverRadius: 5 } }
        };
    };

    const chartConfigs = [
        { data: globalSpcData, title: 'Specific Power Consumption', unit: 'kWh/t', icon: <ShieldFill />, color: chartColors.primary, description: 'Energy efficiency monitoring' },
        { data: globalTsrData, title: 'Thermal Substitution Rate', unit: '%', icon: <Thermometer />, color: chartColors.error, description: 'Alternative fuel usage' },
        { data: globalClinkerData, title: 'Clinker Quality Index', unit: '%', icon: <Shield />, color: chartColors.secondary, description: 'Product quality metrics' },
        { data: globalCo2Data, title: 'CO₂ Emissions', unit: 't/t clinker', icon: <CloudRain />, color: chartColors.warning, description: 'Environmental impact' },
    ];
    
    // --- MODIFICATION: Read logs from the global state ---
    const filteredLogs = controllerState.logs.filter(log => logFilter === 'All' || log.level === logFilter);

    return (
        <div className="controller-container">
            <div className="controller-header">
                <h1 className="page-title">Process Controller</h1>
                <p className="page-subtitle">Real-time monitoring and process control systems</p>
            </div>

            <Row className="mb-4">
                {kpiCards.map((kpi, index) => (
                    <Col xl={3} md={6} key={index} className="mb-3 mb-xl-0">
                        <div className="summary-kpi-card">
                            <div className="kpi-icon" style={{color: kpi.color}}>{kpi.icon}</div>
                            <div className="kpi-details">
                                <span className="kpi-title">{kpi.title}</span>
                                <span className="kpi-value">{safeToFixed(kpi.value)} <span className="kpi-unit">{kpi.unit}</span></span>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            <Row>
                <Col lg={8}>
                    <div className="section-header">
                        <h3 className="section-title">Process Parameters</h3>
                    </div>
                    <Row>
                        {chartConfigs.map((config, index) => (
                            <Col md={6} className="mb-4" key={index}>
                                <div className="chart-card">
                                    <div className="chart-header">
                                        <div className="chart-info">
                                            <div className="chart-icon" style={{ color: config.color }}>{config.icon}</div>
                                            <div className="chart-details">
                                                <h6 className="chart-title">{config.title}</h6>
                                                <p className="chart-description">{config.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="chart-container">
                                        <Line data={config.data} options={getChartOptions(config.unit, config.data)} />
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Col>

                <Col lg={4}>
                    <div className="section-header">
                        <h3 className="section-title">System Events</h3>
                    </div>
                    <div className="log-wrapper">
                        <div className="log-filters">
                            <ButtonGroup>
                                {(['All', 'Alert', 'Warning', 'Info'] as const).map(level => (
                                    <Button key={level} className={logFilter === level ? 'active' : ''} onClick={() => setLogFilter(level)}>
                                        {level}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </div>
                        <div className="log-content">
                            {filteredLogs.length === 0 ? (
                                <div className="empty-logs"><Info size={24} /><p>No '{logFilter}' events</p></div>
                            ) : (
                                <div className="log-list">
                                    {filteredLogs.map((log) => {
                                        const logConfig = getLogConfig(log.level);
                                        return (
                                            <div key={log.id} className="log-entry">
                                                <div className="log-indicator" style={{color: logConfig.color}}>{logConfig.icon}</div>
                                                <div className="log-details">
                                                    <p className="log-message">{log.message}</p>
                                                    <span className="log-time">{formatTimestamp(log.id)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            <style>{`
                /* STYLES ARE PRESERVED AS REQUESTED */
                .controller-container { padding: 0; }
                .controller-header { margin-bottom: 2rem; }
                .page-title { font-size: 32px; font-weight: 300; margin-bottom: 0.25rem; }
                .page-subtitle { font-size: 16px; color: var(--text-secondary); margin: 0; }
                .section-header { margin-bottom: 1.5rem; }
                .section-title { font-size: 20px; font-weight: 500; }
                .summary-kpi-card { background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: 1rem; display: flex; align-items: center; gap: 1rem; }
                .kpi-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .kpi-details { display: flex; flex-direction: column; gap: 0.25rem; overflow: hidden; }
                .kpi-title { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }
                .kpi-value { font-size: 22px; font-weight: 500; color: var(--text-primary); }
                .kpi-unit { font-size: 14px; color: var(--text-secondary); }
                .chart-card { background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); overflow: hidden; }
                .chart-header { display: flex; padding: 1rem; }
                .chart-info { display: flex; align-items: center; gap: 0.75rem; }
                .chart-icon { font-size: 1.2rem; }
                .chart-details { display: flex; flex-direction: column; }
                .chart-title { font-size: 14px; font-weight: 500; margin: 0; }
                .chart-description { font-size: 12px; color: var(--text-tertiary); margin: 0; }
                .chart-container { height: 200px; padding: 0 1rem 1rem; }
                .log-wrapper { background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); height: 100%; display: flex; flex-direction: column; }
                .log-filters { padding: 0.5rem; border-bottom: 1px solid var(--border-primary); }
                .log-filters .btn-group { width: 100%; }
                .log-filters .btn { background: transparent; border: none; color: var(--text-tertiary); font-size: 12px; font-weight: 500; text-transform: uppercase; border-radius: var(--radius-md) !important; flex-grow: 1; }
                .log-filters .btn.active { background: var(--accent-primary); color: var(--bg-primary); }
                .log-content { flex-grow: 1; overflow-y: auto; padding: 1rem; }
                .empty-logs { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-tertiary); }
                .log-entry { display: flex; align-items: flex-start; gap: 1rem; }
                .log-entry:not(:last-child) { margin-bottom: 1rem; }
                .log-indicator { font-size: 1.1rem; }
                .log-details { display: flex; flex-direction: column; }
                .log-message { font-size: 13px; color: var(--text-secondary); margin-bottom: 0.25rem; }
                .log-time { font-size: 11px; color: var(--text-tertiary); }
                .log-content::-webkit-scrollbar { width: 6px; }
                .log-content::-webkit-scrollbar-track { background: transparent; }
                .log-content::-webkit-scrollbar-thumb { background: var(--border-secondary); border-radius: 3px; }
            `}</style>
        </div>
    );
};

export default ControllerPage;