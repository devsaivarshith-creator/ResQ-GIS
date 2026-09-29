import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Printer,
  Search,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { flyToDistrict, flyToState, flyToHabitation } from '../../cesium/camera';
import type { Habitation, RelocationSite } from '../../types';
import {
  toRiskPercentage,
  getRiskColor,
  getRiskBandInfo,
  calculateWeightageBreakdown,
} from '../../utils/riskClassification';

// Helper: Determine mode of travel & journey time based on distance and hazard exposure
function getRouteDetails(hab: Habitation, site?: RelocationSite) {
  const distKm = site?.distanceFromAffected || 12.5;
  const isFlood = hab.hazardExposure.some((he) => he.type === 'flood' && (he.level === 'HIGH' || he.level === 'CRITICAL'));
  const isGLOF = hab.hazardExposure.some((he) => he.type === 'glof' && (he.level === 'HIGH' || he.level === 'CRITICAL'));
  const isHighAltitude = (hab.location.elevation || 1500) > 1800;

  let modeLabel = 'Heavy Evacuation Bus';
  let modeIcon = '🚌';
  let speedKmH = 32;
  let vehicleType = '45-Seater High-Clearance State Transport Bus';

  if (isGLOF || (isHighAltitude && hab.riskLevel === 'CRITICAL')) {
    modeLabel = 'Air / Helicopter Sortie';
    modeIcon = '🚁';
    speedKmH = 80;
    vehicleType = 'Mi-17V5 / ALH Dhruv SAR Helicopter Sortie';
  } else if (isFlood && hab.vulnerabilityIndex.overall > 0.6) {
    modeLabel = 'Motorboat / Flood Vessel';
    modeIcon = '🚤';
    speedKmH = 22;
    vehicleType = 'NDRF Inflatable Motorized Rescue Boat';
  } else if (isHighAltitude) {
    modeLabel = 'Heavy 4x4 Off-Road Truck';
    modeIcon = '🚜';
    speedKmH = 24;
    vehicleType = 'Army 4x4 All-Terrain Stallion Troop Carrier';
  }

  const travelMins = Math.round((distKm / speedKmH) * 60);
  const journeyTimeStr = travelMins >= 60 ? `${Math.floor(travelMins / 60)}h ${travelMins % 60}m` : `${travelMins} mins`;

  return {
    modeLabel,
    modeIcon,
    vehicleType,
    distKm,
    journeyTimeStr,
    corridor: site?.lifelineCorridor || 'NH Lifeline Highway',
  };
}

