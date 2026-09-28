import { useState, useRef, useEffect } from 'react';
import {
  FolderKanban,
  ChevronDown,
  Plus,
  Radio,
  Sun,
  Moon,
  Layers,
  Globe,
  Check,
  Navigation,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { flyToDistrict, flyToState } from '../../cesium/camera';

const STATES_AND_DISTRICTS: Record<string, string[]> = {
  'Uttarakhand': ['Chamoli', 'Rudraprayag', 'Pithoragarh', 'Uttarkashi'],
  'Himachal Pradesh': ['Kullu', 'Mandi', 'Kinnaur'],
  'Kerala': ['Wayanad', 'Idukki', 'Alappuzha'],
  'Andhra Pradesh': ['Dr. B.R. Ambedkar Konaseema', 'Visakhapatnam'],
  'Assam': ['Majuli', 'Cachar', 'Dima Hasao'],
  'Sikkim': ['Mangan', 'Gangtok'],
  'Odisha': ['Jagatsinghpur', 'Puri', 'Ganjam'],
  'Jammu & Kashmir': ['Anantnag', 'Srinagar'],
  'Meghalaya': ['East Khasi Hills'],
  'Manipur & Nagaland': ['Noney', 'Kohima'],
};

export default function TopBar() {
  const {
    theme,
    toggleTheme,
    mapMode,
    setMapMode,
    backendConnected,
    alerts,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addWorkspace,
    isSurveillanceActive,
    toggleSurveillance,
    selectedState,
    setSelectedState,
    selectedDistrict,
    setSelectedDistrict,
    selectedHazardType,
    setSelectedHazardType,
    setActiveNav,
    selectHabitation,
    selectSite,
    selectRiver,
  } = useAppStore();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDistrict, setNewWsDistrict] = useState('Chamoli');
  const [newWsDescription, setNewWsDescription] = useState('');
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const topAlert = alerts[0];

  // Close workspace dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        workspaceDropdownRef.current &&
        !workspaceDropdownRef.current.contains(event.target as Node)
      ) {
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const newWs = {
      id: `ws-${Date.now()}`,
      name: newWsName.trim(),
      district: newWsDistrict,
      description: newWsDescription.trim() || 'Custom operational monitoring sector',
      color: '#3b82f6',
      habitationsCount: 5,
      safeSitesCount: 2,
      priority: 'HIGH' as const,
      surveillanceZones: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    addWorkspace(newWs);
    setActiveWorkspaceId(newWs.id);
    setSelectedDistrict(newWsDistrict);
    selectHabitation(null);
    selectSite(null);
    selectRiver(null);
    flyToDistrict(newWsDistrict);
    setNewWsName('');
    setNewWsDescription('');
    setNewWorkspaceModalOpen(false);
    setWorkspaceMenuOpen(false);
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    selectHabitation(null);
    selectSite(null);
    selectRiver(null);
    const dists = STATES_AND_DISTRICTS[stateName] || [];
    if (dists.length > 0) {
      setSelectedDistrict(dists[0]);
      flyToDistrict(dists[0]);
    } else {
      setSelectedDistrict('');
      flyToState(stateName);
    }
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    selectHabitation(null);
    selectSite(null);
    selectRiver(null);
    flyToDistrict(dist);
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 38,
        padding: '0 8px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        gap: 5,
        flexShrink: 0,
        position: 'relative',
        zIndex: 10000,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Brand Logo + Version + Workspace Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 11,
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
            }}
          >
            ▲
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'nowrap' }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 900,
                  background: 'linear-gradient(90deg, var(--text-primary), var(--accent-blue))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}
              >
                DRISHTI
              </span>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--border-color)' }} />

        {/* Workspace Folder Dropdown */}
        <div ref={workspaceDropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="btn-action"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 7px',
              height: 24,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 10.5,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            <FolderKanban size={12} color="var(--accent-indigo)" />
            <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeWorkspace?.name || 'Workspace'}
            </span>
            <ChevronDown size={11} color="var(--text-muted)" />
          </button>

          {/* Dropdown Menu */}
          {workspaceMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: 280,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                zIndex: 10001,
              }}
            >
              <div
                style={{
                  padding: '6px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Regional Workspaces & Folders
              </div>

              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspaceId;
                return (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setWorkspaceMenuOpen(false);
                      flyToDistrict(ws.district);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: isSelected ? 'var(--accent-blue-subtle)' : 'transparent',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-blue)' : 'transparent',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>📁</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ws.name}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>
                          {ws.district} &bull; {ws.habitationsCount} sectors
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={14} color="var(--accent-blue)" strokeWidth={2.5} />}
                  </button>
                );
              })}

              <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setNewWorkspaceModalOpen(true);
                  setWorkspaceMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 10px',
                  background: 'var(--bg-subtle)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--accent-blue)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>Create New Workspace Folder</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Unified Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>
        {/* State Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)' }}>State</span>
          <select
            value={selectedState || 'Uttarakhand'}
            onChange={(e) => handleStateChange(e.target.value)}
            style={{
              padding: '2px 5px',
              fontFamily: 'var(--font-sans)',
              fontSize: 10.5,
              fontWeight: 600,
              color: 'var(--text-primary)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: 95,
              height: 26,
            }}
          >
            {Object.keys(STATES_AND_DISTRICTS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* District Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)' }}>Dist</span>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            style={{
              padding: '2px 5px',
              fontFamily: 'var(--font-sans)',
              fontSize: 10.5,
              fontWeight: 600,
              color: 'var(--text-primary)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: 105,
              height: 26,
            }}
          >
            {(STATES_AND_DISTRICTS[selectedState] || ['Chamoli', 'Rudraprayag', 'Pithoragarh', 'Uttarkashi']).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Hazard Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)' }}>Hazard</span>
          <select
            value={selectedHazardType ?? 'all'}
            onChange={(e) => setSelectedHazardType(e.target.value === 'all' ? null : (e.target.value as any))}
            style={{
              padding: '2px 5px',
              fontFamily: 'var(--font-sans)',
              fontSize: 10.5,
              fontWeight: 600,
              color: 'var(--text-primary)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: 100,
              height: 26,
            }}
          >
            <option value="all">All Hazards</option>
            <option value="landslide">Landslide & Slope</option>
            <option value="flood">Flood & Flash Flood</option>
            <option value="glof">GLOF</option>
            <option value="cyclone">Cyclone</option>
            <option value="earthquake">Seismic</option>
          </select>
        </div>

        {/* Relocation Core USP CTA */}
        <button
          onClick={() => setActiveNav('relocation')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(6, 182, 212, 0.16))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            color: '#10b981',
            fontSize: 10.5,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            height: 26,
            boxShadow: '0 1px 3px rgba(16, 185, 129, 0.15)',
          }}
          title="Open Flagship Relocation & Safe Haven Logistics Hub"
        >
          <Navigation size={11} color="#10b981" />
          <span>Relocation Hub</span>
        </button>

        {/* Live Alert Ticker Pill */}
        {topAlert && (
          <button
            onClick={() => setActiveNav('alerts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: topAlert.severity === 'red' ? 'var(--accent-rose-subtle)' : 'var(--accent-amber-subtle)',
              border: `1px solid ${topAlert.severity === 'red' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              padding: '2px 6px',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              marginLeft: 2,
              minWidth: 0,
              maxWidth: 180,
              height: 26,
              overflow: 'hidden',
              flexShrink: 1,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                flexShrink: 0,
                background: topAlert.severity === 'red' ? 'var(--accent-rose)' : 'var(--accent-amber)',
                boxShadow: `0 0 5px ${topAlert.severity === 'red' ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: topAlert.severity === 'red' ? 'var(--accent-rose)' : 'var(--accent-amber)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {topAlert.eventType || 'Active Warning'}: {topAlert.area ? topAlert.area.split(',')[0] : 'Regional'}
            </span>
          </button>
        )}
      </div>

      {/* 3. Action Tools: Surveillance, Map Mode, Telemetry & Theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        {/* Surveillance Mode Toggle Button */}
        <button
          onClick={() => {
            toggleSurveillance();
            if (!isSurveillanceActive) {
              setActiveNav('surveillance');
            }
          }}
          className="btn-action"
          style={{
            background: isSurveillanceActive ? 'var(--accent-rose)' : 'var(--bg-surface)',
            color: isSurveillanceActive ? '#ffffff' : 'var(--text-primary)',
            borderColor: isSurveillanceActive ? 'var(--accent-rose)' : 'var(--border-color)',
            boxShadow: isSurveillanceActive ? '0 0 8px rgba(244, 63, 94, 0.3)' : 'var(--shadow-xs)',
            height: 26,
            padding: '2px 7px',
            fontSize: 10.5,
          }}
          title="Toggle Surveillance AOI Tool"
        >
          <Radio size={12} className={isSurveillanceActive ? 'pulse' : ''} />
          <span>{isSurveillanceActive ? 'AOI Active' : 'Mark AOI'}</span>
        </button>

        {/* 2D / 3D Map Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: 1.5,
            height: 26,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setMapMode('2d')}
            style={{
              padding: '2px 6px',
              fontSize: 10.5,
              fontWeight: 700,
              background: mapMode === '2d' ? 'var(--bg-surface)' : 'transparent',
              color: mapMode === '2d' ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              boxShadow: mapMode === '2d' ? 'var(--shadow-xs)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Layers size={11} />
            <span>2D</span>
          </button>
          <button
            onClick={() => setMapMode('3d')}
            style={{
              padding: '2px 6px',
              fontSize: 10.5,
              fontWeight: 700,
              background: mapMode === '3d' ? 'var(--bg-surface)' : 'transparent',
              color: mapMode === '3d' ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              boxShadow: mapMode === '3d' ? 'var(--shadow-xs)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Globe size={11} />
            <span>3D</span>
          </button>
        </div>

        {/* Telemetry Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 6px',
            background: backendConnected ? 'var(--accent-emerald-subtle)' : 'rgba(14, 165, 233, 0.1)',
            border: `1px solid ${backendConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(14, 165, 233, 0.3)'}`,
            borderRadius: 'var(--radius-pill)',
            fontSize: 9.5,
            fontWeight: 700,
            height: 26,
            color: backendConnected ? 'var(--accent-emerald)' : 'var(--accent-blue)',
          }}
          title={backendConnected ? 'FastAPI & Live Government Ingestion active' : 'Direct GIS Telemetry active'}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: backendConnected ? 'var(--accent-emerald)' : 'var(--accent-blue)',
            }}
          />
          <span>{backendConnected ? 'Live Synced' : 'Operational'}</span>
        </div>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-action"
          style={{ padding: '6px 8px' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} color="#fde047" />}
        </button>
      </div>

      {/* New Workspace Creation Modal */}
      {newWorkspaceModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              padding: 20,
              width: 380,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderKanban size={18} color="var(--accent-blue)" />
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                Create Operational Workspace
              </div>
            </div>

            <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Workspace / Sector Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Joshimath Rapid Surveillance"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Assigned Administrative District
                </label>
                <select
                  value={newWsDistrict}
                  onChange={(e) => setNewWsDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="Chamoli">Chamoli</option>
                  <option value="Rudraprayag">Rudraprayag</option>
                  <option value="Pithoragarh">Pithoragarh</option>
                  <option value="Uttarkashi">Uttarkashi</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Mission Objective & Description
                </label>
                <textarea
                  placeholder="Describe focus: subsidence tracking, flash flood, evacuation corridors..."
                  value={newWsDescription}
                  onChange={(e) => setNewWsDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setNewWorkspaceModalOpen(false)}
                  className="btn-action"
                  style={{ padding: '7px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-action btn-action--primary"
                  style={{ padding: '7px 16px' }}
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
