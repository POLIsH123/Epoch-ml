try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

from models.ensemble.ensemble_model import EnsembleModel


class XGBoostModel(EnsembleModel):
    """
    XGBoost model for classification and regression tasks.
    Requires xgboost package to be installed.
    """
    
    def __init__(self, config):
        if not XGBOOST_AVAILABLE:
            raise ImportError("XGBoost not installed. Install with: pip install xgboost")
        super().__init__(config)
        self.n_estimators = config.get('n_estimators', 100)
        self.learning_rate = config.get('learning_rate', 0.1)
        self.max_depth = config.get('max_depth', 6)
        self.subsample = config.get('subsample', 1.0)
        self.random_state = config.get('random_state', 42)
    
    def build_model(self):
        """Build XGBoost model"""
        if self.task_type == 'classification':
            self.model = xgb.XGBClassifier(
                n_estimators=self.n_estimators,
                learning_rate=self.learning_rate,
                max_depth=self.max_depth,
                subsample=self.subsample,
                random_state=self.random_state,
                use_label_encoder=False,
                eval_metric='logloss'
            )
        else:
            self.model = xgb.XGBRegressor(
                n_estimators=self.n_estimators,
                learning_rate=self.learning_rate,
                max_depth=self.max_depth,
                subsample=self.subsample,
                random_state=self.random_state
            )
        return self.model
