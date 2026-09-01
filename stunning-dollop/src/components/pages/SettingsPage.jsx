import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../configs/service';
import API_ENDPOINTS from '../../configs/api';
import './SettingsPage.css';

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', icon: '⚙️', write: 'admin' },
  { id: 'security', label: 'Security', icon: '🔒', write: 'superadmin' },
  { id: 'payments', label: 'Payments', icon: '💳', write: 'superadmin' },
  { id: 'notifs', label: 'Notifications', icon: '🔔', write: 'admin' },
  { id: 'api', label: 'API & Integrations', icon: '🔌', write: 'superadmin' },
];

const ToggleRow = ({ label, hint, checked, onChange, disabled }) => (
  <div className="settings-row">
    <div className="settings-row-info">
      <span className="settings-row-label">{label}</span>
      {hint && <span className="settings-row-hint">{hint}</span>}
    </div>
    <label className="toggle-switch">
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  </div>
);

const InputRow = ({ label, hint, type = 'text', value, onChange, prefix, suffix, masked, disabled }) => (
  <div className="settings-row">
    <div className="settings-row-info">
      <span className="settings-row-label">{label}</span>
      {hint && <span className="settings-row-hint">{hint}</span>}
    </div>
    <div className="settings-input-wrap">
      {prefix && <span className="settings-affix">{prefix}</span>}
      <input
        className="settings-input"
        type={masked ? 'password' : type}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {suffix && <span className="settings-affix settings-affix--right">{suffix}</span>}
    </div>
  </div>
);

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { canWrite, isSuperAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [general, setGeneral] = useState({});
  const [security, setSecurity] = useState({});
  const [payments, setPayments] = useState({});
  const [notifs, setNotifs] = useState({});
  const [api, setApi] = useState({});
  const [apiKeyPreview, setApiKeyPreview] = useState('');

  const canEditSection = (writeLevel) => {
    if (writeLevel === 'superadmin') return isSuperAdmin;
    return canWrite;
  };

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await apiService.get(API_ENDPOINTS.SETTINGS);
      const data = res.data || {};
      setGeneral(data.general || {});
      setSecurity(data.security || {});
      setPayments(data.payments || {});
      setNotifs(data.notifications || {});
      setApi(data.api || {});
      try {
        const keyRes = await apiService.get(API_ENDPOINTS.SETTINGS_API_KEY);
        setApiKeyPreview(keyRes.data?.keyPreview || '');
      } catch {
        setApiKeyPreview('');
      }
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (setter) => (key) => (val) => setter((prev) => ({ ...prev, [key]: val }));
  const setG = set(setGeneral);
  const setSec = set(setSecurity);
  const setPay = set(setPayments);
  const setNot = set(setNotifs);
  const setApi2 = set(setApi);

  const handleSave = async () => {
    const section = SETTINGS_SECTIONS.find((s) => s.id === activeSection);
    if (!section || !canEditSection(section.write)) {
      setError('You do not have permission to edit this section');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const map = {
        general: { endpoint: API_ENDPOINTS.SETTINGS_GENERAL, body: general },
        security: { endpoint: API_ENDPOINTS.SETTINGS_SECURITY, body: security },
        payments: { endpoint: API_ENDPOINTS.SETTINGS_PAYMENTS, body: payments },
        notifs: { endpoint: API_ENDPOINTS.SETTINGS_NOTIFICATIONS, body: notifs },
        api: { endpoint: API_ENDPOINTS.SETTINGS_API, body: api },
      };
      const { endpoint, body } = map[activeSection];
      const res = await apiService.patch(endpoint, body);
      if (activeSection === 'general') setGeneral(res.data || body);
      if (activeSection === 'security') setSecurity(res.data || body);
      if (activeSection === 'payments') setPayments(res.data || body);
      if (activeSection === 'notifs') setNotifs(res.data || body);
      if (activeSection === 'api') setApi(res.data || body);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setBusy(false);
    }
  };

  const rotateKey = async () => {
    if (!isSuperAdmin) return;
    setBusy(true);
    try {
      const res = await apiService.post(API_ENDPOINTS.SETTINGS_API_KEY_ROTATE, {});
      setApiKeyPreview(res.data?.newKey || res.data?.keyPreview || 'rotated');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to rotate API key');
    } finally {
      setBusy(false);
    }
  };

  const testWebhook = async () => {
    if (!canWrite) return;
    setBusy(true);
    try {
      const res = await apiService.post(API_ENDPOINTS.SETTINGS_WEBHOOK_TEST, {});
      setError('');
      alert(`Webhook test: ${res.data?.status || 'done'} (${res.data?.responseTime ?? '?'}ms)`);
    } catch (err) {
      setError(err.message || 'Webhook test failed');
    } finally {
      setBusy(false);
    }
  };

  const editable = canEditSection(SETTINGS_SECTIONS.find((s) => s.id === activeSection)?.write);

  if (loading) return <div className="settings-page"><p>Loading settings…</p></div>;

  return (
    <div className="settings-page">
      {error && <p style={{ color: 'var(--red)', marginBottom: 8 }}>{error}</p>}
      {!editable && (
        <p className="settings-row-hint" style={{ marginBottom: 8 }}>
          Read-only for your role. {activeSection === 'security' || activeSection === 'payments' || activeSection === 'api'
            ? 'Super Admin required to edit this section.'
            : 'Admin or Super Admin required to edit.'}
        </p>
      )}

      <div className="settings-layout">
        <nav className="settings-nav">
          {SETTINGS_SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`settings-nav-item ${activeSection === s.id ? 'settings-nav-item--active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="settings-content">
          {activeSection === 'general' && (
            <div className="settings-section-panel">
              <div className="settings-section-head">
                <h3>General Settings</h3>
                <p>Basic platform configuration and operational controls</p>
              </div>
              <div className="settings-group">
                <div className="settings-group-title">Site Information</div>
                <InputRow label="Site Name" value={general.siteName} onChange={setG('siteName')} disabled={!editable} />
                <InputRow label="Site URL" type="url" value={general.siteUrl} onChange={setG('siteUrl')} disabled={!editable} />
                <InputRow label="Support Email" type="email" value={general.supportEmail} onChange={setG('supportEmail')} disabled={!editable} />
              </div>
              <div className="settings-group">
                <div className="settings-group-title">Regional</div>
                <div className="settings-row">
                  <div className="settings-row-info"><span className="settings-row-label">Currency</span></div>
                  <select className="settings-input settings-select" value={general.currency || 'INR'} disabled={!editable} onChange={(e) => setG('currency')(e.target.value)}>
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
                <div className="settings-row">
                  <div className="settings-row-info"><span className="settings-row-label">Timezone</span></div>
                  <select className="settings-input settings-select" value={general.timezone || 'Asia/Kolkata'} disabled={!editable} onChange={(e) => setG('timezone')(e.target.value)}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
              <div className="settings-group">
                <div className="settings-group-title">Platform Controls</div>
                <ToggleRow label="Site Maintenance Mode" checked={general.maintenanceMode} onChange={setG('maintenanceMode')} disabled={!editable} />
              </div>
              <div className="settings-group">
                <div className="settings-group-title">Appearance</div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <span className="settings-row-label">Interface Theme</span>
                    <span className="settings-row-hint">Currently: {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
                  </div>
                  <button className="theme-switch-btn" onClick={toggleTheme}>
                    {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section-panel">
              <div className="settings-section-head">
                <h3>Security Settings</h3>
                <p>Authentication, access control, and security features</p>
              </div>
              <div className="settings-group">
                <ToggleRow label="Two-Factor Authentication Required" checked={security.twoFactorRequired} onChange={setSec('twoFactorRequired')} disabled={!editable} />
                <InputRow label="Session Timeout" value={security.sessionTimeout} onChange={setSec('sessionTimeout')} type="number" suffix="hrs" disabled={!editable} />
                <InputRow label="Max Login Attempts" value={security.maxLoginAttempts} onChange={setSec('maxLoginAttempts')} type="number" disabled={!editable} />
                <ToggleRow label="Rate Limiting" checked={security.rateLimiting} onChange={setSec('rateLimiting')} disabled={!editable} />
              </div>
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="settings-section-panel">
              <div className="settings-section-head">
                <h3>Payment Settings</h3>
                <p>Configure deposit and withdrawal rules and payment gateways</p>
              </div>
              <div className="settings-group">
                <div className="settings-group-title">UPI QR Code & Gateway</div>
                <InputRow label="Merchant UPI ID (VPA)" hint="e.g. breeww@upi" value={payments.upiId} onChange={setPay('upiId')} disabled={!editable} />
                <InputRow label="Merchant Display Name" hint="e.g. Breeww Gaming" value={payments.upiMerchantName} onChange={setPay('upiMerchantName')} disabled={!editable} />
                <InputRow label="Custom QR Code Image URL" hint="Direct image URL for deposit QR" value={payments.upiQrImageUrl} onChange={setPay('upiQrImageUrl')} disabled={!editable} />
                <ToggleRow label="Enable UPI QR Payments" checked={payments.upiEnabled !== false} onChange={setPay('upiEnabled')} disabled={!editable} />
              </div>
              <div className="settings-group">
                <div className="settings-group-title">Deposit & Cashout Limits</div>
                <InputRow label="Minimum Deposit" value={payments.minDeposit} onChange={setPay('minDeposit')} type="number" prefix="₹" disabled={!editable} />
                <InputRow label="Maximum Deposit" value={payments.maxDeposit} onChange={setPay('maxDeposit')} type="number" prefix="₹" disabled={!editable} />
                <InputRow label="Minimum Withdrawal" value={payments.minWithdrawal} onChange={setPay('minWithdrawal')} type="number" prefix="₹" disabled={!editable} />
                <InputRow label="Maximum Withdrawal" value={payments.maxWithdrawal} onChange={setPay('maxWithdrawal')} type="number" prefix="₹" disabled={!editable} />
                <InputRow label="Withdrawal Fee" value={payments.withdrawalFee} onChange={setPay('withdrawalFee')} type="number" suffix="%" disabled={!editable} />
                <ToggleRow label="Net Banking" checked={payments.netBankingEnabled} onChange={setPay('netBankingEnabled')} disabled={!editable} />
                <ToggleRow label="Credit / Debit Cards" checked={payments.cardEnabled} onChange={setPay('cardEnabled')} disabled={!editable} />
                <ToggleRow label="Cryptocurrency" checked={payments.cryptoEnabled} onChange={setPay('cryptoEnabled')} disabled={!editable} />
              </div>
            </div>
          )}

          {activeSection === 'notifs' && (
            <div className="settings-section-panel">
              <div className="settings-section-head">
                <h3>Notification Settings</h3>
                <p>Configure when and how you receive admin alerts</p>
              </div>
              <div className="settings-group">
                <ToggleRow label="Email Alerts" checked={notifs.emailAlerts} onChange={setNot('emailAlerts')} disabled={!editable} />
                <ToggleRow label="SMS Alerts" checked={notifs.smsAlerts} onChange={setNot('smsAlerts')} disabled={!editable} />
                <ToggleRow label="Big Win Alerts" checked={notifs.bigWinAlert} onChange={setNot('bigWinAlert')} disabled={!editable} />
                {notifs.bigWinAlert && (
                  <InputRow label="Big Win Threshold" value={notifs.bigWinThreshold} onChange={setNot('bigWinThreshold')} type="number" prefix="₹" disabled={!editable} />
                )}
                <ToggleRow label="Daily Summary Report" checked={notifs.dailyReport} onChange={setNot('dailyReport')} disabled={!editable} />
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="settings-section-panel">
              <div className="settings-section-head">
                <h3>API & Integrations</h3>
                <p>Manage API access, webhooks, and external integrations</p>
              </div>
              <div className="settings-group">
                <InputRow label="API Key Preview" value={apiKeyPreview || '••••••••'} masked disabled />
                <div className="api-key-actions">
                  {isSuperAdmin && (
                    <button className="api-btn api-btn--regen" disabled={busy} onClick={rotateKey}>🔄 Regenerate Key</button>
                  )}
                  {canWrite && (
                    <button className="api-btn api-btn--copy" disabled={busy} onClick={testWebhook}>🧪 Test Webhook</button>
                  )}
                </div>
              </div>
              <div className="settings-group">
                <ToggleRow label="Webhooks Enabled" checked={api.webhookEnabled} onChange={setApi2('webhookEnabled')} disabled={!editable} />
                <InputRow label="Webhook URL" type="url" value={api.webhookUrl} onChange={setApi2('webhookUrl')} disabled={!editable} />
                <InputRow label="Rate Limit" value={api.rateLimitPerMin} onChange={setApi2('rateLimitPerMin')} type="number" suffix="req/min" disabled={!editable} />
                <InputRow label="Allowed Origins" value={api.allowedOrigins} onChange={setApi2('allowedOrigins')} disabled={!editable} />
                <ToggleRow label="Request Logging" checked={api.loggingEnabled} onChange={setApi2('loggingEnabled')} disabled={!editable} />
              </div>
            </div>
          )}

          <div className="settings-save-bar">
            <button
              className={`settings-save-btn ${saved ? 'settings-save-btn--saved' : ''}`}
              onClick={handleSave}
              disabled={!editable || busy}
            >
              {saved ? '✓ Settings Saved!' : '💾 Save Settings'}
            </button>
            <button className="settings-reset-btn" onClick={load} disabled={busy}>↺ Reload</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
