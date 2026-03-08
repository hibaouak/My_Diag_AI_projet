# backend/routes/diagnostic_routes.py
from flask import Blueprint, request, jsonify
from models.modele import predictor
import mysql.connector
from config import Config
import json
import os
from datetime import datetime
import sys
import numpy as np
import traceback

diagnostic_bp = Blueprint('diagnostic', __name__)

# ==================== FONCTIONS POUR LES PATIENTS ====================

def get_doctors_by_specialty(specialty):
    """Récupère les médecins par spécialité"""
    try:
        conn = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB
        )
        
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT id, CONCAT('Dr. ', prenom, ' ', nom) as name,
               specialite, adresse, telephone, email, ville, clinique, note
        FROM medecins 
        WHERE specialite = %s AND disponible = 1
        ORDER BY note DESC
        LIMIT 10
        """
        
        cursor.execute(query, (specialty,))
        doctors = cursor.fetchall()
        cursor.close()
        conn.close()
        return doctors
    except Exception as e:
        print(f"DB Error: {e}")
        return get_mock_doctors(specialty)

def get_mock_doctors(specialty):
    """Retourne des médecins fictifs pour test"""
    mock_doctors = {
        "Pneumologue": [
            {
                "id": 1,
                "name": "Dr. Claire Dubois",
                "specialite": "Pneumologue",
                "adresse": "25 Rue de Rivoli, 75004 Paris",
                "telephone": "01 45 67 89 10",
                "email": "c.dubois@pneumo.fr",
                "ville": "Paris",
                "clinique": "Centre Respiratoire",
                "note": 4.7
            }
        ],
        "Cardiologue": [
            {
                "id": 2,
                "name": "Dr. Thomas Bernard",
                "specialite": "Cardiologue",
                "adresse": "15 Rue de la Paix, 75001 Paris",
                "telephone": "01 23 45 67 89",
                "email": "t.bernard@cardio.fr",
                "ville": "Paris",
                "clinique": "Centre Cardiologique",
                "note": 4.8
            }
        ],
        "ORL": [
            {
                "id": 3,
                "name": "Dr. Sophie Martin",
                "specialite": "ORL",
                "adresse": "8 Avenue des Vosges, 75004 Paris",
                "telephone": "01 98 76 54 32",
                "email": "s.martin@orl.fr",
                "ville": "Paris",
                "clinique": "Centre ORL",
                "note": 4.9
            }
        ],
        "Psychiatre": [
            {
                "id": 4,
                "name": "Dr. Jean Dupont",
                "specialite": "Psychiatre",
                "adresse": "42 Boulevard Saint-Michel, 75005 Paris",
                "telephone": "01 34 56 78 90",
                "email": "j.dupont@psy.fr",
                "ville": "Paris",
                "clinique": "Cabinet de Psychiatrie",
                "note": 4.6
            }
        ],
        "Généraliste": [
            {
                "id": 5,
                "name": "Dr. Marie Laurent",
                "specialite": "Généraliste",
                "adresse": "12 Rue de la Pompe, 75016 Paris",
                "telephone": "01 56 78 90 12",
                "email": "m.laurent@generaliste.fr",
                "ville": "Paris",
                "clinique": "Cabinet Médical",
                "note": 4.5
            }
        ],
        "Allergologue": [
            {
                "id": 6,
                "name": "Dr. Pierre Durand",
                "specialite": "Allergologue",
                "adresse": "5 Rue des Lilas, 75011 Paris",
                "telephone": "01 45 67 89 11",
                "email": "p.durand@allergo.fr",
                "ville": "Paris",
                "clinique": "Centre Allergologie",
                "note": 4.6
            }
        ],
        "Neurologue": [
            {
                "id": 7,
                "name": "Dr. Anne Petit",
                "specialite": "Neurologue",
                "adresse": "18 Avenue Foch, 75016 Paris",
                "telephone": "01 45 67 89 12",
                "email": "a.petit@neuro.fr",
                "ville": "Paris",
                "clinique": "Institut Neurologique",
                "note": 4.8
            }
        ]
    }
    return mock_doctors.get(specialty, [])

@diagnostic_bp.route('/predict', methods=['POST'])
def predict():
    """Route pour les patients - Prédire une spécialité à partir des symptômes"""
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        
        if not symptoms:
            return jsonify({'success': False, 'error': 'Aucun symptôme'}), 400
        
        print(f"\n{'='*60}")
        print(f"🔍 PRÉDICTION PATIENT")
        print(f"📋 Symptômes: {symptoms}")
        print(f"{'='*60}")
        
        result = predictor.predict_specialty(symptoms)
        
        if not result['success']:
            print(f"❌ Erreur de prédiction: {result}")
            return jsonify(result), 400
        
        doctors = get_doctors_by_specialty(result['specialty'])
        
        response = {
            'success': True,
            'prediction': {
                'disease': result['disease'],
                'specialty': result['specialty'],
                'confidence': round(result['confidence'] * 100, 2),
                'alternatives': result['top_diseases'][1:] if len(result['top_diseases']) > 1 else []
            },
            'doctors': doctors,
            'symptoms_found': result['symptoms_found']
        }
        
        print(f"✅ Spécialité recommandée: {result['specialty']}")
        print(f"✅ Médecins trouvés: {len(doctors)}")
        print(f"{'='*60}\n")
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Erreur predict: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== FONCTIONS POUR LE MÉDECIN ====================

# Définir le dossier de données
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

def get_diagnostics_file(doctor_id):
    """Retourne le chemin du fichier de diagnostics pour un médecin"""
    return os.path.join(DATA_DIR, f'diagnostics_{doctor_id}.json')

def load_diagnostics(doctor_id):
    """Charger les diagnostics d'un médecin"""
    file_path = get_diagnostics_file(doctor_id)
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Erreur chargement diagnostics: {e}")
        return []

def save_diagnostic(doctor_id, patient_name, age, gender, symptoms, results, notes=''):
    """Sauvegarder un diagnostic"""
    try:
        diagnostics = load_diagnostics(doctor_id)
        
        diagnostic = {
            'id': str(len(diagnostics) + 1),
            'patient_name': patient_name,
            'age': age,
            'gender': gender,
            'symptoms': symptoms,
            'results': results,
            'notes': notes,
            'created_at': datetime.now().isoformat()
        }
        
        diagnostics.append(diagnostic)
        
        file_path = get_diagnostics_file(doctor_id)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(diagnostics, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Diagnostic sauvegardé pour {patient_name} (ID: {diagnostic['id']})")
        return diagnostic
    except Exception as e:
        print(f"❌ Erreur sauvegarde: {e}")
        return None

def get_doctor_stats(doctor_id):
    """Récupérer les statistiques pour le dashboard médecin"""
    try:
        diagnostics = load_diagnostics(doctor_id)
        
        total_diagnostics = len(diagnostics)
        
        # Patients uniques
        unique_patients = len(set(d.get('patient_name', '') for d in diagnostics if d.get('patient_name')))
        
        # Diagnostics récents
        recent = sorted(diagnostics, key=lambda x: x.get('created_at', ''), reverse=True)[:5]
        recent_diagnostics = []
        
        for diag in recent:
            results = diag.get('results', [])
            top_disease = results[0].get('disease', 'Inconnu') if results else 'Inconnu'
            
            recent_diagnostics.append({
                'id': diag['id'],
                'patient_name': diag.get('patient_name', 'Patient'),
                'date': diag.get('created_at', datetime.now().isoformat()),
                'top_disease': top_disease
            })
        
        # Top maladies
        disease_counts = {}
        for diag in diagnostics:
            results = diag.get('results', [])
            if results:
                disease = results[0].get('disease', 'Inconnu')
                disease_counts[disease] = disease_counts.get(disease, 0) + 1
        
        top_diseases = [{'disease': d, 'count': c} for d, c in 
                        sorted(disease_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        return {
            'total_diagnostics': total_diagnostics,
            'total_patients': unique_patients,
            'accuracy': 85.5,
            'recent_diagnostics': recent_diagnostics,
            'top_diseases': top_diseases
        }
    except Exception as e:
        print(f"Erreur stats: {e}")
        return get_demo_stats()

def get_demo_stats():
    """Statistiques de démonstration"""
    return {
        'total_diagnostics': 42,
        'total_patients': 38,
        'accuracy': 92.5,
        'recent_diagnostics': [
            {
                'id': '1',
                'patient_name': 'Jean Dupont',
                'date': datetime.now().isoformat(),
                'top_disease': 'Hypertension'
            },
            {
                'id': '2',
                'patient_name': 'Marie Martin',
                'date': datetime.now().isoformat(),
                'top_disease': 'Diabète Type 2'
            }
        ],
        'top_diseases': [
            {'disease': 'Hypertension', 'count': 12},
            {'disease': 'Diabète', 'count': 8}
        ]
    }

# ==================== ROUTES POUR LE MÉDECIN ====================

@diagnostic_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Route pour le dashboard du médecin"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token manquant'}), 401
        
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        doctor_id = token.split('_')[1] if token.startswith('user_') else '1'
        
        print(f"\n{'='*60}")
        print(f"📊 DASHBOARD POUR MÉDECIN ID: {doctor_id}")
        print(f"{'='*60}")
        
        stats = get_doctor_stats(doctor_id)
        stats['doctor_name'] = 'Dr. Martin'
        stats['last_updated'] = datetime.now().isoformat()
        
        print(f"✅ Diagnostics: {stats['total_diagnostics']}")
        print(f"✅ Patients: {stats['total_patients']}")
        print(f"{'='*60}\n")
        
        return jsonify(stats), 200
        
    except Exception as e:
        print(f"❌ Erreur dashboard: {e}")
        traceback.print_exc()
        return jsonify(get_demo_stats()), 200

@diagnostic_bp.route('/diagnose', methods=['POST'])
def diagnose():
    """Route pour faire un diagnostic (médecin) - UTILISE LE MODÈLE PREDICTOR"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token manquant'}), 401
        
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        doctor_id = token.split('_')[1] if token.startswith('user_') else '1'
        
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        age = data.get('age', 30)
        gender = data.get('gender', 'M')
        patient_name = data.get('patient_name', 'Patient')
        
        if not symptoms:
            return jsonify({'error': 'Aucun symptôme'}), 400
        
        print(f"\n{'='*60}")
        print(f"🩺 DIAGNOSTIC MÉDECIN")
        print(f"👤 Patient: {patient_name}")
        print(f"👤 Âge: {age}, Genre: {gender}")
        print(f"📋 Symptômes: {symptoms}")
        print(f"🆔 Médecin ID: {doctor_id}")
        print(f"{'='*60}")
        
        # ========== UTILISER LE MODÈLE PREDICTOR ==========
        print(f"\n🔍 Appel du modèle predictor.predict_specialty()...")
        result = predictor.predict_specialty(symptoms)
        
        if not result['success']:
            print(f"❌ Erreur de prédiction: {result}")
            return jsonify({'error': 'Erreur de prédiction'}), 400
        
        print(f"\n✅ Résultat brut du modèle:")
        print(f"   - Maladie principale: {result['disease']}")
        print(f"   - Spécialité: {result['specialty']}")
        print(f"   - Confiance: {result['confidence']:.2%}")
        print(f"   - Symptômes identifiés: {result.get('symptoms_found', [])}")
        print(f"   - Alternatives: {len(result.get('top_diseases', [])) - 1}")
        
        # Formater les résultats pour l'interface médecin
        results = []
        
        # Ajouter la maladie principale
        main_disease = {
            'disease': result['disease'],
            'probability_percent': round(result['confidence'] * 100, 2),
            'probability_decimal': round(result['confidence'], 4),
            'confidence_level': 'TRÈS ÉLEVÉE' if result['confidence'] >= 0.8 else 'ÉLEVÉE' if result['confidence'] >= 0.6 else 'MODÉRÉE',
            'medical_action': f'Consulter un {result["specialty"]}',
            'specific_guidance': f'Spécialité recommandée: {result["specialty"]}',
            'suggested_tests': ['Examen clinique approfondi', 'Analyses sanguines', 'Imagerie si nécessaire'],
            'risk_level': 'Élevé' if result['confidence'] >= 0.7 else 'Modéré' if result['confidence'] >= 0.4 else 'Faible',
            'recommendations': [
                'Consultation spécialisée recommandée',
                'Surveillance des symptômes',
                'Suivi médical dans les 48h',
                'Éviter l\'automédication'
            ]
        }
        results.append(main_disease)
        
        # Ajouter les autres possibilités
        alternatives = result.get('top_diseases', [])
        for i, alt in enumerate(alternatives):
            if i == 0:  # Premier élément = maladie principale (déjà ajoutée)
                continue
            if alt['probabilite'] > 0.05:  # Garder seulement les probabilités > 5%
                alt_disease = {
                    'disease': alt['maladie'],
                    'probability_percent': round(alt['probabilite'] * 100, 2),
                    'probability_decimal': round(alt['probabilite'], 4),
                    'confidence_level': 'MODÉRÉE' if alt['probabilite'] >= 0.4 else 'FAIBLE',
                    'medical_action': 'Diagnostic différentiel à considérer',
                    'specific_guidance': f'Spécialité: {alt["specialite"]}',
                    'suggested_tests': ['Examen clinique', 'Tests spécifiques', 'Consultation spécialisée'],
                    'risk_level': 'Modéré' if alt['probabilite'] >= 0.4 else 'Faible',
                    'recommendations': [
                        'Surveillance des symptômes',
                        'Examens complémentaires si persistance',
                        'Consultation si aggravation'
                    ]
                }
                results.append(alt_disease)
        
        # Trier par probabilité décroissante
        results.sort(key=lambda x: x['probability_decimal'], reverse=True)
        
        print(f"\n📊 Résultats formatés ({len(results)} diagnostics):")
        for i, r in enumerate(results):
            print(f"   {i+1}. {r['disease']} - {r['probability_percent']}% - {r['risk_level']}")
        
        # Sauvegarder le diagnostic
        saved = save_diagnostic(doctor_id, patient_name, age, gender, symptoms, results, '')
        
        response = {
            'success': True,
            'diagnostic_assistant': {
                'results': results,
                'statistics': {
                    'symptoms_count': len(symptoms),
                    'top_diagnosis': results[0]['disease'] if results else 'Aucun',
                    'top_probability': results[0]['probability_percent'] if results else 0,
                    'differential_count': len(results)
                },
                'patient_info': {
                    'age': age,
                    'gender': gender,
                    'patient_name': patient_name,
                    'symptoms_analyzed': symptoms
                },
                'diagnostic_id': saved['id'] if saved else None,
                'mode': 'production'
            }
        }
        
        print(f"\n✅ Diagnostic terminé avec succès")
        print(f"{'='*60}\n")
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"\n❌ ERREUR DIAGNOSE: {e}")
        traceback.print_exc()
        print(f"{'='*60}\n")
        return jsonify({'error': str(e)}), 500

@diagnostic_bp.route('/history', methods=['GET'])
def get_history():
    """Route pour l'historique des diagnostics"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token manquant'}), 401
        
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        doctor_id = token.split('_')[1] if token.startswith('user_') else '1'
        
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        print(f"\n{'='*60}")
        print(f"📜 HISTORIQUE POUR MÉDECIN ID: {doctor_id}")
        print(f"📊 Limit: {limit}, Offset: {offset}")
        print(f"{'='*60}")
        
        diagnostics = load_diagnostics(doctor_id)
        
        # Trier par date (plus récent d'abord)
        sorted_diags = sorted(diagnostics, key=lambda x: x.get('created_at', ''), reverse=True)
        
        # Paginer
        paginated = sorted_diags[offset:offset + limit]
        
        print(f"✅ Total diagnostics: {len(diagnostics)}")
        print(f"✅ Affichés: {len(paginated)}")
        print(f"{'='*60}\n")
        
        return jsonify({
            'count': len(paginated),
            'diagnostics': paginated,
            'total': len(diagnostics)
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur history: {e}")
        traceback.print_exc()
        return jsonify({'count': 0, 'diagnostics': [], 'total': 0}), 200

@diagnostic_bp.route('/stats', methods=['GET'])
def get_stats():
    """Route pour les statistiques détaillées"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token manquant'}), 401
        
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        doctor_id = token.split('_')[1] if token.startswith('user_') else '1'
        
        print(f"\n{'='*60}")
        print(f"📊 STATISTIQUES POUR MÉDECIN ID: {doctor_id}")
        print(f"{'='*60}")
        
        # Charger les diagnostics
        diagnostics = load_diagnostics(doctor_id)
        
        # Calculer les statistiques de base
        total_diagnostics = len(diagnostics)
        total_patients = len(set(d.get('patient_name', '') for d in diagnostics if d.get('patient_name')))
        
        print(f"📈 Diagnostics: {total_diagnostics}")
        print(f"👥 Patients uniques: {total_patients}")
        
        # Compter les maladies
        disease_counts = {}
        for diag in diagnostics:
            results = diag.get('results', [])
            if results and len(results) > 0:
                disease = results[0].get('disease', 'Inconnu')
                disease_counts[disease] = disease_counts.get(disease, 0) + 1
        
        # Top 5 maladies
        top_diseases = [
            {'disease': d, 'count': c, 'trend': '+0%'} 
            for d, c in sorted(disease_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        print(f"🏥 Top maladies: {[d['disease'] for d in top_diseases]}")
        
        # Statistiques mensuelles (simulées)
        monthly_stats = [
            {'month': 'Jan', 'diagnostics': 5},
            {'month': 'Fév', 'diagnostics': 8},
            {'month': 'Mar', 'diagnostics': 12},
            {'month': 'Avr', 'diagnostics': 10},
            {'month': 'Mai', 'diagnostics': 15},
            {'month': 'Juin', 'diagnostics': 7},
            {'month': 'Juil', 'diagnostics': 9},
            {'month': 'Août', 'diagnostics': 6},
            {'month': 'Sep', 'diagnostics': 11},
            {'month': 'Oct', 'diagnostics': 14},
            {'month': 'Nov', 'diagnostics': 8},
            {'month': 'Déc', 'diagnostics': 10},
        ]
        
        # Catégories (simulées)
        category_stats = [
            {'category': 'Respiratoire', 'percentage': 35, 'color': 'bg-blue-500'},
            {'category': 'Cardiaque', 'percentage': 25, 'color': 'bg-red-500'},
            {'category': 'Digestif', 'percentage': 20, 'color': 'bg-green-500'},
            {'category': 'Neurologique', 'percentage': 12, 'color': 'bg-purple-500'},
            {'category': 'Autres', 'percentage': 8, 'color': 'bg-gray-500'},
        ]
        
        response = {
            'total_diagnostics': total_diagnostics,
            'total_patients': total_patients,
            'average_accuracy': 85.5,
            'average_duration': 2.3,
            'top_diseases': top_diseases,
            'monthly_stats': monthly_stats,
            'category_stats': category_stats
        }
        
        print(f"✅ Statistiques envoyées")
        print(f"{'='*60}\n")
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Erreur stats: {e}")
        traceback.print_exc()
        return jsonify({
            'total_diagnostics': 0,
            'total_patients': 0,
            'average_accuracy': 85.5,
            'average_duration': 2.3,
            'top_diseases': [],
            'monthly_stats': monthly_stats_default,
            'category_stats': category_stats_default
        }), 200

# Valeurs par défaut pour les erreurs
monthly_stats_default = [
    {'month': 'Jan', 'diagnostics': 5},
    {'month': 'Fév', 'diagnostics': 8},
    {'month': 'Mar', 'diagnostics': 12},
    {'month': 'Avr', 'diagnostics': 10},
    {'month': 'Mai', 'diagnostics': 15},
    {'month': 'Juin', 'diagnostics': 7},
]

category_stats_default = [
    {'category': 'Respiratoire', 'percentage': 35, 'color': 'bg-blue-500'},
    {'category': 'Cardiaque', 'percentage': 25, 'color': 'bg-red-500'},
    {'category': 'Digestif', 'percentage': 20, 'color': 'bg-green-500'},
    {'category': 'Neurologique', 'percentage': 12, 'color': 'bg-purple-500'},
    {'category': 'Autres', 'percentage': 8, 'color': 'bg-gray-500'},
]