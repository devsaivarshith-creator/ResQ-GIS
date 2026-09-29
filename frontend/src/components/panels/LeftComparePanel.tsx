import { useMemo, useEffect } from 'react';
import {
  ArrowLeftRight,
  Compass,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { flyToHabitation } from '../../cesium/camera';
import {
  toRiskPercentage,
  getRiskColor,
  getRiskBandInfo,
} from '../../utils/riskClassification';
import { evaluateEvacuationPriority, getRouteDetails } from '../../utils/evacuationUtils';

export default function LeftComparePanel() {
  const {
    habitations,
    relocationSites,
    compareLocationAId,
    compareLocationBId,
    setCompareLocationAId,
    setCompareLocationBId,
    prioritizedLocationId,
    setPrioritizedLocationId,
    isComparisonBoxOpen,
    setIsComparisonBoxOpen,
    setActiveNav,
  } = useAppStore();

  // Default selection if not set
  useEffect(() => {
    if (habitations.length >= 2) {
      if (!compareLocationAId) setCompareLocationAId(habitations[0].id);
      if (!compareLocationBId) setCompareLocationBId(habitations[1].id);
    } else if (habitations.length === 1) {
      if (!compareLocationAId) setCompareLocationAId(habitations[0].id);
    }
  }, [habitations, compareLocationAId, compareLocationBId, setCompareLocationAId, setCompareLocationBId]);

  const habA = useMemo(
    () => habitations.find((h) => h.id === compareLocationAId) || habitations[0] || null,
    [habitations, compareLocationAId]
  );

  const habB = useMemo(
    () => habitations.find((h) => h.id === compareLocationBId) || habitations[1] || habitations[0] || null,
    [habitations, compareLocationBId]
  );

  const siteA = useMemo(
    () => (habA ? relocationSites.find((s) => s.id === habA.nearestRelocationSite) || relocationSites[0] || null : null),
    [relocationSites, habA]
  );

  const siteB = useMemo(
    () => (habB ? relocationSites.find((s) => s.id === habB.nearestRelocationSite) || relocationSites[1] || relocationSites[0] || null : null),
    [relocationSites, habB]
  );

  // Evaluate recommendation automatically
  const priorityEval = useMemo(() => {
    if (!habA || !habB) return null;
    return evaluateEvacuationPriority(habA, habB, siteA, siteB);
  }, [habA, habB, siteA, siteB]);

  // Set default prioritized location to recommendation if not manually selected
  useEffect(() => {
    if (!prioritizedLocationId && priorityEval) {
      setPrioritizedLocationId(priorityEval.recommendedId);
    }
  }, [priorityEval, prioritizedLocationId, setPrioritizedLocationId]);

  const handleSwap = () => {
    if (habA && habB) {
      setCompareLocationAId(habB.id);
      setCompareLocationBId(habA.id);
    }
  };

  const riskA = habA ? toRiskPercentage(habA.riskScore) : 0;
  const riskB = habB ? toRiskPercentage(habB.riskScore) : 0;
  const colorA = getRiskColor(riskA);
  const colorB = getRiskColor(riskB);
  const bandA = getRiskBandInfo(riskA);
  const bandB = getRiskBandInfo(riskB);

  const routeA = habA ? getRouteDetails(habA, siteA) : null;
  const routeB = habB ? getRouteDetails(habB, siteB) : null;

  const isPrioritizedA = prioritizedLocationId === habA?.id;
  const isPrioritizedB = prioritizedLocationId === habB?.id;

  return (
    <div
      style={{
        width: 320,
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '8px 10px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <ArrowLeftRight size={14} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Relocation Compare
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
              Dual Location Priority Directive
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 3 }}>
          <button
            onClick={() => setIsComparisonBoxOpen(!isComparisonBoxOpen)}
            className="btn-action"
            title={isComparisonBoxOpen ? 'Hide Full Comparison Box' : 'Show Full Comparison Box'}
            style={{
              padding: '3px 6px',
              fontSize: 9.5,
              background: isComparisonBoxOpen ? 'var(--accent-blue-subtle)' : 'transparent',
              color: isComparisonBoxOpen ? 'var(--accent-blue)' : 'inherit',
            }}
          >
            <Maximize2 size={11} />
            <span>{isComparisonBoxOpen ? 'Box Open' : 'Open Box'}</span>
          </button>
          <button
            onClick={() => setActiveNav('map')}
            className="btn-action"
            title="Close Comparison Mode"
            style={{ padding: '3px 6px' }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Recommendation Pill */}
        {priorityEval && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
              <Sparkles size={11} />
              <span>Algorithmic Recommendation</span>
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
              Priority: <span style={{ color: '#2563eb' }}>{priorityEval.recommendedName}</span>
            </div>
            <div style={{ fontSize: 8.5, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.3 }}>
              {priorityEval.primaryRationale}
            </div>
          </div>
        )}

        {/* Swap Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Select 2 Settlements
          </span>
          <button
            onClick={handleSwap}
            className="btn-action"
            style={{ padding: '2px 7px', fontSize: 9, fontWeight: 700 }}
            title="Swap Location A and Location B"
          >
            <ArrowLeftRight size={10} />
            <span>Swap Positions</span>
          </button>
        </div>

        {/* Location A Selector & Card */}
        <div
          style={{
            background: isPrioritizedA ? 'rgba(220, 38, 38, 0.05)' : 'var(--bg-subtle)',
            border: isPrioritizedA ? '1.5px solid #dc2626' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 900,
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '1px 5px',
                  borderRadius: 3,
                }}
              >
                LOCATION A
              </span>
              {isPrioritizedA && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    background: '#dc2626',
                    color: '#ffffff',
                    padding: '1px 4px',
                    borderRadius: 3,
                  }}
                >
                  ⭐ PRIORITY 1
                </span>
              )}
            </div>

            {habA && (
              <button
                onClick={() => flyToHabitation(habA.location.lng, habA.location.lat)}
                className="btn-action"
                style={{ padding: '2px 5px', fontSize: 8.5 }}
                title="Fly to Location A on map"
              >
                <Compass size={10} />
                <span>Fly</span>
              </button>
            )}
          </div>

          {/* Location A Dropdown */}
          <select
            value={habA?.id || ''}
            onChange={(e) => setCompareLocationAId(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 6px',
              fontSize: 10.5,
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              marginBottom: 5,
            }}
          >
            {habitations.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.district}, {toRiskPercentage(h.riskScore)}% Risk)
              </option>
            ))}
          </select>

          {habA && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>District / State:</span>
                <b>{habA.district}, {habA.state || 'India'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Exposed Pop:</span>
                <b>{habA.population.toLocaleString()} souls</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Risk Score:</span>
                <span style={{ fontWeight: 900, color: colorA }}>
                  {riskA}% • {bandA.label}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Safe Haven:</span>
                <b style={{ color: '#059669', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                  🏰 {siteA?.name || 'Assigned Shelter'}
                </b>
              </div>
              {routeA && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: 'var(--text-secondary)' }}>
                  <span>Transit: {routeA.modeIcon} {routeA.modeLabel}</span>
                  <b>{routeA.distKm} km ({routeA.journeyTimeStr})</b>
                </div>
              )}

              {/* Priority Assign Button */}
              <button
                onClick={() => setPrioritizedLocationId(habA.id)}
                className="btn-action"
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '5px',
                  fontSize: 10,
                  fontWeight: 800,
                  background: isPrioritizedA ? '#dc2626' : 'var(--bg-surface)',
                  color: isPrioritizedA ? '#ffffff' : '#dc2626',
                  borderColor: '#dc2626',
                }}
              >
                {isPrioritizedA ? '✓ HIGHEST PRIORITY 1 ASSIGNED' : '🚨 SET LOCATION A AS PRIORITY 1'}
              </button>
            </div>
          )}
        </div>

        {/* Location B Selector & Card */}
        <div
          style={{
            background: isPrioritizedB ? 'rgba(220, 38, 38, 0.05)' : 'var(--bg-subtle)',
            border: isPrioritizedB ? '1.5px solid #dc2626' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 900,
                  background: '#8b5cf6',
                  color: '#ffffff',
                  padding: '1px 5px',
                  borderRadius: 3,
                }}
              >
                LOCATION B
              </span>
              {isPrioritizedB && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    background: '#dc2626',
                    color: '#ffffff',
                    padding: '1px 4px',
                    borderRadius: 3,
                  }}
                >
                  ⭐ PRIORITY 1
                </span>
              )}
            </div>

            {habB && (
              <button
                onClick={() => flyToHabitation(habB.location.lng, habB.location.lat)}
                className="btn-action"
                style={{ padding: '2px 5px', fontSize: 8.5 }}
                title="Fly to Location B on map"
              >
                <Compass size={10} />
                <span>Fly</span>
              </button>
            )}
          </div>

          {/* Location B Dropdown */}
          <select
            value={habB?.id || ''}
            onChange={(e) => setCompareLocationBId(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 6px',
              fontSize: 10.5,
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              marginBottom: 5,
            }}
          >
            {habitations.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.district}, {toRiskPercentage(h.riskScore)}% Risk)
              </option>
            ))}
          </select>

          {habB && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>District / State:</span>
                <b>{habB.district}, {habB.state || 'India'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Exposed Pop:</span>
                <b>{habB.population.toLocaleString()} souls</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Risk Score:</span>
                <span style={{ fontWeight: 900, color: colorB }}>
                  {riskB}% • {bandB.label}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Safe Haven:</span>
                <b style={{ color: '#059669', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                  🏰 {siteB?.name || 'Assigned Shelter'}
                </b>
              </div>
              {routeB && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: 'var(--text-secondary)' }}>
                  <span>Transit: {routeB.modeIcon} {routeB.modeLabel}</span>
                  <b>{routeB.distKm} km ({routeB.journeyTimeStr})</b>
                </div>
              )}

              {/* Priority Assign Button */}
              <button
                onClick={() => setPrioritizedLocationId(habB.id)}
                className="btn-action"
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '5px',
                  fontSize: 10,
                  fontWeight: 800,
                  background: isPrioritizedB ? '#dc2626' : 'var(--bg-surface)',
                  color: isPrioritizedB ? '#ffffff' : '#dc2626',
                  borderColor: '#dc2626',
                }}
              >
                {isPrioritizedB ? '✓ HIGHEST PRIORITY 1 ASSIGNED' : '🚨 SET LOCATION B AS PRIORITY 1'}
              </button>
            </div>
          )}
        </div>

        {/* Delta Comparison Summary Card */}
        {habA && habB && (
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 8px',
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Direct Metric Differential
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 8.5 }}>
              <div style={{ background: 'var(--bg-surface)', padding: 4, borderRadius: 3, border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)' }}>Risk Differential</div>
                <div style={{ fontWeight: 800, color: riskA >= riskB ? '#dc2626' : '#2563eb' }}>
                  {riskA >= riskB ? `Location A +${riskA - riskB}%` : `Location B +${riskB - riskA}%`}
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: 4, borderRadius: 3, border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)' }}>Population Gap</div>
                <div style={{ fontWeight: 800 }}>
                  {habA.population >= habB.population
                    ? `Loc A +${(habA.population - habB.population).toLocaleString()}`
                    : `Loc B +${(habB.population - habA.population).toLocaleString()}`}
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: 4, borderRadius: 3, border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)' }}>Shelter Capacity</div>
                <div style={{ fontWeight: 800, color: '#059669' }}>
                  A: {siteA?.capacity || 0} vs B: {siteB?.capacity || 0}
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: 4, borderRadius: 3, border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)' }}>Travel Distance</div>
                <div style={{ fontWeight: 800 }}>
                  {routeA && routeB
                    ? `${routeA.distKm} km vs ${routeB.distKm} km`
                    : '--'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Full Comparison Box Trigger */}
        <button
          onClick={() => setIsComparisonBoxOpen(true)}
          className="btn-action"
          style={{
            width: '100%',
            padding: '7px 8px',
            background: 'var(--accent-blue)',
            color: '#ffffff',
            border: 'none',
            fontSize: 10.5,
            fontWeight: 800,
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
          }}
        >
          <Maximize2 size={12} />
          <span>Open Full Evacuation Comparison Box</span>
        </button>
      </div>
    </div>
  );
}