export default function ReportsPanel() {
  const { habitations, relocationSites } = useAppStore();

  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReportHab, setActiveReportHab] = useState<Habitation | null>(null);

  // Dynamically extract unique states from all habitations
  const availableStates = useMemo(() => {
    const states = habitations.map(h => h.state).filter(Boolean) as string[];
    return Array.from(new Set(states)).sort();
  }, [habitations]);

  // Dynamically extract districts for selected state
  const availableDistricts = useMemo(() => {
    const filtered = habitations.filter(h => selectedState === 'ALL' || h.state === selectedState);
    const dists = filtered.map(h => h.district).filter(Boolean) as string[];
    return Array.from(new Set(dists)).sort();
  }, [habitations, selectedState]);

  // Auto select ALL or first district when state changes and trigger camera
  const handleStateChange = (st: string) => {
    setSelectedState(st);
    setSelectedDistrict('ALL');
    if (st !== 'ALL') {
      flyToState(st);
    }
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    if (dist !== 'ALL') {
      flyToDistrict(dist);
    }
  };

  const distHabs = useMemo(() => {
    return habitations.filter((h) => {
      const matchState = selectedState === 'ALL' || (h.state && h.state.toLowerCase() === selectedState.toLowerCase());
      const matchDist = selectedDistrict === 'ALL' || (h.district && h.district.toLowerCase() === selectedDistrict.toLowerCase());
      const matchSearch = !searchQuery.trim() || 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.block && h.block.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchState && matchDist && matchSearch;
    });
  }, [habitations, selectedState, selectedDistrict, searchQuery]);

  const distSites = useMemo(() => {
    return relocationSites.filter((s) => {
      const matchState = selectedState === 'ALL' || (s.state && s.state.toLowerCase() === selectedState.toLowerCase());
      const matchDist = selectedDistrict === 'ALL' || (s.district && s.district.toLowerCase() === selectedDistrict.toLowerCase());
      return matchState && matchDist;
    });
  }, [relocationSites, selectedState, selectedDistrict]);

  const atRiskHabs = distHabs.filter((h) => h.riskScore >= 0.5 || h.riskLevel === 'HIGH' || h.riskLevel === 'CRITICAL');
  const exposedPop = distHabs.reduce((sum, h) => sum + h.population, 0);
  const totalSafeCapacity = distSites.reduce((sum, s) => sum + s.capacity, 0);

  // Logistics calculations
  const busesNeeded = Math.ceil(exposedPop / 50);
  const ambulancesNeeded = Math.max(2, Math.ceil(exposedPop / 350));
  const rationsTonnes = ((exposedPop * 0.45 * 14) / 1000).toFixed(1);



  const fallbackSite: RelocationSite = {
    id: 'site-fallback',
    name: 'District Multi-Purpose Safe Haven',
    district: activeReportHab?.district || 'Chamoli',
    state: activeReportHab?.state || 'Uttarakhand',
    location: {
      lat: (activeReportHab?.location.lat || 30.5) + 0.05,
      lng: (activeReportHab?.location.lng || 79.5) + 0.05,
      elevation: Math.max(300, (activeReportHab?.location.elevation || 1500) - 400),
    },
    suitability: 'LOW',
    suitabilityScore: 0.95,
    capacity: 5000,
    currentOccupants: 0,
    operationalStatus: 'READY',
    hasRoadAccess: true,
    hasWaterAccess: true,
    nearInfrastructure: true,
    constraints: [],
    distanceFromAffected: 14.5,
    foodStockDays: 15,
    dailyWaterLiters: 15000,
    managingAgency: 'District Disaster Management Authority',
    slopeGrade: 'Gentle (4-8°)',
  };

  const activeSite = activeReportHab 
    ? (relocationSites.find(s => s.id === activeReportHab.nearestRelocationSite) || relocationSites[0] || fallbackSite)
    : null;
  const activeRoute = activeReportHab && activeSite ? getRouteDetails(activeReportHab, activeSite) : null;

  return (
    <div className="panel report-panel" style={{ padding: '6px' }}>

      {/* State & District Selector and Search */}
      <div className="panel__section" style={{ background: 'var(--bg-surface)', marginTop: 4, padding: '5px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 5 }}>
          <div>
            <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
              Target State
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              style={{
                width: '100%',
                padding: '3px 6px',
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All States</option>
              {availableStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
              District Sector
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              style={{
                width: '100%',
                padding: '3px 6px',
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All Districts ({availableDistricts.length})</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={11} style={{ position: 'absolute', left: 7, top: 6, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search village or settlement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '3px 6px 3px 22px',
              fontSize: 10,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* KPI Logistics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, margin: '6px 0' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '5px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>EXPOSED</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
            {exposedPop.toLocaleString()}
          </div>
          <div style={{ fontSize: 7.5, color: 'var(--text-muted)' }}>{atRiskHabs.length} at risk</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '5px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SAFE BEDS</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            {totalSafeCapacity.toLocaleString()}
          </div>
          <div style={{ fontSize: 7.5, color: 'var(--text-muted)' }}>{distSites.length} havens</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '5px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FLEET</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
            {busesNeeded} / {ambulancesNeeded}
          </div>
          <div style={{ fontSize: 7.5, color: 'var(--text-muted)' }}>Bus / Amb</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '5px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>RATIONS</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
            {rationsTonnes} T
          </div>
          <div style={{ fontSize: 7.5, color: 'var(--text-muted)' }}>14-day stock</div>
        </div>
      </div>

      {/* DASHBOARD-STYLE CARDS LIST (Instead of plain table) */}
      <div style={{ marginTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Evacuation Roster ({distHabs.length})
          </div>
          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
            Click card for transit map &amp; memo
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {distHabs.map((h) => {
            const haven = distSites.find((s) => s.id === h.nearestRelocationSite) || distSites[0];
            const route = getRouteDetails(h, haven);
            const isHighRisk = h.riskScore >= 0.7 || h.riskLevel === 'CRITICAL';

            return (
              <div
                key={h.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: isHighRisk ? '1px solid var(--accent-rose)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-xs)',
                  padding: '6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  transition: 'all 0.15s ease',
                }}
              >
                {/* 1. Card Top Bar: Village Name, District, Risk Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {h.name}
                      </span>
                      <span
                        style={{
                          fontSize: 8.5,
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-pill)',
                          background: isHighRisk ? 'var(--accent-rose-subtle)' : 'var(--accent-amber-subtle)',
                          color: isHighRisk ? 'var(--accent-rose)' : 'var(--accent-amber)',
                          border: `1px solid ${isHighRisk ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
                        }}
                      >
                        {(h.riskScore * 100).toFixed(0)}% • {h.riskLevel}
                      </span>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>
                      📍 {h.district} • Elev: {h.location.elevation || 1500}m
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (h.location) flyToHabitation(h.location.lng, h.location.lat);
                      useAppStore.setState({ selectedHabitationId: h.id });
                      setActiveReportHab(h);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 9.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={11} strokeWidth={2.2} />
                    <span>Report</span>
                  </button>
                </div>

                {/* 2. Structured 2-Column Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 5 }}>
                  {/* Metric 1: Demographics & Threats */}
                  <div style={{ background: 'var(--bg-subtle)', padding: '4px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      POPULATION &amp; THREATS
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginTop: 1 }}>
                      {h.population.toLocaleString()} <span style={{ fontSize: 8.5, fontWeight: 500, color: 'var(--text-muted)' }}>({h.households || 0} HH)</span>
                    </div>
                    <div
                      title={h.hazardExposure.map(he => he.type).join(', ')}
                      style={{ fontSize: 8.5, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      ⚠️ {h.hazardExposure.map(he => he.type).join(', ') || 'Subsidence'}
                    </div>
                  </div>

                  {/* Metric 2: Safe Haven Destination */}
                  <div style={{ background: 'var(--bg-subtle)', padding: '4px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      ASSIGNED HAVEN
                    </div>
                    <div
                      title={haven?.name || 'Safe Haven'}
                      style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      🏰 {haven?.name || 'Safe Haven'}
                    </div>
                    <div style={{ fontSize: 8.5, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Cap: <strong>{haven?.capacity?.toLocaleString() || 5000}</strong> beds
                    </div>
                  </div>
                </div>

                {/* 3. Transit Logistics Strip */}
                <div style={{ background: 'var(--bg-subtle)', padding: '4px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, overflow: 'hidden' }}>
                    <span style={{ fontSize: 11, flexShrink: 0 }}>{route.modeIcon}</span>
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--accent-blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {route.modeLabel}
                      </div>
                      <div style={{ fontSize: 8, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        🛣️ {route.corridor}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {route.journeyTimeStr}
                    </div>
                    <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>
                      {route.distKm} km
                    </div>
                  </div>
                </div>

                {/* 4. Bottom Agency Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 8.5, color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)', paddingTop: 3, marginTop: -1 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Security</span>
                  <span style={{ color: 'var(--accent-indigo)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                    {haven?.managingAgency || 'District Admin & NDRF'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXECUTIVE EVACUATION REPORT MODAL WITH VECTOR ROUTE MAP */}
      {activeReportHab && activeSite && activeRoute && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16,
          }}
          onClick={() => setActiveReportHab(null)}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              maxWidth: 780,
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '2px solid #1e293b',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              fontFamily: 'var(--font-sans)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3.5" fill="#ffffff" />
                    <circle cx="12" cy="12" r="1.3" fill="#3b82f6" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#dc2626' }}>
                    NATIONAL DISASTER MANAGEMENT AUTHORITY • RELOCATION DIRECTIVE
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>
                    DRISHTI EVACUATION &amp; TRANSIT REPORT: {activeReportHab.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>
                    Ref: DRISHTI-MEMO-{activeReportHab.id.toUpperCase()}-2026 • Security Level: OFFICIAL USE ONLY
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={13} />
                  <span>Print PDF</span>
                </button>
                <button
                  onClick={() => setActiveReportHab(null)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Section 1: Habitation & Site Profile Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Origin Village Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ORIGIN: AT-RISK HABITATION
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {activeReportHab.name} ({activeReportHab.district})
                </div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                  State: {activeReportHab.state || 'Uttarakhand'} • Elevation: {activeReportHab.location.elevation || 1500}m ASL
                </div>
                <div style={{ marginTop: 8, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div>👥 <strong>Exposed Population:</strong> {activeReportHab.population.toLocaleString()} ({activeReportHab.households || 0} households)</div>
                  <div>
                    ⚡ <strong>Collective Risk Score:</strong>{' '}
                    <span style={{ color: getRiskColor(toRiskPercentage(activeReportHab.riskScore)), fontWeight: 900 }}>
                      {toRiskPercentage(activeReportHab.riskScore)}% ({getRiskBandInfo(toRiskPercentage(activeReportHab.riskScore)).label})
                    </span>
                  </div>
                  <div>⚠️ <strong>Primary Threats:</strong> {activeReportHab.hazardExposure.map(he => he.type).join(', ') || 'Landslide subsidence'}</div>
                  <div>🛡️ <strong>Vulnerability Index:</strong> Overall {Math.round(activeReportHab.vulnerabilityIndex.overall * 100)}% (Adaptive: {Math.round(activeReportHab.vulnerabilityIndex.adaptiveCapacity * 100)}%)</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, background: 'rgba(0,0,0,0.03)', padding: '2px 5px', borderRadius: 3 }}>
                    Weightages: {calculateWeightageBreakdown(activeReportHab.riskScore, activeReportHab.vulnerabilityIndex.overall).formulaString}
                  </div>
                </div>
              </div>

              {/* Destination Safe Haven Box */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  DESTINATION: DESIGNATED SAFE HAVEN
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {activeSite.name} ({activeSite.facilityType})
                </div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                  Location: {activeSite.district} • Elevation: {activeSite.location.elevation || 900}m ASL
                </div>
                <div style={{ marginTop: 8, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div>🛏️ <strong>Total Shelter Capacity:</strong> {activeSite.capacity.toLocaleString()} beds (Occupants: {activeSite.currentOccupants || 0})</div>
                  <div>💧 <strong>Daily Water Allocation:</strong> {(activeSite.dailyWaterLiters || 14000).toLocaleString()} Litres/day</div>
                  <div>🍞 <strong>Rations Stock Buffer:</strong> {activeSite.foodStockDays || 14} Days dry grain inventory</div>
                  <div>⚡ <strong>Auxiliary Power:</strong> {activeSite.powerBackupHours || 48} Hours diesel generator run-time</div>
                  <div>🏥 <strong>Medical Beds:</strong> {activeSite.medicalBayBeds || 15} isolation/triage beds</div>
                </div>
              </div>
            </div>

            {/* Section 2: Transit Corridor Blueprint */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                TRANSIT LOGISTICS &amp; MOBILIZATION DIRECTIVE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>Primary Transit Mode</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1e3a8a', marginTop: 2 }}>{activeRoute.modeIcon} {activeRoute.modeLabel}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>Corridor Distance</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1e3a8a', marginTop: 2 }}>{activeRoute.distKm} km</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>Estimated Journey Time</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1e3a8a', marginTop: 2 }}>{activeRoute.journeyTimeStr}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>Fleet Allocation</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1e3a8a', marginTop: 2 }}>{Math.ceil(activeReportHab.population / 45)} Vehicles / Units</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: '#334155' }}>
                <strong>Vehicle Specification:</strong> {activeRoute.vehicleType} via <strong>{activeRoute.corridor}</strong>. Managing Authority: <strong>{activeSite.managingAgency || 'District Administration & NDRF'}</strong>.
              </div>
            </div>

            {/* Section 3: High-End Vector Route Map Visualizer */}
            <div style={{ background: '#0f172a', border: '2px solid #000000', borderRadius: 8, padding: 14, color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: 6, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#38bdf8' }}>
                  🗺️ OPERATIONAL EVACUATION TRANSIT ROUTE MAP
                </div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  ORIGIN [{activeReportHab.location.lat.toFixed(4)}°N, {activeReportHab.location.lng.toFixed(4)}°E] ➔ DEST [{activeSite.location.lat.toFixed(4)}°N, {activeSite.location.lng.toFixed(4)}°E]
                </div>
              </div>

              {/* Vector SVG Map Canvas */}
              <div style={{ position: 'relative', width: '100%', height: 180, background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
                <svg width="100%" height="100%" viewBox="0 0 680 180">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.7" />
                    </pattern>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Terrain Contour / Ridge Visualizer */}
                  <path d="M 0 140 Q 120 70 240 110 T 480 80 T 680 130" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="4, 4" />
                  <path d="M 0 160 Q 180 100 360 130 T 680 150" fill="none" stroke="#334155" strokeWidth="1" />

                  {/* Route Polyline (Origin to Destination) */}
                  <path
                    d="M 80 110 C 180 40, 280 150, 420 80 S 540 120, 600 70"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    opacity="0.35"
                  />
                  <path
                    d="M 80 110 C 180 40, 280 150, 420 80 S 540 120, 600 70"
                    fill="none"
                    stroke="url(#routeGrad)"
                    strokeWidth="3"
                    strokeDasharray="6, 6"
                  />

                  {/* Waypoint 1 (Staging Node) */}
                  <circle cx="240" cy="95" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="240" y="115" fill="#cbd5e1" fontSize="9" fontWeight="700" textAnchor="middle">Waypoint Alpha (Bridge)</text>

                  {/* Waypoint 2 (Triage Post) */}
                  <circle cx="420" cy="80" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="420" y="65" fill="#cbd5e1" fontSize="9" fontWeight="700" textAnchor="middle">NDRF Medical Checkpost</text>

                  {/* Transport Vehicle Icon along corridor */}
                  <g transform="translate(330, 85)">
                    <circle cx="0" cy="0" r="16" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                    <text x="0" y="4" fill="#ffffff" fontSize="12" textAnchor="middle">{activeRoute.modeIcon}</text>
                  </g>

                  {/* Origin Settlement Marker */}
                  <g transform="translate(80, 110)">
                    <circle cx="0" cy="0" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx="0" cy="0" r="18" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5">
                      <animate attributeName="r" values="10;24;10" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x="0" y="-16" fill="#fca5a5" fontSize="11" fontWeight="900" textAnchor="middle">{activeReportHab.name.toUpperCase()}</text>
                    <text x="0" y="22" fill="#ffffff" fontSize="9" fontWeight="600" textAnchor="middle">{activeReportHab.location.elevation || 1500}m ASL</text>
                  </g>

                  {/* Destination Safe Haven Marker */}
                  <g transform="translate(600, 70)">
                    <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">🏰</text>
                    <text x="0" y="-18" fill="#86efac" fontSize="11" fontWeight="900" textAnchor="middle">{activeSite.name.toUpperCase()}</text>
                    <text x="0" y="24" fill="#ffffff" fontSize="9" fontWeight="600" textAnchor="middle">SAFE HAVEN ({activeSite.capacity} BEDS)</text>
                  </g>

                  {/* Scale Bar */}
                  <g transform="translate(20, 160)">
                    <line x1="0" y1="0" x2="60" y2="0" stroke="#ffffff" strokeWidth="2" />
                    <line x1="0" y1="-4" x2="0" y2="4" stroke="#ffffff" strokeWidth="2" />
                    <line x1="60" y1="-4" x2="60" y2="4" stroke="#ffffff" strokeWidth="2" />
                    <text x="30" y="-6" fill="#ffffff" fontSize="8" fontWeight="700" textAnchor="middle">10 KM</text>
                  </g>

                  {/* Compass Rose */}
                  <g transform="translate(650, 25)">
                    <circle cx="0" cy="0" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                    <polygon points="0,-10 3,-2 0,0 -3,-2" fill="#ef4444" />
                    <polygon points="0,10 3,2 0,0 -3,2" fill="#94a3b8" />
                    <text x="0" y="-12" fill="#ef4444" fontSize="8" fontWeight="900" textAnchor="middle">N</text>
                  </g>
                </svg>
              </div>

              {/* Elevation & Slope Profile Strip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#94a3b8' }}>
                <div>Elevation Profile: <strong>{activeReportHab.location.elevation || 1500}m</strong> (Origin) ➔ <strong>{activeSite.location.elevation || 900}m</strong> (Haven)</div>
                <div>Slope Grade: <strong>{activeSite.slopeGrade || 'Gentle (5-10°)'}</strong></div>
                <div>Total Transit Time: <strong style={{ color: '#38bdf8' }}>{activeRoute.journeyTimeStr}</strong></div>
              </div>
            </div>

            {/* Official Sign-off Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: 10, fontSize: 10, color: '#64748b' }}>
              <div>Authorized by: <strong>DRISHTI Disaster Intelligence Operations Center</strong></div>
              <div>System Timestamp: {new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
