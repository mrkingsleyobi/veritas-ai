import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import './MFAStyles.css';

const MFASetup = () => {
  const [step, setStep] = useState('intro'); // intro, qr, verify, success
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setupMFA, verifyMFA } = useAuth();

  useEffect(() => {
    if (step === 'qr') {
      loadQRCode();
    }
  }, [step]);

  const loadQRCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await setupMFA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
    } catch (err) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const response = await verifyMFA(verificationCode);
      setBackupCodes(response.backupCodes);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  return (
    <div className="mfa-container">
      <div className="mfa-card">
        <h2>Set Up Two-Factor Authentication</h2>

        {error && <div className="error-message">{error}</div>}

        {step === 'intro' && (
          <div className="mfa-intro">
            <p>Two-factor authentication adds an extra layer of security to your account.</p>
            <p>You'll need an authenticator app like Google Authenticator or Authy.</p>

            <button
              onClick={() => setStep('qr')}
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Get Started'}
            </button>
          </div>
        )}

        {step === 'qr' && (
          <div className="mfa-qr">
            <p>Scan this QR code with your authenticator app:</p>

            {qrCode ? (
              <div className="qr-code-container">
                <img src={qrCode} alt="MFA QR Code" className="qr-code" />
              </div>
            ) : (
              <div className="qr-placeholder">
                {loading ? 'Generating QR code...' : 'QR code not available'}
              </div>
            )}

            <p className="manual-entry">
              Or enter this code manually: <strong>{secret}</strong>
            </p>

            <button
              onClick={() => setStep('verify')}
              className="auth-button"
              disabled={!qrCode || loading}
            >
              Next
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="mfa-verify">
            <p>Enter the 6-digit code from your authenticator app:</p>

            <form onSubmit={handleVerify} className="auth-form">
              <div className="form-group">
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={loading}
                  placeholder="123456"
                  maxLength="6"
                />
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            <button
              onClick={() => setStep('qr')}
              className="secondary-button"
              disabled={loading}
            >
              Back
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="mfa-success">
            <div className="success-icon">✓</div>
            <h3>Two-Factor Authentication Enabled!</h3>
            <p>Save these backup codes in a secure location:</p>

            <div className="backup-codes">
              {backupCodes.map((code, index) => (
                <div key={index} className="backup-code">{code}</div>
              ))}
            </div>

            <div className="backup-actions">
              <button onClick={downloadBackupCodes} className="secondary-button">
                Download Codes
              </button>
              <button onClick={copyBackupCodes} className="secondary-button">
                Copy Codes
              </button>
            </div>

            <p className="warning">
              <strong>Warning:</strong> These codes will not be shown again.
              Store them securely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MFASetup;