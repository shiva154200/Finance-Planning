"""
Comprehensive ML Model Training, Benchmarking, Tuning, and Calibration Script.
Trains risk classification and continuous score regression models with zero data leakage.
"""

import sys
from pathlib import Path
import json
import datetime
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-GUI backend for clean background headless plotting
import matplotlib.pyplot as plt
import seaborn as sns

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, StratifiedKFold, KFold, cross_validate, GridSearchCV
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import (
    RandomForestClassifier, ExtraTreesClassifier,
    GradientBoostingClassifier, HistGradientBoostingClassifier,
    RandomForestRegressor, GradientBoostingRegressor
)
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score,
    confusion_matrix, classification_report, brier_score_loss,
    mean_absolute_error, mean_squared_error, r2_score, roc_auc_score
)
from sklearn.inspection import permutation_importance
from xgboost import XGBClassifier, XGBRegressor

from src.feature_engineering import (
    FinancialRatioTransformer,
    build_preprocessor_pipeline,
    RAW_NUMERICAL_COLS,
    RAW_CATEGORICAL_COLS
)
from src.labeling_framework import RISK_CLASSES
from src.risk_model import HybridRiskModel


def train_and_evaluate():
    models_dir = BASE_DIR / "models"
    reports_dir = BASE_DIR / "reports"
    plots_dir = reports_dir / "plots"
    models_dir.mkdir(parents=True, exist_ok=True)
    plots_dir.mkdir(parents=True, exist_ok=True)

    data_path = BASE_DIR / "datasets" / "customer_financial_profiles_v2.csv"
    if not data_path.exists():
        data_path = BASE_DIR / "datasets" / "customer_financial_profiles.csv"

    print(f"Loading training data from: {data_path}")
    df = pd.read_csv(data_path)

    feature_cols = RAW_NUMERICAL_COLS + RAW_CATEGORICAL_COLS
    X = df[feature_cols].copy()
    y_class_raw = df["target_risk_category"].copy()
    y_score = df["target_risk_score"].copy()

    # Map class labels to integers 0..4 for XGBoost / consistency
    class_to_idx = {cls: idx for idx, cls in enumerate(RISK_CLASSES)}
    idx_to_class = {idx: cls for idx, cls in enumerate(RISK_CLASSES)}
    y_class = y_class_raw.map(class_to_idx).fillna(2).astype(int)

    # 1. Held-out test set isolation (20%)
    X_train, X_test, y_train_cls, y_test_cls, y_train_score, y_test_score = train_test_split(
        X, y_class, y_score,
        test_size=0.20,
        random_state=42,
        stratify=y_class
    )
    print(f"Train size: {len(X_train)} | Isolated Test size: {len(X_test)}")

    # 2. Build feature engineering & preprocessing pipeline
    fe_transformer = FinancialRatioTransformer()
    preprocessor = build_preprocessor_pipeline()
    feature_prep = Pipeline([
        ("feature_engineering", fe_transformer),
        ("preprocessor", preprocessor)
    ])

    # Fit feature pipeline on training data only
    X_train_trans = feature_prep.fit_transform(X_train)
    X_test_trans = feature_prep.transform(X_test)

    # 3. Model Benchmark (Classification)
    print("\n--- Benchmarking Candidate Classification Models (5-Fold Stratified CV) ---")
    candidate_classifiers = {
        "LogisticRegression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42),
        "RandomForest": RandomForestClassifier(n_estimators=150, max_depth=8, class_weight="balanced", random_state=42),
        "ExtraTrees": ExtraTreesClassifier(n_estimators=150, max_depth=8, class_weight="balanced", random_state=42),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42),
        "HistGradientBoosting": HistGradientBoostingClassifier(max_iter=100, class_weight="balanced", random_state=42),
        "XGBoost": XGBClassifier(n_estimators=120, max_depth=4, eval_metric="mlogloss", random_state=42)
    }

    cv_cls = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    benchmark_results = {}

    for name, clf in candidate_classifiers.items():
        scores = cross_validate(
            clf, X_train_trans, y_train_cls,
            cv=cv_cls,
            scoring=["accuracy", "f1_macro", "f1_weighted"],
            n_jobs=-1
        )
        acc_mean = float(np.mean(scores["test_accuracy"]))
        acc_std = float(np.std(scores["test_accuracy"]))
        f1_macro_mean = float(np.mean(scores["test_f1_macro"]))
        f1_weighted_mean = float(np.mean(scores["test_f1_weighted"]))

        benchmark_results[name] = {
            "cv_accuracy_mean": round(acc_mean, 4),
            "cv_accuracy_std": round(acc_std, 4),
            "cv_f1_macro": round(f1_macro_mean, 4),
            "cv_f1_weighted": round(f1_weighted_mean, 4)
        }
        print(f"  {name:22s} | Acc: {acc_mean:.4f} (+/- {acc_std:.4f}) | Macro F1: {f1_macro_mean:.4f} | Weighted F1: {f1_weighted_mean:.4f}")

    # 4. Hyperparameter Tuning for Best Ensemble (Random Forest / XGBoost)
    print("\n--- Tuning Hyperparameters for Final Ensemble ---")
    param_grid = {
        "n_estimators": [100, 150, 200],
        "max_depth": [6, 8, 10],
        "min_samples_split": [2, 5],
        "min_samples_leaf": [1, 2]
    }
    grid_search = GridSearchCV(
        RandomForestClassifier(class_weight="balanced", random_state=42),
        param_grid,
        cv=cv_cls,
        scoring="f1_macro",
        n_jobs=-1
    )
    grid_search.fit(X_train_trans, y_train_cls)
    best_clf_raw = grid_search.best_estimator_
    print(f"  Best params: {grid_search.best_params_}")
    print(f"  Best CV Macro F1: {grid_search.best_score_:.4f}")

    # 5. Probability Calibration
    print("\n--- Calibrating Probabilities (CalibratedClassifierCV - Sigmoid / Platt) ---")
    calibrated_clf = CalibratedClassifierCV(best_clf_raw, cv=5, method="sigmoid")
    calibrated_clf.fit(X_train_trans, y_train_cls)

    # 6. Train Regressor for Continuous Risk Score
    print("\n--- Training Continuous Score Regressor ---")
    regressor = GradientBoostingRegressor(n_estimators=150, max_depth=4, learning_rate=0.08, random_state=42)
    regressor.fit(X_train_trans, y_train_score)

    # 7. Final Evaluation on Held-out Isolated Test Set
    print("\n================================================================")
    print("=== FINAL TEST SET EVALUATION ===")
    print("================================================================")
    y_test_pred_cls = calibrated_clf.predict(X_test_trans)
    y_test_proba = calibrated_clf.predict_proba(X_test_trans)
    y_test_pred_score = regressor.predict(X_test_trans)

    test_acc = accuracy_score(y_test_cls, y_test_pred_cls)
    test_f1_macro = f1_score(y_test_cls, y_test_pred_cls, average="macro")
    test_f1_weighted = f1_score(y_test_cls, y_test_pred_cls, average="weighted")
    test_precision_macro = precision_score(y_test_cls, y_test_pred_cls, average="macro", zero_division=0)
    test_recall_macro = recall_score(y_test_cls, y_test_pred_cls, average="macro", zero_division=0)

    # Multi-class Brier score
    y_test_one_hot = np.zeros((len(y_test_cls), len(RISK_CLASSES)))
    for i, label in enumerate(y_test_cls):
        y_test_one_hot[i, label] = 1.0
    brier = float(np.mean(np.sum((y_test_proba - y_test_one_hot) ** 2, axis=1)))

    # Multiclass ROC-AUC (OvR)
    try:
        test_roc_auc = float(roc_auc_score(y_test_cls, y_test_proba, multi_class="ovr", average="macro"))
    except Exception:
        test_roc_auc = None

    # Regression metrics
    reg_mae = mean_absolute_error(y_test_score, y_test_pred_score)
    reg_rmse = np.sqrt(mean_squared_error(y_test_score, y_test_pred_score))
    reg_r2 = r2_score(y_test_score, y_test_pred_score)

    print(f"Test Accuracy:         {test_acc:.4f}")
    print(f"Test Macro F1:         {test_f1_macro:.4f}")
    print(f"Test Weighted F1:      {test_f1_weighted:.4f}")
    print(f"Test Macro Precision:  {test_precision_macro:.4f}")
    print(f"Test Macro Recall:     {test_recall_macro:.4f}")
    print(f"Multi-class Brier:     {brier:.4f}")
    if test_roc_auc:
        print(f"Test ROC-AUC (OvR):    {test_roc_auc:.4f}")
    print(f"Regressor MAE:         {reg_mae:.4f}")
    print(f"Regressor RMSE:        {reg_rmse:.4f}")
    print(f"Regressor R2:          {reg_r2:.4f}")

    cls_report = classification_report(
        y_test_cls, y_test_pred_cls,
        target_names=RISK_CLASSES,
        output_dict=True,
        zero_division=0
    )
    print("\nClassification Report:")
    print(classification_report(y_test_cls, y_test_pred_cls, target_names=RISK_CLASSES, zero_division=0))

    # Confusion matrix plot
    cm = confusion_matrix(y_test_cls, y_test_pred_cls)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=RISK_CLASSES, yticklabels=RISK_CLASSES)
    plt.title("Confusion Matrix - Calibrated Risk Classifier")
    plt.xlabel("Predicted Class")
    plt.ylabel("Ground Truth Class")
    plt.tight_layout()
    plt.savefig(plots_dir / "confusion_matrix.png", dpi=300)
    plt.close()

    # Feature Importance (Permutation on Test Set)
    print("\n--- Computing Permutation Feature Importances ---")
    perm_importance = permutation_importance(calibrated_clf, X_test_trans, y_test_cls, n_repeats=10, random_state=42, n_jobs=-1)
    
    # Get feature names from ColumnTransformer
    cat_ohe_names = list(preprocessor.named_transformers_["cat"].get_feature_names_out(RAW_CATEGORICAL_COLS))
    num_names = list(preprocessor.named_transformers_["num"].feature_names_in_) if hasattr(preprocessor.named_transformers_["num"], "feature_names_in_") else [f"num_{i}" for i in range(X_train_trans.shape[1] - len(cat_ohe_names))]
    all_feature_names = num_names + cat_ohe_names
    
    top_indices = np.argsort(perm_importance.importances_mean)[::-1][:15]
    top_features = [all_feature_names[i] if i < len(all_feature_names) else f"feature_{i}" for i in top_indices]
    top_scores = [float(perm_importance.importances_mean[i]) for i in top_indices]

    plt.figure(figsize=(10, 6))
    sns.barplot(x=top_scores, y=top_features, palette="viridis")
    plt.title("Top 15 Permutation Feature Importances on Test Set")
    plt.xlabel("Mean Importance (Drop in F1/Accuracy)")
    plt.tight_layout()
    plt.savefig(plots_dir / "feature_importance.png", dpi=300)
    plt.close()

    # 8. Save Unified Hybrid Model
    metadata = {
        "model_version": "risk-model-v1.0.0",
        "training_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "model_type": "Calibrated Random Forest Classifier + Gradient Boosting Regressor",
        "dataset": str(data_path.name),
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "classes": RISK_CLASSES,
        "metrics": {
            "test_accuracy": round(test_acc, 4),
            "test_macro_f1": round(test_f1_macro, 4),
            "test_weighted_f1": round(test_f1_weighted, 4),
            "brier_score": round(brier, 4),
            "roc_auc_ovr": round(test_roc_auc, 4) if test_roc_auc else None,
            "regressor_mae": round(reg_mae, 4),
            "regressor_rmse": round(reg_rmse, 4),
            "regressor_r2": round(reg_r2, 4)
        },
        "top_features": dict(zip(top_features[:10], [round(s, 4) for s in top_scores[:10]])),
        "confidence_threshold_safety": 0.45
    }

    hybrid_model = HybridRiskModel(
        feature_pipeline=feature_prep,
        classifier=calibrated_clf,
        regressor=regressor,
        classes=RISK_CLASSES,
        metadata=metadata
    )

    model_save_path = models_dir / "risk_model.joblib"
    joblib.dump(hybrid_model, model_save_path)
    print(f"\nTrained Hybrid Model successfully saved to: {model_save_path}")

    metadata_path = models_dir / "model_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    # Save reports
    with open(reports_dir / "model_comparison.json", "w") as f:
        json.dump(benchmark_results, f, indent=2)

    with open(reports_dir / "evaluation_report.json", "w") as f:
        json.dump({
            "metadata": metadata,
            "benchmark_comparison": benchmark_results,
            "per_class_metrics": cls_report
        }, f, indent=2)

    print(f"Evaluation report and comparison saved to: {reports_dir}")
    return metadata

if __name__ == "__main__":
    train_and_evaluate()
