from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from werkzeug.utils import secure_filename
from models.text_analyzer import TextAnalyzer
from models.image_analyzer import ImageAnalyzer
from models.educational_content import EducationalContent
import json
import base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize analyzers
text_analyzer = TextAnalyzer()
image_analyzer = ImageAnalyzer()
educational_content = EducationalContent()

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/analyze/text', methods=['POST'])
def analyze_text():
    """Analyze text content for phishing indicators"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        sender = data.get('sender', '')
        
        # Analyze text content
        result = text_analyzer.analyze(text)
        
        # Analyze sender if provided
        if sender:
            sender_result = text_analyzer.analyze_sender(sender)
            # Combine results
            combined_risk = max(result['risk_score'], sender_result['risk_score'])
            combined_indicators = result['indicators'] + sender_result['indicators']
            combined_confidence = (result['confidence'] + sender_result['confidence']) / 2
            
            result = {
                'risk_level': 'critical' if combined_risk >= 80 else 'high' if combined_risk >= 60 else 'medium' if combined_risk >= 30 else 'low',
                'risk_score': combined_risk,
                'confidence': combined_confidence,
                'indicators': list(set(combined_indicators)),
                'text_analysis': result,
                'sender_analysis': sender_result
            }
        
        # Add educational content
        guidance = educational_content.get_response_guidance(result['risk_level'], result['indicators'])
        result['guidance'] = guidance
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Text analysis error: {e}")
        return jsonify({'error': 'Analysis failed'}), 500

@app.route('/api/analyze/image', methods=['POST'])
def analyze_image():
    """Analyze image/screenshot for phishing indicators"""
    try:
        if 'image' not in request.files and 'image_data' not in request.form:
            return jsonify({'error': 'No image provided'}), 400
        
        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({'error': 'No image selected'}), 400
            
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                result = image_analyzer.analyze(filepath)
                
                # Clean up uploaded file
                try:
                    os.remove(filepath)
                except:
                    pass
            else:
                return jsonify({'error': 'Invalid file type'}), 400
        
        # Handle base64 image data
        elif 'image_data' in request.form:
            image_data = request.form['image_data']
            result = image_analyzer.analyze(image_data)
        
        else:
            return jsonify({'error': 'No valid image data provided'}), 400
        
        # Add educational content
        guidance = educational_content.get_response_guidance(result['risk_level'], result['indicators'])
        result['guidance'] = guidance
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        return jsonify({'error': 'Image analysis failed'}), 500

@app.route('/api/analyze/email', methods=['POST'])
def analyze_email():
    """Analyze email content for phishing indicators"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract email components
        subject = data.get('subject', '')
        body = data.get('body', '')
        sender = data.get('sender', '')
        attachments = data.get('attachments', [])
        
        # Analyze subject and body
        full_text = f"{subject} {body}".strip()
        text_result = text_analyzer.analyze(full_text)
        
        # Analyze sender
        sender_result = text_analyzer.analyze_sender(sender) if sender else None
        
        # Combine results
        if sender_result:
            combined_risk = max(text_result['risk_score'], sender_result['risk_score'])
            combined_indicators = text_result['indicators'] + sender_result['indicators']
            combined_confidence = (text_result['confidence'] + sender_result['confidence']) / 2
        else:
            combined_risk = text_result['risk_score']
            combined_indicators = text_result['indicators']
            combined_confidence = text_result['confidence']
        
        result = {
            'risk_level': 'critical' if combined_risk >= 80 else 'high' if combined_risk >= 60 else 'medium' if combined_risk >= 30 else 'low',
            'risk_score': combined_risk,
            'confidence': combined_confidence,
            'indicators': list(set(combined_indicators)),
            'text_analysis': text_result,
            'sender_analysis': sender_result,
            'attachment_warning': len(attachments) > 0
        }
        
        # Add educational content
        guidance = educational_content.get_response_guidance(result['risk_level'], result['indicators'])
        result['guidance'] = guidance
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Email analysis error: {e}")
        return jsonify({'error': 'Email analysis failed'}), 500

