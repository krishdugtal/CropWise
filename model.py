import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

# Standard Crop Recommendations based on USDA Texture Classes
CROP_RECOMMENDATIONS = {
    "Sand":            ["Groundnut", "Watermelon", "Carrots", "Pears", "Cassava", "Millet", "Peaches", "Pecans", "Sunflowers", "Guava"],
    "Loamy Sand":      ["Potatoes", "Melons", "Asparagus", "Onions", "Sweet Potatoes", "Garlic", "Turnips", "Raspberries", "Plums", "Figs"],
    "Sandy Loam":      ["Sweetcorn", "Tomatoes", "Peppers", "Berries", "Grapes", "Citrus", "Radishes", "Apples", "Apricots", "Zucchini"],
    "Loam":            ["Corn", "Soybeans", "Cotton", "General Vegetables", "Wheat", "Barley", "Strawberries", "Cherries", "Orchard Fruits", "Peas"],
    "Silt Loam":       ["Wheat", "Potatoes", "Sugar Beet", "Vining Peas", "Bulbs", "Field Vegetables", "Cabbage", "Lettuce", "Parsnips"],
    "Silt":            ["Wheat", "Small fruits", "Ferns", "Grasses", "Hops", "Flax", "Pomegranates"],
    "Sandy Clay Loam": ["Cotton", "Sorghum", "Cowpeas", "Oats", "Chili Peppers", "Beans", "Millet", "Pumpkin"],
    "Clay Loam":       ["Alfalfa", "Sunflowers", "Heavy grains", "Hemp", "Safflower", "Canola", "Sugar Cane", "Tobacco"],
    "Silty Clay Loam": ["Barley", "Oats", "Rice", "Mustard", "Faba Beans", "Chickpeas", "Lentils", "Flaxseed"],
    "Sandy Clay":      ["Deep-rooted trees", "Orchard fruits", "Walnuts", "Almonds", "Pistachios", "Pecans", "Hazelnut"],
    "Silty Clay":      ["Rice", "Forage crops", "Soybeans", "Sorghum", "Clover", "Ryegrass", "Buckwheat"],
    "Clay":            ["Paddy", "Sugarcane", "Broccoli", "Cabbage", "Cauliflower", "Brussels Sprouts", "Kale", "Taro", "Lotus Root"],
}

# Advanced Scientific Characteristics for the PDF Detailed Report
SOIL_CHARACTERISTICS = {
    "Sand": {
        "ph_level": "Slightly acidic (5.5 - 6.5)",
        "water_retention": "Extremely Low — Drains very rapidly",
        "porosity": "High macroporosity, excellent aeration",
        "erosion_risk": "High susceptibility to wind erosion"
    },
    "Loamy Sand": {
        "ph_level": "Neutral (6.0 - 7.0)",
        "water_retention": "Low — Needs frequent light irrigation",
        "porosity": "High aeration, loose structure",
        "erosion_risk": "Moderate wind erosion risk"
    },
    "Sandy Loam": {
        "ph_level": "Neutral to slightly acidic (5.8 - 7.0)",
        "water_retention": "Moderate — Good balance of drainage",
        "porosity": "Excellent tillability and airflow",
        "erosion_risk": "Low to Moderate"
    },
    "Loam": {
        "ph_level": "Optimal Neutral (6.5 - 7.5)",
        "water_retention": "Excellent — The gold standard for farming",
        "porosity": "Perfect balance of macro and micropores",
        "erosion_risk": "Low (Highly stable aggregate structure)"
    },
    "Silt Loam": {
        "ph_level": "Slightly acidic (6.0 - 6.8)",
        "water_retention": "High — Holds significant plant available water",
        "porosity": "Moderate, fine-textured but aerated",
        "erosion_risk": "High susceptibility to water erosion"
    },
    "Silt": {
        "ph_level": "Neutral (6.5 - 7.0)",
        "water_retention": "Very High — Can become waterlogged easily",
        "porosity": "Low aeration, prone to crusting",
        "erosion_risk": "Extremely high water erosion risk"
    },
    "Sandy Clay Loam": {
        "ph_level": "Slightly Alkaline (6.5 - 7.8)",
        "water_retention": "Moderate to High",
        "porosity": "Moderate, holds nutrients well",
        "erosion_risk": "Low"
    },
    "Clay Loam": {
        "ph_level": "Neutral to slightly alkaline (6.8 - 7.8)",
        "water_retention": "High — Excellent nutrient holding capacity",
        "porosity": "Lower aeration, requires careful tilling",
        "erosion_risk": "Low"
    },
    "Silty Clay Loam": {
        "ph_level": "Neutral (6.5 - 7.2)",
        "water_retention": "Very High — Slowly permeable",
        "porosity": "Low porosity, heavy texture",
        "erosion_risk": "Moderate to High"
    },
    "Sandy Clay": {
        "ph_level": "Slightly Acidic (5.8 - 6.5)",
        "water_retention": "Moderate",
        "porosity": "Low aeration, prone to compaction",
        "erosion_risk": "Low"
    },
    "Silty Clay": {
        "ph_level": "Neutral (6.0 - 7.0)",
        "water_retention": "Very High",
        "porosity": "Very low aeration, extremely cohesive",
        "erosion_risk": "Moderate"
    },
    "Clay": {
        "ph_level": "Alkaline tendency (7.0 - 8.0)",
        "water_retention": "Maximum — Extremely high runoff potential",
        "porosity": "Microporous only, essentially zero aeration",
        "erosion_risk": "Low wind erosion, high runoff risk"
    }
}

