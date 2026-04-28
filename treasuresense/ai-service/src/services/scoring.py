import numpy as np
from typing import Dict, Any

class ProbabilityScorer:
    """
    Calculate treasure probability scores based on multiple factors.
    Uses weighted scoring algorithm with machine learning enhancement.
    """
    
    # Feature weights (sum to 1.0)
    WEIGHTS = {
        'historical': 0.35,
        'terrain': 0.30,
        'proximity': 0.20,
        'accessibility': 0.10,
        'seasonal': 0.05
    }
    
    def __init__(self):
        # Load pre-trained model if available
        self.model = None
        try:
            import joblib
            self.model = joblib.load('models/scorer_v1.pkl')
        except:
            pass
    
    def calculate_score(
        self, 
        terrain_features: Dict[str, Any],
        historical_data: Dict[str, Any],
        nearby_discoveries: int
    ) -> Dict[str, Any]:
        """
        Calculate overall probability score (0-100).
        """
        # Calculate individual factor scores
        historical_score = self._score_historical(historical_data)
        terrain_score = self._score_terrain(terrain_features)
        proximity_score = self._score_proximity(nearby_discoveries)
        accessibility_score = self._score_accessibility(terrain_features)
        seasonal_score = self._score_seasonal()
        
        # Weighted sum
        total_score = (
            historical_score * self.WEIGHTS['historical'] +
            terrain_score * self.WEIGHTS['terrain'] +
            proximity_score * self.WEIGHTS['proximity'] +
            accessibility_score * self.WEIGHTS['accessibility'] +
            seasonal_score * self.WEIGHTS['seasonal']
        )
        
        # Apply ML model if available for refinement
        if self.model:
            features = np.array([
                historical_score, terrain_score, proximity_score,
                accessibility_score, seasonal_score
            ]).reshape(1, -1)
            ml_adjustment = self.model.predict(features)[0]
            total_score = (total_score + ml_adjustment) / 2
        
        # Calculate confidence based on data quality
        confidence = self._calculate_confidence(
            terrain_features, historical_data
        )
        
        return {
            'total_score': min(100, max(0, total_score)),
            'historical_score': historical_score,
            'terrain_score': terrain_score,
            'proximity_score': proximity_score,
            'accessibility_score': accessibility_score,
            'seasonal_score': seasonal_score,
            'confidence': confidence
        }
    
    def _score_historical(self, data: Dict[str, Any]) -> float:
        """Score based on historical significance (0-100)."""
        score = 30  # Base score
        
        # Points for historical sites nearby
        if data.get('nearby_sites'):
            score += min(30, len(data['nearby_sites']) * 10)
        
        # Points for trade routes
        if data.get('trade_route_proximity', 0) < 1:  # Within 1km
            score += 20
        elif data.get('trade_route_proximity', 0) < 5:
            score += 10
        
        # Points for settlement history
        if data.get('settlement_era'):
            era_bonus = {
                'ancient': 15,
                'medieval': 12,
                'colonial': 10,
                'frontier': 8
            }
            score += era_bonus.get(data['settlement_era'], 0)
        
        # Points for battlefields
        if data.get('battlefield_proximity', 0) < 2:
            score += 15
        
        return min(100, score)
    
    def _score_terrain(self, features: Dict[str, Any]) -> float:
        """Score based on terrain characteristics (0-100)."""
        score = 40  # Base score
        
        terrain_type = features.get('type', 'unknown')
        
        # Terrain type bonuses
        terrain_scores = {
            'beach': 25,      # High traffic, erosion reveals items
            'riverbank': 25,  # Historical crossings
            'field': 20,      # Agricultural history
            'forest_edge': 18, # Old settlements, camps
            'pasture': 15,    # Historical grazing
            'woodland': 12,   # Hunting grounds
            'hillside': 10,   # Travel routes
            'wetland': 5,     # Poor preservation
            'urban': 0        # Modern interference
        }
        score += terrain_scores.get(terrain_type, 10)
        
        # Soil type for preservation
        soil_scores = {
            'sandy': 15,      # Good drainage
            'loamy': 12,      # Balanced
            'clay': 8,        # Hard to detect
            'rocky': 5        # Difficult
        }
        score += soil_scores.get(features.get('soil_type'), 8)
        
        # Slope factor
        slope = features.get('slope', 'moderate')
        if slope == 'gentle':
            score += 10  # Items settle here
        elif slope == 'steep':
            score -= 5   # Items slide away
        
        # Water proximity (but not too close)
        water_dist = features.get('water_distance_m', 9999)
        if 50 < water_dist < 500:
            score += 10  # Good for campsites
        
        return min(100, max(0, score))
    
    def _score_proximity(self, nearby_count: int) -> float:
        """Score based on nearby discoveries (0-100)."""
        # More discoveries nearby = higher probability
        if nearby_count >= 10:
            return 95
        elif nearby_count >= 5:
            return 80
        elif nearby_count >= 3:
            return 65
        elif nearby_count >= 1:
            return 50
        else:
            return 30  # Unknown area
    
    def _score_accessibility(self, features: Dict[str, Any]) -> float:
        """Score based on accessibility (0-100)."""
        score = 50
        
        # Distance from roads (sweet spot: accessible but not too close)
        road_dist = features.get('road_distance_m', 1000)
        if 100 < road_dist < 1000:
            score += 30  # Accessible but not picked over
        elif road_dist < 100:
            score += 10  # Probably detected already
        else:
            score += 5   # Hard to reach
        
        # Land ownership
        if features.get('public_land', False):
            score += 20
        
        # Ease of detecting
        vegetation = features.get('vegetation', 'moderate')
        if vegetation == 'sparse':
            score += 15
        elif vegetation == 'dense':
            score -= 10
        
        return min(100, max(0, score))
    
    def _score_seasonal(self) -> float:
        """Score based on seasonal factors (0-100)."""
        from datetime import datetime
        
        month = datetime.now().month
        
        # Spring and fall are best (after rain, before snow)
        if month in [4, 5, 9, 10]:
            return 80
        # Summer is good
        elif month in [6, 7, 8]:
            return 70
        # Winter is harder
        else:
            return 50
    
    def _calculate_confidence(
        self, 
        terrain: Dict[str, Any], 
        historical: Dict[str, Any]
    ) -> float:
        """Calculate confidence in the score (0-1)."""
        confidence = 0.5
        
        # More data = higher confidence
        if terrain.get('satellite_quality') == 'high':
            confidence += 0.15
        
        if historical.get('data_sources', 0) > 3:
            confidence += 0.15
        
        if terrain.get('elevation_known', False):
            confidence += 0.1
        
        if historical.get('verified_sites', 0) > 0:
            confidence += 0.1
        
        return min(0.95, confidence)
