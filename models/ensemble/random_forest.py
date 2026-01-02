from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from models.ensemble.ensemble_model import EnsembleModel


class RandomForestModel(EnsembleModel):
    """
    Random Forest model for classification and regression tasks.
    """
    
    def __init__(self, config):
        super().__init__(config)
        self.n_estimators = config.get('n_estimators', 100)
        self.max_depth = config.get('max_depth', None)
        self.min_samples_split = config.get('min_samples_split', 2)
        self.min_samples_leaf = config.get('min_samples_leaf', 1)
        self.random_state = config.get('random_state', 42)
    
    def build_model(self):
        """Build Random Forest model"""
        if self.task_type == 'classification':
            self.model = RandomForestClassifier(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                min_samples_leaf=self.min_samples_leaf,
                random_state=self.random_state,
                n_jobs=-1
            )
        else:
            self.model = RandomForestRegressor(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                min_samples_leaf=self.min_samples_leaf,
                random_state=self.random_state,
                n_jobs=-1
            )
        return self.model
