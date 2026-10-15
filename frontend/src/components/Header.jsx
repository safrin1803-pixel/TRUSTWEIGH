import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Bell, UserCheck, Clock, Calendar, AlertTriangle, 
  CheckCircle2, RefreshCw, Radio, LogOut 
} from 'lucide-react';

export default function Header({ 
  activeAlerts = [], 
  onAlertClick, 
  onRefresh,
  currentUser,
  onLogout 
}) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const unreadCount = activeAlerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <header style={{
      height: '76px',
      background: 'rgba(9, 15, 29, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px'
    }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)',
          border: '1px solid rgba(56, 189, 248, 0.4)'
        }}>
          <ShieldCheck size={26} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              TRUSTWEIGH
            </span>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700
            }}>
              LEGAL METROLOGY
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
            Tampering Detection & Trust Evaluation System
          </p>
        </div>
      </div>

      {/* Center: Live Date & Time Ticker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: 'rgba(14, 23, 42, 0.6)',
        padding: '8px 18px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          <Calendar size={15} color="#38bdf8" />
          <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{formattedDate}</span>
        </div>
        <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
          <Clock size={16} color="#10b981" />
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontWeight: 700, 
            color: '#34d399', 
            letterSpacing: '0.04em' 
          }}>
            {formattedTime}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.65rem',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600
          }}>
            <Radio size={10} className="status-dot trusted" /> LIVE
          </span>
        </div>
      </div>

      {/* Right Controls: Refresh, Notifications, Admin Profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Manual Refresh */}
        <button
          onClick={onRefresh}
          className="btn btn-secondary"
          title="Refresh Data"
          style={{ padding: '8px 10px' }}
        >
          <RefreshCw size={15} />
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: unreadCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: unreadCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: unreadCount > 0 ? '#f87171' : 'var(--text-secondary)',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Menu */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '50px',
              width: '320px',
              background: '#0e172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              zIndex: 200,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.9)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Metrology Alerts ({unreadCount} active)</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Real-Time Stream</span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {activeAlerts.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
                    No active alerts. All instruments compliant.
                  </div>
                ) : (
                  activeAlerts.slice(0, 5).map(alert => (
                    <div 
                      key={alert.alert_id}
                      onClick={() => {
                        onAlertClick && onAlertClick(alert);
                        setShowNotifications(false);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <AlertTriangle 
                        size={16} 
                        color={alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'} 
                        style={{ flexShrink: 0 }} 
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#f8fafc' }}>
                            {alert.device_id}
                          </span>
                          <span className={`badge badge-${alert.severity.toLowerCase()}`} style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                            {alert.alert_type}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Score: <b style={{ color: '#f87171' }}>{alert.trust_score.toFixed(2)}</b> • {alert.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '6px 12px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '2px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <UserCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
              {currentUser?.name || 'Admin'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 600 }}>
              {currentUser?.role || 'System Administrator'}
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onLogout}
          className="btn btn-secondary"
          title="Sign Out"
          style={{ padding: '8px 10px', color: '#fca5a5' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
