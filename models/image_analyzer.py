# Optional image processing imports
try:
    import cv2
    import numpy as np
    import pytesseract
    from PIL import Image
    import base64
    from io import BytesIO
    IMAGE_PROCESSING_AVAILABLE = True
except ImportError:
    IMAGE_PROCESSING_AVAILABLE = False
    cv2 = None
    np = None
    pytesseract = None
    Image = None
    base64 = None
    BytesIO = None

import re
import requests
import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

class ImageAnalyzer:
    def __init__(self):
        if not IMAGE_PROCESSING_AVAILABLE:
            logger.warning("Image processing libraries not available. Image analysis will be limited.")
            
        self.suspicious_visual_patterns = {
            'login_form_indicators': [
                'password', 'login', 'sign in', 'username', 'email', 'account',
                'authenticate', 'verify', 'security check'
            ],
            'urgency_indicators': [
                'urgent', 'immediate', 'asap', 'hurry', 'limited time', 'expires',
                'act now', 'don\'t delay', 'last chance', 'final notice'
            ],
            'financial_indicators': [
                'payment', 'invoice', 'refund', 'transaction', 'account', 'balance',
                'credit card', 'bank', 'wire transfer', 'cryptocurrency'
            ],
            'credential_indicators': [
                'password', 'login', 'verify', 'authenticate', 'confirm identity',
                'security question', 'two-factor', '2fa'
            ]
        }
        
        self.suspicious_colors = {
            'phishing_red_flags': [(255, 0, 0), (220, 20, 60), (178, 34, 34)],  # Red variations
            'warning_orange': [(255, 165, 0), (255, 140, 0), (255, 127, 80)],     # Orange variations
            'danger_yellow': [(255, 255, 0), (255, 215, 0), (218, 165, 32)]       # Yellow variations
        }
        
        self.known_brands = [
            'paypal', 'amazon', 'microsoft', 'google', 'apple', 'facebook',
            'linkedin', 'twitter', 'instagram', 'netflix', 'spotify', 'ebay'
        ]

    def analyze(self, image_data: str) -> Dict:
        """
        Analyze image for phishing indicators
        
        Args:
            image_data: Base64 encoded image or file path
            
        Returns:
            Dict containing analysis results
        """
        if not IMAGE_PROCESSING_AVAILABLE:
            logger.warning("Image processing not available. Returning basic analysis.")
            return self._create_basic_image_result()
            
        try:
            # Load image
            image = self._load_image(image_data)
            if image is None:
                return self._create_error_result("Failed to load image")
            
            # Perform various analyses
            text_analysis = self._analyze_text_content(image)
            visual_analysis = self._analyze_visual_elements(image)
            brand_analysis = self._analyze_brand_impersonation(image)
            layout_analysis = self._analyze_layout_patterns(image)
            color_analysis = self._analyze_color_patterns(image)
            
            # Combine results
            combined_result = self._combine_analyses([
                text_analysis, visual_analysis, brand_analysis,
                layout_analysis, color_analysis
            ])
            
            return combined_result
            
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            return self._create_error_result(f"Analysis error: {str(e)}")

    def _load_image(self, image_data: str):
        """Load image from base64 string or file path"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return None
            
        try:
            if image_data.startswith('data:image'):
                # Base64 encoded image
                image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
                image = Image.open(BytesIO(image_bytes))
                return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            elif image_data.startswith('http'):
                # URL
                response = requests.get(image_data)
                image = Image.open(BytesIO(response.content))
                return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            else:
                # File path
                return cv2.imread(image_data)
        except Exception as e:
            logger.error(f"Failed to load image: {e}")
            return None

    def _analyze_text_content(self, image) -> Dict:
        """Extract and analyze text content from image"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return self._create_result(0, [], 0.0)
            
        try:
            # Extract text using OCR
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            text = pytesseract.image_to_string(gray)
            
            if not text.strip():
                return self._create_result(0, [], 0.0)
            
            text_lower = text.lower()
            indicators = []
            risk_score = 0
            
            # Check for login form indicators
            login_keywords = 0
            for keyword in self.suspicious_visual_patterns['login_form_indicators']:
                if keyword in text_lower:
                    login_keywords += 1
            
            if login_keywords >= 2:
                indicators.append("login_form_detected")
                risk_score += 30
            
            # Check for urgency indicators
            urgency_count = 0
            for keyword in self.suspicious_visual_patterns['urgency_indicators']:
                if keyword in text_lower:
                    urgency_count += 1
            
            if urgency_count >= 2:
                indicators.append("urgency_language")
                risk_score += 25
            
            # Check for financial indicators
            financial_count = 0
            for keyword in self.suspicious_visual_patterns['financial_indicators']:
                if keyword in text_lower:
                    financial_count += 1
            
            if financial_count >= 2:
                indicators.append("financial_content")
                risk_score += 20
            
            # Check for credential requests
            credential_count = 0
            for keyword in self.suspicious_visual_patterns['credential_indicators']:
                if keyword in text_lower:
                    credential_count += 1
            
            if credential_count >= 3:
                indicators.append("credential_requests")
                risk_score += 35
            
            # Check for suspicious URLs in text
            urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)
            suspicious_urls = 0
            for url in urls:
                if self._is_suspicious_url(url):
                    suspicious_urls += 1
            
            if suspicious_urls > 0:
                indicators.append("suspicious_urls_in_text")
                risk_score += suspicious_urls * 20
            
            confidence = min(0.9, (login_keywords + urgency_count + financial_count + credential_count) / 10)
            
            return self._create_result(risk_score, indicators, confidence)
            
        except Exception as e:
            logger.error(f"Text content analysis failed: {e}")
            return self._create_result(0, [], 0.0)

    def _analyze_visual_elements(self, image) -> Dict:
        """Analyze visual elements and shapes"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return self._create_result(0, [], 0.0)
            
        try:
            indicators = []
            risk_score = 0
            
            # Convert to grayscale for shape analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect forms/buttons using template matching
            form_indicators = self._detect_form_elements(gray)
            if form_indicators:
                indicators.extend(form_indicators)
                risk_score += len(form_indicators) * 15
            
            # Check for security badges/padlocks
            security_elements = self._detect_security_elements(gray)
            if security_elements:
                indicators.extend(security_elements)
                risk_score += len(security_elements) * 10
            
            # Detect popup-like elements
            popup_elements = self._detect_popup_elements(gray)
            if popup_elements:
                indicators.extend(popup_elements)
                risk_score += len(popup_elements) * 20
            
            confidence = min(0.8, len(indicators) / 5)
            
            return self._create_result(risk_score, indicators, confidence)
            
        except Exception as e:
            logger.error(f"Visual elements analysis failed: {e}")
            return self._create_result(0, [], 0.0)

    def _analyze_brand_impersonation(self, image) -> Dict:
        """Analyze for brand impersonation"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return self._create_result(0, [], 0.0)
            
        try:
            indicators = []
            risk_score = 0
            
            # Extract text for brand analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            text = pytesseract.image_to_string(gray).lower()
            
            # Check for brand mentions
            brand_mentions = []
            for brand in self.known_brands:
                if brand in text:
                    brand_mentions.append(brand)
            
            if brand_mentions:
                indicators.append("brand_mentions")
                risk_score += len(brand_mentions) * 15
                
                # Check if brand is mentioned with suspicious context
                for brand in brand_mentions:
                    if self._is_suspicious_brand_context(text, brand):
                        indicators.append(f"suspicious_{brand}_context")
                        risk_score += 25
            
            # Check for brand logos/colors (simplified)
            color_analysis = self._analyze_brand_colors(image)
            if color_analysis:
                indicators.extend(color_analysis)
                risk_score += len(color_analysis) * 10
            
            confidence = min(0.85, (len(brand_mentions) * 0.3 + len(indicators) * 0.2))
            
            return self._create_result(risk_score, indicators, confidence)
            
        except Exception as e:
            logger.error(f"Brand impersonation analysis failed: {e}")
            return self._create_result(0, [], 0.0)

    def _analyze_layout_patterns(self, image) -> Dict:
        """Analyze layout patterns typical of phishing"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return self._create_result(0, [], 0.0)
            
        try:
            indicators = []
            risk_score = 0
            
            # Get image dimensions
            height, width = image.shape[:2]
            
            # Check for centered login forms
            if self._is_centered_login_form(image):
                indicators.append("centered_login_form")
                risk_score += 20
            
            # Check for popup-like layout
            if self._is_popup_layout(image):
                indicators.append("popup_layout")
                risk_score += 25
            
            # Check for overlay patterns
            if self._has_overlay_pattern(image):
                indicators.append("overlay_pattern")
                risk_score += 15
            
            # Check for fake browser chrome
            if self._has_fake_browser_chrome(image):
                indicators.append("fake_browser_chrome")
                risk_score += 30
            
            confidence = min(0.75, len(indicators) / 4)
            
            return self._create_result(risk_score, indicators, confidence)
            
        except Exception as e:
            logger.error(f"Layout pattern analysis failed: {e}")
            return self._create_result(0, [], 0.0)

    def _analyze_color_patterns(self, image) -> Dict:
        """Analyze color patterns for phishing indicators"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return self._create_result(0, [], 0.0)
            
        try:
            indicators = []
            risk_score = 0
            
            # Analyze dominant colors
            colors = self._get_dominant_colors(image, k=5)
            
            # Check for phishing color patterns
            for color_name, color_values in self.suspicious_colors.items():
                for color in colors:
                    if self._is_color_match(color, color_values):
                        indicators.append(f"{color_name}_detected")
                        risk_score += 15
                        break
            
            # Check for high contrast warning colors
            if self._has_high_contrast_warning(image):
                indicators.append("high_contrast_warning")
                risk_score += 20
            
            confidence = min(0.7, len(indicators) / 3)
            
            return self._create_result(risk_score, indicators, confidence)
            
        except Exception as e:
            logger.error(f"Color pattern analysis failed: {e}")
            return self._create_result(0, [], 0.0)

    def _detect_form_elements(self, gray) -> List[str]:
        """Detect form elements in grayscale image"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return []
            
        indicators = []
        
        # Simple rectangle detection for form fields
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        rectangle_count = 0
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
            if len(approx) == 4:  # Rectangle
                area = cv2.contourArea(contour)
                if 1000 < area < 50000:  # Reasonable size for form fields
                    rectangle_count += 1
        
        if rectangle_count >= 3:
            indicators.append("multiple_form_fields")
        
        return indicators

    def _detect_security_elements(self, gray) -> List[str]:
        """Detect security badges and padlocks"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return []
            
        indicators = []
        
        # Look for padlock-like shapes (simplified)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if 500 < area < 5000:  # Size range for small icons
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h if h > 0 else 0
                
                # Check for padlock-like aspect ratio
                if 0.7 < aspect_ratio < 1.3 and h > w * 0.8:
                    indicators.append("security_icon_detected")
                    break
        
        return indicators

    def _detect_popup_elements(self, gray) -> List[str]:
        """Detect popup-like elements"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return []
            
        indicators = []
        
        # Look for overlay patterns
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Check for rectangular overlays
        overlay_count = 0
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
            if len(approx) == 4:
                area = cv2.contourArea(contour)
                if area > 10000:  # Large rectangular area
                    overlay_count += 1
        
        if overlay_count >= 1:
            indicators.append("popup_overlay_detected")
        
        return indicators

    def _is_centered_login_form(self, image) -> bool:
        """Check if image has a centered login form pattern"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return False
            
        height, width = image.shape[:2]
        center_region = image[height//4:3*height//4, width//4:3*width//4]
        
        # Simple check for form elements in center
        gray = cv2.cvtColor(center_region, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        form_elements = 0
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
            if len(approx) == 4:  # Rectangle
                area = cv2.contourArea(contour)
                if 1000 < area < 20000:
                    form_elements += 1
        
        return form_elements >= 2

    def _is_popup_layout(self, image) -> bool:
        """Check if image has popup-like layout"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return False
            
        height, width = image.shape[:2]
        
        # Check for centered content with borders
        center_region = image[height//6:5*height//6, width//6:5*width//6]
        
        # Simple brightness analysis for popup detection
        gray = cv2.cvtColor(center_region, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        
        # Check for clear rectangular boundary
        edges = cv2.Canny(binary, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
            if len(approx) == 4:
                area = cv2.contourArea(contour)
                if area > (height * width) * 0.3:  # Large central area
                    return True
        
        return False

    def _has_overlay_pattern(self, image) -> bool:
        """Check for overlay patterns typical of phishing"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return False
            
        # Simple check for transparency-like effects
        # In real implementation, would check for actual transparency
        height, width = image.shape[:2]
        
        # Check for semi-transparent regions
        # This is a simplified check
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Look for regions with intermediate gray values
        overlay_regions = np.sum((gray > 100) & (gray < 200))
        total_pixels = height * width
        
        return (overlay_regions / total_pixels) > 0.3

    def _has_fake_browser_chrome(self, image) -> bool:
        """Check for fake browser chrome elements"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return False
            
        height, width = image.shape[:2]
        
        # Check top region for browser-like elements
        top_region = image[0:height//8, 0:width]
        
        # Look for address bar-like rectangles
        gray = cv2.cvtColor(top_region, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        address_bar_like = 0
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
            if len(approx) == 4:  # Rectangle
                x, y, w, h = cv2.boundingRect(contour)
                if w > width * 0.6 and h < 50:  # Wide, thin rectangle
                    address_bar_like += 1
        
        return address_bar_like >= 1

    def _analyze_brand_colors(self, image) -> List[str]:
        """Analyze colors that might indicate brand impersonation"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return []
            
        indicators = []
        
        # Get dominant colors
        colors = self._get_dominant_colors(image, k=3)
        
        # Check for brand color patterns (simplified)
        brand_colors = {
            'paypal': [(0, 112, 186), (255, 255, 255)],  # Blue and white
            'facebook': [(24, 119, 242), (255, 255, 255)],  # Blue and white
            'google': [(66, 133, 244), (52, 168, 83), (251, 188, 5), (234, 67, 53)],
            'microsoft': [(245, 128, 0), (255, 255, 255)]  # Orange and white
        }
        
        for brand, brand_color_list in brand_colors.items():
            for color in colors:
                for brand_color in brand_color_list:
                    if self._is_color_match(color, [brand_color]):
                        indicators.append(f"{brand}_color_pattern")
                        break
        
        return indicators

    def _is_suspicious_brand_context(self, text: str, brand: str) -> bool:
        """Check if brand is mentioned in suspicious context"""
        suspicious_contexts = [
            f'{brand} security',
            f'{brand} verification',
            f'{brand} account',
            f'{brand} login',
            f'{brand} password'
        ]
        
        return any(context in text for context in suspicious_contexts)

    def _get_dominant_colors(self, image, k: int = 5) -> List[Tuple[int, int, int]]:
        """Get dominant colors from image using K-means"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return []
            
        # Reshape image to be a list of pixels
        pixels = image.reshape((-1, 3))
        pixels = np.float32(pixels)
        
        # Define criteria and apply kmeans
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, 0.1)
        _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convert back to uint8
        centers = np.uint8(centers)
        
        return [tuple(color) for color in centers]

    def _is_color_match(self, color1: Tuple[int, int, int], color_list: List[Tuple[int, int, int]], threshold: int = 30) -> bool:
        """Check if two colors are similar"""
        for color2 in color_list:
            distance = np.sqrt(sum((a - b) ** 2 for a, b in zip(color1, color2)))
            if distance < threshold:
                return True
        return False

    def _has_high_contrast_warning(self, image) -> bool:
        """Check for high contrast warning colors"""
        if not IMAGE_PROCESSING_AVAILABLE:
            return False
            
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Count pixels with high saturation and value (bright colors)
        bright_colors = np.sum((hsv[:, :, 1] > 150) & (hsv[:, :, 2] > 200))
        total_pixels = image.shape[0] * image.shape[1]
        
        return (bright_colors / total_pixels) > 0.1

    def _is_suspicious_url(self, url: str) -> bool:
        """Check if URL is suspicious"""
        # Check for IP addresses instead of domains
        if re.match(r'https?://\d+\.\d+\.\d+\.\d+', url):
            return True
        
        # Check for suspicious TLDs
        suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.top', '.work']
        domain = re.sub(r'https?://', '', url).split('/')[0]
        
        return any(domain.endswith(tld) for tld in suspicious_tlds)

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
            'indicators': list(set(all_indicators))
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

    def _create_error_result(self, error_message: str) -> Dict:
        """Create error result"""
        return {
            'risk_level': 'error',
            'risk_score': 0,
            'confidence': 0.0,
            'indicators': ['analysis_error'],
            'error': error_message
        }

    def _create_basic_image_result(self) -> Dict:
        """Create basic result when image processing is not available"""
        return {
            'risk_level': 'low',
            'risk_score': 10,
            'confidence': 0.3,
            'indicators': ['basic_analysis_only'],
            'note': 'Image processing libraries not available - basic analysis only'
        }

    def is_healthy(self) -> bool:
        """Check if the analyzer is healthy and ready"""
        try:
            # Test with a simple image
            test_image = np.zeros((100, 100, 3), dtype=np.uint8)
            test_result = self.analyze(test_image)
            return isinstance(test_result, dict) and 'risk_level' in test_result
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False