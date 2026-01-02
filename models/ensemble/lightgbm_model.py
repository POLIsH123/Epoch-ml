try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

from models.ensemble.ensemble_model import EnsembleModel


class LightGBMModel(EnsembleModel):
    """
    LightGBM model for classification and regression tasks.
    Requires lightgbm package to be installed.
    """
    
    def __init__(self, config):
        if not LIGHTGBM_AVAILABLE:
            raise ImportError("LightGBM not installed. Install with: pip install lightgbm")
        super().__init__(config)
        self.n_estimators = config.get('n_estimators', 100)
        self.learning_rate = config.get('learning_rate', 0.1)
        self.max_depth = config.get('max_depth', -1)  # -1 means no limit
        self.num_leaves = config.get('num_leaves', 31)
        self.random_state = config.get('random_state', 42)
    
    def build_model(self):
        """Build LightGBM model"""
        if self.task_type == 'classification':
            self.model = lgb.LGBMClassifier(
                n_estimators=self.n_estimators,
                learning_rate=self.learning_rate,
                max_depth=self.max_depth,
                num_leaves=self.num_leaves,
                random_state=self.random_state,
                n_jobs=-1,
                verbose=-1
            )
        else:
            self.model = lgb.LGBMRegressor(
                n_estimators=self.n_estimators,
                learning_rate=self.learning_rate,
                max_depth=self.max_depth,
                num_leaves=self.num_leaves,
                random_state=self.random_state,
                n_jobs=-1,
                verbose=-1
            )
        return self.model
