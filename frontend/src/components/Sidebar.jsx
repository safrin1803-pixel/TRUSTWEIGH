import { 
  LayoutDashboard, Scale, ShieldAlert, BellRing, 
  BarChart3, FileText, Settings, ShieldCheck, Cpu
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, activeAlertsCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Scale },
    { id: 'trust', label: 'Trust Evaluation', icon: ShieldCheck },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: activeAlertsCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 110,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px'
    }}>
      <div>
        {/* Logo Branding */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 8px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)'
          }}>
            <Scale size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.03em'
            }}>
              TRUSTWEIGH
            </div>
            <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 600 }}>
              Metrology Security v1.0
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: isActive 
                    ? 'linear-gradient(90deg, rgba(2, 132, 199, 0.25) 0%, rgba(2, 132, 199, 0.08) 100%)' 
                    : 'transparent',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease-in-out',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={19} color={isActive ? '#38bdf8' : '#94a3b8'} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div style={{
        background: 'rgba(14, 23, 42, 0.7)',
        borderRadius: '10px',
        padding: '12px 14px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="status-dot trusted" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
            Trust Engine Active
          </span>
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
          Direct + Indirect + BiLSTM Sequence Evaluator Ready
        </div>
      </div>
    </aside>
  );
}
