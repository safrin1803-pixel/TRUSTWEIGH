import { useState } from 'react';
import { 
  Scale, Search, Filter, Plus, ExternalLink, ShieldCheck, 
  AlertCircle, AlertOctagon, ArrowUpDown, Lock, Unlock, ShieldAlert
} from 'lucide-react';
import { blockDevice } from '../api';

export default function DeviceTable({ 
  devices = [], 
  onViewDetails, 
  onAddDeviceClick,
  onUnblockClick,
  onDeviceUpdated,
  initialFilter = 'all'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [sortField, setSortField] = useState('device_id');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredDevices = devices.filter(dev => {
    const matchesSearch = 
      dev.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.sensor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.device_type.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'BLOCKED') {
      return matchesSearch && dev.is_blocked;
    }

    const matchesStatus = 
      statusFilter === 'all' || 
      dev.trust_status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Sorting
  filteredDevices.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleManualBlock = async (devId) => {
    if (!window.confirm(`Are you sure you want to administratively BLOCK and quarantine device ${devId}?`)) {
      return;
    }
    try {
      await blockDevice(devId, {
        admin_name: 'Admin',
        reason: 'Manual administrative security quarantine initiated from console.'
      });
      if (onDeviceUpdated) onDeviceUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to block device.');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      {/* Table Action Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Weighing Instruments Registry & Security Monitoring
            </h3>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px 8px',
              borderRadius: '999px',
              fontFamily: 'var(--font-mono)'
            }}>
              {filteredDevices.length} Instruments
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Continuous Legal Metrology compliance, auto-quarantine, and admin unblock governance
          </p>
        </div>

        {/* Right side: Search, Status Filter & + Add Device button */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search 
              size={15} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search ID, IP, Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.8rem', height: '36px' }}
            />
          </div>

          {/* Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: '145px', height: '36px', fontSize: '0.8rem', padding: '6px 10px' }}
            >
              <option value="all">All Statuses</option>
              <option value="TRUSTED">Trusted</option>
              <option value="SUSPICIOUS">Suspicious</option>
              <option value="TAMPERED">Tampered</option>
              <option value="BLOCKED">🔒 Blocked Only</option>
            </select>
          </div>

          {/* + Add Device Button */}
          <button
            onClick={onAddDeviceClick}
            className="btn btn-primary"
            style={{ height: '36px', padding: '0 16px', fontSize: '0.8125rem' }}
          >
            <Plus size={16} /> + Add Device
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('device_id')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Device ID <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Sensor ID</th>
              <th>Device Type & Location</th>
              <th>IP Address</th>
              <th onClick={() => handleSort('dynamic_trust_score')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Trust Score <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Trust Status</th>
              <th>Security State</th>
              <th>Last Evaluated</th>
              <th style={{ textAlign: 'right' }}>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                  No weighing instruments found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredDevices.map((dev) => {
                const statusClass = dev.trust_status.toLowerCase();
                const isBlocked = dev.is_blocked;

                return (
                  <tr key={dev.device_id} style={{
                    background: isBlocked ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                  }}>
                    {/* Device ID */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`status-dot ${isBlocked ? 'tampered' : statusClass}`} />
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                          {dev.device_id}
                        </span>
                      </div>
                    </td>

                    {/* Sensor ID */}
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {dev.sensor_id}
                    </td>

                    {/* Type & Location */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f8fafc' }}>
                        {dev.device_type}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {dev.location}
                      </div>
                    </td>

                    {/* IP Address */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {dev.ip_address}
                    </td>

                    {/* Trust Score with Progress Bar */}
                    <td style={{ minWidth: '130px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: dev.dynamic_trust_score >= 0.8 ? '#10b981' : dev.dynamic_trust_score >= 0.5 ? '#f59e0b' : '#ef4444'
                        }}>
                          {dev.dynamic_trust_score.toFixed(2)}
                        </span>
                      </div>
                      <div className="trust-bar-bg">
                        <div 
                          className={`trust-bar-fill ${statusClass}`} 
                          style={{ width: `${Math.min(100, Math.max(0, dev.dynamic_trust_score * 100))}%` }} 
                        />
                      </div>
                    </td>

                    {/* Trust Status Badge */}
                    <td>
                      <span className={`badge badge-${statusClass}`}>
                        {dev.trust_status}
                      </span>
                    </td>

                    {/* Security State (Blocked vs Active) */}
                    <td>
                      {isBlocked ? (
                        <span className="badge badge-critical" style={{ gap: '4px' }}>
                          <Lock size={11} /> BLOCKED
                        </span>
                      ) : (
                        <span className="badge badge-trusted" style={{ gap: '4px' }}>
                          <ShieldCheck size={11} /> OPERATIONAL
                        </span>
                      )}
                    </td>

                    {/* Last Evaluated Date & Time */}
                    <td>
                      <div style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 500 }}>
                        {dev.last_evaluated_date}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {dev.last_evaluated_time}
                      </div>
                    </td>

                    {/* Admin Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {isBlocked ? (
                          <button
                            onClick={() => onUnblockClick && onUnblockClick(dev)}
                            className="btn btn-primary btn-sm"
                            style={{ background: '#059669', borderColor: '#10b981', fontSize: '0.72rem', gap: '4px' }}
                            title="Admin Seal Verification & Unblock"
                          >
                            <Unlock size={12} /> Unblock
                          </button>
                        ) : (
                          dev.trust_status !== 'TRUSTED' && (
                            <button
                              onClick={() => handleManualBlock(dev.device_id)}
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.72rem', gap: '4px' }}
                              title="Manually Block / Quarantine Device"
                            >
                              <Lock size={12} /> Block
                            </button>
                          )
                        )}

                        <button
                          onClick={() => onViewDetails(dev.device_id)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px' }}
                        >
                          <ExternalLink size={13} />
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
  );
}
