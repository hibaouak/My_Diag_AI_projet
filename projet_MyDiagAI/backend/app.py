print("🔥 app.py est bien exécuté - VERSION MYSQL")
# backend/app.py - VERSION MÉDECIN AVEC VOTRE BASE DE DONNÉES EXISTANTE
from flask import Flask, request, jsonify, g
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
import mysql.connector
from mysql.connector import pooling
from functools import wraps

print("=" * 60)
print(f"MyDiagAI Backend - VERSION AVEC VOTRE BASE DE DONNÉES - Python {sys.version.split()[0]}")
print("=" * 60)

# Charger les variables d'environnement
load_dotenv()

# Initialiser Flask
app = Flask(__name__)

# Configuration CORS
CORS(app, origins="*")  # Pour le développement seulement

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'modeles_medical')
HISTORY_FILE = os.path.join(os.path.dirname(__file__), 'diagnostics_history.json')  # Optionnel, pour compatibilité
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')  # Optionnel, pour compatibilité
print(f"📁 Chemin des modèles: {MODEL_PATH}")

# Configuration MySQL avec VOTRE base de données
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DB', 'mydiagai_db'),  # Votre nom de base de données
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'pool_name': 'mydiagai_pool',
    'pool_size': 10,
    'pool_reset_session': True,
    'autocommit': False,
    'charset': 'utf8mb4',
    'use_unicode': True
}

# Créer un pool de connexions MySQL
try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(**db_config)
    print("✅ Pool de connexions MySQL créé avec succès")
    
    # Tester la connexion
    test_conn = connection_pool.get_connection()
    test_cursor = test_conn.cursor()
    test_cursor.execute("SELECT 1")
    test_cursor.close()
    test_conn.close()
    print("✅ Connexion à votre base de données testée avec succès")
    
except Exception as e:
    print(f"❌ Erreur de connexion à votre base de données: {e}")
    print("⚠️  Le serveur fonctionnera en mode dégradé (fichiers JSON)")
    connection_pool = None

# Fonction pour obtenir une connexion MySQL
def get_db():
    """Obtenir une connexion MySQL depuis le pool"""
    if connection_pool:
        try:
            return connection_pool.get_connection()
        except Exception as e:
            print(f"❌ Erreur lors de l'obtention d'une connexion: {e}")
            return None
    return None

# Décorateur pour vérifier l'authentification
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Token d\'authentification manquant'}), 401
        
        try:
            # Supporte les formats "Bearer user_123" ou simplement "user_123"
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                token = auth_header
            
            if token.startswith('user_'):
                doctor_id = token.split('_')[1]
                
                # Vérifier que le médecin existe dans votre base
                conn = get_db()
                if conn:
                    cursor = conn.cursor(dictionary=True)
                    
                    # Adapter cette requête à VOTRE structure de table
                    # Supposons que vous ayez une table 'users' ou 'doctors'
                    cursor.execute("""
                        SELECT id, email, nom as full_name, prenom, specialite as specialization 
                        FROM utilisateurs 
                        WHERE id = %s AND actif = 1
                    """, (doctor_id,))
                    
                    doctor = cursor.fetchone()
                    cursor.close()
                    conn.close()
                    
                    if doctor:
                        g.current_doctor = doctor
                        return f(*args, **kwargs)
                    else:
                        return jsonify({'error': 'Médecin non trouvé ou inactif'}), 401
                else:
                    # Fallback sur l'ancien système de fichiers JSON
                    return jsonify({'error': 'Base de données non disponible'}), 503
            
            return jsonify({'error': 'Token invalide'}), 401
            
        except Exception as e:
            return jsonify({'error': f'Erreur d\'authentification: {str(e)}'}), 401
    
    return decorated_function

