# Modèles d'Emails pour EmailJS — Portfolio Sacha GUITTER

Ce dossier contient les modèles d'emails prêts à l'emploi (formats **HTML éditorial** et **Texte brut**), conçus sur mesure pour respecter rigoureusement la **Direction Artistique éditoriale suisse** du portfolio (Blanc Papier `#FFFFFF`, Noir d'Encre `#000000`, filets nets `1px`/`2px`, angles droits stricts, typographie forte en capitales) et optimisés pour être **100% responsive** sur mobile, tablette et desktop.

---

## 📁 Contenu du dossier

| Fichier | Destinataire | Description |
| :--- | :--- | :--- |
| **`notification_pour_sacha.html`** | **Sacha GUITTER** | Version HTML riche reçue dès qu'un visiteur envoie le formulaire : fiche contact, objet lisible, message mis en valeur et bouton direct « Répondre ». |
| **`notification_pour_sacha.txt`** | **Sacha GUITTER** | Version texte brut équivalente (secours ou consultation rapide). |
| **`confirmation_pour_visiteur.html`** | **Le Visiteur** | Accusé de réception HTML envoyé à la personne qui vous a écrit : remerciement personnalisé, récapitulatif de sa demande et vos coordonnées directes (téléphone, Instagram, portfolio). |
| **`confirmation_pour_visiteur.txt`** | **Le Visiteur** | Version texte brut de l'accusé de réception. |

---

## 🏷️ Variables utilisables dans EmailJS

Le formulaire du portfolio injecte automatiquement ces variables dans les templates :

- `{{firstname}}` : Prénom de l'expéditeur (ex: *Camille*)
- `{{lastname}}` : Nom de l'expéditeur (ex: *Dupont*)
- `{{name}}` : Nom complet concaténé (ex: *Camille Dupont*)
- `{{email}}` ou `{{reply_to}}` : Adresse email saisie par le visiteur (ex: *camille.dupont@exemple.fr*)
- `{{subject}}` : Objet sélectionné traduit en clair (ex: *Shooting photo / Portrait personnel*, *Commande de tirage d'art*, etc.)
- `{{message}}` : Contenu du message saisi

---

## 🛠️ Guide de configuration pas à pas dans EmailJS

### Étape 1 — Créer le compte et le Service Email
1. Rendez-vous sur [https://www.emailjs.com/](https://www.emailjs.com/) et connectez-vous.
2. Dans **Email Services**, cliquez sur **Add New Service** (choisissez Gmail ou votre messagerie habituelle, par exemple `sachaguitterphoto@gmail.com`).
3. Notez le **Service ID** (ex: `service_xyz123`).

---

### Étape 2 — Configurer le Template 1 : Notification pour Sacha
1. Dans le menu de gauche, allez sur **Email Templates** puis **Create New Template**.
2. Nommez le template : `Notification Portfolio (Sacha)`.
3. Configurez les champs d'en-tête :
   - **Subject** : `Nouveau message portfolio : {{subject}} — {{name}}`
   - **To Email** : `sachaguitterphoto@gmail.com`
   - **From Name** : `Portfolio Sacha Guitter`
   - **Reply-To** : `{{email}}` *(très important : cela vous permet de cliquer sur "Répondre" dans votre messagerie pour écrire directement au visiteur)*.
4. Dans l'éditeur de contenu :
   - Basculez en mode **Source Code** (`</>`) ou HTML.
   - Copiez l'intégralité du fichier [`notification_pour_sacha.html`](file:///C:/Users/sacha/Documents/DEVELOPPEMENT/Dev_web/portfolio_v3/portfolio_v3_web/modeles_mails/notification_pour_sacha.html) et collez-la.
5. Cliquez sur **Save**.
6. Notez le **Template ID** (ex: `template_abc456`).

---

### Étape 3 — Configurer le Template 2 : Accusé de réception pour le Visiteur
1. Créez un second template : **Create New Template**.
2. Nommez le template : `Accusé de réception (Visiteur)`.
3. Configurez les champs d'en-tête :
   - **Subject** : `Confirmation de votre message — Sacha GUITTER`
   - **To Email** : `{{email}}` *(adresse saisie par le visiteur dans le formulaire)*
   - **From Name** : `Sacha GUITTER`
   - **Reply-To** : `sachaguitterphoto@gmail.com`
4. Dans l'éditeur de contenu :
   - Basculez en mode **Source Code** (`</>`) ou HTML.
   - Copiez l'intégralité du fichier [`confirmation_pour_visiteur.html`](file:///C:/Users/sacha/Documents/DEVELOPPEMENT/Dev_web/portfolio_v3/portfolio_v3_web/modeles_mails/confirmation_pour_visiteur.html) et collez-la.
5. Cliquez sur **Save**.
6. Notez ce second **Template ID** (ex: `template_def789`).

---

### Étape 4 — Renseigner vos clés dans le code du site

Ouvrez le fichier [`portfolio_v3_web/script/email.config.js`](file:///C:/Users/sacha/Documents/DEVELOPPEMENT/Dev_web/portfolio_v3/portfolio_v3_web/script/email.config.js) et remplacez les valeurs d'exemple :

```javascript
window.EMAILJS_CONFIG = {
    // Clé publique trouvée dans EmailJS > Account > Public Key
    publicKey: "VOTRE_PUBLIC_KEY_ICI",

    // Identifiant du service créé à l'étape 1
    serviceId: "VOTRE_SERVICE_ID_ICI",

    // Identifiant du Template 1 (notification pour Sacha)
    templateId: "VOTRE_TEMPLATE_ID_NOTIFICATION",

    // Identifiant du Template 2 (accusé de réception pour le visiteur)
    // Laissez vide "" si vous ne souhaitez pas d'accusé de réception automatique
    templateAutoReplyId: "VOTRE_TEMPLATE_ID_ACCUSE_RECEPTION"
};
```

---

## 🔒 Sécurité et bonnes pratiques
- **Clé publique sécurisée** : La `publicKey` EmailJS est conçue pour fonctionner côté navigateur (frontend). EmailJS limite les abus par origine de domaine (vous pouvez restreindre les domaines autorisés dans votre compte EmailJS : `Account > Security > Allowed Domains`).
- **Protection anti-spam intégrée** : Le formulaire du portfolio intègre déjà un champ invisible honeypot anti-robots et une validation stricte des champs avant envoi.
