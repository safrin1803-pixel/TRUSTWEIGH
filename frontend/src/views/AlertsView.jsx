import { useState } from 'react';
import { 
  BellRing, AlertTriangle, AlertOctagon, CheckCircle2, 
  ExternalLink, Search, Filter, Check, ShieldAlert 
} from 'lucide-react';
import { acknowledgeAlert } from '../api';

export default function AlertsView({ alerts = [], onAlertAcknowledged, onViewDevice }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [acknowledgingId, setAcknowledgingId] = useState(null);

  const filteredAlerts = alerts.filter(al => {
    const matchesSearch = 
      al.alert_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      al.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      al.alert_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || al.severity.toUpperCase() === severityFilter.toUpperCase();
    const matchesStatus = statusFilter === 'all' || al.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleAcknowledge = async (alertId) => {
    setAcknowledgingId(alertId);
    try {
      await acknowledgeAlert(alertId, 'Admin (Legal Metrology)');
      if (onAlertAcknowledged) onAlertAcknowledged(alertId);
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  return (
    <div>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(14, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <BellRing size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                Metrology Security Alerts & Incident History
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Permanent audit trail of tampering detections, threshold violations, and signature failures.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 700 }}>CRITICAL ACTIVE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>{criticalCount}</div>
            </div>
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#fde68a', fontWeight: 700 }}>TOTAL UNRESOLVED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{activeCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search 
              size={15} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search alert ID or device ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.8rem', height: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="form-select"
              style={{ width: '140px', height: '36px', fontSize: '0.8rem' }}
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="WARNING">Warning</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: '140px', height: '36px', fontSize: '0.8rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active (Unresolved)</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
            </select>
          </div>
        </div>

        {/* Table without Reason Column */}
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Device ID</th>
                <th>Alert Type</th>
                <th>Trust Score</th>
                <th>Severity</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No alerts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((al) => {
                  const sevClass = al.severity.toLowerCase();
                  return (
                    <tr key={al.alert_id}>
                      {/* Alert ID */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: '#cbd5e1' }}>
                        {al.alert_id}
                      </td>

                      {/* Device ID */}
                      <td>
                        <span 
                          onClick={() => onViewDevice(al.device_id)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            color: '#38bdf8',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          {al.device_id}
                        </span>
                      </td>

                      {/* Alert Type */}
                      <td style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f8fafc' }}>
                        {al.alert_type}
                      </td>

                      {/* Trust Score */}
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: al.trust_score >= 0.8 ? '#10b981' : al.trust_score >= 0.5 ? '#f59e0b' : '#ef4444'
                        }}>
                          {al.trust_score.toFixed(2)}
                        </span>
                      </td>

                      {/* Severity */}
                      <td>
                        <span className={`badge badge-${sevClass}`}>
                          {al.severity}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td>
                        <div style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 500 }}>
                          {al.date}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {al.time}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <div>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: al.status === 'ACTIVE' ? '#ef4444' : '#10b981'
                          }}>
                            {al.status}
                          </span>
                          {al.acknowledged_by && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              By: {al.acknowledged_by}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {al.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleAcknowledge(al.alert_id)}
                              disabled={acknowledgingId === al.alert_id}
                              className="btn btn-primary btn-sm"
                              style={{ background: '#059669', borderColor: '#10b981', fontSize: '0.7rem' }}
                            >
                              <Check size={12} /> {acknowledgingId === al.alert_id ? '...' : 'Acknowledge'}
                            </button>
                          )}
                          <button
                            onClick={() => onViewDevice(al.device_id)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.7rem' }}
                          >
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