# ==================== CHARGEMENT DES MODÈLES ML ====================

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
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print(f"\n✅ Modèle RandomForest chargé")
    else:
        model = None
        print(f"\n⚠️ Modèle non trouvé")
    
    if os.path.exists(encoder_path):
        label_encoder = joblib.load(encoder_path)
        print(f"✅ Encodeur de maladies chargé")
        if hasattr(label_encoder, 'classes_'):
            print(f"   Nombre de maladies: {len(label_encoder.classes_)}")
    else:
        label_encoder = None
    
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        print(f"✅ Normaliseur chargé")
    else:
        scaler = None
    
    # Charger la liste des symptômes
    if os.path.exists(symptoms_path):
        with open(symptoms_path, 'r', encoding='utf-8') as f:
            symptoms_list = [line.strip() for line in f]
        print(f"✅ {len(symptoms_list)} symptômes chargés")
    else:
        # Liste par défaut
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
        print(f"✅ {len(symptoms_list)} symptômes chargés (liste par défaut)")
    
except Exception as e:
    print(f"\n❌ ERREUR DE CHARGEMENT: {type(e).__name__}: {e}")
    traceback.print_exc()
    print("\n⚠️  MODE SIMULATION ACTIVÉ")
    model = None
    label_encoder = None
    scaler = None

# ==================== GESTION DE L'HISTORIQUE JSON (FALLBACK) ====================

def ensure_history_file():
    """S'assurer que le fichier d'historique existe (fallback)"""
    try:
        if not os.path.exists(HISTORY_FILE):
            os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
            with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print(f"✅ Fichier d'historique créé (fallback)")
    except Exception as e:
        print(f"❌ Erreur création fichier historique: {e}")

def load_history_from_json():
    """Charger l'historique depuis JSON (fallback)"""
    try:
        ensure_history_file()
        if os.path.exists(HISTORY_FILE) and os.path.getsize(HISTORY_FILE) > 0:
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"❌ Erreur chargement historique JSON: {e}")
        return []

def save_history_to_json(history):
    """Sauvegarder l'historique dans JSON (fallback)"""
    try:
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"❌ Erreur sauvegarde historique JSON: {e}")
        return False

# ==================== FONCTIONS DE HACHAGE ====================

def hash_password(password):
    """Hacher un mot de passe"""
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt, 100000)
    pwdhash = pwdhash.hex()
    return (salt + pwdhash.encode('ascii')).decode('ascii')

def verify_password(stored_password, provided_password):
    """Vérifier un mot de passe"""
    try:
        salt = stored_password[:64].encode('ascii')
        stored_pwdhash = stored_password[64:]
        pwdhash = hashlib.pbkdf2_hmac('sha512', provided_password.encode('utf-8'), salt, 100000)
        pwdhash = pwdhash.hex()
        return pwdhash == stored_pwdhash
    except:
        # Fallback pour l'ancien système de hash simple
        return stored_password == hashlib.sha256(provided_password.encode()).hexdigest()

# ==================== FONCTIONS D'AUTHENTIFICATION (À ADAPTER À VOTRE STRUCTURE) ====================

def authenticate_user(email, password):
    """Authentifier un utilisateur - À ADAPTER À VOTRE STRUCTURE DE BASE"""
    conn = None
    try:
        conn = get_db()
        if conn:
            cursor = conn.cursor(dictionary=True)
            
            # 🔧 ADAPTEZ CETTE REQUÊTE À VOTRE STRUCTURE DE TABLE
            # Exemple avec une table 'utilisateurs' qui a email, mot_de_passe, nom, etc.
            cursor.execute("""
                SELECT id, email, nom as full_name, prenom, specialite as specialization
                FROM utilisateurs 
                WHERE email = %s AND actif = 1
            """, (email,))
            
            user = cursor.fetchone()
            
            if user:
                # Récupérer le mot de passe hashé (à adapter)
                cursor.execute("SELECT mot_de_passe FROM utilisateurs WHERE id = %s", (user['id'],))
                password_result = cursor.fetchone()
                
                if password_result and verify_password(password_result['mot_de_passe'], password):
                    cursor.close()
                    conn.close()
                    return True, user, "Connexion réussie"
            
            cursor.close()
            conn.close()
            return False, None, "Email ou mot de passe incorrect"
        else:
            # Fallback sur JSON
            return authenticate_user_json(email, password)
            
    except Exception as e:
        print(f"❌ Erreur authentification: {e}")
        return False, None, f"Erreur: {str(e)}"
    finally:
        if conn:
            conn.close()