@app.route('/api/analyze/url', methods=['POST'])
def analyze_url():
    """Analyze URL for phishing indicators"""
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'No URL provided'}), 400
        
        url = data['url']
        
        # Analyze URL using text analyzer (URL analysis is part of text analysis)
        result = text_analyzer.analyze(url)
        
        # Add URL-specific indicators
        if 'suspicious_url' not in result['indicators']:
            # Additional URL checks
            if len(url) > 100 or url.count('-') > 5 or url.count('.') > 4:
                result['indicators'].append('suspicious_url_structure')
                result['risk_score'] += 10
        
        # Add educational content
        guidance = educational_content.get_response_guidance(result['risk_level'], result['indicators'])
        result['guidance'] = guidance
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"URL analysis error: {e}")
        return jsonify({'error': 'URL analysis failed'}), 500

@app.route('/api/education/content', methods=['GET'])
def get_educational_content():
    """Get educational content"""
    try:
        topic = request.args.get('topic')
        content = educational_content.get_educational_content(topic)
        return jsonify(content)
        
    except Exception as e:
        logger.error(f"Education content error: {e}")
        return jsonify({'error': 'Failed to retrieve educational content'}), 500

@app.route('/api/education/quiz', methods=['GET'])
def get_quiz():
    """Get quiz questions"""
    try:
        question_id = request.args.get('question_id', type=int)
        if question_id is not None:
            question = educational_content.get_quiz_question(question_id)
            return jsonify(question)
        else:
            questions = educational_content.get_all_quiz_questions()
            return jsonify(questions)
            
    except Exception as e:
        logger.error(f"Quiz error: {e}")
        return jsonify({'error': 'Failed to retrieve quiz'}), 500

@app.route('/api/education/safety-report', methods=['POST'])
def generate_safety_report():
    """Generate comprehensive safety report"""
    try:
        data = request.get_json()
        if not data or 'analysis_results' not in data:
            return jsonify({'error': 'No analysis results provided'}), 400
        
        analysis_results = data['analysis_results']
        user_actions = data.get('user_actions', {})
        
        report = educational_content.generate_safety_report(analysis_results, user_actions)
        
        return jsonify({'report': report})
        
    except Exception as e:
        logger.error(f"Safety report error: {e}")
        return jsonify({'error': 'Failed to generate safety report'}), 500

@app.route('/api/education/security-checklist', methods=['GET'])
def get_security_checklist():
    """Get security checklist"""
    try:
        checklist = educational_content.create_security_checklist()
        return jsonify({'checklist': checklist})
        
    except Exception as e:
        logger.error(f"Security checklist error: {e}")
        return jsonify({'error': 'Failed to retrieve security checklist'}), 500

@app.route('/api/education/emergency-contacts', methods=['GET'])
def get_emergency_contacts():
    """Get emergency contact information"""
    try:
        contacts = educational_content.get_emergency_contacts()
        return jsonify(contacts)
        
    except Exception as e:
        logger.error(f"Emergency contacts error: {e}")
        return jsonify({'error': 'Failed to retrieve emergency contacts'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check if all services are healthy
        text_healthy = text_analyzer.is_healthy()
        image_healthy = image_analyzer.is_healthy()
        
        health_status = {
            'status': 'healthy' if text_healthy and image_healthy else 'degraded',
            'services': {
                'text_analyzer': 'healthy' if text_healthy else 'unhealthy',
                'image_analyzer': 'healthy' if image_healthy else 'unhealthy',
                'educational_content': 'healthy'
            },
            'timestamp': logging.Formatter().formatTime(logging.LogRecord(
                name='health', level=logging.INFO, pathname='', lineno=0,
                msg='', args=(), exc_info=None
            ))
        }
        
        status_code = 200 if text_healthy and image_healthy else 503
        return jsonify(health_status), status_code
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 503

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Development server configuration
    app.run(debug=True, host='0.0.0.0', port=5000)