import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import QrReader from 'react-qr-scanner';
import './QrStyles.css';

const QRPDFApp = () => {
  const location = useLocation();
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [scannedUrl, setScannedUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [useNativeScanner, setUseNativeScanner] = useState(false);

  // Default constraints with modern approach
  const defaultConstraints = {
    video: {
      facingMode: "environment",
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  useEffect(() => {
    // Extract spreadsheet ID from navigation state
    const state = location.state || {};
    setSpreadsheetId(state.spreadsheetId || '');
    
    // Detect if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setUseNativeScanner(isMobile);
  }, [location]);

  useEffect(() => {
    setIsScanning(true);
    return () => {
      // Cleanup when component unmounts
      setIsScanning(false);
    };
  }, []);

  const handleScan = async (data) => {
    if (data?.text) {
      try {
        // Validate URL format
        new URL(data.text);
        setScannedUrl(data.text);
        setIsScanning(false);
        await processScannedUrl(data.text, spreadsheetId);
      } catch (err) {
        // If URL validation fails, try alternative validation
        if (!isValidQRCodeFormat(data.text)) {
          setError('Invalid QR code format');
        } else {
          setError('Unknown scanning error');
        }
      }
    }
  };

  const isValidQRCodeFormat = (text) => {
    // Add more flexible validation logic here
    const urlPatterns = [
      /^https?:\/\//,  // Standard URL
      /^(lid|eid)=\d+/,  // Specific ID formats
      /^TC-\d{4}-\d{4}-TICKET-\d{3}$/  // Ticket-specific format
    ];
    return urlPatterns.some(pattern => pattern.test(text));
  };

  const handleNativeScan = (e) => {
    const url = e.target.value;
    if (url) {
      try {
        new URL(url); // Validate URL format
        setScannedUrl(url);
        setIsScanning(false);
        processScannedUrl(url, spreadsheetId);
      } catch (err) {
        setError('Invalid URL format');
      }
    }
  };

  const handleScanError = (err) => {
    console.error('QR Scan Error:', err);
    setError('Camera access or scanning error: ' + err.message);
    setIsScanning(false);
  };

  const processScannedUrl = async (url, spreadsheetId) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${backendUrl}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          scanned_url: url,
          scanned_at: new Date().toISOString(),
          spreadsheet_id: spreadsheetId
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Registration failed');
      }

      setResult(data.data);
    } catch (err) {
      setError('Error: ' + err.message);
      console.error('Processing Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const restartScanning = () => {
    setIsScanning(true);
    setError('');
    setResult(null);
    setScannedUrl('');
  };

  const toggleScannerMethod = () => {
    setUseNativeScanner(!useNativeScanner);
    restartScanning();
  };

  return (
    <div className="scanner-container">
      <h2>QR Scanner</h2>
      
      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Scanner selection toggle */}
      <div className="scanner-toggle">
        <button 
          onClick={toggleScannerMethod}
          className={`toggle-button ${!useNativeScanner ? 'active' : ''}`}
        >
          Web Camera
        </button>
        <button 
          onClick={toggleScannerMethod}
          className={`toggle-button ${useNativeScanner ? 'active' : ''}`}
        >
          Mobile Scanner
        </button>
      </div>

      {/* Web Camera Scanner */}
      {isScanning && !useNativeScanner && !result && !error && (
        <div className="scanner-wrapper">
          <QrReader
            delay={300}
            onError={handleScanError}
            onScan={handleScan}
            constraints={defaultConstraints}
            style={{
              filter: 'contrast(120%) brightness(110%)'
            }}
            className="qr-reader"
          />
        </div>
      )}

      {/* Mobile Native Scanner */}
      {isScanning && useNativeScanner && !result && !error && (
        <div className="native-scan-option">
          <p>Point your camera at a QR code:</p>
          <input
            type="url"
            inputMode="url"
            placeholder="Click here to scan QR code"
            onFocus={(e) => {
              e.target.value = '';
            }}
            onChange={handleNativeScan}
            className="native-scan-input"
            autoFocus
          />
          <p className="hint-text">Your device's QR scanner will open automatically</p>
        </div>
      )}

      {scannedUrl && (
        <div className="scan-result">
          <p><strong>Scanned URL:</strong> {scannedUrl}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}

      {(result || error) && (
        <button 
          onClick={restartScanning}
          className="restart-button"
        >
          Scan Another Code
        </button>
      )}

      {result && (
        <div className="result-container">
          <h3>Registration Details:</h3>
          <div className="registration-details">
            <p><strong>Name:</strong> {result.Name}</p>
            <p><strong>Title:</strong> {result.Title}</p>
            <p><strong>Email:</strong> {result.Email}</p>
            <p><strong>Phone:</strong> {result.Phone}</p>
            <p><strong>Preferred Contact:</strong> {result.Preferred_Contact}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRPDFApp;