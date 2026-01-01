from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from .ensemble_model import EnsembleModel


class GradientBoostingModel(EnsembleModel):
    """
    Gradient Boosting model for classification and regression tasks.
    """
    
    def __init__(self, config):
        super().__init__(config)
        self.n_estimators = config.get('n_estimators', 100)
        self.learning_rate = config.get('learning_rate', 0.1)
        self.max_depth = config.get('max_depth', 3)
        self.subsample = config.get('subsample', 1.0)
        self.random_state = config.get('random_state', 42)
    
    def build_model(self):
        """Build Gradient Boosting model"""
        if self.task_type == 'classification':
            self.model = GradientBoostingClassifier(
                n_estimators=self.n_estimators,
                learning_rate=self.learning_rate,
                max_depth=self.max_depth,
                subsample=self.subsample,
                random_state=self.random_state
            )
        else:
            self.model = GradientBoostingRegressor(
                n_estimators=self.n_estimators,
                learning_rate=self.learning_rate,
                max_depth=self.max_depth,
                subsample=self.subsample,
                random_state=self.random_state
            )
        return self.model