def authenticate_user_json(email, password):
    """Authentifier via JSON (fallback)"""
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                users = json.load(f)
            
            if email in users:
                user = users[email]
                if user.get('password_hash') == hashlib.sha256(password.encode()).hexdigest():
                    user_info = user.copy()
                    user_info.pop('password_hash', None)
                    return True, user_info, "Connexion réussie"
        
        return False, None, "Email ou mot de passe incorrect"
    except Exception as e:
        print(f"❌ Erreur authentification JSON: {e}")
        return False, None, str(e)

# ==================== FONCTIONS POUR LES DIAGNOSTICS ====================

def save_diagnostic(doctor_id, patient_name, age, gender, symptoms, results, notes=''):
    """Sauvegarder un diagnostic - UTILISE VOTRE BASE DE DONNÉES"""
    conn = None
    try:
        conn = get_db()
        if conn:
            cursor = conn.cursor(dictionary=True)
            
            # Convertir en JSON
            symptoms_json = json.dumps(symptoms, ensure_ascii=False)
            results_json = json.dumps(results, ensure_ascii=False)
            
            # 🔧 ADAPTEZ À VOTRE TABLE DE DIAGNOSTICS
            # Exemple: insertion dans une table 'diagnostics'
            cursor.execute("""
                INSERT INTO diagnostics 
                (medecin_id, patient_nom, patient_age, patient_genre, symptomes, resultats, notes, date_creation)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            """, (doctor_id, patient_name, age, gender, symptoms_json, results_json, notes))
            
            diagnostic_id = cursor.lastrowid
            conn.commit()
            
            cursor.close()
            conn.close()
            
            return {
                'id': str(diagnostic_id),
                'patient_name': patient_name,
                'age': age,
                'gender': gender,
                'symptoms': symptoms,
                'results': results,
                'notes': notes,
                'created_at': datetime.now().isoformat()
            }, "Succès"
        else:
            # Fallback sur JSON
            return save_diagnostic_json(patient_name, age, gender, symptoms, results, doctor_id, notes)
            
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        print(f"❌ Erreur sauvegarde diagnostic: {e}")
        return None, str(e)

def save_diagnostic_json(patient_name, age, gender, symptoms, results, doctor_id=None, notes=''):
    """Sauvegarder dans JSON (fallback)"""
    try:
        history = load_history_from_json()
        
        diagnostic = {
            'id': str(len(history) + 1),
            'patient_name': patient_name,
            'age': age,
            'gender': gender,
            'symptoms': symptoms,
            'results': results,
            'notes': notes,
            'doctor_id': str(doctor_id) if doctor_id else None,
            'timestamp': datetime.now().isoformat()
        }
        
        history.append(diagnostic)
        save_history_to_json(history)
        
        return diagnostic, "Succès"
    except Exception as e:
        print(f"❌ Erreur sauvegarde JSON: {e}")
        return None, str(e)

