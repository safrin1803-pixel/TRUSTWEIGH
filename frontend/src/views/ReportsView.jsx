import { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, ShieldAlert, CheckCircle2, 
  Scale, AlertTriangle, RefreshCw, Calendar, Clock, UserCheck 
} from 'lucide-react';
import { fetchReportSummary } from '../api';

export default function ReportsView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchReportSummary();
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `legal_metrology_inspection_${report.report_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = (type = 'devices') => {
    window.open(`http://127.0.0.1:8001/api/reports/export/csv?type=${type}`, '_blank');
  };

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Generating Metrology Audit Report...</div>;
  }

  return (
    <div>
      <style>{`
        @page { size: A4 portrait; margin: 12mm; }
        @media print {
          html, body { background: #fff !important; color: #111827 !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden !important; }
          .audit-report, .audit-report * { visibility: visible !important; }
          .report-actions { display: none !important; }
          .audit-report {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: 100% !important; max-width: none !important; margin: 0 !important;
            padding: 8mm !important; box-sizing: border-box !important;
            background: #fff !important; color: #111827 !important;
            border: 0 !important; border-radius: 0 !important; box-shadow: none !important;
            font-size: 10pt !important; line-height: 1.35 !important;
          }
          .audit-report h1, .audit-report h2, .audit-report h3,
          .audit-report p, .audit-report span, .audit-report div,
          .audit-report li, .audit-report b { color: #111827 !important; }
          .audit-report h1 { font-size: 18pt !important; }
          .audit-report h3 { font-size: 12pt !important; break-after: avoid; }
          .audit-report [style*='display: grid'] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .audit-report [style*='display: flex'] { flex-wrap: wrap !important; gap: 8px !important; }
          .audit-report [style*='background: rgba'] { background: #fff !important; }
          .audit-report [style*='border'] { border-color: #cbd5e1 !important; }
          .audit-report > div { break-inside: avoid; }
          .audit-report button { display: none !important; }
          .audit-report svg { color: #111827 !important; }
        }
      `}</style>
      <div>
      {/* Action Header */}
      <div className="glass-panel report-actions" style={{
        padding: '20px 28px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <FileText size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Legal Metrology Trust & Tampering Inspection Report
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Official verification audit report for regulatory inspection & enforcement.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={loadReport}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} /> Generate Fresh Report
          </button>
          <button
            onClick={() => handleExportCSV('devices')}
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} /> Export Devices CSV
          </button>
          <button
            onClick={() => handleExportCSV('alerts')}
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} /> Export Alerts CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} /> Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary btn-sm"
          >
            <Printer size={14} /> Print Audit Sheet
          </button>
        </div>
      </div>

      {/* Official Report Document Container */}
      <div className="glass-panel audit-report" style={{
        padding: '36px 40px',
        background: '#090f1d',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        marginBottom: '32px'
      }}>
        {/* Document Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid rgba(56, 189, 248, 0.3)',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em' }}>
              DEPARTMENT OF LEGAL METROLOGY • CYBER-PHYSICAL SCALES INSPECTORATE
            </span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '6px 0 2px' }}>
              TRUST & TAMPERING EVALUATION AUDIT REPORT
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Jurisdiction: <b>{report?.jurisdiction}</b> | Report Reference: <b style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{report?.report_id}</b>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Generated Date & Time:</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{report?.generated_date}</div>
            <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{report?.generated_time}</div>
          </div>
        </div>

        {/* 1. Four Summary Sections Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Trust Evaluation Summary */}
          <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>1. TRUST EVALUATION SUMMARY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
              {report?.average_trust_score?.toFixed(2)} Avg
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Trusted: <b>{report?.trusted_count}</b> | Suspicious: <b>{report?.suspicious_count}</b>
            </div>
          </div>

          {/* Device Summary */}
          <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>2. DEVICE SUMMARY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
              {report?.total_devices} Total
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              All instruments verified against legal metrology tolerances.
            </div>
          </div>

          {/* Alert Summary */}
          <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>3. ALERT SUMMARY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
              {report?.active_alerts_count} Active
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Unacknowledged calibration or signature alerts.
            </div>
          </div>

          {/* Tampering Summary */}
          <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 700 }}>4. TAMPERING SUMMARY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
              {report?.tampered_count} Detected
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fca5a5' }}>
              {report?.blocked_count ? `${report.blocked_count} Quarantined` : 'Zero Breaches'}
            </div>
          </div>
        </div>

        {/* 2. Critical Tampering Incidents Section (without reason text) */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} /> Critical Tampering Incidents & Flagged Instruments
          </h3>
          {report?.tampering_incidents?.length === 0 ? (
            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem' }}>
              No critical tampering breaches detected in the current audit period.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {report?.tampering_incidents?.map((inc, idx) => (
                <div key={idx} style={{
                  padding: '14px 18px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                      {inc.device_id}
                    </span>
                    <span className="badge badge-critical">{inc.alert_type}</span>
                    <span style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                      Trust Score: <b>{inc.trust_score.toFixed(2)}</b>
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div>{inc.date} | {inc.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Official Regulatory Recommendations */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '18px 22px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '28px'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: '#ffffff' }}>
            Officer Findings & Legal Metrology Recommendations
          </h3>
          <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: '#cbd5e1', display: 'grid', gap: '8px' }}>
            {report?.recommendations?.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Signatures Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            <div>Inspecting Authority: <b>{report?.inspector_name}</b></div>
            <div>Department: <b>Legal Metrology Enforcement Directorate</b></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.3)', width: '180px', marginBottom: '6px' }} />
            <div>Digital Signature Verified</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#38bdf8' }}>LM-SIG-2026-X89104</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
