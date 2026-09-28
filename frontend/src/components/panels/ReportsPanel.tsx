import { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Habitation, RelocationSite } from '../../types';



// Helper: Determine mode of travel & journey time based on distance and hazard exposure
function getRouteDetails(hab: Habitation, site?: RelocationSite) {
  const distKm = site?.distanceFromAffected || 12.5;
  const isFlood = hab.hazardExposure.some((he) => he.type === 'flood' && (he.level === 'HIGH' || he.level === 'CRITICAL'));
  const isGLOF = hab.hazardExposure.some((he) => he.type === 'glof' && (he.level === 'HIGH' || he.level === 'CRITICAL'));
  const isHighAltitude = (hab.location.elevation || 1500) > 1800;

  let modeLabel = '🚌 Heavy Evacuation Bus';
  let modeIcon = '🚌';
  let speedKmH = 32;

  if (isGLOF || (isHighAltitude && hab.riskLevel === 'CRITICAL')) {
    modeLabel = '🚁 Air / Helicopter Sortie';
    modeIcon = '🚁';
    speedKmH = 75; // Helicopters in mountainous terrain
  } else if (isFlood && hab.vulnerabilityIndex.overall > 0.6) {
    modeLabel = '🚤 Motorboat / Flood Vessel';
    modeIcon = '🚤';
    speedKmH = 20; // Flood rescue vessels
  } else if (isHighAltitude) {
    modeLabel = '🚜 Heavy 4x4 Off-Road Truck';
    modeIcon = '🚜';
    speedKmH = 22; // Mountainous offroad rescue trucks
  }

  const travelMins = Math.round((distKm / speedKmH) * 60);
  const journeyTimeStr = travelMins >= 60 ? `${Math.floor(travelMins / 60)}h ${travelMins % 60}m` : `${travelMins} mins`;

  return {
    modeLabel,
    modeIcon,
    distKm,
    journeyTimeStr,
    corridor: site?.lifelineCorridor || 'NH Lifeline Highway',
  };
}

export default function ReportsPanel() {
  const { habitations, relocationSites } = useAppStore();

  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  // Dynamically extract unique states from all habitations
  const availableStates = useMemo(() => {
    const states = habitations.map(h => h.state).filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [habitations]);

  // Dynamically extract districts for selected state
  const availableDistricts = useMemo(() => {
    const filtered = habitations.filter(h => selectedState === 'ALL' || h.state === selectedState);
    const dists = filtered.map(h => h.district).filter(Boolean);
    return Array.from(new Set(dists)).sort();
  }, [habitations, selectedState]);

  // Auto select ALL or first district when state changes
  const handleStateChange = (st: string) => {
    setSelectedState(st);
    setSelectedDistrict('ALL');
  };

  const distHabs = useMemo(() => {
    return habitations.filter((h) => {
      const matchState = selectedState === 'ALL' || (h.state && h.state.toLowerCase() === selectedState.toLowerCase());
      const matchDist = selectedDistrict === 'ALL' || (h.district && h.district.toLowerCase() === selectedDistrict.toLowerCase());
      return matchState && matchDist;
    });
  }, [habitations, selectedState, selectedDistrict]);

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
  const rationsTonnes = ((exposedPop * 0.45 * 14) / 1000).toFixed(1); // 14-day food requirement

  const handleExportCSV = () => {
    const csvHeader = 'Settlement,District,State,Population,Households,Elevation_m,RiskScore,PrimaryHazard,AssignedSafeHaven,CapacityBeds,Occupants,RationsDays,WaterLiters,TravelMode,DistanceKm,ExpectedJourneyTime,LifelineCorridor';
    const csvRows = distHabs.map((h) => {
      const haven = distSites.find((s) => s.id === h.nearestRelocationSite) || distSites[0];
      const primaryHaz = h.hazardExposure[0]?.type || 'general';
      const route = getRouteDetails(h, haven);
      return `"${h.name}","${h.district}","${h.state || ''}",${h.population},${h.households || 0},${h.location.elevation || 1500},${h.riskScore.toFixed(2)},"${primaryHaz}","${haven?.name || 'Safe Enclave'}",${haven?.capacity || 1000},${haven?.currentOccupants || 0},${haven?.foodStockDays || 14},${haven?.dailyWaterLiters || 10000},"${route.modeLabel}",${route.distKm},"${route.journeyTimeStr}","${route.corridor}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [csvHeader].concat(csvRows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `drishti_relocation_report_${selectedDistrict.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="panel report-panel" style={{ padding: '12px' }}>
      {/* Top Banner */}
      <div className="panel__section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="panel__row panel__row--between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'var(--accent-indigo-subtle)',
                border: '1.5px solid var(--accent-indigo)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-indigo)',
              }}
            >
              <FileText size={19} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                DRISHTI — National Evacuation Memo
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Institutional Situation, Safe House Registry & Transit Route Brief
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleExportCSV}
              className="btn-action"
              title="Export Full Relocation Brief as CSV"
              style={{ padding: '5px 9px', fontSize: 11 }}
            >
              <Download size={13} strokeWidth={2} />
              <span>CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="btn-action"
              title="Print or Save Briefing as PDF"
              style={{ padding: '5px 10px', fontSize: 11, background: 'var(--accent-blue)', color: '#ffffff', border: 'none' }}
            >
              <Printer size={13} strokeWidth={2} />
              <span>Print PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* State & District Selector */}
      <div className="panel__section" style={{ background: 'var(--bg-surface)', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>
              Target State Filter
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All States (Pan-India Relocation Matrix)</option>
              {availableStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>
              District Sector Filter
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: 11,
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
      </div>

      {/* KPI Logistics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, margin: '10px 0' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>EXPOSED POP</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
            {exposedPop.toLocaleString()}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{atRiskHabs.length} at-risk settlements</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SAFE BEDS</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            {totalSafeCapacity.toLocaleString()}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{distSites.length} safe havens</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>BUSES / AMBULANCES</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
            {busesNeeded} / {ambulancesNeeded}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Evac &amp; Triage fleet</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>RATIONS (14-DAY)</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
            {rationsTonnes} T
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Dry grain stocks</div>
        </div>
      </div>

      {/* SECTION 1: HABITATION SITUATION DIRECTORY */}
      <div className="panel__section" style={{ background: 'var(--bg-surface)', marginTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 6 }}>
          1. Habitation Situation &amp; Population Profile
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', background: 'var(--bg-surface)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Settlement</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>State / District</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Pop.</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Households</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Elev (m)</th>
                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Risk Score</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Primary Threats</th>
              </tr>
            </thead>
            <tbody>
              {distHabs.map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>{h.name}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{h.district}, {h.state || 'India'}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{h.population.toLocaleString()}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{h.households || 0}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{h.location.elevation || 1500}m</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: 10,
                        fontWeight: 700,
                        background: h.riskScore >= 0.7 ? 'var(--accent-rose-subtle)' : 'var(--accent-amber-subtle)',
                        color: h.riskScore >= 0.7 ? 'var(--accent-rose)' : 'var(--accent-amber)',
                      }}
                    >
                      {(h.riskScore * 100).toFixed(0)}% ({h.riskLevel})
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-secondary)', fontSize: 10 }}>
                    {h.hazardExposure.map(he => he.type).join(', ') || 'Slope instability'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: SAFE HOUSE SHELTER REGISTRY & FOOD/WATER METRICS */}
      <div className="panel__section" style={{ background: 'var(--bg-surface)', marginTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 6 }}>
          2. Safe House Haven Registry &amp; Logistics Readiness
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', background: 'var(--bg-surface)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Safe Haven Facility</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Cap (Beds)</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Occupants</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Water (L/day)</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Power (h)</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Med Beds</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Rations</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Managing Agency</th>
              </tr>
            </thead>
            <tbody>
              {distSites.map((site) => (
                <tr key={site.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {site.name}
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>{site.facilityType}</div>
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {site.capacity.toLocaleString()}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {site.currentOccupants || 0}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {(site.dailyWaterLiters || 12000).toLocaleString()}L
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {site.powerBackupHours || 48}h
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {site.medicalBayBeds || 15}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>
                    {site.foodStockDays || 14} Days
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-secondary)', fontSize: 10 }}>
                    {site.managingAgency || 'District Administration & NDRF'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: EVACUATION ROUTE MATRIX & TRAVEL MODE */}
      <div className="panel__section" style={{ background: 'var(--bg-surface)', marginTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 6 }}>
          3. Evacuation Route Matrix &amp; Mode of Travel Brief
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', background: 'var(--bg-surface)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Evacuation Settlement</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Assigned Safe Haven</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Mode of Travel</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Distance</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Journey Time</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Lifeline Corridor</th>
              </tr>
            </thead>
            <tbody>
              {distHabs.map((h) => {
                const haven = distSites.find((s) => s.id === h.nearestRelocationSite) || distSites[0];
                const route = getRouteDetails(h, haven);
                return (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>{h.name}</td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{haven?.name || 'District Safe Haven'}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{route.modeLabel}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{route.distKm} km</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      {route.journeyTimeStr}
                    </td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-muted)', fontSize: 10 }}>{route.corridor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
