import { useState } from 'react';
import { X, Scale, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { registerDevice } from '../api';

export default function AddDeviceModal({ isOpen, onClose, onDeviceAdded }) {
  const [formData, setFormData] = useState({
    device_id: '',
    sensor_id: '',
    ip_address: '',
    mac_address: '',
    location: '',
    device_type: 'Digital Industrial Platform Scale (500 Kg)'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const deviceTypes = [
    'Heavy Vehicle Weighbridge (50 Ton)',
    'Digital Industrial Platform Scale (500 Kg)',
    'High-Precision Micro Analytical Balance (0.01mg)',
    'Suspended Crane Scale (20 Ton)',
    'Electronic Price Computing Scale',
    'Axle Load Dynamic Weigh-in-Motion',
    'Mass Flow Metrology Terminal',
    'Hopper Batching Scale (5 Ton)',
    'Heavy Duty Pallet Scale'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.device_id.trim() || !formData.sensor_id.trim() || !formData.ip_address.trim()) {
      setError('Please fill in Device ID, Sensor ID, and IP Address.');
      return;
    }

    setSubmitting(true);
    try {
      const newDev = await registerDevice(formData);
      onDeviceAdded(newDev);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to register weighing instrument.');
    } finally {
      setSubmitting(false);
    }
  };

  const generateDemoValues = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      device_id: `WEIGH-0${Math.floor(11 + Math.random() * 20)}`,
      sensor_id: `SENSOR-${Math.floor(11 + Math.random() * 20)}`,
      ip_address: `192.168.1.${Math.floor(20 + Math.random() * 200)}`,
      mac_address: `3C:71:BF:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
      location: `Zone-A Commercial Hub - Terminal ${randomNum}`,
      device_type: 'Digital Industrial Platform Scale (500 Kg)'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          background: 'rgba(15, 23, 42, 0.9)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Scale size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
                Register New Weighing Instrument
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                Legal Metrology Trust Evaluation Enrolment
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Device ID */}
            <div className="form-group">
              <label className="form-label">Device ID *</label>
              <input
                type="text"
                name="device_id"
                placeholder="e.g. WEIGH-011"
                value={formData.device_id}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Sensor ID */}
            <div className="form-group">
              <label className="form-label">Sensor ID *</label>
              <input
                type="text"
                name="sensor_id"
                placeholder="e.g. SENSOR-11"
                value={formData.sensor_id}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* IP Address */}
            <div className="form-group">
              <label className="form-label">IP Address *</label>
              <input
                type="text"
                name="ip_address"
                placeholder="e.g. 192.168.1.55"
                value={formData.ip_address}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* MAC Address */}
            <div className="form-group">
              <label className="form-label">MAC Address</label>
              <input
                type="text"
                name="mac_address"
                placeholder="e.g. 3C:71:BF:8A:2B:20"
                value={formData.mac_address}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Physical Location / Facility *</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. State Grain Warehouse - Platform Bay #3"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Device Type */}
          <div className="form-group">
            <label className="form-label">Instrument Classification / Type *</label>
            <select
              name="device_type"
              value={formData.device_type}
              onChange={handleChange}
              className="form-select"
            >
              {deviceTypes.map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={generateDemoValues}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Autofill Sample Data
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Registering...' : 'Register Device'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
