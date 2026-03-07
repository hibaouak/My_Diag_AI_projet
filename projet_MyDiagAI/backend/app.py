print("🔥 app.py est bien exécuté")
# backend/app.py - VERSION POUR MÉDECIN
from flask import Flask, request, jsonify
print("🔥 Flask importé avec succès")
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
import os
import sys
import traceback
from datetime import datetime, timedelta
import random
import json
from collections import defaultdict, Counter
import hashlib

print("=" * 60)
print(f"MyDiagAI Backend - VERSION MÉDECIN - Python {sys.version.split()[0]}")
print("=" * 60)

# Charger les variables d'environnement
load_dotenv()

# Initialiser Flask
app = Flask(__name__)

# Configuration CORS COMPLÈTE
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:8080", "http://localhost:8081", "http://127.0.0.1:8080", "http://127.0.0.1:8081", "http://localhost:5173", "http://127.0.0.1:5173"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True
     }})

# OU solution simple :
CORS(app, origins="*")  # Pour le développement seulement

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'modeles_medical')
HISTORY_FILE = os.path.join(os.path.dirname(__file__), 'diagnostics_history.json')
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')  # Fichier pour stocker les utilisateurs
print(f"📁 Chemin des modèles: {MODEL_PATH}")
print(f"📁 Fichier d'historique: {HISTORY_FILE}")
print(f"📁 Fichier des utilisateurs: {USERS_FILE}")

# Vérifier l'existence du dossier
if not os.path.exists(MODEL_PATH):
    print(f"❌ ERREUR: Le dossier '{MODEL_PATH}' n'existe pas!")
    print(f"   Créez-le et placez-y les fichiers de modèles:")
    print(f"   - modele_random_forest.pkl")
    print(f"   - encodeur_maladies.pkl")
    print(f"   - normaliseur_age.pkl")
    print(f"   - liste_symptomes.txt")

# Initialiser l'historique et les utilisateurs
diagnostics_history = []
users = {}

# ==================== GESTION DES UTILISATEURS ====================

def hash_password(password):
    """Hacher un mot de passe de manière simple"""
    return hashlib.sha256(password.encode()).hexdigest()

def load_users():
    """Charger les utilisateurs depuis le fichier"""
    global users
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                users = json.load(f)
            print(f"✅ Utilisateurs chargés: {len(users)} utilisateurs")
        else:
            users = {}
            print("✅ Aucun fichier utilisateurs, initialisation")
    except Exception as e:
        print(f"❌ Erreur chargement utilisateurs: {e}")
        users = {}

def save_users():
    """Sauvegarder les utilisateurs dans le fichier"""
    try:
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
        print(f"✅ Utilisateurs sauvegardés: {len(users)} utilisateurs")
    except Exception as e:
        print(f"❌ Erreur sauvegarde utilisateurs: {e}")

def register_user(full_name, email, password):
    """Enregistrer un nouvel utilisateur"""
    if email in users:
        return False, "Cet email est déjà utilisé"
    
    user_id = str(len(users) + 1)
    users[email] = {
        'id': user_id,
        'full_name': full_name,
        'email': email,
        'password_hash': hash_password(password),
        'created_at': datetime.now().isoformat(),
        'role': 'doctor'  # Par défaut tous les utilisateurs sont médecins
    }
    
    save_users()
    return True, "Utilisateur créé avec succès"

def authenticate_user(email, password):
    """Authentifier un utilisateur"""
    if email not in users:
        return False, None, "Email ou mot de passe incorrect"
    
    user = users[email]
    if user['password_hash'] != hash_password(password):
        return False, None, "Email ou mot de passe incorrect"
    
    # Retourner les informations utilisateur sans le mot de passe
    user_info = user.copy()
    user_info.pop('password_hash', None)
    return True, user_info, "Connexion réussie"

def ensure_history_file():
    """S'assurer que le fichier d'historique existe"""
    try:
        if not os.path.exists(HISTORY_FILE):
            print(f"📝 Création du fichier d'historique: {HISTORY_FILE}")
            # Créer le dossier parent si nécessaire
            os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
            # Créer le fichier avec un tableau vide
            with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print(f"✅ Fichier d'historique créé")
        else:
            print(f"✅ Fichier d'historique existe déjà")
    except Exception as e:
        print(f"❌ Erreur lors de la création du fichier d'historique: {e}")
        traceback.print_exc()

def load_history():
    """Charger l'historique des diagnostics"""
    global diagnostics_history
    try:
        print(f"📂 Chargement de l'historique depuis: {HISTORY_FILE}")
        
        # S'assurer que le fichier existe
        ensure_history_file()
        
        if os.path.exists(HISTORY_FILE):
            file_size = os.path.getsize(HISTORY_FILE)
            print(f"   Taille du fichier: {file_size} octets")
            
            if file_size == 0:
                print("⚠️ Fichier vide, initialisation avec tableau vide")
                diagnostics_history = []
                # Réécrire un tableau vide
                with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
                    json.dump([], f, ensure_ascii=False, indent=2)
            else:
                with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                    diagnostics_history = json.load(f)
                
                # Vérifier que c'est bien une liste
                if not isinstance(diagnostics_history, list):
                    print("⚠️ Format invalide, réinitialisation")
                    diagnostics_history = []
                    save_history()
                
                print(f"✅ Historique chargé: {len(diagnostics_history)} diagnostics")
        else:
            print("❌ Fichier non trouvé après création")
            diagnostics_history = []
            
    except json.JSONDecodeError as e:
        print(f"❌ Erreur JSON dans le fichier d'historique: {e}")
        print("⚠️ Réinitialisation de l'historique")
        diagnostics_history = []
        save_history()
    except Exception as e:
        print(f"❌ Erreur lors du chargement de l'historique: {e}")
        traceback.print_exc()
        diagnostics_history = []

def save_history():
    """Sauvegarder l'historique des diagnostics"""
    try:
        print(f"💾 Sauvegarde de l'historique dans: {HISTORY_FILE}")
        print(f"   Nombre de diagnostics à sauvegarder: {len(diagnostics_history)}")
        
        # S'assurer que le dossier existe
        os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
        
        # Sauvegarder
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(diagnostics_history, f, ensure_ascii=False, indent=2)
        
        # Vérifier la sauvegarde
        file_size = os.path.getsize(HISTORY_FILE)
        print(f"✅ Historique sauvegardé")
        print(f"   Taille du fichier: {file_size} octets")
        
    except Exception as e:
        print(f"❌ Erreur lors de la sauvegarde de l'historique: {e}")
        traceback.print_exc()

def generate_initial_demo_data():
    """Générer des données initiales si l'historique est vide"""
    global diagnostics_history
    try:
        if len(diagnostics_history) == 0:
            print("📝 Génération de données de démonstration initiales...")
            
            demo_patients = [
                {'name': 'Jean Dupont', 'age': 35, 'gender': 'M'},
                {'name': 'Marie Curie', 'age': 28, 'gender': 'F'},
                {'name': 'Pierre Martin', 'age': 42, 'gender': 'M'},
                {'name': 'Sophie Laurent', 'age': 31, 'gender': 'F'},
            ]
            
            demo_diseases = [
                'Grippe saisonnière',
                'Migraine',
                'Bronchite aiguë',
                'Gastro-entérite',
                'Sinusite',
            ]
            
            # Liste COMPLÈTE des symptômes
            demo_symptoms = [
                'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering',
                'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting',
                'vomiting', 'burning_micturition', 'spotting_urination', 'fatigue', 'weight_gain',
                'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
                'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever',
                'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion',
                'headache', 'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite',
                'pain_behind_the_eyes', 'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea',
                'mild_fever', 'yellow_urine', 'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload',
                'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision',
                'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose',
                'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements',
                'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness',
                'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels',
                'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties',
                'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech',
                'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints',
                'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness',
                'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of_urine',
                'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_typhos',
                'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body',
                'belly_pain', 'abnormal_menstruation', 'dischromic_patches', 'watering_from_eyes',
                'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum',
                'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion',
                'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen',
                'history_of_alcohol_consumption', 'fluid_overload', 'blood_in_sputum', 'prominent_veins_on_calf',
                'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring',
                'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails',
                'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
            ]
            
            for i in range(5):
                patient = demo_patients[i % len(demo_patients)]
                disease = demo_diseases[i % len(demo_diseases)]
                symptoms = random.sample(demo_symptoms, random.randint(2, 4))
                
                diagnostic_record = {
                    'id': str(i + 1),
                    'patient_name': patient['name'],
                    'age': patient['age'],
                    'gender': patient['gender'],
                    'symptoms': symptoms,
                    'results': [{
                        'disease': disease,
                        'probability_percent': random.randint(75, 95),
                        'probability_decimal': round(random.uniform(0.75, 0.95), 2),
                        'confidence_level': 'ÉLEVÉE - Diagnostic plausible',
                        'medical_action': 'Diagnostic principal à considérer',
                        'specific_guidance': f'Conseil médical pour {disease}',
                        'suggested_tests': ['Examen clinique', 'Analyses sanguines'],
                        'risk_level': 'Modéré'
                    }],
                    'timestamp': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
                }
                
                diagnostics_history.append(diagnostic_record)
            
            save_history()
            print(f"✅ {len(diagnostics_history)} diagnostics de démonstration générés")
        else:
            print(f"✅ Historique déjà peuplé: {len(diagnostics_history)} diagnostics")
            
    except Exception as e:
        print(f"❌ Erreur lors de la génération des données initiales: {e}")
        traceback.print_exc()

# Charger les modèles au démarrage
print("\n⏳ Chargement des modèles...")
try:
    # Utiliser des chemins absolus
    model_path = os.path.join(MODEL_PATH, 'modele_random_forest.pkl')
    encoder_path = os.path.join(MODEL_PATH, 'encodeur_maladies.pkl')
    scaler_path = os.path.join(MODEL_PATH, 'normaliseur_age.pkl')
    symptoms_path = os.path.join(MODEL_PATH, 'liste_symptomes.txt')
    
    print(f"🔍 Recherche des fichiers:")
    print(f"   • {model_path}")
    print(f"   • {encoder_path}")
    print(f"   • {scaler_path}")
    print(f"   • {symptoms_path}")
    
    # Vérifier que tous les fichiers existent
    for path, name in [
        (model_path, "modele_random_forest.pkl"),
        (encoder_path, "encodeur_maladies.pkl"),
        (scaler_path, "normaliseur_age.pkl"),
        (symptoms_path, "liste_symptomes.txt")
    ]:
        if not os.path.exists(path):
            print(f"   ❌ {name}: NON TROUVÉ")
        else:
            print(f"   ✅ {name}: OK ({os.path.getsize(path)} octets)")
    
    # Charger les modèles
    model = joblib.load(model_path)
    print(f"\n✅ Modèle RandomForest chargé")
    print(f"   Type: {type(model)}")
    print(f"   Nombre d'estimateurs: {model.n_estimators if hasattr(model, 'n_estimators') else 'N/A'}")
    
    label_encoder = joblib.load(encoder_path)
    print(f"✅ Encodeur de maladies chargé")
    print(f"   Nombre de maladies: {len(label_encoder.classes_)}")
    
    scaler = joblib.load(scaler_path)
    print(f"✅ Normaliseur chargé")
    print(f"   Type: {type(scaler)}")
    
    # Charger la liste des symptômes
    with open(symptoms_path, 'r', encoding='utf-8') as f:
        symptoms_list = [line.strip() for line in f]
    
    print(f"✅ {len(symptoms_list)} symptômes chargés")
    
    # Afficher TOUS les symptômes
    print(f"\n📋 LISTE COMPLÈTE DES {len(symptoms_list)} SYMPTÔMES:")
    for i, symptom in enumerate(symptoms_list):
        print(f"   {i+1:3d}. {symptom}")
    
except FileNotFoundError as e:
    print(f"\n❌ FICHIER MANQUANT: {e}")
    print("\n⚠️  MODE SIMULATION ACTIVÉ")
    print("   Le serveur fonctionnera mais avec des données simulées")
    
    # Liste COMPLÈTE des 132 symptômes
    symptoms_list = [
        'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering',
        'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting',
        'vomiting', 'burning_micturition', 'spotting_urination', 'fatigue', 'weight_gain',
        'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
        'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever',
        'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion',
        'headache', 'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite',
        'pain_behind_the_eyes', 'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea',
        'mild_fever', 'yellow_urine', 'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload',
        'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision',
        'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose',
        'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements',
        'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness',
        'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels',
        'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties',
        'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech',
        'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints',
        'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness',
        'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of_urine',
        'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_typhos',
        'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body',
        'belly_pain', 'abnormal_menstruation', 'dischromic_patches', 'watering_from_eyes',
        'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum',
        'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion',
        'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen',
        'history_of_alcohol_consumption', 'fluid_overload', 'blood_in_sputum', 'prominent_veins_on_calf',
        'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring',
        'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails',
        'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
    ]
    
    print(f"✅ {len(symptoms_list)} symptômes chargés en mode simulation")
    
    # Afficher TOUS les symptômes en mode simulation aussi
    print(f"\n📋 LISTE COMPLÈTE DES {len(symptoms_list)} SYMPTÔMES (MODE SIMULATION):")
    for i, symptom in enumerate(symptoms_list):
        print(f"   {i+1:3d}. {symptom}")
    
    model = None
    label_encoder = None
    scaler = None
    
except Exception as e:
    print(f"\n❌ ERREUR DE CHARGEMENT: {type(e).__name__}: {e}")
    traceback.print_exc()
    print("\n⚠️  MODE SIMULATION ACTIVÉ")
    
    # Liste COMPLÈTE des 132 symptômes
    symptoms_list = [
        'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering',
        'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting',
        'vomiting', 'burning_micturition', 'spotting_urination', 'fatigue', 'weight_gain',
        'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
        'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever',
        'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion',
        'headache', 'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite',
        'pain_behind_the_eyes', 'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea',
        'mild_fever', 'yellow_urine', 'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload',
        'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision',
        'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose',
        'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements',
        'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness',
        'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels',
        'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties',
        'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech',
        'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints',
        'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness',
        'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of_urine',
        'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_typhos',
        'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body',
        'belly_pain', 'abnormal_menstruation', 'dischromic_patches', 'watering_from_eyes',
        'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum',
        'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion',
        'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen',
        'history_of_alcohol_consumption', 'fluid_overload', 'blood_in_sputum', 'prominent_veins_on_calf',
        'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring',
        'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails',
        'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
    ]
    
    print(f"✅ {len(symptoms_list)} symptômes chargés en mode simulation")
    
    # Afficher TOUS les symptômes en mode simulation aussi
    print(f"\n📋 LISTE COMPLÈTE DES {len(symptoms_list)} SYMPTÔMES (MODE SIMULATION):")
    for i, symptom in enumerate(symptoms_list):
        print(f"   {i+1:3d}. {symptom}")
    
    model = None
    label_encoder = None
    scaler = None

# ==================== CHARGEMENT DE L'HISTORIQUE ET UTILISATEURS ====================

print("\n📂 Chargement de l'historique des diagnostics...")
load_history()

print("\n👥 Chargement des utilisateurs...")
load_users()

# Créer un utilisateur par défaut si aucun utilisateur n'existe
if len(users) == 0:
    print("📝 Création d'un utilisateur par défaut...")
    register_user("Dr. Admin", "admin@diagnostic.com", "admin123")
    print("✅ Utilisateur par défaut créé:")
    print("   Email: admin@diagnostic.com")
    print("   Mot de passe: admin123")

# Générer des données de démonstration si l'historique est vide
generate_initial_demo_data()

# ==================== ROUTES D'AUTHENTIFICATION ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Enregistrer un nouvel utilisateur"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        required_fields = ['full_name', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Champ manquant: {field}'}), 400
        
        full_name = data['full_name']
        email = data['email'].lower()
        password = data['password']
        
        # Validation simple
        if len(password) < 4:
            return jsonify({'error': 'Le mot de passe doit contenir au moins 4 caractères'}), 400
        
        success, message = register_user(full_name, email, password)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'user': {
                    'email': email,
                    'full_name': full_name
                }
            }), 201
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        print(f"❌ Erreur lors de l'enregistrement: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Connecter un utilisateur"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        email = data.get('email', '').lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        success, user_info, message = authenticate_user(email, password)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'user': user_info,
                'token': f"user_{user_info['id']}"  # Token simple pour identification
            }), 200
        else:
            return jsonify({'error': message}), 401
            
    except Exception as e:
        print(f"❌ Erreur lors de la connexion: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/users', methods=['GET'])
def list_users():
    """Lister tous les utilisateurs (pour débogage)"""
    try:
        # Retourner la liste des utilisateurs sans les mots de passe
        users_list = []
        for email, user in users.items():
            user_copy = user.copy()
            user_copy.pop('password_hash', None)
            users_list.append(user_copy)
        
        return jsonify({
            'count': len(users_list),
            'users': users_list
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ROUTES ====================

@app.route('/')
def home():
    """Page d'accueil de l'API pour médecin"""
    return jsonify({
        'message': 'MyDiagAI Backend API - VERSION MÉDECIN',
        'version': '1.0.0',
        'user_type': 'médecin',
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            '/': 'Page d\'accueil (cette page)',
            '/api/health': 'État du serveur',
            '/api/auth/login': 'Connexion utilisateur (POST)',
            '/api/auth/register': 'Enregistrement utilisateur (POST)',
            '/api/auth/users': 'Liste utilisateurs (GET, debug)',
            '/api/symptoms': 'Liste des symptômes disponibles',
            '/api/diseases': 'Liste des maladies connues',
            '/api/debug': 'Informations de débogage technique',
            '/api/debug/history': 'Debug de l\'historique',
            '/api/diagnose': 'Effectuer un diagnostic (POST)',
            '/api/history': 'Historique des diagnostics (GET)',
            '/api/stats': 'Statistiques globales (GET)',
            '/api/dashboard': 'Données pour le dashboard (GET)'
        },
        'stats': {
            'total_diagnostics': len(diagnostics_history),
            'total_patients': len(set(d['patient_name'] for d in diagnostics_history if 'patient_name' in d)),
            'total_users': len(users),
            'symptoms_count': len(symptoms_list),
            'history_file': HISTORY_FILE,
            'users_file': USERS_FILE
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état du serveur"""
    return jsonify({
        'status': 'healthy',
        'service': 'MyDiagAI - Assistant Diagnostic pour Médecin',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model is not None,
        'symptoms_available': len(symptoms_list),
        'diagnostics_count': len(diagnostics_history),
        'users_count': len(users),
        'mode': 'PRODUCTION' if model is not None else 'SIMULATION',
        'user_type': 'médecin',
        'history_file': HISTORY_FILE,
        'history_file_exists': os.path.exists(HISTORY_FILE),
        'users_file': USERS_FILE,
        'users_file_exists': os.path.exists(USERS_FILE)
    })

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    """Retourne la liste complète des symptômes disponibles"""
    return jsonify({
        'count': len(symptoms_list),
        'symptoms': symptoms_list,  # Retourne TOUTE la liste
        'note': f'{len(symptoms_list)} symptômes disponibles pour le diagnostic',
        'example_request': {
            'method': 'POST',
            'url': '/api/diagnose',
            'body': {
                'symptoms': ['fever', 'cough', 'headache'],
                'age': 30,
                'gender': 'M',
                'patient_name': 'Nom du patient',
                'additional_notes': 'Notes cliniques optionnelles',
                'doctor_email': 'email@medecin.com'
            }
        }
    })

@app.route('/api/diseases', methods=['GET'])
def get_diseases():
    """Retourne la liste des maladies que le modèle connaît"""
    if label_encoder is None:
        # En mode simulation, retourner une liste de maladies simulées
        simulated_diseases = [
            'Allergy', 'Diabetes', 'Gastroenteritis', 'Hypertension', 'Migraine',
            'Bronchial Asthma', 'Common Cold', 'Dengue', 'Typhoid', 'Hepatitis A',
            'Hepatitis B', 'Hepatitis C', 'Hepatitis D', 'Hepatitis E', 'Alcoholic hepatitis',
            'Tuberculosis', 'Heart attack', 'Varicose veins', 'Hypothyroidism', 'Hyperthyroidism',
            'Hypoglycemia', 'Osteoarthristis', 'Arthritis', 'Paralysis (brain hemorrhage)',
            'Jaundice', 'Malaria', 'Chicken pox', 'Dengue', 'Typhoid', 'hepatitis A',
            'Hepatitis B', 'Hepatitis C', 'Hepatitis D', 'Hepatitis E', 'Alcoholic hepatitis',
            'Tuberculosis', 'Common Cold', 'Pneumonia', 'Dimorphic hemmorhoids(piles)',
            'Heart attack', 'Varicose veins', 'Hypothyroidism', 'Hyperthyroidism',
            'Hypoglycemia', 'Osteoarthristis', 'Arthritis', '(vertigo) Paroymsal  Positional Vertigo',
            'Acne', 'Urinary tract infection', 'Psoriasis', 'Impetigo'
        ]
        return jsonify({
            'count': len(simulated_diseases),
            'diseases': simulated_diseases,
            'note': 'Mode simulation - Données de démonstration'
        })
    
    diseases = label_encoder.classes_.tolist()
    return jsonify({
        'count': len(diseases),
        'diseases': diseases,
        'note': f'Le modèle peut diagnostiquer {len(diseases)} maladies différentes'
    })

# ==================== ROUTES DE DÉBOGAGE ====================

@app.route('/api/debug/history', methods=['GET'])
def debug_history():
    """Debug: vérifier l'état de l'historique"""
    try:
        return jsonify({
            'history_file_exists': os.path.exists(HISTORY_FILE),
            'history_file_path': os.path.abspath(HISTORY_FILE),
            'history_file_size': os.path.getsize(HISTORY_FILE) if os.path.exists(HISTORY_FILE) else 0,
            'history_count': len(diagnostics_history),
            'symptoms_count': len(symptoms_list),
            'sample_diagnostics': diagnostics_history[:3] if diagnostics_history else [],
            'all_patients': list(set(d['patient_name'] for d in diagnostics_history if 'patient_name' in d)),
            'users_count': len(users),
            'users_file': USERS_FILE,
            'users_file_exists': os.path.exists(USERS_FILE)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug', methods=['GET'])
def debug_info():
    """Retourne des informations de debug"""
    diseases_count = len(label_encoder.classes_) if label_encoder is not None else 0
    
    return jsonify({
        'python_version': sys.version,
        'numpy_version': np.__version__,
        'sklearn_version': joblib.__version__,
        'model_loaded': model is not None,
        'symptoms_count': len(symptoms_list),
        'diseases_count': diseases_count,
        'model_path': MODEL_PATH,
        'user_type': 'médecin',
        'history_count': len(diagnostics_history),
        'users_count': len(users),
        'history_file': HISTORY_FILE,
        'history_file_exists': os.path.exists(HISTORY_FILE),
        'users_file': USERS_FILE,
        'users_file_exists': os.path.exists(USERS_FILE),
        'files_exist': {
            'modele_random_forest.pkl': os.path.exists(os.path.join(MODEL_PATH, 'modele_random_forest.pkl')),
            'encodeur_maladies.pkl': os.path.exists(os.path.join(MODEL_PATH, 'encodeur_maladies.pkl')),
            'normaliseur_age.pkl': os.path.exists(os.path.join(MODEL_PATH, 'normaliseur_age.pkl')),
            'liste_symptomes.txt': os.path.exists(os.path.join(MODEL_PATH, 'liste_symptomes.txt')),
        }
    })

# ==================== NOUVELLES ROUTES STATISTIQUES ====================

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Récupérer les statistiques globales"""
    try:
        print(f"📊 Calcul des statistiques pour {len(diagnostics_history)} diagnostics")
        
        if len(diagnostics_history) == 0:
            print("⚠️ Historique vide, retour des stats par défaut")
            return jsonify({
                'total_diagnostics': 0,
                'total_patients': 0,
                'average_accuracy': 0,
                'average_duration': 2.3,
                'top_diseases': [],
                'monthly_stats': [],
                'category_stats': [],
                'symptoms_count': len(symptoms_list)
            })
        
        # Calculer les statistiques réelles
        total_diagnostics = len(diagnostics_history)
        
        # Patients uniques
        unique_patients = set()
        for d in diagnostics_history:
            if 'patient_name' in d:
                unique_patients.add(d['patient_name'])
        total_patients = len(unique_patients)
        
        # Précision moyenne
        total_accuracy = 0
        valid_diagnostics = 0
        for diag in diagnostics_history:
            if 'results' in diag and len(diag['results']) > 0:
                prob = diag['results'][0].get('probability_percent', 0)
                if prob > 0:
                    total_accuracy += prob
                    valid_diagnostics += 1
        
        average_accuracy = round(total_accuracy / valid_diagnostics, 1) if valid_diagnostics > 0 else 0
        
        # Temps moyen (simulé)
        average_duration = 2.3
        
        # Top maladies
        disease_counts = Counter()
        for diag in diagnostics_history:
            if 'results' in diag and len(diag['results']) > 0:
                for result in diag['results'][:1]:  # Prendre seulement le diagnostic principal
                    disease = result.get('disease', 'Inconnu')
                    disease_counts[disease] += 1
        
        top_diseases = []
        for disease, count in disease_counts.most_common(5):
            # Générer une tendence aléatoire
            trends = ['+12%', '+5%', '-3%', '+8%', '0%', '+15%', '-2%']
            trend = random.choice(trends)
            top_diseases.append({
                'disease': disease,
                'count': count,
                'trend': trend
            })
        
        # Statistiques mensuelles
        monthly_counts = defaultdict(int)
        month_names = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
        
        for diag in diagnostics_history:
            if 'timestamp' in diag:
                try:
                    # Nettoyer la chaîne de date
                    timestamp = diag['timestamp'].replace('Z', '+00:00')
                    date = datetime.fromisoformat(timestamp)
                    month_key = month_names[date.month - 1]
                    monthly_counts[month_key] += 1
                except Exception as e:
                    print(f"⚠️ Erreur parsing date: {e}")
                    continue
        
        monthly_stats = []
        # Afficher les 6 derniers mois
        for i in range(6):
            month_index = (datetime.now().month - 1 - i) % 12
            month_name = month_names[month_index]
            count = monthly_counts.get(month_name, 0)
            monthly_stats.append({
                'month': month_name,
                'diagnostics': count
            })
        monthly_stats.reverse()
        
        # Statistiques par catégorie (simulées basées sur les maladies)
        category_stats = [
            {'category': 'Respiratoire', 'percentage': 35, 'color': 'bg-blue-500'},
            {'category': 'Neurologique', 'percentage': 25, 'color': 'bg-purple-500'},
            {'category': 'Digestif', 'percentage': 20, 'color': 'bg-green-500'},
            {'category': 'Général', 'percentage': 12, 'color': 'bg-yellow-500'},
            {'category': 'Autre', 'percentage': 8, 'color': 'bg-gray-500'},
        ]
        
        stats = {
            'total_diagnostics': total_diagnostics,
            'total_patients': total_patients,
            'average_accuracy': average_accuracy,
            'average_duration': average_duration,
            'top_diseases': top_diseases,
            'monthly_stats': monthly_stats,
            'category_stats': category_stats,
            'symptoms_count': len(symptoms_list),
            'last_updated': datetime.now().isoformat()
        }
        
        print(f"✅ Statistiques calculées: {total_diagnostics} diagnostics, {total_patients} patients, {average_accuracy}% précision")
        return jsonify(stats), 200
        
    except Exception as e:
        print(f"❌ Erreur dans get_statistics: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Récupérer les données pour le dashboard"""
    try:
        print(f"🏠 Dashboard: {len(diagnostics_history)} diagnostics")
        
        total_diagnostics = len(diagnostics_history)
        
        # Patients uniques
        unique_patients = set()
        for d in diagnostics_history:
            if 'patient_name' in d:
                unique_patients.add(d['patient_name'])
        total_patients = len(unique_patients)
        
        # Précision
        total_accuracy = 0
        valid_diagnostics = 0
        for diag in diagnostics_history:
            if 'results' in diag and len(diag['results']) > 0:
                prob = diag['results'][0].get('probability_percent', 0)
                if prob > 0:
                    total_accuracy += prob
                    valid_diagnostics += 1
        
        accuracy = round(total_accuracy / valid_diagnostics) if valid_diagnostics > 0 else 0
        
        # Diagnostics récents (5 derniers)
        recent_diagnostics = []
        recent_slice = diagnostics_history[-5:] if diagnostics_history else []
        for i, diag in enumerate(reversed(recent_slice)):
            recent_diagnostics.append({
                'id': diag.get('id', str(len(diagnostics_history) - i)),
                'patient_name': diag.get('patient_name', 'Patient'),
                'date': diag.get('timestamp', datetime.now().isoformat()),
                'top_disease': diag['results'][0]['disease'] if 'results' in diag and len(diag['results']) > 0 else 'Non spécifié'
            })
        
        # Top maladies
        disease_counts = Counter()
        for diag in diagnostics_history:
            if 'results' in diag and len(diag['results']) > 0:
                disease = diag['results'][0].get('disease', 'Inconnu')
                disease_counts[disease] += 1
        
        top_diseases = []
        for disease, count in disease_counts.most_common(3):
            top_diseases.append({
                'disease': disease,
                'count': count
            })
        
        data = {
            'total_diagnostics': total_diagnostics,
            'total_patients': total_patients,
            'accuracy': accuracy,
            'recent_diagnostics': recent_diagnostics,
            'top_diseases': top_diseases,
            'symptoms_count': len(symptoms_list),
            'last_updated': datetime.now().isoformat()
        }
        
        print(f"✅ Dashboard data: {total_diagnostics} diag, {total_patients} patients, {accuracy}% accuracy")
        return jsonify(data), 200
        
    except Exception as e:
        print(f"❌ Erreur dans get_dashboard: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    """Récupérer l'historique complet des diagnostics"""
    try:
        return jsonify({
            'count': len(diagnostics_history),
            'diagnostics': diagnostics_history[-50:],  # Retourner seulement les 50 derniers
            'total': len(diagnostics_history),
            'symptoms_count': len(symptoms_list),
            'last_updated': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== FONCTIONS MÉDECIN ====================

def get_medical_guidance(disease_name, probability):
    """Retourne des conseils médicaux pour un médecin"""
    medical_guidance = {
        'Fungal infection': 'Considérer un antifongique topique ou systémique selon la localisation. Examen mycologique recommandé.',
        'Allergy': 'Identifier l\'allergène. Antihistaminiques de 2ème génération en première intention. Évaluation allergologique si persistant.',
        'GERD': 'Inhibiteurs de la pompe à protons pendant 4-8 semaines. Modifications du mode de vie. Endoscopie si symptômes d\'alarme.',
        'Diabetes': 'Contrôle glycémique: HbA1c <7%. Bilan rénal, ophtalmologique et podologique. Éducation thérapeutique.',
        'Hypertension': 'Mesurer aux deux bras. Objectif <140/90 mmHg (<130/80 si diabète). Bilan étiologique si <40 ans.',
        'Common Cold': 'Traitement symptomatique. Repos. Éviter les antibiotiques sans surinfection bactérienne.',
        'Pneumonia': 'Antibiothérapie selon CURB-65. Radiographie thoracique. Hospitalisation si score ≥2.',
        'Heart attack': 'APPELER LE 15 IMMÉDIATEMENT. ECG, troponine, MONA (Morphine, Oxygène, Nitrés, Aspirine).',
        'Bronchial Asthma': 'Corticostéroïdes inhalés + β2-agonistes de longue durée. Mesure du DEP. Éducation du patient.',
        'Migraine': 'Triptans en crise. Prophylaxie si >3 crises/mois (bêta-bloquants, anti-épileptiques). Éviter les opiacés.',
        'Gastroenteritis': 'Réhydratation orale ou IV. Examens parasitologiques si persistant. Isolement des selles.',
    }
    
    default = f'Diagnostic différentiel à considérer. Examen clinique complet recommandé.'
    
    # Niveaux de confiance pour médecin
    if probability >= 0.8:
        confidence_level = 'TRÈS ÉLEVÉE - Diagnostic probable'
        action = 'Diagnostic principal à considérer. Investigations complémentaires pour confirmation.'
    elif probability >= 0.6:
        confidence_level = 'ÉLEVÉE - Diagnostic plausible'
        action = 'Inclure dans le diagnostic différentiel. Investigations ciblées recommandées.'
    elif probability >= 0.4:
        confidence_level = 'MODÉRÉE - Hypothèse à explorer'
        action = 'Faire partie du diagnostic différentiel. Rechercher d\'autres symptômes associés.'
    elif probability >= 0.2:
        confidence_level = 'FAIBLE - Possibilité à exclure'
        action = 'Exclure par examens complémentaires si cliniquement pertinent.'
    else:
        confidence_level = 'TRÈS FAIBLE - Peu probable'
        action = 'Peu probable en l\'absence d\'autres signes. Surveiller l\'évolution.'
    
    specific_guidance = medical_guidance.get(disease_name, default)
    
    return {
        'confidence_level': confidence_level,
        'medical_action': action,
        'specific_guidance': specific_guidance,
        'suggested_tests': get_suggested_tests(disease_name)
    }

def get_suggested_tests(disease_name):
    """Retourne des examens complémentaires suggérés"""
    test_recommendations = {
        'Fungal infection': ['Examen mycologique', 'Biopsie cutanée', 'Examen en lumière de Wood'],
        'Allergy': ['Tests cutanés', 'IgE spécifiques', 'Test de provocation'],
        'GERD': ['pH-métrie œsophagienne', 'Endoscopie digestive haute', 'Manométrie œsophagienne'],
        'Diabetes': ['Glycémie à jeun', 'HbA1c', 'ECBU', 'Fond d\'œil'],
        'Hypertension': ['ECG', 'Échocardiographie', 'Bilan rénal', 'Albuminurie'],
        'Pneumonia': ['Radiographie thoracique', 'NFS/CRP', 'Hémocultures', 'Gaz du sang'],
        'Heart attack': ['ECG 12 dérivations', 'Troponine', 'Échocardiographie', 'Coronarographie'],
        'Bronchial Asthma': ['Spirométrie', 'Test de réversibilité', 'Mesure du DEP', 'Rx thorax'],
    }
    
    return test_recommendations.get(disease_name, ['Examen clinique approfondi', 'Analyses sanguines standard'])

def save_diagnostic_to_history(patient_name, age, gender, symptoms, results, doctor_email=None):
    """Sauvegarder un diagnostic dans l'historique"""
    diagnostic_record = {
        'id': str(len(diagnostics_history) + 1),
        'patient_name': patient_name,
        'age': age,
        'gender': gender,
        'symptoms': symptoms,
        'results': results,
        'timestamp': datetime.now().isoformat()
    }
    
    # Ajouter l'email du médecin si fourni
    if doctor_email:
        diagnostic_record['doctor_email'] = doctor_email
        if doctor_email in users:
            diagnostic_record['doctor_name'] = users[doctor_email]['full_name']
    
    diagnostics_history.append(diagnostic_record)
    save_history()
    print(f"📝 Diagnostic sauvegardé: {patient_name}, {len(results)} résultats")
    return diagnostic_record

# ==================== ROUTE DIAGNOSTIC ====================

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    """Effectue un diagnostic basé sur les symptômes - Version médecin"""
    # Si modèle non chargé, mode simulation
    if model is None:
        return simulate_diagnosis(request)
    
    try:
        data = request.json
        
        # Validation des données
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        required_fields = ['symptoms', 'age', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Champ manquant: {field}'}), 400
        
        symptoms = data['symptoms']
        age = int(data['age'])
        gender = data['gender'].upper()
        patient_name = data.get('patient_name', 'Patient')
        additional_notes = data.get('additional_notes', '')
        doctor_email = data.get('doctor_email')  # Optionnel: email du médecin
        
        if gender not in ['M', 'F']:
            return jsonify({'error': 'Genre doit être M (Masculin) ou F (Féminin)'}), 400
        
        if age < 1 or age > 120:
            return jsonify({'error': 'Âge doit être entre 1 et 120 ans'}), 400
        
        # Si doctor_email fourni, vérifier qu'il existe
        if doctor_email and doctor_email not in users:
            print(f"⚠️ Email médecin non trouvé: {doctor_email}")
            doctor_email = None
        
        print(f"🩺 Diagnostic pour: {patient_name}, {age} ans, {gender}")
        if doctor_email:
            print(f"👨‍⚕️ Médecin: {doctor_email}")
        print(f"📋 {len(symptoms)} symptômes: {symptoms}")
        
        # Créer le vecteur d'entrée
        input_vector = np.zeros(len(symptoms_list) + 2)
        
        # Remplir les symptômes
        for i, symptom in enumerate(symptoms_list):
            if symptom in symptoms:
                input_vector[i] = 1
        
        # Ajouter âge normalisé
        try:
            input_vector[-2] = scaler.transform([[age]])[0][0]
        except Exception as e:
            print(f"⚠️ Erreur normalisation âge: {e}, utilisation valeur brute")
            input_vector[-2] = age / 100.0  # Normalisation simple
        
        # Ajouter genre (0=femme, 1=homme)
        input_vector[-1] = 0 if gender == 'F' else 1
        
        # Faire la prédiction
        probabilities = model.predict_proba([input_vector])[0]
        
        # Récupérer les top 5 maladies
        top_indices = np.argsort(probabilities)[-5:][::-1]
        
        results = []
        for idx in top_indices:
            prob = probabilities[idx]
            if prob > 0.01:  # Seuil minimum de 1%
                try:
                    disease_name = label_encoder.inverse_transform([idx])[0]
                except:
                    disease_name = f"Maladie_{idx}"
                
                # Obtenir les conseils médicaux
                guidance = get_medical_guidance(disease_name, prob)
                
                results.append({
                    'disease': disease_name,
                    'probability_percent': round(prob * 100, 2),
                    'probability_decimal': round(prob, 4),
                    'confidence_level': guidance['confidence_level'],
                    'medical_action': guidance['medical_action'],
                    'specific_guidance': guidance['specific_guidance'],
                    'suggested_tests': guidance['suggested_tests'],
                    'risk_level': 'Élevé' if prob >= 0.7 else 'Modéré' if prob >= 0.4 else 'Faible'
                })
        
        # Trier par probabilité décroissante
        results.sort(key=lambda x: x['probability_decimal'], reverse=True)
        
        # Statistiques pour médecin
        stats = {
            'symptoms_count': len(symptoms),
            'top_diagnosis': results[0]['disease'] if results else 'Aucun',
            'top_probability': results[0]['probability_percent'] if results else 0,
            'differential_diagnosis_count': len(results),
            'high_probability_count': len([r for r in results if r['probability_decimal'] >= 0.6]),
            'timestamp': datetime.now().isoformat()
        }
        
        # Sauvegarder dans l'historique
        diagnostic_record = save_diagnostic_to_history(
            patient_name=patient_name,
            age=age,
            gender=gender,
            symptoms=symptoms,
            results=results,
            doctor_email=doctor_email
        )
        
        response = {
            'success': True,
            'diagnostic_assistant': {
                'results': results,
                'statistics': stats,
                'patient_info': {
                    'age': age,
                    'gender': gender,
                    'patient_name': patient_name,
                    'symptoms_analyzed': symptoms,
                    'additional_notes': additional_notes
                },
                'doctor_info': {
                    'email': doctor_email,
                    'name': diagnostic_record.get('doctor_name', 'Médecin') if doctor_email else 'Médecin'
                },
                'disclaimer': 'Cet assistant diagnostic est un outil d\'aide à la décision. Le diagnostic final revient au médecin traitant.',
                'mode': 'production',
                'diagnostic_id': diagnostic_record['id']
            }
        }
        
        print(f"✅ Diagnostic terminé: {len(results)} résultats, principal: {results[0]['disease'] if results else 'Aucun'}")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Erreur lors du diagnostic: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def simulate_diagnosis(request):
    """Simule un diagnostic quand le modèle n'est pas chargé"""
    try:
        data = request.json or {}
        
        symptoms = data.get('symptoms', ['fever', 'cough'])
        age = data.get('age', 30)
        gender = data.get('gender', 'M')
        patient_name = data.get('patient_name', 'Patient')
        additional_notes = data.get('additional_notes', '')
        doctor_email = data.get('doctor_email')
        
        print(f"🩺 [SIMULATION] Diagnostic pour: {patient_name}")
        if doctor_email:
            print(f"👨‍⚕️ Médecin: {doctor_email}")
        
        # Maladies simulées avec conseils pour médecin
        simulated_diseases = [
            {
                'disease': 'Common Cold',
                'probability_percent': 78.5,
                'probability_decimal': 0.785,
                'confidence_level': 'ÉLEVÉE - Diagnostic plausible',
                'medical_action': 'Diagnostic principal à considérer. Investigations complémentaires pour confirmation.',
                'specific_guidance': 'Traitement symptomatique. Repos. Éviter les antibiotiques sans surinfection bactérienne.',
                'suggested_tests': ['Examen ORL', 'Température', 'Auscultation pulmonaire'],
                'risk_level': 'Faible'
            },
            {
                'disease': 'Seasonal Allergy',
                'probability_percent': 52.3,
                'probability_decimal': 0.523,
                'confidence_level': 'MODÉRÉE - Hypothèse à explorer',
                'medical_action': 'Inclure dans le diagnostic différentiel. Investigations ciblées recommandées.',
                'specific_guidance': 'Identifier l\'allergène. Antihistaminiques de 2ème génération en première intention.',
                'suggested_tests': ['Tests cutanés', 'IgE totales', 'Rhinoscopie'],
                'risk_level': 'Faible'
            }
        ]
        
        # Statistiques pour médecin
        stats = {
            'symptoms_count': len(symptoms),
            'top_diagnosis': 'Common Cold',
            'top_probability': 78.5,
            'differential_diagnosis_count': 2,
            'high_probability_count': 1,
            'timestamp': datetime.now().isoformat()
        }
        
        # Sauvegarder dans l'historique (même en mode simulation)
        diagnostic_record = save_diagnostic_to_history(
            patient_name=patient_name,
            age=age,
            gender=gender,
            symptoms=symptoms,
            results=simulated_diseases,
            doctor_email=doctor_email
        )
        
        response = {
            'success': True,
            'diagnostic_assistant': {
                'results': simulated_diseases,
                'statistics': stats,
                'patient_info': {
                    'age': age,
                    'gender': gender,
                    'patient_name': patient_name,
                    'symptoms_analyzed': symptoms,
                    'additional_notes': additional_notes
                },
                'doctor_info': {
                    'email': doctor_email,
                    'name': diagnostic_record.get('doctor_name', 'Médecin') if doctor_email else 'Médecin'
                },
                'disclaimer': 'MODÈLE SIMULATION - Données de démonstration seulement.',
                'mode': 'simulation',
                'diagnostic_id': diagnostic_record['id']
            }
        }
        
        print(f"✅ [SIMULATION] Diagnostic simulé sauvegardé")
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ROUTES D'ADMINISTRATION ====================

@app.route('/api/admin/clear-history', methods=['POST'])
def clear_history():
    """Effacer l'historique (pour le développement)"""
    try:
        global diagnostics_history
        old_count = len(diagnostics_history)
        diagnostics_history = []
        save_history()
        return jsonify({
            'success': True,
            'message': f'Historique effacé ({old_count} diagnostics supprimés)',
            'new_count': len(diagnostics_history)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/generate-demo-data', methods=['POST'])
def generate_demo_data():
    """Générer des données de démonstration"""
    try:
        demo_patients = [
            {'name': 'Jean Dupont', 'age': 35, 'gender': 'M'},
            {'name': 'Marie Curie', 'age': 28, 'gender': 'F'},
            {'name': 'Pierre Martin', 'age': 42, 'gender': 'M'},
            {'name': 'Sophie Laurent', 'age': 31, 'gender': 'F'},
            {'name': 'Thomas Bernard', 'age': 55, 'gender': 'M'},
            {'name': 'Julie Petit', 'age': 24, 'gender': 'F'},
        ]
        
        demo_diseases = [
            'Grippe saisonnière',
            'Migraine',
            'Bronchite aiguë',
            'Gastro-entérite',
            'Sinusite',
            'Rhume',
            'Allergie saisonnière'
        ]
        
        # Utiliser les symptômes réels de la liste
        demo_symptoms = symptoms_list[:50]  # Prendre les 50 premiers symptômes
        
        start_count = len(diagnostics_history)
        
        for i in range(20):
            patient = random.choice(demo_patients)
            disease = random.choice(demo_diseases)
            symptoms = random.sample(demo_symptoms, random.randint(2, 4))
            
            diagnostic_record = {
                'id': str(len(diagnostics_history) + 1),
                'patient_name': patient['name'],
                'age': patient['age'],
                'gender': patient['gender'],
                'symptoms': symptoms,
                'results': [{
                    'disease': disease,
                    'probability_percent': random.randint(70, 95),
                    'probability_decimal': round(random.uniform(0.7, 0.95), 2),
                    'confidence_level': 'ÉLEVÉE - Diagnostic plausible',
                    'medical_action': 'Diagnostic principal à considérer',
                    'specific_guidance': 'Conseil médical standard',
                    'suggested_tests': ['Test standard'],
                    'risk_level': 'Modéré'
                }],
                'timestamp': (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat()
            }
            
            diagnostics_history.append(diagnostic_record)
        
        save_history()
        added_count = len(diagnostics_history) - start_count
        
        return jsonify({
            'success': True,
            'message': f'{added_count} diagnostics de démonstration générés',
            'total_diagnostics': len(diagnostics_history),
            'added': added_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        port = int(os.getenv('PORT', 5000))
        debug = os.getenv('FLASK_ENV', 'development').lower() == 'development'
        
        print("\n" + "=" * 60)
        print(f"🌐 CONFIGURATION FINALE - VERSION MÉDECIN")
        print(f"📡 Port: {port}")
        print(f"🐞 Mode debug: {debug}")
        print(f"👨‍⚕️ User: Médecin")
        print(f"🔐 Authentification: SIMPLE (fichier JSON)")
        print(f"🔧 Mode: {'PRODUCTION' if model is not None else 'SIMULATION'}")
        print(f"📊 Historique: {len(diagnostics_history)} diagnostics")
        print(f"👥 Utilisateurs: {len(users)} inscrits")
        print(f"📋 Symptômes: {len(symptoms_list)} disponibles")
        print(f"📁 Fichier historique: {HISTORY_FILE}")
        print(f"📁 Fichier utilisateurs: {USERS_FILE}")
        if os.path.exists(USERS_FILE):
            print(f"   Taille: {os.path.getsize(USERS_FILE)} octets")
        print("=" * 60)
        
        print("\n📚 ENDPOINTS DISPONIBLES:")
        print(f"   GET  http://localhost:{port}/")
        print(f"   GET  http://localhost:{port}/api/health")
        print(f"   POST http://localhost:{port}/api/auth/login")
        print(f"   POST http://localhost:{port}/api/auth/register")
        print(f"   GET  http://localhost:{port}/api/auth/users")
        print(f"   GET  http://localhost:{port}/api/symptoms")
        print(f"   GET  http://localhost:{port}/api/diseases")
        print(f"   GET  http://localhost:{port}/api/debug")
        print(f"   GET  http://localhost:{port}/api/debug/history")
        print(f"   GET  http://localhost:{port}/api/stats")
        print(f"   GET  http://localhost:{port}/api/dashboard")
        print(f"   GET  http://localhost:{port}/api/history")
        print(f"   POST http://localhost:{port}/api/diagnose")
        print(f"   POST http://localhost:{port}/api/admin/clear-history")
        print(f"   POST http://localhost:{port}/api/admin/generate-demo-data")
        
        print("\n🔑 UTILISATEUR PAR DÉFAUT:")
        print(f"   Email: admin@diagnostic.com")
        print(f"   Mot de passe: admin123")
        
        print("\n🔍 POUR TESTER L'AUTHENTIFICATION:")
        print(f'   # Connexion')
        print(f'   curl -X POST http://localhost:{port}/api/auth/login \\')
        print(f'        -H "Content-Type: application/json" \\')
        print(f'        -d \'{{"email":"admin@diagnostic.com","password":"admin123"}}\'')
        print(f'')
        print(f'   # Inscription')
        print(f'   curl -X POST http://localhost:{port}/api/auth/register \\')
        print(f'        -H "Content-Type: application/json" \\')
        print(f'        -d \'{{"full_name":"Dr. Test","email":"test@test.com","password":"test123"}}\'')
        print(f'')
        print(f'   # Lister les utilisateurs')
        print(f'   curl http://localhost:{port}/api/auth/users')
        print("\n" + "=" * 60)
        print("✅ Le serveur est prêt! Utilisez /api/auth/login pour vous connecter.")
        print("=" * 60)
        
        app.run(host='0.0.0.0', port=port, debug=debug, use_reloader=False)
        
    except Exception as e:
        print(f"\n❌ ERREUR DE DÉMARRAGE: {e}")
        traceback.print_exc()
        input("\nAppuyez sur Entrée pour quitter...")