def get_doctor_diagnostics(doctor_id, limit=50, offset=0):
    """Récupérer les diagnostics d'un médecin"""
    conn = None
    try:
        conn = get_db()
        if conn:
            cursor = conn.cursor(dictionary=True)
            
            # 🔧 ADAPTEZ À VOTRE TABLE
            cursor.execute("""
                SELECT id, patient_nom as patient_name, patient_age as age, 
                       patient_genre as gender, symptomes as symptoms, 
                       resultats as results, notes, date_creation as created_at
                FROM diagnostics 
                WHERE medecin_id = %s
                ORDER BY date_creation DESC
                LIMIT %s OFFSET %s
            """, (doctor_id, limit, offset))
            
            diagnostics = cursor.fetchall()
            
            # Compter le total
            cursor.execute("SELECT COUNT(*) as total FROM diagnostics WHERE medecin_id = %s", (doctor_id,))
            total = cursor.fetchone()['total']
            
            # Convertir les JSON
            for diag in diagnostics:
                try:
                    diag['symptoms'] = json.loads(diag['symptoms'])
                except:
                    diag['symptoms'] = []
                try:
                    diag['results'] = json.loads(diag['results'])
                except:
                    diag['results'] = []
                diag['id'] = str(diag['id'])
                diag['created_at'] = diag['created_at'].isoformat() if diag['created_at'] else None
            
            cursor.close()
            conn.close()
            
            return diagnostics, total, "Succès"
        else:
            # Fallback sur JSON
            return get_all_diagnostics_json(doctor_id)
            
    except Exception as e:
        print(f"❌ Erreur récupération diagnostics: {e}")
        return [], 0, str(e)
    finally:
        if conn:
            conn.close()

def get_all_diagnostics_json(doctor_id=None):
    """Récupérer tous les diagnostics depuis JSON (fallback)"""
    try:
        history = load_history_from_json()
        
        if doctor_id:
            filtered = [d for d in history if str(d.get('doctor_id')) == str(doctor_id)]
        else:
            filtered = history
        
        return filtered, len(filtered), "Succès"
    except Exception as e:
        return [], 0, str(e)

def get_doctor_stats(doctor_id):
    """Récupérer les statistiques d'un médecin"""
    conn = None
    try:
        conn = get_db()
        if conn:
            cursor = conn.cursor(dictionary=True)
            
            # Nombre total de diagnostics
            cursor.execute("SELECT COUNT(*) as count FROM diagnostics WHERE medecin_id = %s", (doctor_id,))
            total_diagnostics = cursor.fetchone()['count']
            
            # Nombre total de patients uniques
            cursor.execute("""
                SELECT COUNT(DISTINCT patient_nom) as count 
                FROM diagnostics 
                WHERE medecin_id = %s
            """, (doctor_id,))
            total_patients = cursor.fetchone()['count']
            
            # Diagnostics récents
            cursor.execute("""
                SELECT id, patient_nom as patient_name, date_creation as created_at, resultats as results
                FROM diagnostics 
                WHERE medecin_id = %s
                ORDER BY date_creation DESC
                LIMIT 5
            """, (doctor_id,))
            
            recent = cursor.fetchall()
            recent_diagnostics = []
            for diag in recent:
                try:
                    results = json.loads(diag['results']) if diag['results'] else []
                except:
                    results = []
                
                recent_diagnostics.append({
                    'id': str(diag['id']),
                    'patient_name': diag['patient_name'],
                    'date': diag['created_at'].isoformat() if diag['created_at'] else None,
                    'top_disease': results[0]['disease'] if results else 'Inconnu'
                })
            
            cursor.close()
            conn.close()
            
            stats = {
                'total_diagnostics': total_diagnostics,
                'total_patients': total_patients,
                'average_accuracy': 85.5,  # Valeur par défaut
                'average_duration': 2.3,
                'recent_diagnostics': recent_diagnostics,
                'symptoms_count': len(symptoms_list)
            }
            
            return stats, "Succès"
        else:
            # Fallback
            return get_fallback_stats()
            
    except Exception as e:
        print(f"❌ Erreur stats: {e}")
        return get_fallback_stats(), str(e)
    finally:
        if conn:
            conn.close()

def get_fallback_stats():
    """Statistiques par défaut"""
    return {
        'total_diagnostics': 0,
        'total_patients': 0,
        'average_accuracy': 85.5,
        'average_duration': 2.3,
        'recent_diagnostics': [],
        'symptoms_count': len(symptoms_list)
    }

# ==================== FONCTIONS MÉDECIN POUR CONSEILS ====================

