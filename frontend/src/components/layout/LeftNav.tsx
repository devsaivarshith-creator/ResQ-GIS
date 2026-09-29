import {
  LayoutDashboard,
  Radio,
  Layers,
  Home,
  Navigation,
  Building,
  AlertTriangle,
  FileText,
  Database,
  Settings,
  ArrowLeftRight,
  Scan,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { NavSection } from '../../types';

interface NavItemDef {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  targetPanel?: NavSection;
}

const NAV_ITEMS: NavItemDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, targetPanel: 'analysis' },
  { id: 'map', label: 'Live Situation', icon: Radio, targetPanel: 'map' },
  { id: 'compare', label: 'Priority Compare', icon: ArrowLeftRight, targetPanel: 'relocation_compare' },
  { id: 'surveillance', label: 'Surveillance & AOI', icon: Scan, targetPanel: 'surveillance' },
  { id: 'habitations', label: 'Habitations', icon: Home, targetPanel: 'habitations' },
  { id: 'relocation', label: 'Relocation & Havens', icon: Navigation, targetPanel: 'relocation' },
  { id: 'infrastructure', label: 'Infrastructure', icon: Building, targetPanel: 'rivers' },
  { id: 'hazard_layers', label: 'Hazard Layers', icon: Layers, targetPanel: 'layers' },
  { id: 'alerts', label: 'Alerts Feed', icon: AlertTriangle, targetPanel: 'alerts' },
  { id: 'reports', label: 'Travel & Evacuation', icon: FileText, targetPanel: 'reports' },
  { id: 'datasources', label: 'Data Sources', icon: Database, targetPanel: 'datasources' },
  { id: 'settings', label: 'Settings', icon: Settings, targetPanel: 'settings' },
];

export default function LeftNav() {
  const { activeNav, setActiveNav, isLeftNavCollapsed, toggleLeftNav } = useAppStore();

  const handleNavClick = (item: NavItemDef) => {
    if (item.targetPanel) {
      setActiveNav(item.targetPanel);
    }
  };

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: isLeftNavCollapsed ? 40 : 148,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: '6px 3px',
        flexShrink: 0,
        gap: 6,
        transition: 'width 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Top Header & Fold Toggle Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isLeftNavCollapsed ? 'center' : 'space-between',
            padding: '2px 4px 4px 4px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {!isLeftNavCollapsed && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Operations
            </span>
          )}
          <button
            onClick={toggleLeftNav}
            className="btn-action"
            style={{
              padding: '2px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
            }}
            title={isLeftNavCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isLeftNavCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Navigation Menu Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.id === 'dashboard' && activeNav === 'analysis') ||
              (item.id === 'map' && activeNav === 'map') ||
              (item.id === 'compare' && activeNav === 'relocation_compare') ||
              (item.id === 'surveillance' && activeNav === 'surveillance') ||
              (item.id === 'hazard_layers' && activeNav === 'layers') ||
              (item.id === 'habitations' && activeNav === 'habitations') ||
              (item.id === 'relocation' && activeNav === 'relocation') ||
              (item.id === 'infrastructure' && activeNav === 'rivers') ||
              (item.id === 'alerts' && activeNav === 'alerts') ||
              (item.id === 'reports' && activeNav === 'reports') ||
              (item.id === 'datasources' && activeNav === 'datasources') ||
              (item.id === 'settings' && activeNav === 'settings');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  padding: isLeftNavCollapsed ? '5px 0' : '4px 6px',
                  justifyContent: isLeftNavCollapsed ? 'center' : 'flex-start',
                  background: isActive ? 'var(--accent-blue-subtle)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
                title={isLeftNavCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 2.5,
                      background: 'var(--accent-blue)',
                      borderRadius: '0 2px 2px 0',
                    }}
                  />
                )}
                <Icon
                  size={13}
                  color={isActive ? 'var(--accent-blue)' : (item.id === 'relocation' ? '#10b981' : 'var(--text-secondary)')}
                  strokeWidth={isActive || item.id === 'relocation' ? 2.5 : 2}
                />
                {!isLeftNavCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', overflow: 'hidden' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 10.5,
                        fontWeight: isActive ? 700 : (item.id === 'relocation' ? 700 : 500),
                        color: isActive ? 'var(--accent-blue)' : (item.id === 'relocation' ? '#10b981' : 'var(--text-primary)'),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.label}
                    </span>
                    {item.id === 'relocation' && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          letterSpacing: '0.4px',
                          marginLeft: 4,
                          flexShrink: 0,
                        }}
                      >
                        CORE
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
}
