import { useState, useMemo } from 'react';
import { Clock, Siren, Filter, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

function formatTimeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h ago`;
}

export default function AlertsPanel() {
  const { alerts } = useAppStore();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('72H'); // '6H' | '12H' | '24H' | '48H' | '72H' | 'ALL'
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [hazardFilter, setHazardFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique states & hazards dynamically
  const uniqueStates = useMemo(() => {
    const states = alerts.map(a => a.state).filter(Boolean) as string[];
    return Array.from(new Set(states)).sort();
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const now = Date.now();
    return alerts.filter((alert) => {
      const issuedMs = new Date(alert.issuedAt).getTime();
      const ageHours = (now - issuedMs) / (1000 * 3600);

      // 1. Time range filter
      if (timeRange === '6H' && ageHours > 6) return false;
      if (timeRange === '12H' && ageHours > 12) return false;
      if (timeRange === '24H' && ageHours > 24) return false;
      if (timeRange === '48H' && ageHours > 48) return false;
      if (timeRange === '72H' && ageHours > 72) return false;

      // 2. State filter
      if (stateFilter !== 'ALL' && alert.state && alert.state.toLowerCase() !== stateFilter.toLowerCase()) {
        return false;
      }

      // 3. Hazard type filter
      if (hazardFilter !== 'ALL') {
        const hazardMatch =
          (alert.hazardType && alert.hazardType.toLowerCase() === hazardFilter.toLowerCase()) ||
          alert.eventType.toLowerCase().includes(hazardFilter.toLowerCase());
        if (!hazardMatch) return false;
      }

      // 4. Severity filter
      if (severityFilter !== 'ALL') {
        if (severityFilter === 'red' && alert.severity !== 'red') return false;
        if (severityFilter === 'orange' && alert.severity !== 'orange') return false;
        if (severityFilter === 'yellow' && alert.severity !== 'yellow') return false;
        if (severityFilter === 'green' && alert.severity !== 'green') return false;
      }

      // 5. Text search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const textMatch =
          alert.area.toLowerCase().includes(q) ||
          alert.eventType.toLowerCase().includes(q) ||
          alert.description.toLowerCase().includes(q) ||
          alert.source.toLowerCase().includes(q) ||
          (alert.district && alert.district.toLowerCase().includes(q));
        if (!textMatch) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [alerts, timeRange, stateFilter, hazardFilter, severityFilter, searchQuery]);

  return (
    <div className="panel">
      {/* Header */}
      <div className="panel__section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="panel__row panel__row--between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: 'var(--accent-rose-subtle)',
                border: '1px solid var(--accent-rose)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)',
              }}
            >
              <Siren size={18} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                72-Hour Disaster Alerts Feed
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {filteredAlerts.length} Active Bulletins (NDMA, IMD, CWC, SACHET)
              </div>
            </div>
          </div>
          <button
            className={`btn-action ${filtersOpen ? 'btn-action--primary' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter size={13} strokeWidth={2} />
            <span>{filtersOpen ? 'Hide Filters' : 'Filters'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Filter Controls */}
      {filtersOpen && (
        <div className="panel__section" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="panel__row panel__row--between" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Multi-Criteria Alert Filters
            </span>
            <button
              onClick={() => {
                setTimeRange('72H');
                setStateFilter('ALL');
                setHazardFilter('ALL');
                setSeverityFilter('ALL');
                setSearchQuery('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-blue)',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {/* Time Filter */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>Time Window</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  fontSize: 11,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="6H">Past 6 Hours</option>
                <option value="12H">Past 12 Hours</option>
                <option value="24H">Past 24 Hours</option>
                <option value="48H">Past 48 Hours</option>
                <option value="72H">Past 72 Hours (Default)</option>
                <option value="ALL">All Available Logs</option>
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>State / Region</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  fontSize: 11,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="ALL">All States ({uniqueStates.length})</option>
                {uniqueStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Disaster Type Filter */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>Disaster / Hazard</label>
              <select
                value={hazardFilter}
                onChange={(e) => setHazardFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  fontSize: 11,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="ALL">All Disaster Types</option>
                <option value="landslide">Landslide / Subsidence</option>
                <option value="flood">Flood / River Overflow</option>
                <option value="heavy_rain">Heavy Rain / Cloudburst</option>
                <option value="glof">GLOF Glacial Threat</option>
                <option value="earthquake">Earthquake Tremor</option>
                <option value="cyclone">Cyclone & Storm Surge</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>Alert Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  fontSize: 11,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="ALL">All Severities</option>
                <option value="red">Critical (Red Alert)</option>
                <option value="orange">High (Orange Alert)</option>
                <option value="yellow">Moderate (Yellow Alert)</option>
                <option value="green">Advisory (Green Alert)</option>
              </select>
            </div>
          </div>

          {/* Location Search Input */}
          <div style={{ marginTop: 8 }}>
            <input
              type="text"
              placeholder="Search by district, village, or emergency agency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: 11,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Alert Feed List */}
      <div className="panel__list" style={{ padding: '12px', gap: 10 }}>
        {filteredAlerts.length === 0 ? (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 12,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            No active disaster alerts matched your time/location criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isRed = alert.severity === 'red';
            const isOrange = alert.severity === 'orange';
            const isYellow = alert.severity === 'yellow';

            const cardBg = isRed
              ? 'var(--accent-rose-subtle)'
              : isOrange
              ? 'var(--accent-amber-subtle)'
              : isYellow
              ? 'var(--bg-subtle)'
              : 'var(--bg-surface)';

            const badgeColor = isRed
              ? 'var(--accent-rose)'
              : isOrange
              ? 'var(--accent-amber)'
              : 'var(--accent-emerald)';

            return (
              <div
                key={alert.id}
                style={{
                  background: cardBg,
                  border: '1px solid var(--border-color)',
                  borderLeft: `4px solid ${badgeColor}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {alert.source}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                    <Clock size={11} />
                    <span>{formatTimeAgo(alert.issuedAt)}</span>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  {alert.eventType}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: badgeColor }}>
                  <MapPin size={12} />
                  <span>{alert.area}</span>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>
                  {alert.description}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