def get_medical_guidance(disease_name, probability):
    """Retourne des conseils médicaux"""
    medical_guidance = {
        'Fungal infection': 'Considérer un antifongique topique ou systémique. Examen mycologique recommandé.',
        'Allergy': 'Identifier l\'allergène. Antihistaminiques de 2ème génération en première intention.',
        'GERD': 'Inhibiteurs de la pompe à protons pendant 4-8 semaines. Modifications du mode de vie.',
        'Diabetes': 'Contrôle glycémique: HbA1c <7%. Bilan rénal, ophtalmologique et podologique.',
        'Hypertension': 'Mesurer aux deux bras. Objectif <140/90 mmHg.',
        'Common Cold': 'Traitement symptomatique. Repos. Éviter les antibiotiques.',
        'Pneumonia': 'Antibiothérapie selon CURB-65. Radiographie thoracique.',
        'Heart attack': 'APPELER LE 15 IMMÉDIATEMENT. ECG, troponine.',
        'Bronchial Asthma': 'Corticostéroïdes inhalés + β2-agonistes. Éducation du patient.',
        'Migraine': 'Triptans en crise. Prophylaxie si >3 crises/mois.',
        'Gastroenteritis': 'Réhydratation orale ou IV. Examens parasitologiques si persistant.',
    }
    
    default = 'Diagnostic différentiel à considérer. Examen clinique complet recommandé.'
    
    # Niveaux de confiance
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
    suggested_tests = get_suggested_tests(disease_name)
    
    return {
        'confidence_level': confidence_level,
        'medical_action': action,
        'specific_guidance': specific_guidance,
        'suggested_tests': suggested_tests
    }

def get_suggested_tests(disease_name):
    """Retourne des examens suggérés"""
    test_recommendations = {
        'Fungal infection': ['Examen mycologique', 'Biopsie cutanée'],
        'Allergy': ['Tests cutanés', 'IgE spécifiques'],
        'GERD': ['pH-métrie œsophagienne', 'Endoscopie digestive haute'],
        'Diabetes': ['Glycémie à jeun', 'HbA1c', 'ECBU'],
        'Hypertension': ['ECG', 'Échocardiographie', 'Bilan rénal'],
        'Pneumonia': ['Radiographie thoracique', 'NFS/CRP', 'Hémocultures'],
        'Heart attack': ['ECG 12 dérivations', 'Troponine', 'Échocardiographie'],
        'Bronchial Asthma': ['Spirométrie', 'Test de réversibilité'],
    }
    
    return test_recommendations.get(disease_name, ['Examen clinique approfondi', 'Analyses sanguines standard'])

# ==================== ROUTES D'AUTHENTIFICATION ====================

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
        
        success, user, message = authenticate_user(email, password)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'user': user,
                'token': f"user_{user['id']}"
            }), 200
        else:
            return jsonify({'error': message}), 401
            
    except Exception as e:
        print(f"❌ Erreur lors de la connexion: {e}")
        return jsonify({'error': str(e)}), 500

# ==================== ROUTES PUBLIQUES ====================

@app.route('/')
def home():
    """Page d'accueil de l'API"""
    return jsonify({
        'message': 'MyDiagAI Backend API',
        'version': '2.0.0',
        'database': 'connectée' if connection_pool else 'non connectée (fallback JSON)',
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            '/': 'Page d\'accueil',
            '/api/health': 'État du serveur',
            '/api/auth/login': 'Se connecter (POST)',
            '/api/symptoms': 'Liste des symptômes',
            '/api/diseases': 'Liste des maladies',
            '/api/diagnose': 'Faire un diagnostic (POST - Authentifié)',
            '/api/history': 'Historique (GET - Authentifié)',
            '/api/dashboard': 'Dashboard (GET - Authentifié)',
            '/api/stats': 'Statistiques (GET - Authentifié)'
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état du serveur"""
    conn = get_db()
    db_status = "connected" if conn else "disconnected"
    if conn:
        conn.close()
    
    return jsonify({
        'status': 'healthy',
        'service': 'MyDiagAI',
        'database': db_status,
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model is not None,
        'symptoms_available': len(symptoms_list),
        'mode': 'PRODUCTION' if model is not None else 'SIMULATION'
    })

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    """Retourne la liste des symptômes"""
    return jsonify({
        'count': len(symptoms_list),
        'symptoms': symptoms_list
    })

@app.route('/api/diseases', methods=['GET'])
def get_diseases():
    """Retourne la liste des maladies"""
    if label_encoder is None:
        simulated_diseases = [
            'Allergy', 'Diabetes', 'Gastroenteritis', 'Hypertension', 'Migraine',
            'Common Cold', 'Pneumonia', 'Bronchial Asthma', 'Heart attack'
        ]
        return jsonify({
            'count': len(simulated_diseases),
            'diseases': simulated_diseases,
            'note': 'Mode simulation'
        })
    
    diseases = label_encoder.classes_.tolist()
    return jsonify({
        'count': len(diseases),
        'diseases': diseases
    })

# ==================== ROUTES PROTÉGÉES ====================

@app.route('/api/dashboard', methods=['GET'])
@login_required
def get_dashboard():
    """Dashboard du médecin connecté"""
    try:
        doctor = g.current_doctor
        doctor_id = doctor['id']
        
        stats, message = get_doctor_stats(doctor_id)
        
        stats['doctor_name'] = doctor.get('full_name', 'Médecin')
        stats['last_updated'] = datetime.now().isoformat()
        
        return jsonify(stats), 200
        
    except Exception as e:
        print(f"❌ Erreur dashboard: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    """Statistiques du médecin"""
    return get_dashboard()

@app.route('/api/history', methods=['GET'])
@login_required
def get_history():
    """Historique des diagnostics"""
    try:
        doctor = g.current_doctor
        doctor_id = doctor['id']
        
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        diagnostics, total, message = get_doctor_diagnostics(doctor_id, limit, offset)
        
        return jsonify({
            'count': len(diagnostics),
            'diagnostics': diagnostics,
            'total': total,
            'symptoms_count': len(symptoms_list)
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur history: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/diagnose', methods=['POST'])
@login_required
def diagnose():
    """Effectuer un diagnostic"""
    try:
        doctor = g.current_doctor
        doctor_id = doctor['id']
        
        data = request.json
        
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
        
        if gender not in ['M', 'F']:
            return jsonify({'error': 'Genre doit être M ou F'}), 400
        
        if age < 1 or age > 120:
            return jsonify({'error': 'Âge invalide'}), 400
        
        print(f"🩺 Diagnostic pour: {patient_name}")
        print(f"👨‍⚕️ Médecin ID: {doctor_id}")
        
        # Faire le diagnostic
        if model is None:
            results = simulate_diagnosis(symptoms)
        else:
            results = perform_ml_diagnosis(symptoms, age, gender)
        
        # Sauvegarder
        saved, message = save_diagnostic(
            doctor_id=doctor_id,
            patient_name=patient_name,
            age=age,
            gender=gender,
            symptoms=symptoms,
            results=results,
            notes=additional_notes
        )
        
        response = {
            'success': True,
            'diagnostic_assistant': {
                'results': results,
                'statistics': {
                    'symptoms_count': len(symptoms),
                    'top_diagnosis': results[0]['disease'] if results else 'Aucun',
                    'top_probability': results[0]['probability_percent'] if results else 0
                },
                'patient_info': {
                    'age': age,
                    'gender': gender,
                    'patient_name': patient_name,
                    'symptoms_analyzed': symptoms
                },
                'doctor_info': {
                    'id': doctor['id'],
                    'name': doctor.get('full_name', 'Médecin')
                },
                'diagnostic_id': saved['id'] if saved else None,
                'mode': 'production' if model is not None else 'simulation'
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Erreur diagnostic: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def perform_ml_diagnosis(symptoms, age, gender):
    """Diagnostic avec ML"""
    input_vector = np.zeros(len(symptoms_list) + 2)
    
    for i, symptom in enumerate(symptoms_list):
        if symptom in symptoms:
            input_vector[i] = 1
    
    if scaler:
        try:
            input_vector[-2] = scaler.transform([[age]])[0][0]
        except:
            input_vector[-2] = age / 100.0
    else:
        input_vector[-2] = age / 100.0
    
    input_vector[-1] = 0 if gender == 'F' else 1
    
    probabilities = model.predict_proba([input_vector])[0]
    top_indices = np.argsort(probabilities)[-5:][::-1]
    
    results = []
    for idx in top_indices:
        prob = probabilities[idx]
        if prob > 0.01:
            try:
                disease_name = label_encoder.inverse_transform([idx])[0]
            except:
                disease_name = f"Maladie_{idx}"
            
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
    
    results.sort(key=lambda x: x['probability_decimal'], reverse=True)
    return results

def simulate_diagnosis(symptoms):
    """Simulation de diagnostic"""
    return [
        {
            'disease': 'Common Cold',
            'probability_percent': 78.5,
            'probability_decimal': 0.785,
            'confidence_level': 'ÉLEVÉE',
            'medical_action': 'Traitement symptomatique',
            'specific_guidance': 'Repos, hydratation, antipyrétiques si fièvre',
            'suggested_tests': ['Examen clinique'],
            'risk_level': 'Faible'
        },
        {
            'disease': 'Seasonal Allergy',
            'probability_percent': 52.3,
            'probability_decimal': 0.523,
            'confidence_level': 'MODÉRÉE',
            'medical_action': 'Antihistaminiques',
            'specific_guidance': 'Éviter les allergènes',
            'suggested_tests': ['Tests cutanés'],
            'risk_level': 'Faible'
        }
    ]

# ==================== DÉMARRAGE ====================

if __name__ == '__main__':
    try:
        port = int(os.getenv('PORT', 5000))
        debug = os.getenv('FLASK_ENV', 'development').lower() == 'development'
        
        print("\n" + "=" * 60)
        print("🌐 CONFIGURATION FINALE")
        print(f"📡 Port: {port}")
        print(f"🐞 Mode debug: {debug}")
        print(f"🗄️  Base de données: {'MySQL (connecté)' if connection_pool else 'MySQL (non connecté)'}")
        print(f"🤖 Modèle ML: {'Chargé' if model else 'Simulation'}")
        print(f"📋 Symptômes: {len(symptoms_list)} disponibles")
        print("=" * 60)
        
        print("\n📚 ENDPOINTS DISPONIBLES:")
        print(f"   POST http://localhost:{port}/api/auth/login - Se connecter")
        print(f"   GET  http://localhost:{port}/api/symptoms - Liste symptômes")
        print(f"   GET  http://localhost:{port}/api/diseases - Liste maladies")
        print(f"   GET  http://localhost:{port}/api/dashboard - Dashboard")
        print(f"   GET  http://localhost:{port}/api/history - Historique")
        print(f"   POST http://localhost:{port}/api/diagnose - Diagnostic")
        
        print("\n🔑 POUR TESTER:")
        print(f'   curl -X POST http://localhost:{port}/api/auth/login \\')
        print(f'        -H "Content-Type: application/json" \\')
        print(f'        -d \'{{"email":"votre_email","password":"votre_mdp"}}\'')
        print("\n" + "=" * 60)
        print("✅ Le serveur est prêt!")
        print("=" * 60)
        
        app.run(host='0.0.0.0', port=port, debug=debug, use_reloader=False)
        
    except Exception as e:
        print(f"\n❌ ERREUR DE DÉMARRAGE: {e}")
        traceback.print_exc()
        input("\nAppuyez sur Entrée pour quitter...")