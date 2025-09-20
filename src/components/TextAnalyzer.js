import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Info, Copy, ExternalLink } from 'lucide-react';
import { analyzeText } from '../services/api';

const TextAnalyzer = () => {
  const [textInput, setTextInput] = useState('');
  const [sender, setSender] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const sampleTexts = [
    {
      title: "Suspicious Email",
      text: "Dear Customer, Your account has been compromised. Click here immediately to verify your identity: http://suspicious-bank-login.com/verify",
      sender: "security@yourb4nk.com"
    },
    {
      title: "Urgent Request",
      text: "URGENT: Your package is waiting for delivery. Update your shipping information within 24 hours or it will be returned. Click: track-package-now.net/update",
      sender: "shipping@delivery-service.com"
    },
    {
      title: "Safe Message",
      text: "Hi team, just a reminder about our meeting tomorrow at 2 PM in the conference room. Please bring the quarterly reports.",
      sender: "manager@company.com"
    }
  ];

  const handleAnalyze = async () => {
    if (!textInput.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      const result = await analyzeText(textInput, sender);
      setAnalysisResult(result);
      
      // Update statistics
      updateStatistics(result);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateStatistics = (result) => {
    try {
      const stats = JSON.parse(localStorage.getItem('phishingStats') || '{"totalScans":0,"threatsDetected":0,"safeContent":0,"accuracyRate":95}');
      stats.totalScans += 1;
      
      if (result.risk_level === 'high' || result.risk_level === 'critical') {
        stats.threatsDetected += 1;
      } else if (result.risk_level === 'low') {
        stats.safeContent += 1;
      }
      
      localStorage.setItem('phishingStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  };

  const loadSampleText = (sample) => {
    setTextInput(sample.text);
    setSender(sample.sender);
    setAnalysisResult(null);
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="risk-icon" />;
      case 'medium':
        return <Info className="risk-icon" />;
      case 'low':
        return <CheckCircle className="risk-icon" />;
      default:
        return <Info className="risk-icon" />;
    }
  };

  const getRiskClass = (riskLevel) => {
    return `risk-${riskLevel}`;
  };

  return (
    <div className="text-analyzer">
      <div className="card mb-4">
        <div className="card-header">
          <h1 className="card-title">
            <FileText /> Text Message Analyzer
          </h1>
        </div>
        <p className="text-secondary">
          Paste suspicious text messages, emails, or any text content to check for phishing indicators.
        </p>
      </div>

      {/* Sample Texts */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Try Sample Texts</h3>
        </div>
        <div className="sample-texts">
          {sampleTexts.map((sample, index) => (
            <div key={index} className="sample-text-item">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => loadSampleText(sample)}
              >
                {sample.title}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="card mb-4">
        <div className="form-group">
          <label className="form-label">Sender (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Email address or phone number of sender"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Text Content *</label>
          <textarea
            className="form-textarea"
            rows={6}
            placeholder="Paste the suspicious text message, email content, or any text you want to analyze..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !textInput.trim()}
        >
          {isAnalyzing ? (
            <>
              <div className="loading"></div>
              Analyzing...
            </>
          ) : (
            <>
              <FileText />
              Analyze Text
            </>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="card">
          <div className="card-header">
            <h3>Analysis Results</h3>
            <div className={`risk-indicator ${getRiskClass(analysisResult.risk_level)}`}>
              {getRiskIcon(analysisResult.risk_level)}
              {analysisResult.risk_level.toUpperCase()} RISK
            </div>
          </div>

          <div className="analysis-details">
            <div className="risk-score">
              <strong>Risk Score:</strong> {analysisResult.risk_score}/100
            </div>
            <div className="confidence">
              <strong>Confidence:</strong> {Math.round(analysisResult.confidence * 100)}%
            </div>

            {analysisResult.indicators.length > 0 && (
              <div className="indicators">
                <h4>🚩 Phishing Indicators Detected:</h4>
                <ul>
                  {analysisResult.indicators.map((indicator, index) => (
                    <li key={index} className="indicator-item">
                      {indicator.replace(/_/g, ' ').toUpperCase()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.guidance && (
              <div className="guidance">
                <h4>💡 Recommended Actions:</h4>
                <div className="guidance-content">
                  {analysisResult.guidance.immediate_actions.map((action, index) => (
                    <div key={index} className="guidance-item">
                      <strong>{action.action}:</strong> {action.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.guidance?.educational_tips && (
              <div className="education">
                <h4>📚 Educational Tips:</h4>
                <ul>
                  {analysisResult.guidance.educational_tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="actions">
              <button
                className="btn btn-secondary"
                onClick={() => copyToClipboard(JSON.stringify(analysisResult, null, 2))}
              >
                <Copy /> Copy Results
              </button>
              
              {analysisResult.risk_level === 'high' || analysisResult.risk_level === 'critical' ? (
                <button className="btn btn-danger">
                  <ExternalLink /> Report Phishing
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextAnalyzer;