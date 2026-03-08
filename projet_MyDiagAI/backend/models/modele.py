# backend/models/modele.py
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
import joblib
import os

class SymptomPredictor:
    def __init__(self):
        # VOTRE LISTE EXACTE DES 50 SYMPTÔMES
        self.SYMPTOMS_LIST = [
            'anxiety and nervousness', 'depression', 'shortness of breath',
            'sharp chest pain', 'dizziness', 'insomnia', 'palpitations',
            'irregular heartbeat', 'breathing fast', 'hoarse voice',
            'sore throat', 'difficulty speaking', 'cough', 'nasal congestion',
            'throat swelling', 'difficulty in swallowing', 'vomiting',
            'headache', 'nausea', 'diarrhea', 'painful urination',
            'frequent urination', 'blood in urine', 'hand or finger pain',
            'arm pain', 'back pain', 'neck pain', 'low back pain',
            'knee pain', 'foot or toe pain', 'ankle pain', 'joint pain',
            'muscle pain', 'muscle stiffness or tightness', 'fatigue',
            'fever', 'chills', 'weight gain', 'recent weight loss',
            'decreased appetite', 'excessive appetite', 'swollen lymph nodes',
            'skin rash', 'skin lesion', 'acne or pimples', 'mouth ulcer',
            'eye redness', 'diminished vision', 'double vision', 'seizures'
        ]
        
        # Mapping des maladies vers les spécialités
        self.SPECIALTY_MAP = {
            'panic disorder': 'Psychiatre',
            'vocal cord polyp': 'ORL',
            'turner syndrome': 'Endocrinologue',
            'cryptorchidism': 'Urologue',
            'poisoning due to ethylene glycol': 'Urgentiste',
            'atrophic vaginitis': 'Gynécologue',
            'allergy': 'Allergologue',
            'otitis media': 'ORL',
            'acute bronchiolitis': 'Pneumologue'
        }
        
        self.model = None
        self.load_or_train_model()
    
    def load_or_train_model(self):
        """Charge le modèle existant ou l'entraîne"""
        model_path = 'models/symptom_model.pkl'
        data_path = 'models/data.csv'
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            print(f"✅ Modèle chargé depuis {model_path}")
        elif os.path.exists(data_path):
            self.train_model(data_path)
        else:
            print("⚠️ Aucun modèle ou dataset trouvé")
    
    def train_model(self, data_path):
        """Entraîne le modèle à partir du dataset"""
        try:
            data = pd.read_csv(data_path)
            X = data.drop('diseases', axis=1)
            Y = data['diseases']
            
            self.model = LogisticRegression(max_iter=1000)
            self.model.fit(X, Y)
            
            score = self.model.score(X, Y)
            print(f"✅ Modèle entraîné avec score: {score:.4f}")
            
            joblib.dump(self.model, 'models/symptom_model.pkl')
        except Exception as e:
            print(f"❌ Erreur entraînement: {e}")
    
    def predict_specialty(self, user_symptoms):
        """Prédit la spécialité à partir des symptômes"""
        if self.model is None:
            return {
                'success': False,
                'error': 'Modèle non disponible'
            }
        
        # Créer le vecteur d'entrée
        input_vector = [0] * 50
        symptoms_found = []
        
        for i, symptom in enumerate(self.SYMPTOMS_LIST):
            for user_s in user_symptoms:
                if user_s.lower() in symptom.lower():
                    input_vector[i] = 1
                    symptoms_found.append(symptom)
                    break
        
        # Prédiction
        features = pd.DataFrame([input_vector], columns=self.SYMPTOMS_LIST)
        disease = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        
        # Spécialité
        specialty = self.SPECIALTY_MAP.get(disease, 'Généraliste')
        
        # Top 3
        top_indices = np.argsort(probabilities)[-3:][::-1]
        top_diseases = []
        for idx in top_indices:
            if probabilities[idx] > 0.05:
                d = self.model.classes_[idx]
                top_diseases.append({
                    'maladie': d,
                    'probabilite': float(probabilities[idx]),
                    'specialite': self.SPECIALTY_MAP.get(d, 'Généraliste')
                })
        
        return {
            'success': True,
            'symptoms_found': symptoms_found,
            'disease': disease,
            'specialty': specialty,
            'confidence': float(probabilities[list(self.model.classes_).index(disease)]),
            'top_diseases': top_diseases
        }
    
    def get_all_symptoms(self):
        return self.SYMPTOMS_LIST

predictor = SymptomPredictor()