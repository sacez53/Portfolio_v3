/**
 * ══════════════════════════════════════════════════════════════════════════
 * CONFIGURATION EMAILJS POUR LE PORTFOLIO DE SACHA GUITTER
 * ══════════════════════════════════════════════════════════════════════════
 * 
 * Ce fichier permet d'envoyer les messages du formulaire de contact
 * directement depuis GitHub Pages (sans avoir besoin d'un serveur PHP).
 * 
 * OÙ TROUVER CES 3 CLÉS SUR https://www.emailjs.com/ :
 * 
 * 1. publicKey :
 *    - Connectez-vous sur EmailJS
 *    - Cliquez sur "Account" (en bas à gauche)
 *    - Copiez votre "Public Key" (ex: "AbCdEfGh123456789")
 * 
 * 2. serviceId :
 *    - Allez dans "Email Services"
 *    - Cliquez sur "Add New Service" (ex: Gmail) et connectez votre adresse
 *    - Copiez l'ID du service (ex: "service_xxxxxxx")
 * 
 * 3. templateId (Notification reçue par vous) :
 *    - Allez dans "Email Templates"
 *    - Créez un template avec le fichier 'modeles_mails/notification_pour_sacha.html'
 *    - Copiez le Template ID (ex: "template_xxxxxxx")
 * 
 * 4. templateAutoReplyId (Confirmation reçue par le visiteur — optionnel) :
 *    - Créez un second template avec le fichier 'modeles_mails/confirmation_pour_visiteur.html'
 *    - Copiez son Template ID (ex: "template_yyyyyyy")
 * ══════════════════════════════════════════════════════════════════════════
 */

window.EMAILJS_CONFIG = {
    publicKey:           'yhvYcP53ipBGVp_DZ',            // 1. Clé publique (Account > Public Key)
    serviceId:           'service_sytx0en',           // 2. ID du service email (Email Services)
    templateId:          'template_lsmuviq',          // 3. ID du template notification (pour vous)
    templateAutoReplyId: 'template_7yp6umq' // 4. ID du template confirmation (pour le visiteur, optionnel)
};
