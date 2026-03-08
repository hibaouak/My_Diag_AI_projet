#Importer les librairies et les fonctions nécessaires.
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

#import notre dataset
data=pd.read_csv("data.csv")

#Étant donné que les données sont déjà préparées et nettoyées, nous pouvons passer directement aux étapes suivantes.
#Séparer notre dataset en deux parties : une pour les symptômes et l’autre pour la variable cible (les maladies).

X = data.drop("diseases", axis=1)
Y=data["diseases"]

#Diviser nos données en deux parties : 80 % pour l’entraînement du modèle et 20 % pour le test.
X_train,X_test,Y_train,Y_test=train_test_split(X,Y,test_size=0.2)

#Importer notre modèle.
model=LogisticRegression()

#training our modele
model.fit(X_train,Y_train)

#print(model.score(X_test,Y_test))
#score donne 0.97 (bonne resultat)
#On peut aussi utulise accuracy pour verifie la precision de notre modele 

#disease to spicialite
def check_disease(disease):

    match disease:

        case 'panic disorder':
            return "Psychiatrist"

        case 'vocal cord polyp':
            return "ENT specialist"

        case 'turner syndrome':
            return "Endocrinologist"
        case 'cryptorchidism':
            return "Urologist"

        case 'poisoning due to ethylene glycol':
            return "Emergency doctor"

        case 'atrophic vaginitis':
            return "Gynecologist"

        case 'allergy':
            return "Allergist"

        case 'otitis media':
            return "ENT specialist"

        case 'acute bronchiolitis':
            return "Pulmonologist"

        case _:
            print("Disease not recognized")

#creation de fonction de prediction :

def predictSpecialisation(symptomes):
    feature=pd.DataFrame([symptomes],columns=X_train.columns)
    disease=model.predict(feature)
    return check_disease(disease)

#symptomes : est une array 2D contien tout les symptomes .chaque valeur est égale à 1 si l’utilisateur présente le symptôme et 0 sinon.

#example:
test = pd.DataFrame([[0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0]],columns=X_train.columns)

print(predictSpecialisation([0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0]))
