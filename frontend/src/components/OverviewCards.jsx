import { Scale, ShieldCheck, AlertCircle, AlertOctagon, BellRing } from 'lucide-react';

export default function OverviewCards({ 
  totalDevices = 10, 
  trustedDevices = 7, 
  suspiciousDevices = 2, 
  tamperedDevices = 1, 
  activeAlerts = 3,
  onCardClick 
}) {
  const cards = [
    {
      id: 'total',
      title: 'Total Devices',
      value: totalDevices,
      subtitle: 'Registered Metrology Scales',
      icon: Scale,
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.1)',
      borderColor: 'rgba(56, 189, 248, 0.25)',
      statusType: 'all'
    },
    {
      id: 'trusted',
      title: 'Trusted Devices',
      value: trustedDevices,
      subtitle: 'Trust Score >= 0.80',
      icon: ShieldCheck,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      statusType: 'TRUSTED'
    },
    {
      id: 'suspicious',
      title: 'Suspicious Devices',
      value: suspiciousDevices,
      subtitle: 'Trust Score 0.50 - 0.79',
      icon: AlertCircle,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      statusType: 'SUSPICIOUS'
    },
    {
      id: 'tampered',
      title: 'Tampered Devices',
      value: tamperedDevices,
      subtitle: 'Trust Score < 0.50',
      icon: AlertOctagon,
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.14)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      statusType: 'TAMPERED',
      pulse: tamperedDevices > 0
    },
    {
      id: 'alerts',
      title: 'Active Alerts',
      value: activeAlerts,
      subtitle: 'Unacknowledged Incidents',
      icon: BellRing,
      color: '#f43f5e',
      bgGlow: 'rgba(244, 63, 94, 0.14)',
      borderColor: 'rgba(244, 63, 94, 0.35)',
      statusType: 'alerts',
      pulse: activeAlerts > 0
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '18px',
      marginBottom: '28px'
    }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick && onCardClick(card.statusType)}
            className="glass-panel"
            style={{
              padding: '20px 22px',
              borderRadius: '14px',
              cursor: 'pointer',
              background: `linear-gradient(145deg, ${card.bgGlow} 0%, rgba(14, 23, 42, 0.8) 100%)`,
              border: `1px solid ${card.borderColor}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Icon Glow */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em'
              }}>
                {card.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: `rgba(255, 255, 255, 0.05)`,
                border: `1px solid ${card.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color
              }}>
                <Icon size={20} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{
                fontSize: '2.1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: '#ffffff',
                lineHeight: 1
              }}>
                {card.value}
              </span>
              {card.pulse && (
                <span className="status-dot tampered" style={{ width: '10px', height: '10px' }} />
              )}
            </div>

            <div style={{
              fontSize: '0.72rem',
              color: card.color,
              marginTop: '8px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)'
            }}>
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