def generate_dataset():
    """
    Generate an extremely balanced, highly dimensional synthetic dataset for soil classification.
    We inject 10 random soil particle diameters in mm rigorously tuned to avoid cluster-bias.
    """
    np.random.seed(42)
    X, y = [], []

    def add_samples(n, label, prob_sand, prob_silt, prob_clay):
        for _ in range(n):
            row = []
            for _ in range(10):
                r = np.random.random()
                if r < prob_sand:
                    val = np.random.uniform(0.05, 2.0)
                elif r < prob_sand + prob_silt:
                    val = np.random.uniform(0.002, 0.05)
                else:
                    val = np.random.uniform(0.0001, 0.002)
                row.append(round(val, 4))
            X.append(row)
            y.append(label)

    # By tightening the probabilities specifically for Random Forest, we eliminate "Silt" defaulting.
    add_samples(200, "Sand",            0.90, 0.05, 0.05)
    add_samples(200, "Loamy Sand",      0.80, 0.10, 0.10)
    add_samples(200, "Sandy Loam",      0.65, 0.20, 0.15)
    add_samples(200, "Loam",            0.40, 0.40, 0.20)
    add_samples(200, "Silt Loam",       0.20, 0.65, 0.15)
    add_samples(200, "Silt",            0.05, 0.90, 0.05)
    add_samples(200, "Sandy Clay Loam", 0.55, 0.15, 0.30)
    add_samples(200, "Clay Loam",       0.30, 0.35, 0.35)
    add_samples(200, "Silty Clay Loam", 0.10, 0.55, 0.35)
    add_samples(200, "Sandy Clay",      0.50, 0.05, 0.45)
    add_samples(200, "Silty Clay",      0.05, 0.45, 0.50)
    add_samples(200, "Clay",            0.15, 0.15, 0.70)

    return np.array(X, dtype=float), np.array(y)


class SoilClassifier:
    def __init__(self):
        # We replace basic K-NN with a highly scalable Random Forest ensemble model.
        self.model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.accuracy = 0.0
        self.classes_ = list(CROP_RECOMMENDATIONS.keys())
        self.model_path = 'model.pkl'
        self.scaler_path = 'scaler.pkl'

    def train(self):
        """
        Trains the logic and officially serializes (pickles) the ML brain to disk.
        """
        # If we already have a pickled version locally, skip training and just load it into memory
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.is_trained = True
            print(f"[CropWise] Cached RandomForest model loaded from disk.")
            return

        print("[CropWise] No cached model found. Bootstrapping training process...")
        X, y = generate_dataset()
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled  = self.scaler.transform(X_test)

        self.model.fit(X_train_scaled, y_train)
        y_pred = self.model.predict(X_test_scaled)
        self.accuracy = round(accuracy_score(y_test, y_pred), 4)
        
        # Serialize the model exactly as done in scalable tech pipelines
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)

        self.is_trained = True
        print(f"[CropWise] RandomForest Model trained & Pickled | Test accuracy={self.accuracy:.2%}")

    def predict(self, values: list):
        if not self.is_trained:
            raise RuntimeError("Model not trained and no .pkl found.")
        if len(values) != 10:
            raise ValueError("Expected exactly 10 soil feature values.")

        arr = np.array(values, dtype=float).reshape(1, -1)
        arr_scaled = self.scaler.transform(arr)

        soil_type = self.model.predict(arr_scaled)[0]
        proba = self.model.predict_proba(arr_scaled)[0]
        classes = self.model.classes_
        confidence = float(proba[list(classes).index(soil_type)])

        # RandomForest provides feature importances, rather than simple "distances"
        crops = CROP_RECOMMENDATIONS.get(soil_type, [])
        details = SOIL_CHARACTERISTICS.get(soil_type, {})

        return {
            "soil_type": soil_type,
            "recommended_crops": crops,
            "confidence": round(confidence, 4),
            "model_accuracy": self.accuracy,
            "all_probabilities": {
                cls: round(float(p), 4)
                for cls, p in zip(classes, proba)
            },
            "agronomy_details": details
        }
