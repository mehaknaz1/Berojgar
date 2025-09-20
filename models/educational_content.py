import json
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class EducationalContent:
    def __init__(self):
        self.response_guidance = {
            'critical': {
                'immediate_actions': [
                    "🚨 DO NOT click any links or download attachments",
                    "🚨 DO NOT provide any personal information",
                    "🚨 Disconnect from the internet if you already clicked",
                    "🚨 Run a full antivirus scan immediately",
                    "🚨 Change passwords for any accounts you may have accessed"
                ],
                'reporting_steps': [
                    "Report to your IT/security team immediately",
                    "Forward the email to your organization's security team",
                    "Report to your email provider (Gmail, Outlook, etc.)",
                    "Report to government agencies (FTC, FBI IC3)",
                    "Document everything: screenshots, sender info, URLs"
                ],
                'prevention_tips': [
                    "Never trust urgent requests for personal information",
                    "Always verify sender identity through official channels",
                    "Use multi-factor authentication on all accounts",
                    "Keep software and antivirus updated",
                    "Regularly backup important data"
                ]
            },
            'high': {
                'immediate_actions': [
                    "⚠️ Do not interact with the suspicious content",
                    "⚠️ Do not provide personal information",
                    "⚠️ Verify the sender through official channels",
                    "⚠️ Check the legitimacy of any mentioned websites"
                ],
                'reporting_steps': [
                    "Report to your email provider",
                    "Inform your IT department",
                    "Report to anti-phishing organizations",
                    "Block the sender"
                ],
                'prevention_tips': [
                    "Always hover over links to see actual URLs",
                    "Check for spelling errors and poor grammar",
                    "Verify requests through official websites",
                    "Use strong, unique passwords"
                ]
            },
            'medium': {
                'immediate_actions': [
                    "🔍 Be cautious and verify the content",
                    "🔍 Check sender details carefully",
                    "🔍 Look for suspicious elements in the message"
                ],
                'reporting_steps': [
                    "Mark as spam in your email client",
                    "Report to your email provider if appropriate"
                ],
                'prevention_tips': [
                    "Stay vigilant about unexpected messages",
                    "Keep your security software updated",
                    "Learn to recognize common phishing patterns"
                ]
            },
            'low': {
                'immediate_actions': [
                    "✅ Content appears safe but stay alert",
                    "✅ Continue normal security practices"
                ],
                'reporting_steps': [
                    "No specific reporting needed"
                ],
                'prevention_tips': [
                    "Maintain good security habits",
                    "Keep learning about new phishing techniques",
                    "Share knowledge with others"
                ]
            }
        }
        
        self.educational_resources = {
            'phishing_basics': {
                'title': 'Understanding Phishing Attacks',
                'content': [
                    "Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive data.",
                    "Common targets include passwords, credit card numbers, and personal information.",
                    "Phishing can occur through email, text messages, phone calls, and fake websites.",
                    "Attackers often create a sense of urgency to pressure victims into acting quickly."
                ],
                'examples': [
                    "Fake emails from your bank asking to verify account details",
                    "Messages claiming your account will be suspended",
                    "Fake login pages that look identical to real websites",
                    "Urgent requests for wire transfers or gift card purchases"
                ]
            },
            'recognition_tips': {
                'title': 'How to Spot Phishing Attempts',
                'content': [
                    "Check the sender's email address carefully - look for misspellings or unusual domains.",
                    "Hover over links to see the actual destination URL before clicking.",
                    "Look for poor grammar, spelling errors, and unprofessional formatting.",
                    "Be suspicious of urgent requests for personal or financial information.",
                    "Check if the greeting is generic (\"Dear Customer\") instead of personalized."
                ],
                'red_flags': [
                    "Requests for passwords or sensitive information",
                    "Threats of account closure or legal action",
                    "Offers that seem too good to be true",
                    "Unexpected attachments or downloads",
                    "URLs that don't match the claimed organization"
                ]
            },
            'safe_practices': {
                'title': 'Safe Online Practices',
                'content': [
                    "Use unique, strong passwords for each account.",
                    "Enable two-factor authentication whenever possible.",
                    "Keep your operating system and software updated.",
                    "Use reputable antivirus and anti-malware software.",
                    "Regularly backup important data to secure locations."
                ],
                'best_practices': [
                    "Verify requests through official channels (call the company directly)",
                    "Use password managers to generate and store strong passwords",
                    "Be cautious with public Wi-Fi - use VPN when possible",
                    "Check website security (HTTPS, valid certificates)",
                    "Educate yourself about current phishing trends"
                ]
            }
        }
        
        self.quiz_questions = [
            {
                'question': 'What should you do if you receive an urgent email from your bank asking for account verification?',
                'options': [
                    'Click the link and provide the information immediately',
                    'Call your bank using the number on their official website',
                    'Forward the email to your friends to warn them',
                    'Delete the email without taking any action'
                ],
                'correct_answer': 1,
                'explanation': 'Always verify urgent requests by contacting the organization through official channels, not through links or numbers provided in suspicious emails.'
            },
            {
                'question': 'Which of these is a common phishing red flag?',
                'options': [
                    'Personalized greeting with your name',
                    'Professional formatting and perfect grammar',
                    'Generic greeting like \"Dear Customer\"',
                    'Contact information that matches the official website'
                ],
                'correct_answer': 2,
                'explanation': 'Generic greetings are common in phishing emails because attackers send them to many people and don\'t have personalized information.'
            },
            {
                'question': 'What is the best way to check if a link is safe?',
                'options': [
                    'Click on it to see where it goes',
                    'Hover over it to see the actual URL',
                    'Copy and paste it into your browser',
                    'Ask a friend to click it first'
                ],
                'correct_answer': 1,
                'explanation': 'Hovering over links reveals the actual destination URL, allowing you to check if it matches the claimed destination.'
            }
        ]

    def get_response_guidance(self, risk_level: str, indicators: List[str] = None) -> Dict:
        """Get appropriate response guidance based on risk level"""
        if risk_level not in self.response_guidance:
            risk_level = 'medium'
        
        guidance = self.response_guidance[risk_level].copy()
        
        # Add specific advice based on indicators
        if indicators:
            specific_advice = self._get_indicator_specific_advice(indicators)
            if specific_advice:
                guidance['specific_advice'] = specific_advice
        
        return guidance
    
    def get_educational_content(self, topic: str = None) -> Dict:
        """Get educational content for users"""
        if topic and topic in self.educational_resources:
            return self.educational_resources[topic]
        
        # Return all educational content if no specific topic
        return self.educational_resources
    
    def get_quiz_question(self, question_id: int = None) -> Dict:
        """Get a quiz question for user education"""
        if question_id is not None and 0 <= question_id < len(self.quiz_questions):
            return self.quiz_questions[question_id]
        
        # Return first question by default
        return self.quiz_questions[0] if self.quiz_questions else {}
    
    def get_all_quiz_questions(self) -> List[Dict]:
        """Get all available quiz questions"""
        return self.quiz_questions
    
    def generate_safety_report(self, analysis_results: Dict, user_actions: Dict = None) -> str:
        """Generate a comprehensive safety report"""
        risk_level = analysis_results.get('risk_level', 'unknown')
        risk_score = analysis_results.get('risk_score', 0)
        indicators = analysis_results.get('indicators', [])
        
        report = f"""
🛡️ ANTI-PHISHING SAFETY REPORT
=====================================

Risk Assessment: {risk_level.upper()}
Risk Score: {risk_score}/100
Confidence: {analysis_results.get('confidence', 0):.1%}

Detected Indicators:
"""
        
        for indicator in indicators:
            report += f"• {indicator.replace('_', ' ').title()}\n"
        
        # Add response guidance
        guidance = self.get_response_guidance(risk_level, indicators)
        
        report += f"""

📋 RECOMMENDED ACTIONS
======================

Immediate Actions:
"""
        for action in guidance.get('immediate_actions', []):
            report += f"{action}\n"
        
        if 'reporting_steps' in guidance:
            report += f"""

Reporting Steps:
"""
            for step in guidance['reporting_steps']:
                report += f"• {step}\n"
        
        if 'specific_advice' in guidance:
            report += f"""

Specific Advice:
"""
            for advice in guidance['specific_advice']:
                report += f"• {advice}\n"
        
        report += f"""

🎓 LEARNING OPPORTUNITY
========================

Prevention Tips:
"""
        for tip in guidance.get('prevention_tips', []):
            report += f"• {tip}\n"
        
        # Add educational content
        report += f"""

📚 EDUCATIONAL RESOURCES
========================

Learn more about phishing protection:
• Visit cybersecurity awareness websites
• Take online security training courses
• Stay updated on latest phishing trends
• Share knowledge with friends and family

Remember: When in doubt, verify through official channels!
"""
        
        return report
    
    def _get_indicator_specific_advice(self, indicators: List[str]) -> List[str]:
        """Get specific advice based on detected indicators"""
        specific_advice = []
        
        for indicator in indicators:
            if 'credential' in indicator:
                specific_advice.append("Never provide passwords or login credentials via email or unknown websites")
            elif 'urgency' in indicator:
                specific_advice.append("Legitimate organizations won't pressure you with urgent deadlines")
            elif 'financial' in indicator:
                specific_advice.append("Verify financial requests through official banking channels")
            elif 'suspicious_url' in indicator:
                specific_advice.append("Always verify URLs by typing them manually in your browser")
            elif 'brand' in indicator and 'spoof' in indicator:
                specific_advice.append("Check for subtle misspellings in brand names and domain names")
            elif 'typosquatting' in indicator:
                specific_advice.append("Look for misspelled domain names (e.g., 'gooogle.com' instead of 'google.com')")
            elif 'subdomain' in indicator:
                specific_advice.append("Be wary of URLs that put trusted brand names in subdomains")
            elif 'popup' in indicator:
                specific_advice.append("Never enter sensitive information in popup windows")
            elif 'overlay' in indicator:
                specific_advice.append("Be cautious of websites with overlay elements asking for information")
        
        return specific_advice
    
    def create_security_checklist(self) -> List[str]:
        """Create a security checklist for users"""
        return [
            "□ Verify sender email addresses carefully",
            "□ Hover over links before clicking to see actual destinations",
            "□ Look for HTTPS and valid SSL certificates on websites",
            "□ Check for spelling and grammar errors",
            "□ Be suspicious of urgent requests for personal information",
            "□ Use unique, strong passwords for each account",
            "□ Enable two-factor authentication where available",
            "□ Keep software and antivirus programs updated",
            "□ Regularly backup important data",
            "□ Report suspicious emails to your IT department",
            "□ Educate yourself about current phishing trends",
            "□ Share security knowledge with friends and family"
        ]
    
    def get_emergency_contacts(self) -> Dict[str, str]:
        """Get emergency contact information for reporting phishing"""
        return {
            'FTC_Report_Fraud': 'https://reportfraud.ftc.gov/',
            'FBI_IC3': 'https://www.ic3.gov/',
            'Anti_Phishing_Working_Group': 'reportphishing@apwg.org',
            'US_Cert': 'https://www.us-cert.gov/report-phishing',
            'Microsoft_Security': 'https://www.microsoft.com/en-us/wdsi/support/report-unsafe-site-guest',
            'Google_Safe_Browsing': 'https://safebrowsing.google.com/safebrowsing/report_phish/'
        }