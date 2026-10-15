import { useState } from 'react';
import { 
  ShieldCheck, Lock, User, KeyRound, AlertCircle, 
  CheckCircle2, ArrowRight, ShieldAlert, Scale, Sparkles 
} from 'lucide-react';
import { loginAdmin } from '../api';

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginAdmin(username, password);
      localStorage.setItem('trustweigh_token', data.token);
      localStorage.setItem('trustweigh_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#060b14',
      backgroundImage: `
        radial-gradient(at 10% 10%, rgba(14, 165, 233, 0.12) 0px, transparent 50%),
        radial-gradient(at 90% 90%, rgba(239, 68, 68, 0.08) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(16, 185, 129, 0.06) 0px, transparent 60%)
      `,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(14, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px -10px rgba(14, 165, 233, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Top Header Card */}
        <div style={{
          padding: '32px 32px 24px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.15) 0%, transparent 100%)'
        }}>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(2, 132, 199, 0.5)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            marginBottom: '16px'
          }}>
            <Scale size={32} color="#ffffff" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.6rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              TRUSTWEIGH
            </h1>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800
            }}>
              ADMIN PORTAL
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            Department of Legal Metrology Enforcement<br />
            Cyber-Physical Scale Tampering Detection & Trust Gateway
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px 32px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '0.8rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              Officer Username / Email
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or r.sundaram@metrology.gov.in"
                className="form-input"
                style={{ paddingLeft: '38px', height: '42px', fontSize: '0.875rem' }}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              Authentication Passcode
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="form-input"
                style={{ paddingLeft: '38px', height: '42px', fontSize: '0.875rem' }}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '44px',
              fontSize: '0.92rem',
              fontWeight: 700,
              marginBottom: '16px'
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating Credentials...' : (
              <>
                <span>Sign In as Legal Metrology Admin</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Quick Demo Fill Helper */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f8fafc' }}>
                Default Demo Credentials:
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                User: <b>admin</b> | Pass: <b>admin123</b>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.7rem', padding: '4px 8px' }}
            >
              <Sparkles size={12} color="#38bdf8" /> Autofill
            </button>
          </div>

          {/* Security Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '22px',
            fontSize: '0.68rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>TLS 1.3 Protected • Government Legal Metrology Gateway</span>
          </div>
        </form>
      </div>
    </div>
  );
}
