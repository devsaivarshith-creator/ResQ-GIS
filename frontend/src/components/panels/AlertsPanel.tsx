import { useState, useMemo } from 'react';
import { Clock, Siren, Filter } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertsPanel() {
  const { alerts } = useAppStore();
  
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | '72H'
  const [typeFilter, setTypeFilter] = useState('');
  const [areaSearch, setAreaSearch] = useState('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // 1. Time filter
      if (timeFilter === '72H') {
        const diff = Date.now() - new Date(alert.issuedAt).getTime();
        if (diff > 72 * 60 * 60 * 1000) return false;
      }
      
      // 2. Event Type Filter
      if (typeFilter && !alert.eventType.toLowerCase().includes(typeFilter.toLowerCase())) {
        return false;
      }
      
      // 3. Area/State/Location Search
      if (areaSearch && !alert.area.toLowerCase().includes(areaSearch.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [alerts, timeFilter, typeFilter, areaSearch]);

  const uniqueTypes = Array.from(new Set(alerts.map(a => a.eventType)));

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
                Emergency Bulletins
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Multi-Agency CAP Alerts Feed
              </div>
            </div>
          </div>
          <button
            className={`btn-action ${filtersOpen ? 'btn-action--primary' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter size={13} strokeWidth={2} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters Drawer */}
      {filtersOpen && (
        <div className="panel__section" style={{ background: 'var(--bg-subtle)' }}>
          <div className="panel__row panel__row--between" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Filter Alerts
            </span>
            <button
              onClick={() => { setTimeFilter('ALL'); setTypeFilter(''); setAreaSearch(''); }}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>Time Period</label>
              <select 
                value={timeFilter} 
                onChange={e => setTimeFilter(e.target.value)}
                style={{ width: '100%', padding: '4px', fontSize: 11, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="ALL">All Time</option>
                <option value="72H">Past 72 Hours</option>
              </select>
            </div>
            
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>Hazard / Event Type</label>
              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)}
                style={{ width: '100%', padding: '4px', fontSize: 11, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="">All Hazards</option>
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>State / Location Search</label>
              <input 
                type="text"
                placeholder="e.g. Kerala, Wayanad..."
                value={areaSearch} 
                onChange={e => setAreaSearch(e.target.value)}
                style={{ width: '100%', padding: '4px 6px', fontSize: 11, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="panel__section" style={{ background: 'var(--bg-surface)', padding: '6px 12px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
          Showing {filteredAlerts.length} Alerts
        </span>
      </div>

      <div className="panel__list" style={{ padding: '12px', gap: 8 }}>
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'red';
          const isOrange = alert.severity === 'orange';
          const badgeBg = isCritical ? 'var(--accent-rose-subtle)' : isOrange ? 'var(--accent-amber-subtle)' : 'var(--accent-cyan-subtle)';
          const badgeColor = isCritical ? 'var(--accent-rose)' : isOrange ? 'var(--accent-amber)' : 'var(--accent-cyan)';
          const borderHighlight = isCritical ? 'var(--accent-rose)' : 'var(--border-color)';

          return (
            <div
              key={alert.id}
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${borderHighlight}`,
                borderLeft: isCritical ? `3px solid var(--accent-rose)` : `1px solid var(--border-color)`,
                boxShadow: 'var(--shadow-xs)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              <div className="panel__row panel__row--between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      background: badgeBg,
                      color: badgeColor,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--border-color)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {alert.source}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {alert.eventType}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                  <Clock size={12} />
                  <span>{timeAgo(alert.issuedAt)}</span>
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                📍 Area: {alert.area}
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {alert.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
