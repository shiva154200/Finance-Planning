"""
In-Memory ML Inference Engine for Financial Risk & Suitability Profiling.
Loads the trained Calibrated Classifier & Continuous Regressor once on application startup.
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
import json
import joblib
import numpy as np
import pandas as pd

from src.feature_engineering import extract_features_from_dict
from src.validation import validate_customer_input, check_model_confidence_safety
from src.explainability import explain_prediction
from src.labeling_framework import RISK_CLASSES, calculate_composite_suitability


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "risk_model.joblib"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.json"


class HybridRiskModel:
    """
    Unified container bundling:
    1. Feature Engineering + Column Transformer
    2. Calibrated 5-class Classifier
    3. Continuous Score Regressor
    4. Label Encoder mappings and Metadata
    """
    def __init__(self, feature_pipeline, classifier, regressor, classes, metadata=None):
        self.feature_pipeline = feature_pipeline
        self.classifier = classifier
        self.regressor = regressor
        self.classes = list(classes)
        self.metadata = metadata or {}

    def predict(self, X):
        X_trans = self.feature_pipeline.transform(X)
        pred_class_idx = self.classifier.predict(X_trans)
        pred_classes = [self.classes[i] if isinstance(i, (int, np.integer)) else i for i in pred_class_idx]
        pred_scores = self.regressor.predict(X_trans)
        pred_scores = np.clip(np.round(pred_scores, 2), 0.0, 100.0)
        return pred_classes, pred_scores

    def predict_proba(self, X):
        X_trans = self.feature_pipeline.transform(X)
        return self.classifier.predict_proba(X_trans)


# In-memory cached model instance
_CACHED_MODEL = None
_CACHED_METADATA = None


def get_model():
    """
    Returns cached model instance or loads from disk if not yet loaded.
    """
    global _CACHED_MODEL, _CACHED_METADATA
    if _CACHED_MODEL is None:
        if MODEL_PATH.exists():
            try:
                _CACHED_MODEL = joblib.load(MODEL_PATH)
                if METADATA_PATH.exists():
                    with open(METADATA_PATH, "r") as f:
                        _CACHED_METADATA = json.load(f)
                else:
                    _CACHED_METADATA = getattr(_CACHED_MODEL, "metadata", {})
            except Exception as e:
                print(f"Warning: Failed to load ML model from {MODEL_PATH}: {e}")
                _CACHED_MODEL = None
    return _CACHED_MODEL, _CACHED_METADATA


def predict_risk_profile(customer_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Primary ML Risk Prediction Pipeline:
    1. Input Validation & OOD Anomaly Detection
    2. ML Model Inference (Calibrated Probabilities & Continuous Score)
    3. Calibrated Confidence & Safety Thresholding
    4. Feature Explainability & Top Risk Factors
    5. Fallback gracefully to rule-based fiduciary baseline if ML model is unavailable.
    """
    # 1. Validation & OOD checks
    is_valid, validation_errors, validation_warnings = validate_customer_input(customer_data)
    if not is_valid:
        raise ValueError(f"Input validation error: {'; '.join(validation_errors)}")

    model, metadata = get_model()

    if model is not None:
        try:
            # 2. Extract features
            df_input = extract_features_from_dict(customer_data)

            # 3. Model predictions
            pred_classes, pred_scores = model.predict(df_input)
            probas = model.predict_proba(df_input)[0]

            predicted_category = str(pred_classes[0])
            predicted_score = float(np.round(pred_scores[0], 1))

            # Calibrated probabilities dictionary
            class_labels = getattr(model, "classes", RISK_CLASSES)
            probabilities_dict = {
                cls: float(np.round(probas[idx], 4)) for idx, cls in enumerate(class_labels)
            }

            # Calibrated confidence (highest class probability)
            raw_confidence = float(np.max(probas))
            calibrated_confidence = float(np.round(raw_confidence, 4))

            # Confidence safety check
            confidence_tier, requires_abstention = check_model_confidence_safety(
                calibrated_confidence, validation_warnings
            )

            # 4. Explainability
            top_factors = explain_prediction(customer_data, predicted_score, predicted_category)

            return {
                "risk_score": predicted_score,
                "risk_profile": predicted_category,
                "confidence": calibrated_confidence,
                "confidence_tier": confidence_tier,
                "probabilities": probabilities_dict,
                "top_factors": top_factors,
                "requires_abstention": requires_abstention,
                "validation_warnings": validation_warnings,
                "model_version": metadata.get("model_version", "risk-model-v1.0.0") if metadata else "risk-model-v1.0.0",
                "methodology": "Trained ML (Calibrated Random Forest + Gradient Boosting Regressor)"
            }

        except Exception as e:
            validation_warnings.append(f"ML inference error encountered ({e}); fallback baseline engaged.")

    # 5. Fallback baseline if model unavailable or failed
    fallback_score, fallback_category = calculate_composite_suitability(customer_data)
    top_factors = explain_prediction(customer_data, fallback_score, fallback_category)

    return {
        "risk_score": float(np.round(fallback_score, 1)),
        "risk_profile": fallback_category,
        "confidence": 0.50,
        "confidence_tier": "Moderate (Baseline)",
        "probabilities": {cls: (0.60 if cls == fallback_category else 0.10) for cls in RISK_CLASSES},
        "top_factors": top_factors,
        "requires_abstention": False,
        "validation_warnings": validation_warnings,
        "model_version": "baseline-fiduciary-v1",
        "methodology": "Rule-Based Fiduciary Suitability Baseline (Fallback)"
    }
