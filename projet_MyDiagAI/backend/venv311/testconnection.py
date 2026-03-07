import mysql.connector

print("🧪 Test de connexion à MySQL...")

try:
    conn = mysql.connector.connect(
        host="localhost",
        port=3306,
        user="root",
        password="",
        auth_plugin='mysql_native_password'
    )
    
    print("✅ SUCCÈS : Connexion MySQL OK!")
    
    # Vérifier les bases
    cursor = conn.cursor()
    cursor.execute("SHOW DATABASES")
    dbs = cursor.fetchall()
    
    print(f"📁 Nombre de bases : {len(dbs)}")
    print("Bases disponibles :")
    for db in dbs:
        print(f"  - {db[0]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ ÉCHEC : {e}")
    print("\n🔧 Solutions possibles :")
    print("1. Vérifiez que MySQL est démarré (XAMPP/WAMP/MAMP)")
    print("2. Essayez de changer le port (8889 pour MAMP)")
    print("3. Essayez avec un mot de passe si vous en avez un")