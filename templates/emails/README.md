# Modèles d’e-mails du portfolio

Les modèles HTML ont une seule colonne, un fond blanc et du texte de 17 px. Le bleu est réservé au titre, aux liens et à la signature. Les styles sont intégrés aux éléments ; la mise en page ne dépend pas de règles CSS pour mobile ni d’images distantes. Les fichiers `.txt` sont les variantes sans mise en forme ni couleur.

## Appliquer les modèles

Le site transmet les données du formulaire à EmailJS. EmailJS conserve le contenu des e-mails dans son propre tableau de bord : modifier ces fichiers ou publier le site ne met pas à jour les modèles envoyés.

Dans le compte [EmailJS](https://dashboard.emailjs.com/), ouvrir les modèles existants indiqués dans `src/script/email.config.js`. Remplacer leur contenu HTML par celui du fichier correspondant, puis enregistrer. Conserver le service et les identifiants actuels.

| Réglage | Notification pour Sacha | Confirmation au visiteur |
| --- | --- | --- |
| Fichier HTML | `notification_pour_sacha.html` | `confirmation_pour_visiteur.html` |
| Identifiant actuel | `template_lsmuviq` | `template_7yp6umq` |
| Objet | Nouveau message portfolio : {{subject}} — {{name}} | Votre message a bien été reçu — Sacha GUITTER |
| Destinataire | sachaguitterphoto@gmail.com | {{email}} |
| Nom d’expéditeur | Portfolio Sacha GUITTER | Sacha GUITTER |
| Reply-To | {{email}} | sachaguitterphoto@gmail.com |

Pour un e-mail sans mise en forme, utiliser le fichier `.txt` correspondant à la place du HTML.

## Variables

Le formulaire transmet `{{firstname}}`, `{{lastname}}`, `{{name}}`, `{{email}}`, `{{subject}}` et `{{message}}`. Les alias `{{user_name}}`, `{{user_email}}` et `{{reply_to}}` restent disponibles. Garder les doubles accolades : EmailJS échappe le contenu saisi par les visiteurs.

Les coordonnées de la signature correspondent à `src/json/infos.json` ; les liens vers le portfolio suivent l’URL canonique de `src/index.html`. Mettre les signatures HTML et texte à jour si ces coordonnées changent.

## Vérifier après enregistrement

Envoyer un essai depuis EmailJS vers une adresse de test, avec un message sur plusieurs lignes et une adresse longue. Vérifier la lecture sur téléphone et la fonction « Répondre ». Le rendu dans une messagerie peut différer de l’aperçu dans un navigateur.
