"""
AI Content Verification Engine for VeritasAI.
"""
import hashlib
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import re


class ContentVerificationEngine:
    """Core AI engine for content authenticity verification."""
    
    def __init__(self):
        """Initialize the verification engine."""
        self.supported_content_types = {
            'text/plain': self._verify_text_content,
            'text/html': self._verify_html_content,
            'image/jpeg': self._verify_image_content,
            'image/png': self._verify_image_content,
            'video/mp4': self._verify_video_content,
            'application/json': self._verify_json_content
        }
        
        # Initialize third-party verification service
        try:
            from src.ai.third_party.service import third_party_service
            self.third_party_service = third_party_service
        except ImportError:
            self.third_party_service = None
    
    def verify_content(self, content: bytes, content_type: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Verify content authenticity using appropriate verification methods.
        
        Args:
            content: Content data as bytes
            content_type: MIME type of the content
            metadata: Additional metadata about the content
            
        Returns:
            Dict containing verification results and confidence scores
        """
        if metadata is None:
            metadata = {}
            
        # Initialize result structure
        result = {
            'content_id': hashlib.sha256(content).hexdigest()[:16],
            'timestamp': datetime.utcnow().isoformat(),
            'content_type': content_type,
            'verification_score': 0.0,
            'confidence': 0.0,
            'findings': [],
            'metadata_analysis': {},
            'cross_references': [],
            'anomalies': [],
            'recommendations': []
        }
        
        # Select appropriate verification method
        verification_method = self.supported_content_types.get(content_type)
        if verification_method:
            method_result = verification_method(content, metadata)
            result.update(method_result)
        else:
            result['findings'].append({
                'type': 'unsupported_content_type',
                'description': f'Content type {content_type} not supported for verification',
                'severity': 'low'
            })
            result['confidence'] = 0.1
            result['verification_score'] = 0.1
        
        # Add third-party verification if available and content is text-based
        if self.third_party_service and content_type in ['text/plain', 'text/html', 'application/json']:
            try:
                text_content = content.decode('utf-8', errors='ignore')
                if len(text_content.strip()) > 10:  # Only verify if there's meaningful content
                    third_party_result = self.third_party_service.verify_text_claim(text_content[:500])  # Limit length
                    result['third_party_verification'] = third_party_result
            except Exception as e:
                result['findings'].append({
                    'type': 'third_party_verification_error',
                    'description': f'Error during third-party verification: {str(e)}',
                    'severity': 'low'
                })
        
        # Add overall assessment
        result['assessment'] = self._generate_assessment(result['verification_score'])
        
        return result
    
    def _verify_text_content(self, content: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Verify text content for authenticity."""
        text = content.decode('utf-8', errors='ignore')
        result = {
            'verification_score': 0.85,
            'confidence': 0.9,
            'findings': [],
            'metadata_analysis': {},
            'cross_references': [],
            'anomalies': []
        }
        
        # Check for common misinformation patterns
        misinformation_patterns = [
            (r'\b(breaking news|urgent|shocking)\b', 'sensational_language', 0.3),
            (r'\b(unconfirmed|alleged|reportedly)\b', 'uncertain_claims', 0.2),
            (r'\b(expert says|scientists agree)\b', 'vague_authority', 0.25),
            (r'\b(99%|all|none|everyone|nobody)\b', 'absolute_claims', 0.35)
        ]
        
        for pattern, label, score_impact in misinformation_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                result['findings'].append({
                    'type': label,
                    'description': f'Detected {len(matches)} instances of {label}',
                    'severity': 'medium' if score_impact > 0.3 else 'low',
                    'matches': matches
                })
                result['verification_score'] -= score_impact * min(len(matches), 5) / 5
        
        # Check text quality and coherence
        word_count = len(text.split())
        if word_count < 50:
            result['findings'].append({
                'type': 'insufficient_content',
                'description': 'Content too short for reliable verification',
                'severity': 'low'
            })
            result['confidence'] = 0.5
        elif word_count > 10000:
            result['findings'].append({
                'type': 'excessive_content',
                'description': 'Content very long, analysis may be less precise',
                'severity': 'low'
            })
        
        # Analyze metadata if available
        if metadata:
            result['metadata_analysis'] = self._analyze_text_metadata(metadata)
        
        # Adjust scores based on findings
        result['verification_score'] = max(0.0, min(1.0, result['verification_score']))
        result['confidence'] = max(0.1, result['confidence'])
        
        return result
    
    def _verify_html_content(self, content: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Verify HTML content for authenticity."""
        result = {
            'verification_score': 0.8,
            'confidence': 0.85,
            'findings': [],
            'metadata_analysis': {},
            'cross_references': [],
            'anomalies': []
        }
        
        html_text = content.decode('utf-8', errors='ignore')
        
        # Check for suspicious HTML elements
        suspicious_patterns = [
            (r'<script[^>]*>.*?</script>', 'embedded_scripts', 0.2),
            (r'on\w+\s*=', 'inline_event_handlers', 0.15),
            (r'<iframe[^>]*>', 'embedded_iframes', 0.25),
            (r'<meta[^>]*refresh[^>]*>', 'auto_refresh', 0.3)
        ]
        
        for pattern, label, score_impact in suspicious_patterns:
            matches = re.findall(pattern, html_text, re.IGNORECASE | re.DOTALL)
            if matches:
                result['findings'].append({
                    'type': label,
                    'description': f'Detected {len(matches)} instances of {label}',
                    'severity': 'medium' if score_impact > 0.2 else 'low',
                    'matches': len(matches)
                })
                result['verification_score'] -= score_impact * min(len(matches), 3) / 3
        
        # Check for content manipulation indicators
        if '<!--' in html_text and '-->' in html_text:
            comment_count = html_text.count('<!--')
            if comment_count > 10:
                result['findings'].append({
                    'type': 'excessive_comments',
                    'description': f'Found {comment_count} HTML comments, possibly indicating content manipulation',
                    'severity': 'medium'
                })
                result['verification_score'] -= 0.1
        
        # Analyze metadata if available
        if metadata:
            result['metadata_analysis'] = self._analyze_html_metadata(metadata)
        
        # Adjust scores
        result['verification_score'] = max(0.0, min(1.0, result['verification_score']))
        
        return result
    
    def _verify_image_content(self, content: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Verify image content for authenticity."""
        result = {
            'verification_score': 0.75,
            'confidence': 0.8,
            'findings': [],
            'metadata_analysis': {},
            'cross_references': [],
            'anomalies': []
        }
        
        # Check image properties from metadata
        if metadata:
            result['metadata_analysis'] = self._analyze_image_metadata(metadata)
            
            # Check for common manipulation indicators
            if 'exif' in metadata:
                exif_data = metadata['exif']
                if 'Software' in exif_data:
                    software = exif_data['Software']
                    if any(tool in software.lower() for tool in ['photoshop', 'gimp', 'paint']):
                        result['findings'].append({
                            'type': 'editing_software',
                            'description': f'Image edited with {software}',
                            'severity': 'low'
                        })
        
        # Add general image verification findings
        result['findings'].append({
            'type': 'image_verification',
            'description': 'Image verification requires specialized deepfake detection algorithms',
            'severity': 'info',
            'recommendation': 'Use deepfake detection for detailed image analysis'
        })
        
        return result
    
    def _verify_video_content(self, content: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Verify video content for authenticity."""
        result = {
            'verification_score': 0.7,
            'confidence': 0.75,
            'findings': [],
            'metadata_analysis': {},
            'cross_references': [],
            'anomalies': []
        }
        
        # Video verification requires specialized processing
        result['findings'].append({
            'type': 'video_content',
            'description': 'Video verification requires specialized deepfake detection algorithms',
            'severity': 'info',
            'recommendation': 'Use deepfake detection module for detailed video analysis'
        })
        
        if metadata:
            result['metadata_analysis'] = self._analyze_video_metadata(metadata)
        
        return result
    
    def _verify_json_content(self, content: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Verify JSON content for authenticity."""
        result = {
            'verification_score': 0.9,
            'confidence': 0.95,
            'findings': [],
            'metadata_analysis': {},
            'cross_references': [],
            'anomalies': []
        }
        
        try:
            json_data = json.loads(content.decode('utf-8', errors='ignore'))
            
            # Check for structured data patterns
            if isinstance(json_data, dict):
                if 'source' in json_data or 'origin' in json_data:
                    result['findings'].append({
                        'type': 'source_attribution',
                        'description': 'Content includes source attribution information',
                        'severity': 'positive'
                    })
                    result['verification_score'] += 0.1
                
                # Check for timestamp information
                timestamp_fields = ['timestamp', 'created', 'date', 'time']
                if any(field in json_data for field in timestamp_fields):
                    result['findings'].append({
                        'type': 'temporal_data',
                        'description': 'Content includes temporal information',
                        'severity': 'positive'
                    })
                    result['verification_score'] += 0.05
            
        except json.JSONDecodeError:
            result['findings'].append({
                'type': 'invalid_json',
                'description': 'Content is not valid JSON',
                'severity': 'high'
            })
            result['verification_score'] = 0.1
            result['confidence'] = 0.3
        
        if metadata:
            result['metadata_analysis'] = self._analyze_json_metadata(metadata)
        
        # Adjust scores
        result['verification_score'] = max(0.0, min(1.0, result['verification_score']))
        
        return result
    
    def _analyze_text_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze text content metadata."""
        analysis = {}
        
        # Check for author information
        if 'author' in metadata:
            analysis['author_info'] = {
                'present': True,
                'author': metadata['author']
            }
        else:
            analysis['author_info'] = {
                'present': False,
                'note': 'No author information provided'
            }
        
        # Check for source information
        source_fields = ['source', 'origin', 'publisher']
        source_present = any(field in metadata for field in source_fields)
        analysis['source_info'] = {
            'present': source_present,
            'fields': [field for field in source_fields if field in metadata]
        }
        
        # Check for timestamp
        time_fields = ['created', 'modified', 'timestamp', 'date']
        time_present = any(field in metadata for field in time_fields)
        analysis['timestamp_info'] = {
            'present': time_present,
            'fields': [field for field in time_fields if field in metadata]
        }
        
        return analysis
    
    def _analyze_html_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze HTML content metadata."""
        return self._analyze_text_metadata(metadata)
    
    def _analyze_image_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze image content metadata."""
        analysis = {}
        
        # Check EXIF data
        if 'exif' in metadata:
            analysis['exif_data'] = {
                'present': True,
                'fields': list(metadata['exif'].keys())
            }
        else:
            analysis['exif_data'] = {
                'present': False,
                'note': 'No EXIF data available'
            }
        
        # Check file properties
        file_fields = ['width', 'height', 'size', 'format']
        analysis['file_properties'] = {
            'available_fields': [field for field in file_fields if field in metadata]
        }
        
        return analysis
    
    def _analyze_video_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze video content metadata."""
        analysis = {}
        
        # Check basic video properties
        video_fields = ['duration', 'width', 'height', 'codec', 'bitrate']
        analysis['video_properties'] = {
            'available_fields': [field for field in video_fields if field in metadata]
        }
        
        # Check for audio track
        analysis['audio_track'] = {
            'present': metadata.get('audio_codec') is not None
        }
        
        return analysis
    
    def _analyze_json_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze JSON content metadata."""
        return self._analyze_text_metadata(metadata)
    
    def _generate_assessment(self, score: float) -> str:
        """Generate human-readable assessment based on verification score."""
        if score >= 0.9:
            return "Highly Authentic"
        elif score >= 0.7:
            return "Likely Authentic"
        elif score >= 0.5:
            return "Uncertain"
        elif score >= 0.3:
            return "Likely Misinformation"
        else:
            return "Highly Suspect"


# Global instance
verification_engine = ContentVerificationEngine()