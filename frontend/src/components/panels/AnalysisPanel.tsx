import { useState, useMemo, useEffect } from 'react';
import { Filter, ArrowRight, Trophy, Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { flyToHabitation } from '../../cesium/camera';
import {
  toRiskPercentage,
  getRiskColor,
  getRiskBandInfo,
  calculateWeightageBreakdown,
} from '../../utils/riskClassification';

type SortCriteria = 'risk' | 'population' | 'vulnerability' | 'name';
type RiskBandFilter = 'ALL' | 'Red Zone' | 'High' | 'Moderate' | 'Low';

export default function AnalysisPanel() {
  const {
    selectHabitation,
    habitations,
    relocationSites,
    setSelectedState,
    setSelectedDistrict,
    calculatePrioritization,
  } = useAppStore();

  const [sortBy, setSortBy] = useState<SortCriteria>('risk');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [bandFilter, setBandFilter] = useState<RiskBandFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');

  useEffect(() => {
    calculatePrioritization();
  }, [calculatePrioritization]);

  const uniqueStates = useMemo(() => {
    return Array.from(new Set(habitations.map((h) => h.state).filter(Boolean)));
  }, [habitations]);

  const uniqueDistricts = useMemo(() => {
    return Array.from(
      new Set(
        habitations
          .filter((h) => !stateFilter || h.state === stateFilter)
          .map((h) => h.district)
      )
    );
  }, [habitations, stateFilter]);

  // Ranked Habitations calculation
  const rankedHabitations = useMemo(() => {
    // 1. Filter
    const filtered = habitations.filter((h) => {
      const riskPct = toRiskPercentage(h.riskScore);
      const band = getRiskBandInfo(riskPct);

      if (stateFilter && h.state !== stateFilter) return false;
      if (districtFilter && h.district !== districtFilter) return false;
      if (bandFilter !== 'ALL' && band.label !== bandFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesDist = h.district.toLowerCase().includes(q);
        const matchesBlock = h.block && h.block.toLowerCase().includes(q);
        if (!matchesName && !matchesDist && !matchesBlock) return false;
      }

      return true;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'risk') {
        comparison = toRiskPercentage(b.riskScore) - toRiskPercentage(a.riskScore);
      } else if (sortBy === 'population') {
        comparison = (b.population || 0) - (a.population || 0);
      } else if (sortBy === 'vulnerability') {
        comparison = (b.vulnerabilityIndex?.overall || 0) - (a.vulnerabilityIndex?.overall || 0);
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });

    // 3. Attach Rank metadata
    return filtered.map((h, idx) => {
      const riskPct = toRiskPercentage(h.riskScore);
      const band = getRiskBandInfo(riskPct);
      const breakdown = calculateWeightageBreakdown(h.riskScore, h.vulnerabilityIndex?.overall);
      const haven = relocationSites.find((s) => s.id === h.nearestRelocationSite);

      return {
        rank: idx + 1,
        habitation: h,
        riskPct,
        band,
        breakdown,
        haven,
      };
    });
  }, [habitations, relocationSites, sortBy, sortOrder, bandFilter, stateFilter, districtFilter, searchQuery]);

  const toggleSort = (criteria: SortCriteria) => {
    if (sortBy === criteria) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(criteria);
      setSortOrder('desc');
    }
  };

  return (
    <div className="panel" style={{ height: 'auto', minHeight: '100%', overflowY: 'visible', paddingBottom: 32 }}>
      {/* Header Banner */}
      <div className="panel__section" style={{ background: 'var(--bg-subtle)', padding: '8px 10px' }}>
        <div className="panel__row panel__row--between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 26,
                height: 26,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
                border: '1.5px solid #000000',
                boxShadow: '1.5px 1.5px 0px #000000',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b91c1c',
              }}
            >
              <Trophy size={14} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-primary)' }}>
                Habitation Risk Dashboard
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                Ranked Registry ({rankedHabitations.length} settlements)
              </div>
            </div>
          </div>

          <button
            className={`btn-action ${filtersOpen ? 'btn-action--primary' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{ padding: '2px 7px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Filter size={11} strokeWidth={2} />
            <span>{filtersOpen ? 'Hide' : 'Filter'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 8px',
            marginTop: 8,
          }}
        >
          <Search size={13} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search ranked habitation, district, block..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: 10.5,
              background: 'transparent',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Feature Weightage & Collective Score Explanation Strip */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '6px 10px',
          fontSize: 9.5,
          lineHeight: 1.35,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
            WEIGHTAGE BREAKDOWN (OUT OF 100)
          </span>
          <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 9 }}>
            Rᵢ = H(40%) + E(35%) + V(25%)
          </span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 9 }}>
          Hazard Threat (40 max) &bull; Exposure Assets (35 max) &bull; Vulnerability Index (25 max)
        </div>
      </div>

      {/* Interactive Ranking Order Selector */}
      <div style={{ padding: '6px 10px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
          Rank Settlement Order By:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          <button
            onClick={() => toggleSort('risk')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '3px 4px',
              fontSize: 9.5,
              fontWeight: 700,
              background: sortBy === 'risk' ? '#ef4444' : 'var(--bg-subtle)',
              color: sortBy === 'risk' ? '#ffffff' : 'var(--text-primary)',
              border: '1px solid #000000',
              borderRadius: 'var(--radius-sm)',
              boxShadow: sortBy === 'risk' ? '1.5px 1.5px 0px #000000' : 'none',
              cursor: 'pointer',
            }}
          >
            <span>Risk %</span>
            {sortBy === 'risk' && <span style={{ fontSize: 8 }}>{sortOrder === 'desc' ? '▼' : '▲'}</span>}
          </button>

          <button
            onClick={() => toggleSort('population')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '3px 4px',
              fontSize: 9.5,
              fontWeight: 700,
              background: sortBy === 'population' ? '#3b82f6' : 'var(--bg-subtle)',
              color: sortBy === 'population' ? '#ffffff' : 'var(--text-primary)',
              border: '1px solid #000000',
              borderRadius: 'var(--radius-sm)',
              boxShadow: sortBy === 'population' ? '1.5px 1.5px 0px #000000' : 'none',
              cursor: 'pointer',
            }}
          >
            <span>Pop</span>
            {sortBy === 'population' && <span style={{ fontSize: 8 }}>{sortOrder === 'desc' ? '▼' : '▲'}</span>}
          </button>

          <button
            onClick={() => toggleSort('vulnerability')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '3px 4px',
              fontSize: 9.5,
              fontWeight: 700,
              background: sortBy === 'vulnerability' ? '#f59e0b' : 'var(--bg-subtle)',
              color: sortBy === 'vulnerability' ? '#000000' : 'var(--text-primary)',
              border: '1px solid #000000',
              borderRadius: 'var(--radius-sm)',
              boxShadow: sortBy === 'vulnerability' ? '1.5px 1.5px 0px #000000' : 'none',
              cursor: 'pointer',
            }}
          >
            <span>HVI</span>
            {sortBy === 'vulnerability' && <span style={{ fontSize: 8 }}>{sortOrder === 'desc' ? '▼' : '▲'}</span>}
          </button>

          <button
            onClick={() => toggleSort('name')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '3px 4px',
              fontSize: 9.5,
              fontWeight: 700,
              background: sortBy === 'name' ? 'var(--text-primary)' : 'var(--bg-subtle)',
              color: sortBy === 'name' ? 'var(--bg-surface)' : 'var(--text-primary)',
              border: '1px solid #000000',
              borderRadius: 'var(--radius-sm)',
              boxShadow: sortBy === 'name' ? '1.5px 1.5px 0px #000000' : 'none',
              cursor: 'pointer',
            }}
          >
            <span>A–Z</span>
            {sortBy === 'name' && <span style={{ fontSize: 8 }}>{sortOrder === 'desc' ? '▼' : '▲'}</span>}
          </button>
        </div>

        {/* Classification Bands (0–30 Low, 30–60 Moderate, 60–80 High, 80–100 Red Zone) */}
        <div style={{ display: 'flex', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
          {(
            [
              { key: 'ALL', label: 'All Bands', color: '', textColor: '' },
              { key: 'Red Zone', label: '80–100% Red Zone', color: '#991b1b', textColor: '#ffffff' },
              { key: 'High', label: '60–80% High', color: '#ef4444', textColor: '#ffffff' },
              { key: 'Moderate', label: '30–60% Moderate', color: '#f59e0b', textColor: '#000000' },
              { key: 'Low', label: '0–30% Low', color: '#10b981', textColor: '#000000' },
            ] as const
          ).map((b) => {
            const isSelected = bandFilter === b.key;
            return (
              <button
                key={b.key}
                onClick={() => setBandFilter(b.key as RiskBandFilter)}
                style={{
                  padding: '2px 6px',
                  fontSize: 8.5,
                  fontWeight: 800,
                  borderRadius: 4,
                  border: '1px solid #000000',
                  background: isSelected ? b.color || 'var(--text-primary)' : 'var(--bg-subtle)',
                  color: isSelected ? b.textColor || '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '1px 1px 0px #000000' : 'none',
                  transition: 'all 0.1s ease',
                }}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Filters Drawer */}
      {filtersOpen && (
        <div className="panel__section" style={{ background: 'var(--bg-subtle)', padding: '6px 10px' }}>
          <div className="panel__row panel__row--between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Scope & Administrative Filters
            </span>
            <button
              onClick={() => {
                setStateFilter('');
                setDistrictFilter('');
                setBandFilter('ALL');
                setSearchQuery('');
              }}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>State</label>
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setDistrictFilter('');
                  if (e.target.value) setSelectedState(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '3px 6px',
                  fontSize: 9.5,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">All States ({uniqueStates.length})</option>
                {uniqueStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>District</label>
              <select
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  if (e.target.value) setSelectedDistrict(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '3px 6px',
                  fontSize: 9.5,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">All Districts ({uniqueDistricts.length})</option>
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Ranked Settlement List */}
      <div className="panel__list" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rankedHabitations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: 11 }}>
            No settlements match the selected ranking filter.
          </div>
        ) : (
          rankedHabitations.map((item) => {
            const h = item.habitation;
            const dynamicColor = getRiskColor(item.riskPct);

            return (
              <div
                key={h.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1.5px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                  borderRadius: 'var(--radius-sm)',
                  padding: '7px 9px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  transition: 'all 0.1s ease',
                }}
              >
                {/* Header Row: Rank + Name + Percentage Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        padding: '1px 5px',
                        background: item.rank <= 3 ? '#ef4444' : 'var(--bg-subtle)',
                        color: item.rank <= 3 ? '#ffffff' : 'var(--text-primary)',
                        border: '1px solid #000000',
                        borderRadius: 3,
                        flexShrink: 0,
                      }}
                    >
                      #{item.rank}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h.name}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                        {h.district}, {h.state} &bull; Pop: <b>{h.population.toLocaleString()}</b>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Color Score Pill (96 is darker red than 95) */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        background: dynamicColor,
                        color: item.band.textColor,
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: 11,
                        fontWeight: 900,
                        padding: '2px 7px',
                        borderRadius: 5,
                        border: '1.5px solid #000000',
                        boxShadow: '1px 1px 0px #000000',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                      title={`Risk Score: ${item.riskPct}% (Band: ${item.band.label})`}
                    >
                      <span>{item.riskPct}%</span>
                    </div>
                    <div style={{ fontSize: 8.5, fontWeight: 700, color: dynamicColor, marginTop: 1 }}>
                      {item.band.label}
                    </div>
                  </div>
                </div>

                {/* 3-Part Feature Weightage Visual Strip (Hazard 40%, Exposure 35%, Vulnerability 25%) */}
                <div style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 4, padding: '4px 6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>
                    <span>Feature Weightage:</span>
                    <span style={{ color: dynamicColor, fontFamily: 'monospace' }}>
                      {item.breakdown.formulaString}
                    </span>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div style={{ display: 'flex', width: '100%', height: 5, borderRadius: 3, overflow: 'hidden', background: '#e2e8f0', gap: 1 }}>
                    <div
                      title={`Hazard: ${item.breakdown.hazardContribution}%`}
                      style={{
                        width: `${item.breakdown.hazardContribution}%`,
                        background: '#dc2626',
                      }}
                    />
                    <div
                      title={`Exposure: ${item.breakdown.exposureContribution}%`}
                      style={{
                        width: `${item.breakdown.exposureContribution}%`,
                        background: '#ea580c',
                      }}
                    />
                    <div
                      title={`Vulnerability: ${item.breakdown.vulnerabilityContribution}%`}
                      style={{
                        width: `${item.breakdown.vulnerabilityContribution}%`,
                        background: '#eab308',
                      }}
                    />
                  </div>
                </div>

                {/* Footer with Haven assignment and View button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 1 }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                    Safe Haven: <b style={{ color: '#059669' }}>{item.haven?.name || 'Designated Shelter'}</b>
                  </div>

                  <button
                    onClick={() => {
                      selectHabitation(h.id);
                      if (h.location) flyToHabitation(h.location.lng, h.location.lat);
                    }}
                    className="btn-action"
                    style={{
                      padding: '2px 7px',
                      fontSize: 9.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      border: '1px solid #000000',
                      boxShadow: '1px 1px 0px #000000',
                    }}
                  >
                    <span>View</span>
                    <ArrowRight size={10} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
