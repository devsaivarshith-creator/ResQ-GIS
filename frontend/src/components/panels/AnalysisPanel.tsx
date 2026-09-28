import { useState, useMemo } from 'react';
import { Filter, ArrowRight, Trophy } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { flyToHabitation } from '../../cesium/camera';

export default function AnalysisPanel() {
  const { prioritizationResults, selectHabitation, habitations, relocationSites } = useAppStore();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  const filteredResults = useMemo(() => {
    return prioritizationResults.filter(item => {
      const hab = habitations.find(h => h.id === item.habitationId);
      if (!hab) return false;
      
      if (stateFilter && hab.district !== stateFilter) {
        // Here we use district as state proxy based on mock data
        return false;
      }
      
      if (riskFilter && hab.riskLevel !== riskFilter) {
        return false;
      }
      
      return true;
    });
  }, [prioritizationResults, habitations, stateFilter, riskFilter]);

  const uniqueDistricts = Array.from(new Set(habitations.map(h => h.district)));

  return (
    <div className="panel">
      {/* Header Banner */}
      <div className="panel__section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="panel__row panel__row--between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: 'var(--accent-amber-subtle)',
                border: '1px solid var(--accent-amber)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-amber)',
              }}
            >
              <Trophy size={18} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Analysis Dashboard
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Multi-Criteria Evacuation Staging
              </div>
            </div>
          </div>

          <button
            className={`btn-action ${filtersOpen ? 'btn-action--primary' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter size={13} strokeWidth={2} />
            <span>{filtersOpen ? 'Close' : 'Filters'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Filters Drawer */}
      {filtersOpen && (
        <div className="panel__section" style={{ background: 'var(--bg-subtle)' }}>
          <div className="panel__row panel__row--between" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Dashboard Filters
            </span>
            <button
              onClick={() => { setStateFilter(''); setRiskFilter(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-blue)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>State / District</label>
              <select 
                value={stateFilter} 
                onChange={e => setStateFilter(e.target.value)}
                style={{ width: '100%', padding: '4px', fontSize: 11, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="">All Regions</option>
                {uniqueDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Risk Factor</label>
              <select 
                value={riskFilter} 
                onChange={e => setRiskFilter(e.target.value)}
                style={{ width: '100%', padding: '4px', fontSize: 11, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="">All Risk Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MODERATE">Moderate</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Ranked List */}
      <div className="panel__list" style={{ padding: '12px', gap: 8 }}>
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
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              {/* Card Header */}
              <div className="panel__row panel__row--between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      background: rankBadgeBg,
                      color: rankBadgeColor,
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    #{item.rank}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {item.district} &bull; Pop: {item.population.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOPSIS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {item.score.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(item.score * 100, 100)}%`,
                    height: '100%',
                    background: item.score >= 0.7 ? 'var(--accent-rose)' : item.score >= 0.4 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                  }}
                />
              </div>

              {/* Factor reasoning */}
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
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
                    padding: '6px 10px',
                    marginTop: 2,
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Haven: <strong style={{ color: 'var(--text-primary)' }}>{site.name}</strong> ({site.distanceFromAffected} km)
                  </div>
                  <button
                    onClick={() => {
                      selectHabitation(item.habitationId);
                      if (hab) flyToHabitation(hab.location.lng, hab.location.lat);
                    }}
                    className="btn-action"
                    style={{ padding: '3px 8px', fontSize: 10 }}
                  >
                    <span>View</span>
                    <ArrowRight size={11} />
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
