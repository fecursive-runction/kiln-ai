import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useController } from '../contexts/ControllerContext';
import {
  List,
  Speedometer2,
  Sliders,
  Robot,
  GraphUp,
  Gear,
  BoxArrowRight,
  Person,
  X,
  Activity,
  Power,
  GearFill,
  Cpu, // Added for brand icon
} from 'react-bootstrap-icons';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactElement;
  description?: string;
}

const MainLayout: React.FC = () => {
  // --- CORRECTED STATE MANAGEMENT ---
  // All variables are declared only once.
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const { state } = useController(); // Get state from ControllerContext
  const { plantStatus } = state;    // Get plantStatus from the context's state
  
  const { currentUser, logOut } = useAuth(); // Get auth info from AuthContext
  const navigate = useNavigate();           // Get navigate function from router
  // --- END OF CORRECTION ---

  const navigationItems: NavigationItem[] = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <Speedometer2 size={20} />,
      description: 'System Overview',
    },
    {
      path: '/controller',
      label: 'Controller',
      icon: <Sliders size={20} />,
      description: 'Process Control',
    },
    {
      path: '/chatbot',
      label: 'PlantGPT',
      icon: <Robot size={20} />,
      description: 'Intelligent Support',
    },
    {
      path: '/optimizer',
      label: 'Optimizer',
      icon: <GraphUp size={20} />,
      description: 'Performance Tuning',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => setIsSidebarMinimized(!isSidebarMinimized);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch {
      console.error("Failed to log out");
    }
  };

  const formatDateTime = (date: Date) => ({
    date: date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Running':
        return {
          icon: <Activity size={14} />,
          color: 'var(--accent-primary)',
          bgColor: 'rgba(0, 255, 136, 0.1)',
        };
      case 'Stopped':
        return {
          icon: <Power size={14} />,
          color: 'var(--accent-error)',
          bgColor: 'rgba(255, 71, 87, 0.1)',
        };
      case 'Maintenance':
        return {
          icon: <GearFill size={14} />,
          color: 'var(--accent-warning)',
          bgColor: 'rgba(255, 149, 0, 0.1)',
        };
      default:
        return {
          icon: <Activity size={14} />,
          color: 'var(--text-tertiary)',
          bgColor: 'var(--bg-tertiary)',
        };
    }
  };

  const statusConfig = getStatusConfig(plantStatus);
  const dateTime = formatDateTime(currentTime);

  return (
    <div className="main-layout">
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-left">
          <Button className="nav-toggle d-none d-md-flex" onClick={toggleSidebar}>
            <List size={22} />
          </Button>
          <Button className="nav-toggle d-md-none" onClick={toggleMobileSidebar}>
            <List size={22} />
          </Button>
          <div className="navbar-brand">
            <div className="brand-icon">
                <Cpu size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-title">kiln.AI</span>
            </div>
          </div>
        </div>
        <div className="navbar-center d-none d-lg-flex">
           <span className="center-title">Plant Control System</span>
        </div>
        <div className="navbar-right">
            <div className="status-panel d-none d-lg-flex">
                <div className="datetime-display">
                    <div className="date-text">{dateTime.date}</div>
                    <div className="time-text">{dateTime.time}</div>
                </div>
                <div className="status-indicator">
                    <div 
                        className="status-badge"
                        style={{ color: statusConfig.color, background: statusConfig.bgColor }}
                    >
                        {statusConfig.icon}
                        <span>Plant {plantStatus}</span>
                    </div>
                </div>
            </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className={`sidebar ${isSidebarMinimized ? 'minimized' : ''}`}>
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <div className="nav-icon">{item.icon}</div>
              {!isSidebarMinimized && (
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
            {!isSidebarMinimized && (
                <div className="footer-content">
                    <div className="user-info-footer">
                        <div className="user-avatar">
                            <Person size={18} />
                        </div>
                        <div className="user-details">
                            <div className="user-name">{currentUser?.username || 'User'}</div>
                            <div className="user-role">{currentUser?.role || 'Guest'}</div>
                        </div>
                    </div>
                    <Button className="logout-button" onClick={handleLogout} title="Sign Out">
                        <BoxArrowRight size={20} />
                    </Button>
                </div>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${isSidebarMinimized ? 'sidebar-minimized' : ''}`}>
          <Outlet />
      </main>

      {/* Styles */}
      <style>{`
        /* ... All previous styles remain the same ... */
        .top-navbar {
          position: fixed; top: 0; left: 0; right: 0; height: 64px;
          background: var(--bg-secondary); border-bottom: 1px solid var(--border-primary);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.5rem; z-index: 1030;
        }
        .navbar-left, .navbar-right { display: flex; align-items: center; gap: 1.5rem; }
        .nav-toggle { background: transparent !important; border: 1px solid var(--border-secondary) !important; color: var(--text-primary) !important; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); }
        .nav-toggle:hover { background: var(--bg-hover) !important; border-color: var(--accent-primary) !important; color: var(--accent-primary) !important; }
        .navbar-brand { display: flex; align-items: center; gap: 0.75rem; }
        .brand-icon { width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--bg-primary); }
        .brand-text { display: flex; flex-direction: column; line-height: 1.2; }
        .brand-title { font-size: 18px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.3px; font-style: italic; }
        .navbar-center { position: absolute; left: 50%; transform: translateX(-50%); }
        .center-title { font-size: 14px; color: var(--text-secondary); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
        .status-panel { display: flex; align-items: center; gap: 1.5rem; padding: 0; background: transparent; border: none; box-shadow: none; }
        .datetime-display { text-align: center; }
        .date-text { font-size: 12px; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .time-text { font-size: 14px; color: var(--text-primary); font-weight: 600; }
        .status-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem; border-radius: var(--radius-md); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .sidebar { position: fixed; top: 64px; left: 0; width: 280px; height: calc(100vh - 64px); background: var(--bg-secondary); border-right: 1px solid var(--border-primary); transition: width var(--transition-normal); z-index: 1020; display: flex; flex-direction: column; }
        .sidebar.minimized { width: 72px; }
        .sidebar-nav { padding: 1rem 0.5rem; flex-grow: 1; }
        .nav-item { display: flex; align-items: center; padding: 0.875rem 1rem; margin-bottom: 0.25rem; border-radius: var(--radius-md); color: var(--text-secondary); text-decoration: none; transition: all var(--transition-fast); position: relative; overflow: hidden; }
        .nav-item::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 0; background: var(--accent-primary); border-radius: 0 2px 2px 0; transition: height var(--transition-fast); }
        .nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
        .nav-item:hover::before { height: 20px; }
        .nav-item.active { background: rgba(0, 255, 136, 0.08); color: var(--accent-primary); }
        .nav-item.active::before { height: 24px; }
        .nav-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 1rem; }
        .sidebar.minimized .nav-item { justify-content: center; padding: 0.875rem; }
        .sidebar.minimized .nav-icon { margin-right: 0; }
        .nav-content { display: flex; flex-direction: column; line-height: 1.3; }
        .nav-label { font-size: 14px; font-weight: 500; }
        .nav-description { font-size: 12px; color: var(--text-tertiary); margin-top: 1px; }
        .sidebar.minimized .nav-content { display: none; }
        .sidebar-footer { padding: 1rem; margin-top: auto; border-top: 1px solid var(--border-primary); }
        .footer-content { display: flex; align-items: center; justify-content: space-between; }
        .user-info-footer { display: flex; align-items: center; gap: 0.75rem; }
        .user-avatar { width: 32px; height: 32px; background: var(--bg-tertiary); border: 1px solid var(--border-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); }
        .user-details { display: flex; flex-direction: column; line-height: 1.2; }
        .user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .user-role { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; }
        .logout-button { background: transparent !important; border: 1px solid var(--border-secondary) !important; color: var(--text-secondary) !important; width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
        .logout-button:hover { background: rgba(255, 71, 87, 0.1) !important; color: var(--accent-error) !important; border-color: var(--accent-error) !important; }
        .main-content { margin-left: 280px; padding-top: 64px; min-height: 100vh; transition: margin-left var(--transition-normal); background: var(--bg-primary); }
        .main-content.sidebar-minimized { margin-left: 72px; }
        .content-container { padding: 2rem; }
        @media (max-width: 767.98px) {
          .sidebar { display: none; }
          .main-content, .main-content.sidebar-minimized { margin-left: 0; }
          .content-container { padding: 1rem; }
        }
        @media (max-width: 991.98px) {
          .navbar-center, .status-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;