import { useState } from 'react';
import {
  Scan,
  Radio,
  BookmarkPlus,
  CloudRain,
  Users,
  Building,
  Activity,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { flyToSite } from '../../cesium/camera';
import type { SurveillanceZone } from '../../types';

export default function SurveillancePanel() {
  const {
    isSurveillanceActive,
    toggleSurveillance,
    surveillanceZones,
    activeSurveillanceZone,
    setActiveSurveillanceZone,
    addSurveillanceZone,
    activeWorkspaceId,
    workspaces,
    weatherReport,
    weather,
    habitations,
    riverStations,
  } = useAppStore();

  const [radiusKm, setRadiusKm] = useState(activeSurveillanceZone?.radiusKm || 3.0);
  const [zoneName, setZoneName] = useState(activeSurveillanceZone?.name || 'Custom AOI Sector');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  // Dynamic calculations based on radius and center
  const centerLat = activeSurveillanceZone?.center.lat || 30.5564;
  const centerLng = activeSurveillanceZone?.center.lng || 79.5663;

  // Compute habitations within radius (simple haversine approximation)
  const habitationsInZone = habitations.filter((h) => {
    const dLat = (h.location.lat - centerLat) * 111;
    const dLng = (h.location.lng - centerLng) * 111 * Math.cos((centerLat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return dist <= radiusKm;
  });

  const totalPop = habitationsInZone.reduce((acc, h) => acc + h.population, 0) || 4213;
  const avgRisk = habitationsInZone.length
    ? +(habitationsInZone.reduce((acc, h) => acc + h.riskScore, 0) / habitationsInZone.length).toFixed(2)
    : 0.85;

  const currentRain = weatherReport?.current?.rainfall24h ?? (weather[0]?.rainfall ?? 28.9);
  const closestGauge = riverStations[0];

  const handleSelectPreset = (zone: SurveillanceZone) => {
    setActiveSurveillanceZone(zone);
    setZoneName(zone.name);
    setRadiusKm(zone.radiusKm);
    flyToSite(zone.center.lng, zone.center.lat);
  };

  const handleSaveToWorkspace = () => {
    const newZone: SurveillanceZone = {
      id: `sz-${Date.now()}`,
      name: zoneName,
      district: activeWs.district,
      center: { lat: centerLat, lng: centerLng },
      radiusKm,
      assignedFolderId: activeWs.id,
      riskScore: avgRisk,
      populationExposed: totalPop,
      activeAlertsCount: 2,
      lastScanned: 'Just now',
    };

    addSurveillanceZone(newZone);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="panel">
      {/* Header Banner */}
      <div className="panel__section" style={{ background: 'var(--bg-subtle)', padding: '5px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-rose-subtle)',
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scan size={14} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>
                Surveillance & AOI
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 500, color: 'var(--text-muted)' }}>
                Precision Radar & Sentry
              </div>
            </div>
          </div>

          <button
            onClick={toggleSurveillance}
            className={`btn-action ${isSurveillanceActive ? 'btn-action--rose' : 'btn-action--primary'}`}
            style={{ padding: '2px 6px', fontSize: 10 }}
          >
            <Radio size={11} />
            <span>{isSurveillanceActive ? 'Active' : 'Engage'}</span>
          </button>
        </div>
      </div>

      <div className="panel__list" style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Active Target Scope Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 8px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Target Surveillance Sector
            </span>
            <span
              className="risk-badge risk-badge--sm"
              style={{
                background: avgRisk >= 0.7 ? 'var(--accent-rose-subtle)' : 'var(--accent-amber-subtle)',
                color: avgRisk >= 0.7 ? 'var(--accent-rose)' : 'var(--accent-amber)',
                padding: '1px 5px',
                fontSize: 9,
              }}
            >
              RISK {avgRisk.toFixed(2)}
            </span>
          </div>
          {/* Select Epicenter from ALL Habitations */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
              Epicenter ({habitations.length} Habitations)
            </label>
            <select
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
              onChange={(e) => {
                const targetHab = habitations.find(h => h.id === e.target.value);
                if (targetHab) {
                  setZoneName(`${targetHab.name} Sentry Zone`);
                  const newZone: SurveillanceZone = {
                    id: `sz-${targetHab.id}`,
                    name: `${targetHab.name} Sentry Zone`,
                    district: targetHab.district,
                    center: { lat: targetHab.location.lat, lng: targetHab.location.lng },
                    radiusKm,
                    assignedFolderId: activeWs.id,
                    riskScore: targetHab.riskScore,
                    populationExposed: targetHab.population,
                    activeAlertsCount: 1,
                    lastScanned: 'Just now',
                  };
                  setActiveSurveillanceZone(newZone);
                  flyToSite(targetHab.location.lng, targetHab.location.lat);
                }
              }}
            >
              <option value="">-- Choose Any Habitation --</option>
              {habitations.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.district}) - Pop: {h.population.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Zone Label / Designation
            </label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              style={{
                padding: '3px 6px',
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 700,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Coordinates & Radius slider */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Perimeter Radius
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-blue)' }}>
                {radiusKm.toFixed(1)} km
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="200.0"
              step="1.0"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
            />
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--text-muted)',
              background: 'var(--bg-subtle)',
              padding: '3px 6px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {centerLat.toFixed(3)}°N, {centerLng.toFixed(3)}°E &bull; {activeWs.name}
          </div>
        </div>

        {/* Live Surveillance Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5 }}>
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 9.5, fontWeight: 600 }}>
              <Users size={11} color="var(--accent-blue)" />
              <span>Zone Pop.</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {totalPop.toLocaleString()}
            </div>
            <div style={{ fontSize: 8.5, fontWeight: 500, color: 'var(--text-muted)' }}>
              {habitationsInZone.length} villages
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 9.5, fontWeight: 600 }}>
              <CloudRain size={11} color="var(--accent-cyan)" />
              <span>24h Rain</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {currentRain.toFixed(1)} mm
            </div>
            <div style={{ fontSize: 8.5, fontWeight: 500, color: 'var(--text-muted)' }}>
              Open-Meteo
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 9.5, fontWeight: 600 }}>
              <Activity size={11} color="var(--accent-amber)" />
              <span>Gauge</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {closestGauge ? `${closestGauge.waterLevel}m` : 'Normal'}
            </div>
            <div style={{ fontSize: 8.5, fontWeight: 500, color: 'var(--text-muted)' }}>
              {closestGauge?.river || 'Alaknanda'}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 9.5, fontWeight: 600 }}>
              <Building size={11} color="var(--accent-emerald)" />
              <span>Corridor</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>
              NH-7 Open
            </div>
            <div style={{ fontSize: 8.5, fontWeight: 500, color: 'var(--text-muted)' }}>
              BRO standby
            </div>
          </div>
        </div>

        {/* Action Button: Save Zone into Workspace */}
        <button
          onClick={handleSaveToWorkspace}
          className="btn-action btn-action--primary"
          style={{ width: '100%', padding: '5px 8px', fontSize: 10, justifyContent: 'center' }}
        >
          <BookmarkPlus size={12} />
          <span>{savedSuccess ? 'Saved!' : `Save Sentry Zone`}</span>
        </button>

        {/* Preset Surveillance Sectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Himalayan Surveillance Presets
          </div>

          {surveillanceZones.map((zone) => {
            const isTarget = activeSurveillanceZone?.id === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => handleSelectPreset(zone)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  background: isTarget ? 'var(--accent-blue-subtle)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: isTarget ? 'var(--accent-blue)' : 'var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {zone.name}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--text-muted)' }}>
                    {zone.district} &bull; {zone.radiusKm} km &bull; {zone.populationExposed.toLocaleString()}
                  </div>
                </div>
                <span
                  className="risk-badge risk-badge--sm"
                  style={{
                    background: zone.riskScore >= 0.8 ? 'var(--accent-rose-subtle)' : 'var(--accent-amber-subtle)',
                    color: zone.riskScore >= 0.8 ? 'var(--accent-rose)' : 'var(--accent-amber)',
                    padding: '1px 4px',
                    fontSize: 8.5,
                  }}
                >
                  {(zone.riskScore * 100).toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
