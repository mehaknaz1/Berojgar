import re
import requests
import numpy as np
from typing import Dict, List, Tuple
import logging

# Optional ML imports - will work without them
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    import torch
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    logging.warning("ML libraries not available. Running in basic mode.")

logger = logging.getLogger(__name__)

class TextAnalyzer:
    def __init__(self):
        self.suspicious_patterns = {
            'urgency_keywords': [
                'urgent', 'immediate', 'asap', 'hurry', 'limited time', 'expires soon',
                'act now', 'don\'t delay', 'last chance', 'final notice', 'deadline'
            ],
            'threat_keywords': [
                'suspend', 'terminate', 'close', 'block', 'disable', 'restricted',
                'violation', 'security breach', 'unauthorized access', 'locked'
            ],
            'financial_keywords': [
                'payment', 'invoice', 'refund', 'transaction', 'account', 'balance',
                'credit card', 'bank', 'wire transfer', 'cryptocurrency', 'bitcoin'
            ],
            'credential_keywords': [
                'password', 'login', 'verify', 'authenticate', 'confirm identity',
                'security question', 'two-factor', '2fa', 'otp'
            ],
            'suspicious_greetings': [
                'dear customer', 'dear user', 'dear valued customer', 'attention user'
            ]
        }
        
        self.suspicious_tlds = [
            '.tk', '.ml', '.ga', '.cf', '.top', '.work', '.date', '.wang',
            '.bid', '.download', '.stream', '.cricket', '.science'
        ]
        
        self.trusted_domains = [
            'google.com', 'microsoft.com', 'apple.com', 'amazon.com',
            'paypal.com', 'ebay.com', 'linkedin.com', 'facebook.com',
            'twitter.com', 'instagram.com', 'github.com', 'stackoverflow.com'
        ]
        
        # Initialize phishing detection model (using a lightweight approach)
        self.phishing_classifier = None
        if ML_AVAILABLE:
            try:
                self.phishing_classifier = pipeline(
                    "text-classification",
                    model="mrm8488/bert-tiny-finetuned-sms-spam-detection",
                    tokenizer="mrm8488/bert-tiny-finetuned-sms-spam-detection"
                )
                logger.info("Phishing detection model loaded successfully")
            except Exception as e:
                logger.warning(f"Could not load phishing detection model: {e}")
                self.phishing_classifier = None
        else:
            logger.info("Running in basic mode without ML models")

    def analyze(self, text: str) -> Dict:
        """Main analysis function that combines multiple detection methods"""
        if not text or not isinstance(text, str):
            return self._create_empty_result()
        
        text = text.lower().strip()
        
        # Run all analysis methods
        keyword_analysis = self._analyze_keywords(text)
        pattern_analysis = self._analyze_patterns(text)
        link_analysis = self._analyze_links(text)
        sender_analysis = self._analyze_sender_format(text)
        ml_analysis = self._ml_analysis(text)
        
        # Combine all analyses
        combined_result = self._combine_analyses([
            keyword_analysis, pattern_analysis, link_analysis, 
            sender_analysis, ml_analysis
        ])
        
        return combined_result
    
    def analyze_sender(self, sender: str) -> Dict:
        """Specific analysis for email senders"""
        if not sender:
            return self._create_empty_result()
        
        sender = sender.lower().strip()
        indicators = []
        risk_score = 0
        
        # Check for spoofed domains
        domain_match = re.search(r'@([^>\s]+)', sender)
        if domain_match:
            domain = domain_match.group(1)
            
            # Check for suspicious TLDs
            if any(domain.endswith(tld) for tld in self.suspicious_tlds):
                indicators.append("suspicious_tld")
                risk_score += 30
            
            # Check for typosquatting
            if self._is_typosquatted(domain):
                indicators.append("typosquatting")
                risk_score += 40
            
            # Check for subdomain spoofing
            if self._is_subdomain_spoof(domain):
                indicators.append("subdomain_spoof")
                risk_score += 35
        
        # Check for display name spoofing
        if '<' in sender and '>' in sender:
            display_name = sender.split('<')[0].strip()
            if self._is_spoofed_display_name(display_name):
                indicators.append("display_name_spoof")
                risk_score += 25
        
        return self._create_result(risk_score, indicators, 0.8)
    
    def _analyze_keywords(self, text: str) -> Dict:
        """Analyze text for suspicious keywords"""
        indicators = []
        risk_score = 0
        
        for category, keywords in self.suspicious_patterns.items():
            found_keywords = []
            for keyword in keywords:
                if keyword in text:
                    found_keywords.append(keyword)
            
            if found_keywords:
                indicators.append(f"{category}_found")
                # Higher risk for financial and credential keywords
                if category in ['financial_keywords', 'credential_keywords']:
                    risk_score += len(found_keywords) * 15
                else:
                    risk_score += len(found_keywords) * 10
        
        return self._create_result(risk_score, indicators, 0.7)
    
    def _analyze_patterns(self, text: str) -> Dict:
        """Analyze text for suspicious patterns"""
        indicators = []
        risk_score = 0
        
        # Check for excessive capitalization
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
        if caps_ratio > 0.3:
            indicators.append("excessive_caps")
            risk_score += 10
        
        # Check for excessive exclamation marks
        exclamation_count = text.count('!')
        if exclamation_count > 3:
            indicators.append("excessive_exclamations")
            risk_score += 10
        
        # Check for suspicious URLs in text
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, text)
        
        for url in urls:
            if self._is_suspicious_url(url):
                indicators.append("suspicious_url_in_text")
                risk_score += 25
                break
        
        # Check for mismatched URLs (display vs actual)
        if self._has_mismatched_urls(text):
            indicators.append("mismatched_urls")
            risk_score += 30
        
        return self._create_result(risk_score, indicators, 0.6)
    
    def _analyze_links(self, text: str) -> Dict:
        """Analyze links in the text"""
        indicators = []
        risk_score = 0
        
        # Extract URLs
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, text)
        
        for url in urls:
            # Check URL reputation
            if self._check_url_reputation(url):
                indicators.append("bad_url_reputation")
                risk_score += 40
            
            # Check for URL shortening services
            if self._is_url_shortened(url):
                indicators.append("url_shortened")
                risk_score += 20
        
        return self._create_result(risk_score, indicators, 0.8)
    
    def _analyze_sender_format(self, text: str) -> Dict:
        """Analyze sender format patterns"""
        indicators = []
        risk_score = 0
        
        # Check for suspicious greeting patterns
        for greeting in self.suspicious_patterns['suspicious_greetings']:
            if greeting in text:
                indicators.append("impersonal_greeting")
                risk_score += 15
                break
        
        # Check for poor grammar/spelling indicators
        if self._has_poor_grammar(text):
            indicators.append("poor_grammar")
            risk_score += 10
        
        return self._create_result(risk_score, indicators, 0.5)
    
    def _ml_analysis(self, text: str) -> Dict:
        """Machine learning-based analysis"""
        if not self.phishing_classifier:
            return self._create_result(0, [], 0.0)
        
        try:
            result = self.phishing_classifier(text[:512])[0]  # Limit text length
            label = result['label']
            confidence = result['score']
            
            if label == 'SPAM' or label == 'spam':
                risk_score = confidence * 50  # Scale to our risk system
                indicators = ['ml_detected_spam']
            else:
                risk_score = 0
                indicators = []
            
            return self._create_result(risk_score, indicators, confidence)
            
        except Exception as e:
            logger.error(f"ML analysis failed: {e}")
            return self._create_result(0, [], 0.0)
    
    def _is_suspicious_url(self, url: str) -> bool:
        """Check if URL is suspicious"""
        # Check for IP addresses instead of domains
        if re.match(r'https?://\d+\.\d+\.\d+\.\d+', url):
            return True
        
        # Check for suspicious TLDs
        domain = re.sub(r'https?://', '', url).split('/')[0]
        if any(domain.endswith(tld) for tld in self.suspicious_tlds):
            return True
        
        return False
    
    def _is_typosquatted(self, domain: str) -> bool:
        """Check for typosquatting of trusted domains"""
        for trusted_domain in self.trusted_domains:
            # Simple Levenshtein distance check
            if self._levenshtein_distance(domain, trusted_domain) <= 2:
                return True
        return False
    
    def _is_subdomain_spoof(self, domain: str) -> bool:
        """Check for subdomain spoofing"""
        for trusted_domain in self.trusted_domains:
            if trusted_domain in domain and not domain.endswith(trusted_domain):
                return True
        return False
    
    def _is_spoofed_display_name(self, display_name: str) -> bool:
        """Check for display name spoofing"""
        trusted_names = ['paypal', 'amazon', 'microsoft', 'google', 'apple']
        for name in trusted_names:
            if name in display_name.lower():
                return True
        return False
    
    def _has_mismatched_urls(self, text: str) -> bool:
        """Check for mismatched display vs actual URLs"""
        # Look for patterns like: [display text](actual_url)
        markdown_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
        matches = re.findall(markdown_pattern, text)
        
        for display, actual in matches:
            if display != actual and not display.startswith('http'):
                return True
        
        return False
    
    def _has_poor_grammar(self, text: str) -> bool:
        """Simple grammar/spelling check"""
        # Check for common phishing grammar patterns
        poor_patterns = [
            r'\b(dear customer|dear user)\b',
            r'\bkindly\b',
            r'\bdo the needful\b',
            r'\batm machine\b',  # Redundant ATM machine
            r'\bpin number\b'   # Redundant PIN number
        ]
        
        for pattern in poor_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def _is_url_shortened(self, url: str) -> bool:
        """Check if URL uses shortening service"""
        shortening_services = [
            'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly',
            'short.link', 'tiny.cc', 'is.gd', 'buff.ly'
        ]
        
        return any(service in url.lower() for service in shortening_services)
    
    def _check_url_reputation(self, url: str) -> bool:
        """Check URL against reputation services (simplified)"""
        # In a real implementation, this would query threat intelligence APIs
        # For now, we'll use some basic heuristics
        
        suspicious_indicators = [
            'phishing', 'scam', 'fake', 'login-verify', 'account-confirm',
            'security-check', 'update-account'
        ]
        
        url_lower = url.lower()
        return any(indicator in url_lower for indicator in suspicious_indicators)
    
    def _levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein distance between two strings"""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    def _combine_analyses(self, analyses: List[Dict]) -> Dict:
        """Combine multiple analysis results"""
        total_risk = 0
        all_indicators = []
        total_confidence = 0
        valid_analyses = 0
        
        for analysis in analyses:
            if analysis and 'risk_score' in analysis:
                total_risk += analysis['risk_score']
                all_indicators.extend(analysis['indicators'])
                total_confidence += analysis.get('confidence', 0)
                valid_analyses += 1
        
        # Calculate average confidence
        avg_confidence = total_confidence / valid_analyses if valid_analyses > 0 else 0
        
        # Determine risk level
        if total_risk >= 80:
            risk_level = 'critical'
        elif total_risk >= 60:
            risk_level = 'high'
        elif total_risk >= 30:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'risk_level': risk_level,
            'risk_score': total_risk,
            'confidence': avg_confidence,
            'indicators': list(set(all_indicators))  # Remove duplicates
        }
    
    def _create_result(self, risk_score: int, indicators: List[str], confidence: float) -> Dict:
        """Create a standardized result dictionary"""
        if risk_score >= 80:
            risk_level = 'critical'
        elif risk_score >= 60:
            risk_level = 'high'
        elif risk_score >= 30:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'risk_level': risk_level,
            'risk_score': risk_score,
            'confidence': confidence,
            'indicators': indicators
        }
    
    def _create_empty_result(self) -> Dict:
        """Create an empty result for invalid input"""
        return {
            'risk_level': 'low',
            'risk_score': 0,
            'confidence': 0.0,
            'indicators': []
        }
    
    def is_healthy(self) -> bool:
        """Check if the analyzer is healthy and ready"""
        try:
            # Test with a simple text
            test_result = self.analyze("This is a test message")
            return isinstance(test_result, dict) and 'risk_level' in test_result
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False