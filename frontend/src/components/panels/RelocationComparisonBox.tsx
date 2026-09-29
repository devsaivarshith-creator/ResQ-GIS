import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  Compass,
  ArrowLeftRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { flyToHabitation, flyToState } from '../../cesium/camera';
import {
  toRiskPercentage,
  getRiskColor,
  getRiskBandInfo,
  calculateWeightageBreakdown,
} from '../../utils/riskClassification';
import { evaluateEvacuationPriority, getRouteDetails } from '../../utils/evacuationUtils';

export default function RelocationComparisonBox() {
  const {
    habitations,
    relocationSites,
    compareStateFilter,
    setCompareStateFilter,
    compareLocationAId,
    compareLocationBId,
    setCompareLocationAId,
    setCompareLocationBId,
    prioritizedLocationId,
    setPrioritizedLocationId,
    isComparisonBoxOpen,
    setIsComparisonBoxOpen,
  } = useAppStore();

  // Dynamically extract unique states from all habitations
  const availableStates = useMemo(() => {
    const states = habitations.map((h) => h.state).filter(Boolean) as string[];
    return Array.from(new Set(states)).sort();
  }, [habitations]);

  // Filter habitations strictly by the selected state
  const stateHabs = useMemo(() => {
    if (compareStateFilter === 'ALL') return habitations;
    return habitations.filter(
      (h) => h.state && h.state.toLowerCase() === compareStateFilter.toLowerCase()
    );
  }, [habitations, compareStateFilter]);

  const handleStateChange = (newSt: string) => {
    setCompareStateFilter(newSt);
    if (newSt !== 'ALL') {
      flyToState(newSt);
    }
    const filtered =
      newSt === 'ALL'
        ? habitations
        : habitations.filter((h) => h.state?.toLowerCase() === newSt.toLowerCase());
    if (filtered.length >= 2) {
      setCompareLocationAId(filtered[0].id);
      setCompareLocationBId(filtered[1].id);
    } else if (filtered.length === 1) {
      setCompareLocationAId(filtered[0].id);
      setCompareLocationBId(filtered[0].id);
    }
  };

  const habA = useMemo(
    () => stateHabs.find((h) => h.id === compareLocationAId) || stateHabs[0] || null,
    [stateHabs, compareLocationAId]
  );

  const habB = useMemo(
    () => stateHabs.find((h) => h.id === compareLocationBId) || stateHabs[1] || stateHabs[0] || null,
    [stateHabs, compareLocationBId]
  );

  const siteA = useMemo(
    () => (habA ? relocationSites.find((s) => s.id === habA.nearestRelocationSite) || relocationSites[0] || null : null),
    [relocationSites, habA]
  );

  const siteB = useMemo(
    () => (habB ? relocationSites.find((s) => s.id === habB.nearestRelocationSite) || relocationSites[1] || relocationSites[0] || null : null),
    [relocationSites, habB]
  );

  const priorityEval = useMemo(() => {
    if (!habA || !habB) return null;
    return evaluateEvacuationPriority(habA, habB, siteA, siteB);
  }, [habA, habB, siteA, siteB]);

  if (!isComparisonBoxOpen || !habA || !habB) return null;

  const riskA = toRiskPercentage(habA.riskScore);
  const riskB = toRiskPercentage(habB.riskScore);
  const colorA = getRiskColor(riskA);
  const colorB = getRiskColor(riskB);
  const bandA = getRiskBandInfo(riskA);
  const bandB = getRiskBandInfo(riskB);

  const breakdownA = calculateWeightageBreakdown(habA.riskScore, habA.vulnerabilityIndex.overall);
  const breakdownB = calculateWeightageBreakdown(habB.riskScore, habB.vulnerabilityIndex.overall);

  const routeA = getRouteDetails(habA, siteA);
  const routeB = getRouteDetails(habB, siteB);

  const isPrioritizedA = prioritizedLocationId === habA.id;
  const isPrioritizedB = prioritizedLocationId === habB.id;

  const busesNeededA = Math.ceil(habA.population / 45);
  const busesNeededB = Math.ceil(habB.population / 45);
  const ambNeededA = Math.max(2, Math.ceil(habA.population / 350));
  const ambNeededB = Math.max(2, Math.ceil(habB.population / 350));

  const handleExportCSV = () => {
    const csvHeader =
      'Parameter,Location_A,Location_B,Differential\n';
    const rows = [
      `Settlement Name,"${habA.name}","${habB.name}",--`,
      `District,"${habA.district}","${habB.district}",--`,
      `State,"${habA.state || ''}","${habB.state || ''}",--`,
      `Population,${habA.population},${habB.population},${habA.population - habB.population}`,
      `Households,${habA.households || 0},${habB.households || 0},${(habA.households || 0) - (habB.households || 0)}`,
      `Elevation ASL (m),${habA.location.elevation || 1500},${habB.location.elevation || 1500},${(habA.location.elevation || 1500) - (habB.location.elevation || 1500)}`,
      `Collective Risk Percentage,"${riskA}%","${riskB}%","${riskA - riskB}%"`,
      `Risk Band,"${bandA.label}","${bandB.label}",--`,
      `Hazard Weightage (40%),"${breakdownA.hazardContribution}%","${breakdownB.hazardContribution}%",--`,
      `Exposure Weightage (35%),"${breakdownA.exposureContribution}%","${breakdownB.exposureContribution}%",--`,
      `Vulnerability Weightage (25%),"${breakdownA.vulnerabilityContribution}%","${breakdownB.vulnerabilityContribution}%",--`,
      `Assigned Safe Haven,"${siteA?.name || 'Haven A'}","${siteB?.name || 'Haven B'}",--`,
      `Shelter Bed Capacity,${siteA?.capacity || 0},${siteB?.capacity || 0},${(siteA?.capacity || 0) - (siteB?.capacity || 0)}`,
      `Water Allocation Litres,${siteA?.dailyWaterLiters || 14000},${siteB?.dailyWaterLiters || 14000},--`,
      `Ration Buffer Days,${siteA?.foodStockDays || 14},${siteB?.foodStockDays || 14},--`,
      `Evacuation Transit Mode,"${routeA.modeLabel}","${routeB.modeLabel}",--`,
      `Corridor Distance Km,${routeA.distKm},${routeB.distKm},${(routeA.distKm - routeB.distKm).toFixed(1)}`,
      `Journey Duration,"${routeA.journeyTimeStr}","${routeB.journeyTimeStr}",--`,
      `Buses Required,${busesNeededA},${busesNeededB},${busesNeededA - busesNeededB}`,
      `Ambulances Required,${ambNeededA},${ambNeededB},${ambNeededA - ambNeededB}`,
      `Prioritized Stage 1 Selection,"${isPrioritizedA ? 'YES' : 'NO'}","${isPrioritizedB ? 'YES' : 'NO'}",--`,
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [csvHeader, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `drishti_priority_comparison_${habA.name}_vs_${habB.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
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
      onClick={() => setIsComparisonBoxOpen(false)}
    >
      <div
        style={{
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 960,
          width: '100%',
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '2px solid #1e293b',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          fontFamily: 'var(--font-sans)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              <ArrowLeftRight size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#dc2626' }}>
                NATIONAL DISASTER MANAGEMENT AUTHORITY • RELOCATION DECISION SUPPORT
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                DUAL RELOCATION COMPARISON &amp; EVACUATION PRIORITY DIRECTIVE
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                Comparing <strong>{habA.name}</strong> ({habA.district}) vs <strong>{habB.name}</strong> ({habB.district}) • Confidential Command Directive
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* State Filter Dropdown in Modal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
              <MapPin size={11} color="#2563eb" />
              <span style={{ fontSize: 9.5, fontWeight: 800, color: '#334155' }}>State:</span>
              <select
                value={compareStateFilter}
                onChange={(e) => handleStateChange(e.target.value)}
                style={{
                  padding: '2px 5px',
                  fontSize: 10,
                  fontWeight: 800,
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All States</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st} ({habitations.filter((h) => h.state === st).length})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                background: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Download size={12} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Printer size={12} />
              <span>Print Brief</span>
            </button>
            <button
              onClick={() => setIsComparisonBoxOpen(false)}
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
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Priority Status Banner */}
        <div
          style={{
            background: isPrioritizedA
              ? 'linear-gradient(90deg, #fef2f2 0%, #fff1f2 100%)'
              : 'linear-gradient(90deg, #f5f3ff 0%, #ede9fe 100%)',
            border: isPrioritizedA ? '1.5px solid #dc2626' : '1.5px solid #7c3aed',
            borderRadius: 8,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🚨</span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: isPrioritizedA ? '#b91c1c' : '#6d28d9' }}>
                CURRENT EXECUTIVE PRIORITY DECISION:
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>
                {isPrioritizedA ? (
                  <>⭐ <strong>{habA.name}</strong> SELECTED FOR LEVEL-1 IMMEDIATE EVACUATION</>
                ) : (
                  <>⭐ <strong>{habB.name}</strong> SELECTED FOR LEVEL-1 IMMEDIATE EVACUATION</>
                )}
              </div>
              {priorityEval && (
                <div style={{ fontSize: 9.5, color: '#475569', marginTop: 2 }}>
                  <strong>Algorithmic Rationale:</strong> {priorityEval.primaryRationale}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPrioritizedLocationId(habA.id)}
              style={{
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 5,
                border: '1.5px solid #2563eb',
                background: isPrioritizedA ? '#2563eb' : '#ffffff',
                color: isPrioritizedA ? '#ffffff' : '#2563eb',
                cursor: 'pointer',
              }}
            >
              {isPrioritizedA ? '✓ Priority 1: Location A' : 'Set Loc A Priority 1'}
            </button>
            <button
              onClick={() => setPrioritizedLocationId(habB.id)}
              style={{
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 5,
                border: '1.5px solid #7c3aed',
                background: isPrioritizedB ? '#7c3aed' : '#ffffff',
                color: isPrioritizedB ? '#ffffff' : '#7c3aed',
                cursor: 'pointer',
              }}
            >
              {isPrioritizedB ? '✓ Priority 1: Location B' : 'Set Loc B Priority 1'}
            </button>
          </div>
        </div>

        {/* Side-by-Side Dual Location Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* LOCATION A CARD */}
          <div
            style={{
              background: '#f8fafc',
              border: isPrioritizedA ? '2px solid #2563eb' : '1px solid #cbd5e1',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Location A Title Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 900, background: '#2563eb', color: '#ffffff', padding: '2px 6px', borderRadius: 3 }}>
                  LOCATION A
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginLeft: 6 }}>
                  {habA.name}
                </span>
              </div>
              <button
                onClick={() => flyToHabitation(habA.location.lng, habA.location.lat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '2px 6px',
                  fontSize: 9,
                  fontWeight: 700,
                  background: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                <Compass size={10} />
                <span>Fly</span>
              </button>
            </div>

            {/* Location A Settlement Selector */}
            <select
              value={habA.id}
              onChange={(e) => setCompareLocationAId(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 6px',
                fontSize: 10.5,
                fontWeight: 800,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              {stateHabs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.district}, {toRiskPercentage(h.riskScore)}% Risk)
                </option>
              ))}
            </select>

            {/* 1. Origin Habitation Demographics */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', marginBottom: 4 }}>
                1. Origin Settlement Demographics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10 }}>
                <div>District / State: <strong>{habA.district}, {habA.state || 'India'}</strong></div>
                <div>ASL Elevation: <strong>{habA.location.elevation || 1500}m</strong></div>
                <div>Exposed Population: <strong>{habA.population.toLocaleString()} souls</strong></div>
                <div>Households: <strong>{habA.households || 0} families</strong></div>
              </div>

              {/* Collective Risk & Weightage breakdown */}
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, color: '#64748b' }}>Collective Risk Score:</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: colorA }}>
                    {riskA}% • {bandA.label}
                  </span>
                </div>
                <div style={{ fontSize: 8.5, color: '#64748b', marginTop: 2, background: 'rgba(0,0,0,0.03)', padding: '3px 6px', borderRadius: 3 }}>
                  Weightages: {breakdownA.formulaString}
                </div>
                <div style={{ fontSize: 9, color: '#334155', marginTop: 3 }}>
                  ⚠️ Primary Threats: <strong>{habA.hazardExposure.map((h) => h.type).join(', ') || 'Subsidence'}</strong>
                </div>
                <div style={{ fontSize: 9, color: '#334155', marginTop: 1 }}>
                  🛡️ Social Vulnerability: <strong>{Math.round(habA.vulnerabilityIndex.overall * 100)}% HVI</strong> (Adaptive: {Math.round(habA.vulnerabilityIndex.adaptiveCapacity * 100)}%)
                </div>
              </div>
            </div>

            {/* 2. Destination Safe Haven */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>
                2. Designated Safe Haven Enclave
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d' }}>
                🏰 {siteA?.name || 'Safe Haven A'}
              </div>
              <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>
                Agency: <strong>{siteA?.managingAgency || 'District Admin & NDRF'}</strong> • Facility: <strong>{siteA?.facilityType || 'Permanent Cyclone/Flood Shelter'}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 9.5, marginTop: 4 }}>
                <div>🛏️ Total Capacity: <strong>{siteA?.capacity?.toLocaleString() || 5000} beds</strong></div>
                <div>👥 Occupants: <strong>{siteA?.currentOccupants || 0} residents</strong></div>
                <div>💧 Daily Water: <strong>{(siteA?.dailyWaterLiters || 14000).toLocaleString()} L/day</strong></div>
                <div>🍞 Rations Buffer: <strong>{siteA?.foodStockDays || 14} days dry grain</strong></div>
                <div>⚡ Power Backup: <strong>{siteA?.powerBackupHours || 48} hrs diesel gen</strong></div>
                <div>🏥 Medical Beds: <strong>{siteA?.medicalBayBeds || 15} triage beds</strong></div>
              </div>
            </div>

            {/* 3. Transit Logistics Directive */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: 4 }}>
                3. Transit Logistics &amp; Corridor
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 9.5 }}>
                <div>Mode: <strong>{routeA.modeIcon} {routeA.modeLabel}</strong></div>
                <div>Distance: <strong>{routeA.distKm} km</strong></div>
                <div>Travel Time: <strong>{routeA.journeyTimeStr}</strong></div>
                <div>Corridor: <strong>{routeA.corridor}</strong></div>
                <div>Buses Needed: <strong>{busesNeededA} Units</strong></div>
                <div>Ambulances: <strong>{ambNeededA} Units</strong></div>
              </div>
              <div style={{ fontSize: 8.5, color: '#1e40af', marginTop: 4 }}>
                Vehicle Type: {routeA.vehicleType}
              </div>
            </div>

            {/* Decision Action Button */}
            <button
              onClick={() => setPrioritizedLocationId(habA.id)}
              style={{
                width: '100%',
                padding: '7px',
                borderRadius: 6,
                border: 'none',
                background: isPrioritizedA ? '#dc2626' : '#2563eb',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              {isPrioritizedA ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>LOCATION A HAS STAGE-1 PRIORITY ALLOCATION</span>
                </>
              ) : (
                <>
                  <span>🚨 GIVE STAGE-1 EVACUATION PRIORITY TO LOCATION A</span>
                </>
              )}
            </button>
          </div>

          {/* LOCATION B CARD */}
          <div
            style={{
              background: '#f8fafc',
              border: isPrioritizedB ? '2px solid #7c3aed' : '1px solid #cbd5e1',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Location B Title Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 900, background: '#7c3aed', color: '#ffffff', padding: '2px 6px', borderRadius: 3 }}>
                  LOCATION B
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginLeft: 6 }}>
                  {habB.name}
                </span>
              </div>
              <button
                onClick={() => flyToHabitation(habB.location.lng, habB.location.lat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '2px 6px',
                  fontSize: 9,
                  fontWeight: 700,
                  background: '#ede9fe',
                  color: '#6d28d9',
                  border: '1px solid #ddd6fe',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                <Compass size={10} />
                <span>Fly</span>
              </button>
            </div>

            {/* Location B Settlement Selector */}
            <select
              value={habB.id}
              onChange={(e) => setCompareLocationBId(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 6px',
                fontSize: 10.5,
                fontWeight: 800,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              {stateHabs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.district}, {toRiskPercentage(h.riskScore)}% Risk)
                </option>
              ))}
            </select>

            {/* 1. Origin Habitation Demographics */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', marginBottom: 4 }}>
                1. Origin Settlement Demographics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10 }}>
                <div>District / State: <strong>{habB.district}, {habB.state || 'India'}</strong></div>
                <div>ASL Elevation: <strong>{habB.location.elevation || 1500}m</strong></div>
                <div>Exposed Population: <strong>{habB.population.toLocaleString()} souls</strong></div>
                <div>Households: <strong>{habB.households || 0} families</strong></div>
              </div>

              {/* Collective Risk & Weightage breakdown */}
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, color: '#64748b' }}>Collective Risk Score:</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: colorB }}>
                    {riskB}% • {bandB.label}
                  </span>
                </div>
                <div style={{ fontSize: 8.5, color: '#64748b', marginTop: 2, background: 'rgba(0,0,0,0.03)', padding: '3px 6px', borderRadius: 3 }}>
                  Weightages: {breakdownB.formulaString}
                </div>
                <div style={{ fontSize: 9, color: '#334155', marginTop: 3 }}>
                  ⚠️ Primary Threats: <strong>{habB.hazardExposure.map((h) => h.type).join(', ') || 'Subsidence'}</strong>
                </div>
                <div style={{ fontSize: 9, color: '#334155', marginTop: 1 }}>
                  🛡️ Social Vulnerability: <strong>{Math.round(habB.vulnerabilityIndex.overall * 100)}% HVI</strong> (Adaptive: {Math.round(habB.vulnerabilityIndex.adaptiveCapacity * 100)}%)
                </div>
              </div>
            </div>

            {/* 2. Destination Safe Haven */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>
                2. Designated Safe Haven Enclave
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d' }}>
                🏰 {siteB?.name || 'Safe Haven B'}
              </div>
              <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>
                Agency: <strong>{siteB?.managingAgency || 'District Admin & NDRF'}</strong> • Facility: <strong>{siteB?.facilityType || 'Permanent Cyclone/Flood Shelter'}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 9.5, marginTop: 4 }}>
                <div>🛏️ Total Capacity: <strong>{siteB?.capacity?.toLocaleString() || 5000} beds</strong></div>
                <div>👥 Occupants: <strong>{siteB?.currentOccupants || 0} residents</strong></div>
                <div>💧 Daily Water: <strong>{(siteB?.dailyWaterLiters || 14000).toLocaleString()} L/day</strong></div>
                <div>🍞 Rations Buffer: <strong>{siteB?.foodStockDays || 14} days dry grain</strong></div>
                <div>⚡ Power Backup: <strong>{siteB?.powerBackupHours || 48} hrs diesel gen</strong></div>
                <div>🏥 Medical Beds: <strong>{siteB?.medicalBayBeds || 15} triage beds</strong></div>
              </div>
            </div>

            {/* 3. Transit Logistics Directive */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: 4 }}>
                3. Transit Logistics &amp; Corridor
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 9.5 }}>
                <div>Mode: <strong>{routeB.modeIcon} {routeB.modeLabel}</strong></div>
                <div>Distance: <strong>{routeB.distKm} km</strong></div>
                <div>Travel Time: <strong>{routeB.journeyTimeStr}</strong></div>
                <div>Corridor: <strong>{routeB.corridor}</strong></div>
                <div>Buses Needed: <strong>{busesNeededB} Units</strong></div>
                <div>Ambulances: <strong>{ambNeededB} Units</strong></div>
              </div>
              <div style={{ fontSize: 8.5, color: '#1e40af', marginTop: 4 }}>
                Vehicle Type: {routeB.vehicleType}
              </div>
            </div>

            {/* Decision Action Button */}
            <button
              onClick={() => setPrioritizedLocationId(habB.id)}
              style={{
                width: '100%',
                padding: '7px',
                borderRadius: 6,
                border: 'none',
                background: isPrioritizedB ? '#dc2626' : '#7c3aed',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              {isPrioritizedB ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>LOCATION B HAS STAGE-1 PRIORITY ALLOCATION</span>
                </>
              ) : (
                <>
                  <span>🚨 GIVE STAGE-1 EVACUATION PRIORITY TO LOCATION B</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 4: Direct Comparative Delta Matrix Table */}
        <div style={{ background: '#0f172a', color: '#ffffff', borderRadius: 8, padding: 12, border: '1px solid #334155' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#38bdf8', marginBottom: 8 }}>
            📊 DIRECT COMPARATIVE PARAMETER DIFFERENTIAL MATRIX
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 9.5 }}>
            <div style={{ background: '#1e293b', padding: '6px 8px', borderRadius: 4, border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8' }}>Risk Differential</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: riskA >= riskB ? '#f87171' : '#60a5fa', marginTop: 2 }}>
                {riskA >= riskB ? `${habA.name} is +${riskA - riskB}% higher risk` : `${habB.name} is +${riskB - riskA}% higher risk`}
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '6px 8px', borderRadius: 4, border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8' }}>Population at Risk</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#facc15', marginTop: 2 }}>
                {habA.population >= habB.population
                  ? `${habA.name} (+${(habA.population - habB.population).toLocaleString()} people)`
                  : `${habB.name} (+${(habB.population - habA.population).toLocaleString()} people)`}
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '6px 8px', borderRadius: 4, border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8' }}>Transit Distance Gap</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#38bdf8', marginTop: 2 }}>
                {routeA.distKm >= routeB.distKm
                  ? `${habA.name} corridor +${(routeA.distKm - routeB.distKm).toFixed(1)} km farther`
                  : `${habB.name} corridor +${(routeB.distKm - routeA.distKm).toFixed(1)} km farther`}
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '6px 8px', borderRadius: 4, border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8' }}>Shelter Capacity Margin</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#4ade80', marginTop: 2 }}>
                {(siteA?.capacity || 0) >= (siteB?.capacity || 0)
                  ? `${siteA?.name || 'Haven A'} has +${((siteA?.capacity || 0) - (siteB?.capacity || 0)).toLocaleString()} beds`
                  : `${siteB?.name || 'Haven B'} has +${((siteB?.capacity || 0) - (siteA?.capacity || 0)).toLocaleString()} beds`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
