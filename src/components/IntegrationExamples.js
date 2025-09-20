import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, Mail, Chrome, Smartphone, Shield, Code, BookOpen, Play } from 'lucide-react';

const IntegrationExamples = () => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState('gmail');
  const [showDemo, setShowDemo] = useState(false);

  const integrations = {
    gmail: {
      name: 'Gmail Add-on',
      icon: Mail,
      description: 'Browser extension for Gmail phishing detection',
      difficulty: 'Easy',
      time: '15 minutes',
      category: 'Email Client',
      features: [
        'Real-time email scanning',
        'Suspicious link detection',
        'Sender verification',
        'One-click reporting'
      ],
      setup: [
        'Install the Gmail add-on from Chrome Web Store',
        'Grant necessary permissions',
        'Configure detection settings',
        'Start protecting your emails'
      ],
      code: `// Gmail Add-on Integration
function onGmailMessageOpen(e) {
  const message = e.gmail;
  const messageId = message.getMessageId();
  
  // Extract email content
  const subject = message.getSubject();
  const body = message.getBody();
  const sender = message.getFrom();
  
  // Send to anti-phishing API
  const response = analyzeEmail({
    subject: subject,
    body: body,
    sender: sender,
    messageId: messageId
  });
  
  // Display results
  if (response.risk_level === 'high') {
    return createWarningCard(response);
  }
}

function createWarningCard(analysis) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('⚠️ Phishing Detected!')
      .setSubtitle('Risk Level: ' + analysis.risk_level.toUpperCase()))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(analysis.reasoning)))
    .build();
}`,
      demo: 'https://workspace.google.com/marketplace'
    },
    outlook: {
      name: 'Outlook Add-in',
      icon: Mail,
      description: 'Microsoft Office add-in for Outlook protection',
      difficulty: 'Medium',
      time: '30 minutes',
      category: 'Email Client',
      features: [
        'Automatic email analysis',
        'Phishing indicator display',
        'Safe sender verification',
        'Integration with Microsoft 365'
      ],
      setup: [
        'Download the Outlook add-in manifest',
        'Upload to Microsoft 365 admin center',
        'Deploy to users',
        'Configure security policies'
      ],
      code: `// Outlook Add-in Integration
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    setupPhishingDetection();
  }
});

function setupPhishingDetection() {
  // Register event handlers
  Office.context.mailbox.addHandlerAsync(
    Office.EventType.ItemChanged,
    analyzeCurrentItem
  );
  
  // Analyze current item
  analyzeCurrentItem();
}

function analyzeCurrentItem() {
  const item = Office.context.mailbox.item;
  
  Promise.all([
    item.subject.getAsync(),
    item.body.getAsync(Office.CoercionType.Text),
    item.from.getAsync()
  ]).then(([subject, body, from]) => {
    const emailData = {
      subject: subject.value,
      body: body.value,
      sender: from.value.emailAddress,
      timestamp: new Date().toISOString()
    };
    
    return fetch('${process.env.REACT_APP_API_URL}/api/analyze/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify(emailData)
    });
  }).then(response => response.json())
    .then(analysis => displayAnalysisResults(analysis))
    .catch(error => console.error('Analysis failed:', error));
}`,
      demo: 'https://appsource.microsoft.com'
    },
    chrome: {
      name: 'Chrome Extension',
      icon: Chrome,
      description: 'Browser extension for web protection',
      difficulty: 'Hard',
      time: '45 minutes',
      category: 'Browser Extension',
      features: [
        'Website reputation checking',
        'Real-time URL scanning',
        'Phishing site blocking',
        'Educational popups'
      ],
      setup: [
        'Clone the Chrome extension repository',
        'Configure API endpoints',
        'Build and package extension',
        'Upload to Chrome Web Store'
      ],
      code: `// Chrome Extension Manifest (manifest.json)
{
  "manifest_version": 3,
  "name": "Anti-Phishing Assistant",
  "version": "1.0.0",
  "description": "AI-powered phishing detection for safer browsing",
  "permissions": [
    "activeTab",
    "storage",
    "notifications"
  ],
  "host_permissions": [
    "https://anti-phishing-api.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  }
}

// Background Service Worker (background.js)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    analyzeUrl(changeInfo.url, tabId);
  }
});

async function analyzeUrl(url, tabId) {
  try {
    const response = await fetch('${process.env.REACT_APP_API_URL}/api/analyze/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({ url })
    });
    
    const analysis = await response.json();
    
    if (analysis.risk_level === 'high' || analysis.risk_level === 'critical') {
      // Block the page and show warning
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('blocked.html?url=' + encodeURIComponent(url))
      });
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Phishing Site Detected!',
        message: "Risk Level: " + analysis.risk_level.toUpperCase() + "\n\n" + analysis.reasoning
      });
    }
  } catch (error) {
    console.error('URL analysis failed:', error);
  }
}`,
      demo: 'https://chrome.google.com/webstore'
    },
    mobile: {
      name: 'Mobile App Integration',
      icon: Smartphone,
      description: 'React Native mobile app integration',
      difficulty: 'Hard',
      time: '60 minutes',
      category: 'Mobile App',
      features: [
        'SMS phishing detection',
        'App security scanning',
        'Push notifications',
        'Offline protection'
      ],
      setup: [
        'Install React Native dependencies',
        'Configure API client',
        'Set up push notifications',
        'Build and deploy app'
      ],
      code: `// React Native Integration (PhishingDetector.js)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import SMSReader from 'react-native-sms-reader';

const PhishingDetector = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Request permissions and setup listeners
    requestPermissions();
    setupSMSListener();
    setupPushNotifications();
    
    return () => {
      // Cleanup listeners
    };
  }, []);

  const requestPermissions = async () => {
    // Request SMS permissions
    const smsPermission = await SMSReader.requestPermission();
    
    // Request notification permissions
    const notificationPermission = await messaging().requestPermission();
    
    console.log('Permissions granted:', { smsPermission, notificationPermission });
  };

  const setupSMSListener = () => {
    SMSReader.start((message) => {
      analyzeMessage(message);
    });
  };

  const setupPushNotifications = () => {
    messaging().onMessage(async remoteMessage => {
      console.log('Push notification received:', remoteMessage);
      handlePushNotification(remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
      handlePushNotification(remoteMessage);
    });
  };

  const analyzeMessage = async (message) => {
    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/analyze/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          text: message.body,
          sender: message.address,
          timestamp: message.date,
          type: 'sms'
        })
      });

      const analysis = await response.json();
      
      if (analysis.risk_level === 'high' || analysis.risk_level === 'critical') {
        showAlert(analysis);
        addAlert(analysis);
      }
    } catch (error) {
      console.error('Message analysis failed:', error);
    }
  };

  const showAlert = (analysis) => {
    Alert.alert(
      '⚠️ Phishing Detected!',
      \`Risk Level: \${analysis.risk_level.toUpperCase()}\\n\\n\${analysis.reasoning}\`,
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'Learn More', onPress: () => openEducationalContent(analysis) },
        { text: 'Report', onPress: () => reportPhishing(analysis) }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5'
    },
    alertCard: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    alertTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8
    },
    alertDescription: {
      fontSize: 14,
      color: '#666'
    }
  });

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Phishing Detection Active
      </Text>
      {alerts.map((alert, index) => (
        <View key={index} style={styles.alertCard}>
          <Text style={styles.alertTitle}>⚠️ {alert.title}</Text>
          <Text style={styles.alertDescription}>{alert.description}</Text>
        </View>
      ))}
    </View>
  );
};

export default PhishingDetector;`,
      demo: 'https://reactnative.dev'
    },
    slack: {
      name: 'Slack Bot Integration',
      icon: Shield,
      description: 'Slack bot for team phishing protection',
      difficulty: 'Medium',
      time: '30 minutes',
      category: 'Team Collaboration',
      features: [
        'Channel monitoring',
        'Automatic link scanning',
        'Team notifications',
        'Admin dashboard'
      ],
      setup: [
        'Create Slack app',
        'Configure bot permissions',
        'Deploy to cloud',
        'Invite bot to channels'
      ],
      code: `// Slack Bot Integration (slack-bot.js)
const { App } = require('@slack/bolt');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Listen for messages in channels
app.message(async ({ message, say }) => {
  try {
    // Check if message contains URLs
    const urls = extractUrls(message.text);
    
    if (urls.length > 0) {
      // Analyze each URL
      for (const url of urls) {
        const analysis = await analyzeUrl(url);
        
        if (analysis.risk_level === 'high' || analysis.risk_level === 'critical') {
          // Send warning to channel
          await say({
            blocks: createWarningBlocks(analysis, message.user)
          });
          
          // Send DM to user who posted the link
          await sendDirectWarning(message.user, analysis);
        }
      }
    }
    
    // Analyze message content for phishing indicators
    const textAnalysis = await analyzeText(message.text);
    if (textAnalysis.risk_level === 'high') {
      await say({
        blocks: createTextWarningBlocks(textAnalysis, message.user)
      });
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

function extractUrls(text) {
  const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
  return text.match(urlRegex) || [];
}

async function analyzeUrl(url) {
  try {
    const response = await axios.post('${process.env.REACT_APP_API_URL}/api/analyze/url', {
      url: url
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('URL analysis failed:', error);
    return { risk_level: 'low' };
  }
}

async function analyzeText(text) {
  try {
    const response = await axios.post('${process.env.REACT_APP_API_URL}/api/analyze/text', {
      text: text
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Text analysis failed:', error);
    return { risk_level: 'low' };
  }
}

function createWarningBlocks(analysis, userId) {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '⚠️ Phishing Link Detected!',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: \`🚨 *<@\${userId}>* shared a potentially dangerous link!\\n\\n*Risk Level:* \${analysis.risk_level.toUpperCase()}\\n*Reason:* \${analysis.reasoning}\`
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Learn More About Phishing',
            emoji: true
          },
          style: 'primary',
          action_id: 'learn_more_phishing'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Report False Positive',
            emoji: true
          },
          style: 'danger',
          action_id: 'report_false_positive'
        }
      ]
    }
  ];
}

async function sendDirectWarning(userId, analysis) {
  try {
    const result = await app.client.conversations.open({
      users: userId
    });
    
    await app.client.chat.postMessage({
      channel: result.channel.id,
      text: \`🚨 *Phishing Warning*\\n\\nYou shared a link that was flagged as potentially dangerous.\\n\\n*Risk Level:* \${analysis.risk_level.toUpperCase()}\\n*Details:* \${analysis.reasoning}\\n\\nPlease be more careful when sharing links in the future. If you believe this is a false positive, please report it.\`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Phishing Warning',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: \`You shared a link that was flagged as potentially dangerous.\\n\\n*Risk Level:* \${analysis.risk_level.toUpperCase()}\\n*Details:* \${analysis.reasoning}\`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Please be more careful when sharing links in the future.'
          }
        }
      ]
    });
  } catch (error) {
    console.error('Failed to send DM:', error);
  }
}

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack bot is running!');
})();`,
      demo: 'https://api.slack.com/apps'
    }
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(key);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadCode = (code, filename) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentIntegration = integrations[selectedIntegration];
  const Icon = currentIntegration.icon;

  return (
    <div className="integration-examples">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">
            <Code /> Integration Examples
          </h1>
          <p className="card-subtitle">
            Ready-to-use integration code for popular platforms and services
          </p>
        </div>
      </div>

      {/* Integration Selection */}
      <div className="card">
        <div className="integration-tabs">
          {Object.entries(integrations).map(([key, integration]) => {
            const IntegrationIcon = integration.icon;
            return (
              <button
                key={key}
                className={`integration-tab ${selectedIntegration === key ? 'active' : ''}`}
                onClick={() => setSelectedIntegration(key)}
              >
                <IntegrationIcon size={20} />
                <span>{integration.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Integration Details */}
      <div className="card">
        <div className="integration-header">
          <div className="integration-info">
            <div className="integration-icon">
              <Icon size={32} />
            </div>
            <div className="integration-details">
              <h2>{currentIntegration.name}</h2>
              <p>{currentIntegration.description}</p>
              <div className="integration-meta">
                <span className={`difficulty ${currentIntegration.difficulty.toLowerCase()}`}>
                  {currentIntegration.difficulty}
                </span>
                <span className="time">{currentIntegration.time}</span>
                <span className="category">{currentIntegration.category}</span>
              </div>
            </div>
          </div>
          <div className="integration-actions">
            <button
              className="btn btn-primary"
              onClick={() => window.open(currentIntegration.demo, '_blank')}
            >
              <ExternalLink size={16} />
              View Demo
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowDemo(!showDemo)}
            >
              <Play size={16} />
              {showDemo ? 'Hide Demo' : 'Show Demo'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="integration-section">
          <h3><Shield size={20} /> Key Features</h3>
          <div className="features-grid">
            {currentIntegration.features.map((feature, index) => (
              <div key={index} className="feature-item">
                <Check size={16} className="feature-icon" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="integration-section">
          <h3><BookOpen size={20} /> Setup Instructions</h3>
          <div className="setup-steps">
            {currentIntegration.setup.map((step, index) => (
              <div key={index} className="setup-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <p>{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Example */}
        <div className="integration-section">
          <h3><Code size={20} /> Implementation Code</h3>
          <div className="code-container">
            <div className="code-header">
              <span className="code-language">JavaScript</span>
              <div className="code-actions">
                <button
                  className="code-action-btn"
                  onClick={() => copyToClipboard(currentIntegration.code, selectedIntegration)}
                >
                  {copiedCode === selectedIntegration ? (
                    <><Check size={16} /> Copied!</>
                  ) : (
                    <><Copy size={16} /> Copy</>
                  )}
                </button>
                <button
                  className="code-action-btn"
                  onClick={() => downloadCode(currentIntegration.code, `${selectedIntegration}-integration.js`)}
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
            <pre className="code-content">
              <code>{currentIntegration.code}</code>
            </pre>
          </div>
        </div>

        {/* Demo Section */}
        {showDemo && (
          <div className="integration-section">
            <h3><Play size={20} /> Live Demo</h3>
            <div className="demo-container">
              <div className="demo-placeholder">
                <p>Interactive demo coming soon!</p>
                <p>For now, check out the official documentation:</p>
                <a 
                  href={currentIntegration.demo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="demo-link"
                >
                  <ExternalLink size={16} />
                  View {currentIntegration.name} Documentation
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Integration Tips */}
      <div className="card">
        <div className="integration-tips">
          <h3>💡 Integration Tips</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <h4>Security First</h4>
              <p>Always validate API keys and use HTTPS for production deployments.</p>
            </div>
            <div className="tip-item">
              <h4>Error Handling</h4>
              <p>Implement proper error handling and fallback mechanisms.</p>
            </div>
            <div className="tip-item">
              <h4>Rate Limiting</h4>
              <p>Respect API rate limits and implement client-side throttling.</p>
            </div>
            <div className="tip-item">
              <h4>User Experience</h4>
              <p>Provide clear feedback and educational content to users.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationExamples;