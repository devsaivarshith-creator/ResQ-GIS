import { useState, useMemo, useEffect } from 'react';
import { Filter, ArrowRight, Trophy } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { flyToHabitation } from '../../cesium/camera';

export default function AnalysisPanel() {
  const { prioritizationResults, calculatePrioritization, selectHabitation, habitations, relocationSites, setSelectedState, setSelectedDistrict } = useAppStore();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [hazardFilter, setHazardFilter] = useState<string>('');

  useEffect(() => {
    if (prioritizationResults.length === 0) {
      calculatePrioritization();
    }
  }, [prioritizationResults.length, calculatePrioritization]);

  const uniqueStates = useMemo(() => {
    return Array.from(new Set(habitations.map(h => h.state).filter(Boolean)));
  }, [habitations]);

  const uniqueDistricts = useMemo(() => {
    return Array.from(new Set(
      habitations
        .filter(h => !stateFilter || h.state === stateFilter)
        .map(h => h.district)
    ));
  }, [habitations, stateFilter]);

  // Fallback to habitations mapping if prioritizationResults is not ready
  const activeResults = useMemo(() => {
    if (prioritizationResults.length > 0) return prioritizationResults;
    return habitations.map((h, idx) => ({
      rank: idx + 1,
      habitationId: h.id,
      name: h.name,
      district: h.district,
      population: h.population,
      score: h.riskScore,
      reason: 'Multi-factor high risk exposure',
      hvi: h.vulnerabilityIndex.overall,
      hazardScore: h.riskScore,
      nearestRelocationSite: h.nearestRelocationSite,
    }));
  }, [prioritizationResults, habitations]);

  const filteredResults = useMemo(() => {
    return activeResults.filter(item => {
      const hab = habitations.find(h => h.id === item.habitationId);
      if (!hab) return false;
      
      if (stateFilter && hab.state !== stateFilter) return false;
      if (districtFilter && hab.district !== districtFilter) return false;
      if (riskFilter && hab.riskLevel !== riskFilter) return false;
      if (hazardFilter && !hab.hazardExposure.some(he => he.type === hazardFilter && (he.level === 'HIGH' || he.level === 'CRITICAL'))) {
        return false;
      }
      
      return true;
    });
  }, [activeResults, habitations, stateFilter, districtFilter, riskFilter, hazardFilter]);

  return (
    <div className="panel">
      {/* Header Banner */}
      <div className="panel__section" style={{ background: 'var(--bg-subtle)', padding: '5px 8px' }}>
        <div className="panel__row panel__row--between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 24,
                height: 24,
                background: 'var(--accent-amber-subtle)',
                border: '1px solid var(--accent-amber)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-amber)',
              }}
            >
              <Trophy size={14} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                Analysis Dashboard
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                Evacuation Staging ({filteredResults.length} Habitations)
              </div>
            </div>
          </div>

          <button
            className={`btn-action ${filtersOpen ? 'btn-action--primary' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{ padding: '2px 6px', fontSize: 10 }}
          >
            <Filter size={11} strokeWidth={2} />
            <span>{filtersOpen ? 'Close' : 'Filter'}</span>
          </button>
        </div>
      </div>

      {/* Risk Score Mathematical Formula Indicator */}
      <div style={{ background: 'rgba(56, 189, 248, 0.08)', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 9.5 }}>
        <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontFamily: 'monospace' }}>
          Rᵢ = [Σ(wₖ × Hᵢₖ)] × Eᵢ × Vᵢ
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>
          Normalized (0–1) • Σwₖ = 1
        </span>
      </div>

      {/* Dynamic Filters Drawer */}
      {filtersOpen && (
        <div className="panel__section" style={{ background: 'var(--bg-subtle)', padding: '6px 8px' }}>
          <div className="panel__row panel__row--between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Dashboard Filters
            </span>
            <button
              onClick={() => { setStateFilter(''); setDistrictFilter(''); setRiskFilter(''); setHazardFilter(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-blue)',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>State</label>
              <select 
                value={stateFilter} 
                onChange={e => {
                  setStateFilter(e.target.value);
                  setDistrictFilter('');
                  if (e.target.value) {
                    setSelectedState(e.target.value);
                  }
                }}
                style={{ width: '100%', padding: '3px 6px', fontSize: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="">All States ({uniqueStates.length})</option>
                {uniqueStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>District</label>
              <select 
                value={districtFilter} 
                onChange={e => {
                  setDistrictFilter(e.target.value);
                  if (e.target.value) {
                    setSelectedDistrict(e.target.value);
                  }
                }}
                style={{ width: '100%', padding: '3px 6px', fontSize: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="">All Districts ({uniqueDistricts.length})</option>
                {uniqueDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>Risk Level</label>
              <select 
                value={riskFilter} 
                onChange={e => setRiskFilter(e.target.value)}
                style={{ width: '100%', padding: '3px 6px', fontSize: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="">All Risk Levels</option>
                <option value="CRITICAL">Critical Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="MODERATE">Moderate Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>Primary Threat</label>
              <select 
                value={hazardFilter} 
                onChange={e => setHazardFilter(e.target.value)}
                style={{ width: '100%', padding: '3px 6px', fontSize: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="">All Hazard Types</option>
                <option value="landslide">Landslide Susceptibility</option>
                <option value="flood">Flood Exposure</option>
                <option value="glof">GLOF Glacial Threat</option>
                <option value="earthquake">Seismic Risk</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Ranked List */}
      <div className="panel__list" style={{ padding: '6px', gap: 6 }}>
        {filteredResults.map((item) => {
          const hab = habitations.find((h) => h.id === item.habitationId);
          const site = relocationSites.find((s) => s.id === item.nearestRelocationSite);

          const rankBadgeBg =
            item.rank === 1
              ? 'var(--accent-rose-subtle)'
              : item.rank === 2
              ? 'var(--accent-amber-subtle)'
              : 'var(--bg-subtle)';
          const rankBadgeColor =
            item.rank === 1
              ? 'var(--accent-rose)'
              : item.rank === 2
              ? 'var(--accent-amber)'
              : 'var(--text-secondary)';

          return (
            <div
              key={item.habitationId}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xs)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                transition: 'all 0.15s ease',
              }}
            >
              {/* Card Header */}
              <div className="panel__row panel__row--between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 5px',
                      background: rankBadgeBg,
                      color: rankBadgeColor,
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    #{item.rank}
                  </span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                      {item.district} &bull; Pop: {item.population.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                    {item.score.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: 4, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(item.score * 100, 100)}%`,
                    height: '100%',
                    background: item.score >= 0.7 ? 'var(--accent-rose)' : item.score >= 0.4 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                  }}
                />
              </div>

              {/* Factor reasoning */}
              <div style={{ fontSize: 9.5, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                <strong>Factors:</strong> {item.reason}
              </div>

              {/* Action Button */}
              {site && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px 6px',
                    marginTop: 1,
                  }}
                >
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                    Haven: <strong style={{ color: 'var(--text-primary)' }}>{site.name}</strong> ({site.distanceFromAffected} km)
                  </div>
                  <button
                    onClick={() => {
                      selectHabitation(item.habitationId);
                      if (hab) flyToHabitation(hab.location.lng, hab.location.lat);
                    }}
                    className="btn-action"
                    style={{ padding: '1px 5px', fontSize: 9.5 }}
                  >
                    <span>View</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
