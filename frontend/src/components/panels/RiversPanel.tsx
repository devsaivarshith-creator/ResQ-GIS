import { useState, useMemo } from 'react';
import { Droplets, Gauge, CloudRain, Wind, Thermometer, Truck, Map as MapIcon, Activity } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { flyToSite, flyToState } from '../../cesium/camera';

export default function RiversPanel() {
  const {
    riverStations,
    selectedRiverId,
    selectRiver,
    weatherReport,
    systemStatus,
    emergencyResources,
    roads,
  } = useAppStore();

  const [selectedState, setSelectedState] = useState<string>('ALL');

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    riverStations.forEach((s) => {
      if (s.state) states.add(s.state);
    });
    return Array.from(states).sort();
  }, [riverStations]);

  const filteredStations = useMemo(() => {
    if (selectedState === 'ALL') return riverStations;
    return riverStations.filter((s) => s.state?.toLowerCase() === selectedState.toLowerCase());
  }, [riverStations, selectedState]);

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    if (st !== 'ALL') {
      flyToState(st);
    }
  };

  const imdProvenance = systemStatus?.sources?.imd?.status || 'LIVE';

  return (
    <div className="panel">
      {/* Title Section */}
      <div className="panel__section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="panel__row panel__row--between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: 'var(--accent-indigo-subtle)',
                border: '1px solid var(--accent-indigo)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-indigo)',
              }}
            >
              <Activity size={18} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Critical Infrastructure
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Telemetry, Resources & Corridors
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel__list" style={{ padding: '12px', gap: 12 }}>
        
        {/* State Infrastructure Filter */}
        <div style={{ background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            State Telemetry Filter ({availableStates.length} States Monitored)
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All States (Pan-India Gauges — {riverStations.length} Stations)</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* River Gauge Cards */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Hydrological Gauges &amp; Dams (CWC)</span>
            <span style={{ fontSize: 10, color: 'var(--accent-blue)', fontWeight: 600 }}>Showing {filteredStations.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredStations.map((station) => {
              const isSelected = selectedRiverId === station.id;
              const isDanger = station.status === 'danger' || (station.waterLevel && station.dangerLevel && station.waterLevel >= station.dangerLevel);
              const isWarning = station.status === 'warning' || (station.waterLevel && station.warningLevel && station.waterLevel >= station.warningLevel);

              const badgeBg = isDanger ? 'var(--accent-rose-subtle)' : isWarning ? 'var(--accent-amber-subtle)' : 'var(--accent-emerald-subtle)';
              const badgeColor = isDanger ? 'var(--accent-rose)' : isWarning ? 'var(--accent-amber)' : 'var(--accent-emerald)';
              const badgeText = isDanger ? 'DANGER' : isWarning ? 'WARNING' : 'NORMAL';

              return (
                <div
                  key={station.id}
                  onClick={() => {
                    selectRiver(station.id);
                    flyToSite(station.longitude, station.latitude);
                  }}
                  style={{
                    background: isSelected ? 'var(--accent-blue-subtle)' : 'var(--bg-surface)',
                    border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-xs)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div className="panel__row panel__row--between">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{station.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {station.river} &bull; {station.district}{station.state ? `, ${station.state}` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, background: badgeBg, color: badgeColor, border: '1px solid var(--border-color)', padding: '2px 7px', borderRadius: 'var(--radius-pill)', textTransform: 'uppercase' }}>
                      {badgeText}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '4px 2px', textAlign: 'center', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2px' }}>CURRENT</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={station.waterLevel ? `${station.waterLevel.toFixed(1)}m` : 'N/A'}>
                        {station.waterLevel ? `${station.waterLevel.toFixed(1)}m` : 'N/A'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--accent-amber-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '4px 2px', textAlign: 'center', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--accent-amber)', letterSpacing: '0.2px' }}>WARNING</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={station.warningLevel ? `${station.warningLevel.toFixed(1)}m` : 'N/A'}>
                        {station.warningLevel ? `${station.warningLevel.toFixed(1)}m` : 'N/A'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--accent-rose-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '4px 2px', textAlign: 'center', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--accent-rose)', letterSpacing: '0.2px' }}>DANGER</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={station.dangerLevel ? `${station.dangerLevel.toFixed(1)}m` : 'N/A'}>
                        {station.dangerLevel ? `${station.dangerLevel.toFixed(1)}m` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Resources */}
        {emergencyResources && emergencyResources.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
              Emergency Resources & Depots
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {emergencyResources.slice(0, 5).map(res => (
                <div key={res.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: 'var(--accent-indigo-subtle)', padding: 4, borderRadius: 4 }}>
                        <Truck size={14} color="var(--accent-indigo)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{res.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{res.district} &bull; Cap: {res.capacity}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, background: res.status === 'READY' ? 'var(--accent-emerald-subtle)' : 'var(--bg-subtle)', color: res.status === 'READY' ? 'var(--accent-emerald)' : 'var(--text-muted)', padding: '2px 6px', borderRadius: 12 }}>
                      {res.status}
                    </span>
                  </div>
                  {res.equipment && res.equipment.length > 0 && (
                    <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-secondary)' }}>
                      <strong>Equip:</strong> {res.equipment.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roads & Evacuation Routes */}
        {roads && roads.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
              Strategic Corridors (OSM)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {roads.slice(0, 5).map(road => (
                <div key={road.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: road.passabilityStatus === 'BLOCKED' ? 'var(--accent-rose-subtle)' : 'var(--accent-emerald-subtle)', padding: 4, borderRadius: 4 }}>
                        <MapIcon size={14} color={road.passabilityStatus === 'BLOCKED' ? 'var(--accent-rose)' : 'var(--accent-emerald)'} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {road.name} {road.isEvacuationRoute && <span style={{ color: 'var(--accent-blue)' }}>(Evac Route)</span>}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Type: {road.highwayType} &bull; {road.lanes} Lanes</div>
                      </div>
                    </div>
                  </div>
                  {road.blockageReason && (
                    <div style={{ marginTop: 6, fontSize: 10, color: 'var(--accent-rose)' }}>
                      <strong>Blockage:</strong> {road.blockageReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IMD Meteorological Observation Deck */}
        <div style={{ marginTop: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xs)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div className="panel__row panel__row--between" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CloudRain size={16} color="var(--accent-blue)" strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                IMD Met Telemetry
              </span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, background: imdProvenance === 'LIVE' ? 'var(--accent-emerald-subtle)' : 'var(--accent-amber-subtle)', color: imdProvenance === 'LIVE' ? 'var(--accent-emerald)' : 'var(--accent-amber)', padding: '2px 7px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-pill)', textTransform: 'uppercase' }}>
              ● {weatherReport?.provenance || imdProvenance}
            </span>
          </div>

          {weatherReport && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <Thermometer size={14} color="var(--accent-amber)" strokeWidth={2} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{weatherReport.current.temperature}°C ({weatherReport.current.condition})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <Droplets size={14} color="var(--accent-cyan)" strokeWidth={2} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>Rain: {weatherReport.current.rainfall24h} mm</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <Wind size={14} color="var(--text-muted)" strokeWidth={2} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Wind: {weatherReport.current.windSpeed} km/h</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <Gauge size={14} color="var(--text-muted)" strokeWidth={2} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Humidity: {weatherReport.current.humidity}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
