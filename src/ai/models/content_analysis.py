"""
AI Models for VeritasAI content analysis.
"""
import re
from typing import Dict, List, Tuple
from collections import Counter


class TextAnalysisModel:
    """Text analysis model for misinformation detection."""
    
    def __init__(self):
        """Initialize the text analysis model."""
        # Patterns for common misinformation indicators
        self.misinformation_patterns = {
            'sensational_language': r'\b(breaking news|urgent|shocking|unbelievable)\b',
            'absolute_claims': r'\b(99%|100%|all|none|everyone|nobody|always|never)\b',
            'vague_authority': r'\b(expert says|scientists agree|studies show)\b',
            'fear_mongering': r'\b(warning|danger|threat|crisis|emergency)\b',
            'conspiracy_indicators': r'\b(cover[-\s]up|hidden agenda|they don\'t want you to know)\b'
        }
        
        # Patterns for credible content indicators
        self.credible_patterns = {
            'source_attribution': r'\b(source:|according to|reported by|cited from)\b',
            'evidence_indicators': r'\b(study|research|data|evidence|statistics)\b',
            'temporal_indicators': r'\b(on [A-Z][a-z]+ \d+|in \d{4}|recently|currently)\b',
            'balanced_language': r'\b(may|might|could|possibly|potentially)\b'
        }
    
    def analyze_text(self, text: str) -> Dict[str, any]:
        """
        Analyze text for misinformation indicators.
        
        Args:
            text: Text content to analyze
            
        Returns:
            Dictionary with analysis results
        """
        results = {
            'misinformation_score': 0.0,
            'credibility_score': 0.0,
            'indicators': {
                'misinformation': [],
                'credibility': []
            },
            'word_count': len(text.split()),
            'sentence_count': len(re.split(r'[.!?]+', text)),
            'readability_metrics': self._calculate_readability(text)
        }
        
        # Analyze for misinformation patterns
        misinfo_matches = []
        for pattern_name, pattern in self.misinformation_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                misinfo_matches.extend([(pattern_name, match) for match in matches])
                results['indicators']['misinformation'].append({
                    'type': pattern_name,
                    'matches': matches,
                    'count': len(matches)
                })
        
        # Analyze for credibility patterns
        credible_matches = []
        for pattern_name, pattern in self.credible_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                credible_matches.extend([(pattern_name, match) for match in matches])
                results['indicators']['credibility'].append({
                    'type': pattern_name,
                    'matches': matches,
                    'count': len(matches)
                })
        
        # Calculate scores
        results['misinformation_score'] = min(1.0, len(misinfo_matches) * 0.1)
        results['credibility_score'] = min(1.0, len(credible_matches) * 0.15)
        
        # Adjust based on text quality
        if results['word_count'] < 20:
            results['confidence'] = 0.3
        elif results['word_count'] < 100:
            results['confidence'] = 0.6
        else:
            results['confidence'] = 0.9
        
        return results
    
    def _calculate_readability(self, text: str) -> Dict[str, float]:
        """Calculate basic readability metrics."""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        sentences = [s for s in sentences if s.strip()]
        
        if not words or not sentences:
            return {'avg_word_length': 0, 'avg_sentence_length': 0}
        
        avg_word_length = sum(len(word) for word in words) / len(words)
        avg_sentence_length = len(words) / len(sentences)
        
        return {
            'avg_word_length': avg_word_length,
            'avg_sentence_length': avg_sentence_length
        }


class ImageAnalysisModel:
    """Image analysis model for basic verification."""
    
    def __init__(self):
        """Initialize the image analysis model."""
        pass
    
    def analyze_image_metadata(self, metadata: Dict) -> Dict[str, any]:
        """
        Analyze image metadata for authenticity indicators.
        
        Args:
            metadata: Image metadata dictionary
            
        Returns:
            Dictionary with analysis results
        """
        results = {
            'metadata_integrity': 0.0,
            'editing_indicators': [],
            'compatibility_issues': [],
            'confidence': 0.7
        }
        
        # Check EXIF data presence
        if 'exif' in metadata and metadata['exif']:
            results['metadata_integrity'] = 0.9
            exif_data = metadata['exif']
            
            # Check for editing software indicators
            software_fields = ['Software', 'ImageDescription', 'Make', 'Model']
            for field in software_fields:
                if field in exif_data:
                    value = str(exif_data[field]).lower()
                    editing_tools = ['photoshop', 'gimp', 'paint', 'snapseed', 'vsco']
                    if any(tool in value for tool in editing_tools):
                        results['editing_indicators'].append({
                            'tool': value,
                            'field': field
                        })
        else:
            results['metadata_integrity'] = 0.3
            results['compatibility_issues'].append('Missing EXIF data')
            results['confidence'] = 0.4
        
        return results


class CrossReferenceModel:
    """Model for cross-referencing content with trusted sources."""
    
    def __init__(self):
        """Initialize the cross-reference model."""
        # Trusted domains (in a real implementation, this would be more comprehensive)
        self.trusted_domains = {
            'news': [
                'reuters.com', 'apnews.com', 'bbc.com', 'npr.org', 
                'nytimes.com', 'washingtonpost.com', 'theguardian.com'
            ],
            'science': [
                'nature.com', 'science.org', 'sciencemag.org', 
                'scientificamerican.com', 'pnas.org'
            ],
            'fact_checking': [
                'snopes.com', 'factcheck.org', 'politifact.com', 
                'fullfact.org', 'leadstories.com'
            ]
        }
    
    def check_source_credibility(self, source_url: str) -> Dict[str, any]:
        """
        Check the credibility of a source URL.
        
        Args:
            source_url: URL of the source to check
            
        Returns:
            Dictionary with credibility assessment
        """
        results = {
            'credibility_score': 0.0,
            'trusted_source': False,
            'source_category': None,
            'notes': []
        }
        
        # Extract domain from URL
        domain = source_url.lower()
        if '://' in domain:
            domain = domain.split('://', 1)[1]
        if '/' in domain:
            domain = domain.split('/', 1)[0]
        
        # Check against trusted domains
        for category, domains in self.trusted_domains.items():
            if any(trusted_domain in domain for trusted_domain in domains):
                results['trusted_source'] = True
                results['source_category'] = category
                results['credibility_score'] = 0.9
                results['notes'].append(f'Source is in trusted {category} category')
                break
        
        # If not trusted, assign lower score
        if not results['trusted_source']:
            results['credibility_score'] = 0.3
            results['notes'].append('Source not in trusted domains list')
        
        return results


# Global instances
text_model = TextAnalysisModel()
image_model = ImageAnalysisModel()
cross_reference_model = CrossReferenceModel()