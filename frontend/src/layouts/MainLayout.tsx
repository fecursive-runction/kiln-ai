import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Nav,
  NavDropdown,
  Button,
  Badge,
  Container,
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
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
} from 'react-bootstrap-icons';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactElement;
  description?: string;
}

const MainLayout: React.FC = () => {
  // State management
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [plantStatus] = useState<'Running' | 'Stopped' | 'Maintenance'>('Running');
  const { currentUser, logOut } = useAuth();
  const navigate = useNavigate();

  // Navigation items
  const navigationItems: NavigationItem[] = [
    {
      path: '/dashboard',
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
      label: 'Plant GPT',
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

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch {
      console.error("Failed to log out");
    }
  };

  // Format date and time
  const formatDateTime = (date: Date) => {
    return {
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
    };
  };

  // Get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Running':
        return {
          variant: 'success',
          icon: <Activity size={14} />,
          color: 'var(--accent-primary)',
          bgColor: 'rgba(0, 255, 136, 0.1)',
        };
      case 'Stopped':
        return {
          variant: 'danger',
          icon: <Power size={14} />,
          color: 'var(--accent-error)',
          bgColor: 'rgba(255, 71, 87, 0.1)',
        };
      case 'Maintenance':
        return {
          variant: 'warning',
          icon: <GearFill size={14} />,
          color: 'var(--accent-warning)',
          bgColor: 'rgba(255, 149, 0, 0.1)',
        };
      default:
        return {
          variant: 'secondary',
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
          {/* Desktop Hamburger */}
          <Button
            className="nav-toggle d-none d-md-flex"
            onClick={toggleSidebar}
          >
            <List size={22} />
          </Button>

          {/* Mobile Hamburger */}
          <Button
            className="nav-toggle d-md-none"
            onClick={toggleMobileSidebar}
          >
            <List size={22} />
          </Button>

          {/* Brand */}
          <div className="navbar-brand">
            <div className="brand-icon">
              <Gear size={24} className="gear-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title">kiln.ai</span>
            </div>
          </div>
        </div>

        {/* Center - Title */}
        <div className="navbar-center d-none d-lg-flex">
           <span className="center-title">Plant Control System</span>
        </div>

        {/* Right - Status Info & User */}
        <div className="navbar-right">
            <div className="status-panel d-none d-lg-flex">
                <div className="datetime-display">
                    <div className="date-text">{dateTime.date}</div>
                    <div className="time-text">{dateTime.time}</div>
                </div>
                <div className="status-indicator">
                    <div 
                        className="status-badge"
                        style={{ 
                            color: statusConfig.color, 
                            background: statusConfig.bgColor 
                        }}
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
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="nav-icon">
                {item.icon}
              </div>
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

      {/* Mobile Sidebar */}
      <aside className={`mobile-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <div className="mobile-brand">
            <Gear size={20} />
            <span>kiln.ai</span>
          </div>
          <Button
            className="mobile-close"
            onClick={toggleMobileSidebar}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="mobile-status">
          <div className="mobile-datetime">
            <div>{dateTime.date} • {dateTime.time}</div>
          </div>
          <div 
            className="mobile-status-badge"
            style={{ 
              color: statusConfig.color, 
              background: statusConfig.bgColor 
            }}
          >
            {statusConfig.icon}
            <span>Plant {plantStatus}</span>
          </div>
        </div>

        <nav className="mobile-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={toggleMobileSidebar}
            >
              <div className="mobile-nav-icon">
                {item.icon}
              </div>
              <div className="mobile-nav-content">
                <span className="mobile-nav-label">{item.label}</span>
                <span className="mobile-nav-description">{item.description}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={toggleMobileSidebar}
      />

      {/* Main Content */}
      <main className={`main-content ${isSidebarMinimized ? 'sidebar-minimized' : ''}`}>
        <Container fluid className="content-container">
          <Outlet />
        </Container>
      </main>

      <style>{`
        .main-layout {
          position: relative;
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        /* ===== TOP NAVIGATION ===== */
        .top-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          border-bottom: 1px solid var(--border-primary);
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          z-index: 1030;
          backdrop-filter: blur(10px);
        }

        .top-navbar::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
          opacity: 0.3;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-toggle {
          background: transparent !important;
          border: 1px solid var(--border-secondary) !important;
          color: var(--text-primary) !important;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .nav-toggle:hover {
          background: var(--bg-hover) !important;
          border-color: var(--accent-primary) !important;
          color: var(--accent-primary) !important;
          transform: scale(1.05);
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-glow);
        }

        .gear-icon {
          color: var(--bg-primary);
          animation: rotate 8s linear infinite;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .brand-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .navbar-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .center-title {
          font-size: 14px;
          color: var(--text-tertiary);
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .navbar-right {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .status-panel {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 0.5rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .datetime-display {
          text-align: center;
        }

        .date-text {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .time-text {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 600;
          font-family: var(--font-primary);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* ===== DESKTOP SIDEBAR ===== */
        .sidebar {
          position: fixed;
          top: 64px;
          left: 0;
          width: 280px;
          height: calc(100vh - 64px);
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          border-right: 1px solid var(--border-primary);
          box-shadow: var(--shadow-lg);
          transition: width var(--transition-normal);
          z-index: 1020;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .sidebar.minimized {
          width: 72px;
        }

        .sidebar-nav {
          padding: 1rem 0.5rem;
          flex-grow: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.875rem 1rem;
          margin-bottom: 0.25rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: var(--accent-primary);
          border-radius: 0 2px 2px 0;
          transition: height var(--transition-fast);
        }

        .nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .nav-item:hover::before {
          height: 20px;
        }

        .nav-item.active {
          background: rgba(0, 255, 136, 0.08);
          color: var(--accent-primary);
          box-shadow: var(--shadow-glow);
        }

        .nav-item.active::before {
          height: 24px;
        }

        .nav-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          transition: transform var(--transition-fast);
        }

        .nav-item.active .nav-icon {
          transform: scale(1.1);
        }

        .sidebar.minimized .nav-item {
          justify-content: center;
          padding: 0.875rem;
        }

        .sidebar.minimized .nav-icon {
          margin-right: 0;
        }

        .nav-content {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .nav-description {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 1px;
        }

        .sidebar.minimized .nav-content {
          display: none;
        }

        /* Sidebar Footer */
        .sidebar-footer {
            padding: 1rem;
            margin-top: auto;
            border-top: 1px solid var(--border-primary);
            background: rgba(0,0,0,0.1);
        }

        .footer-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .user-info-footer {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .user-details {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .user-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .user-role {
          font-size: 11px;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .logout-button {
            background: transparent !important;
            border: 1px solid var(--border-secondary) !important;
            color: var(--text-secondary) !important;
            width: 40px;
            height: 40px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logout-button:hover {
            background: rgba(255, 71, 87, 0.1) !important;
            color: var(--accent-error) !important;
            border-color: var(--accent-error) !important;
        }

        /* ===== MOBILE SIDEBAR ===== */
        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 320px;
          height: 100vh;
          background: var(--bg-card);
          border-right: 1px solid var(--border-primary);
          box-shadow: var(--shadow-lg);
          transform: translateX(-100%);
          transition: transform var(--transition-normal);
          z-index: 1040;
          display: flex;
          flex-direction: column;
        }

        .mobile-sidebar.open {
          transform: translateX(0);
        }

        .mobile-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-primary);
          background: var(--bg-tertiary);
        }

        .mobile-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .mobile-close {
          background: transparent !important;
          border: 1px solid var(--border-secondary) !important;
          color: var(--text-secondary) !important;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-status {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-primary);
          background: rgba(0, 255, 136, 0.03);
        }

        .mobile-datetime {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          font-family: var(--font-primary);
        }

        .mobile-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .mobile-nav {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          margin-bottom: 0.5rem;
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .mobile-nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--border-secondary);
        }

        .mobile-nav-item.active {
          background: rgba(0, 255, 136, 0.08);
          color: var(--accent-primary);
          border-color: var(--border-accent);
          box-shadow: var(--shadow-glow);
        }

        .mobile-nav-icon {
          width: 48px;
          height: 48px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          transition: all var(--transition-fast);
        }

        .mobile-nav-item.active .mobile-nav-icon {
          background: rgba(0, 255, 136, 0.1);
          border-color: var(--accent-primary);
        }

        .mobile-nav-content {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
        }

        .mobile-nav-label {
          font-size: 16px;
          font-weight: 500;
        }

        .mobile-nav-description {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-top: 2px;
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1035;
          opacity: 0;
          visibility: hidden;
          transition: all var(--transition-normal);
        }

        .mobile-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* ===== MAIN CONTENT ===== */
        .main-content {
          margin-left: 280px;
          padding-top: 64px;
          min-height: 100vh;
          transition: margin-left var(--transition-normal);
          background: var(--bg-primary);
        }

        .main-content.sidebar-minimized {
          margin-left: 72px;
        }

        .content-container {
          padding: 2rem;
        }

        /* ===== ANIMATIONS ===== */
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 767.98px) {
          .sidebar {
            display: none;
          }
          
          .main-content,
          .main-content.sidebar-minimized {
            margin-left: 0;
          }

          .content-container {
            padding: 1rem;
          }

          .top-navbar {
            padding: 0 1rem;
          }

          .brand-text {
            display: none;
          }
        }

        @media (max-width: 991.98px) {
          .navbar-center, .status-panel {
            display: none !important;
          }
        }

        @media (max-width: 575.98px) {
          .brand-title {
             display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;