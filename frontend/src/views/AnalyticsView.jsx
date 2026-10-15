import { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart as PieIcon, TrendingUp, AlertTriangle, 
  ShieldCheck, Activity, Scale, CheckCircle2 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, 
  Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { fetchAnalytics } from '../api';

export default function AnalyticsView() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading analytics...</div>;
  }

  const statusColors = {
    Trusted: '#10b981',
    Suspicious: '#f59e0b',
    Tampered: '#ef4444'
  };

  const severityColors = {
    WARNING: '#fbbf24',
    HIGH: '#f97316',
    CRITICAL: '#ef4444'
  };

  return (
    <div>
      {/* Analytics Overview Top Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '28px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NETWORK AVG TRUST SCORE</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#38bdf8', margin: '4px 0' }}>
            {analytics?.average_trust_score?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981' }}>Across all {analytics?.total_devices} active weighing nodes</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVG DIRECT TRUST</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#818cf8', margin: '4px 0' }}>
            {analytics?.average_direct_trust?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Sensor Data & Hardware Integrity</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVG INDIRECT TRUST</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#a78bfa', margin: '4px 0' }}>
            {analytics?.average_indirect_trust?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Peer Metrology Recommendation</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVG BiLSTM BEHAVIOUR SCORE</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#c084fc', margin: '4px 0' }}>
            {analytics?.average_bilstm_score?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Neural Sequence Verification</div>
        </div>
      </div>

      {/* Chart Grid: Row 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        {/* 1. Device Trust Status Distribution Donut */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={18} color="#38bdf8" /> Device Trust Status Distribution
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Trusted vs Suspicious vs Tampered devices
          </p>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.status_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {(analytics?.status_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#38bdf8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0e172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Trust Score Distribution Histogram */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#10b981" /> Trust Score Distribution
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Distribution of dynamic trust scores across instrument spectrum
          </p>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.score_distribution || []} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0e172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Device Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Grid: Row 2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '24px'
      }}>
        {/* 3. Alert Severity Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#ef4444" /> Alert Severity Distribution
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Critical vs High vs Warning security alerts logged
          </p>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.severity_distribution || []} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="severity" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0e172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Alert Count">
                  {(analytics?.severity_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={severityColors[entry.severity] || '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Weighing Instrument Types */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={18} color="#a855f7" /> Instrument Classification
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Categories of legal metrology scales monitored under jurisdiction
          </p>

          <div style={{ display: 'grid', gap: '10px' }}>
            {(analytics?.device_type_distribution || []).map((dt, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'rgba(9, 15, 29, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}>
                <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 500 }}>
                  {dt.type}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {dt.count} Units
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
