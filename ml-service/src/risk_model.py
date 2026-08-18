"""
ML risk inference for final suitability score and profile.
Loads risk_model.joblib from models/ when present; returns None when missing.
"""

from pathlib import Path
from typing import Dict, Any, Optional
import json
import joblib
import numpy as np

from src.feature_engineering import extract_features_from_dict
from src.validation import validate_customer_input


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "risk_model.joblib"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.json"


class HybridRiskModel:
    def __init__(self, feature_pipeline, classifier, regressor, classes, metadata=None):
        self.feature_pipeline = feature_pipeline
        self.classifier = classifier
        self.regressor = regressor
        self.classes = list(classes)
        self.metadata = metadata or {}

    def predict(self, X):
        X_trans = self.feature_pipeline.transform(X)
        pred_class_idx = self.classifier.predict(X_trans)
        pred_classes = [
            self.classes[i] if isinstance(i, (int, np.integer)) else i
            for i in pred_class_idx
        ]
        pred_scores = self.regressor.predict(X_trans)
        pred_scores = np.clip(np.round(pred_scores, 2), 0.0, 100.0)
        return pred_classes, pred_scores


_CACHED_MODEL = None
_CACHED_METADATA = None


def get_model():
    """Returns cached model instance or loads from disk if not yet loaded."""
    global _CACHED_MODEL, _CACHED_METADATA
    if _CACHED_MODEL is None and MODEL_PATH.exists():
        try:
            _CACHED_MODEL = joblib.load(MODEL_PATH)
            if METADATA_PATH.exists():
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    _CACHED_METADATA = json.load(f)
            else:
                _CACHED_METADATA = getattr(_CACHED_MODEL, "metadata", {})
        except Exception as e:
            print(f"Warning: Failed to load ML model from {MODEL_PATH}: {e}")
            _CACHED_MODEL = None
            _CACHED_METADATA = None
    return _CACHED_MODEL, _CACHED_METADATA


def is_model_loaded() -> bool:
    model, _ = get_model()
    return model is not None


def predict_ml_final_risk(customer_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Run ML inference for final risk score and profile.

    Uses risk_tolerance (and other customer fields) — not the frontend risk_score.
    Returns None if risk_model.joblib is missing; does not substitute rule-based output.
    """
    model, _ = get_model()
    if model is None:
        return None

    is_valid, validation_errors, _ = validate_customer_input(customer_data)
    if not is_valid:
        raise ValueError(f"Input validation error: {'; '.join(validation_errors)}")

    df_input = extract_features_from_dict(customer_data)
    pred_classes, pred_scores = model.predict(df_input)

    return {
        "final_risk_score": float(np.round(pred_scores[0], 2)),
        "risk_profile": str(pred_classes[0]),
    }
