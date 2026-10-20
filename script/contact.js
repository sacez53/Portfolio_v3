document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    // Correspondance des valeurs de sélection vers des libellés lisibles pour l'e-mail
    const SUBJECT_LABELS = {
        'stage':     'Recherche de stage (BUT MMI)',
        'photo':     'Shooting photo / Portrait personnel',
        'evenement': 'Couverture d\'événement / Festival',
        'design':    'Projet Graphique & Éditorial',
        'other':     'Autre demande'
    };

    // Initialisation d'EmailJS si la clé publique est configurée
    const config = window.EMAILJS_CONFIG || {};
    const isConfigured = config.publicKey && 
                         config.publicKey !== 'VOTRE_PUBLIC_KEY' &&
                         config.serviceId && 
                         config.serviceId !== 'VOTRE_SERVICE_ID' &&
                         config.templateId && 
                         config.templateId !== 'VOTRE_TEMPLATE_ID';

    if (typeof emailjs !== 'undefined' && isConfigured) {
        try {
            emailjs.init({ publicKey: config.publicKey });
        } catch (initErr) {
            console.warn("Erreur d'initialisation EmailJS :", initErr);
        }
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        const formData = new FormData(contactForm);
        const firstname = (formData.get('firstname') || '').trim();
        const lastname  = (formData.get('lastname') || '').trim();
        const email     = (formData.get('email') || '').trim();
        const subject   = (formData.get('subject') || '').trim();
        const message   = (formData.get('message') || '').trim();
        const honeypot  = (formData.get('website') || '').trim();

        // 1. Détection bot anti-spam (champ honeypot)
        if (honeypot) {
            // Simulation de succès pour tromper le bot sans consommer le quota EmailJS
            showToast({
                message: "Message envoyé avec succès !",
                detail: "Je vous répondrai dans les plus brefs délais.",
                type: "success"
            });
            contactForm.reset();
            return;
        }

        // 2. Validation des champs obligatoires
        if (!firstname || !lastname || !email || !subject || !message) {
            showToast({
                message: "Champs incomplets",
                detail: "Veuillez remplir l'ensemble des champs du formulaire.",
                type: "error"
            });
            return;
        }

        // 3. Validation de l'adresse e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast({
                message: "Adresse e-mail invalide",
                detail: "Veuillez vérifier le format de votre adresse électronique.",
                type: "error"
            });
            return;
        }

        // 4. Vérification de la configuration EmailJS
        if (!isConfigured || typeof emailjs === 'undefined') {
            showToast({
                message: "Configuration EmailJS requise",
                detail: "Veuillez renseigner vos 3 clés EmailJS dans script/email.config.js.",
                type: "info"
            });
            console.info("💡 EmailJS : Ouvrez 'portfolio_v3_web/script/email.config.js' et collez votre publicKey, serviceId et templateId.");
            return;
        }

        // État de chargement
        submitBtn.disabled = true;
        submitBtn.textContent = 'ENVOI EN COURS…';

        const subjectLabel = SUBJECT_LABELS[subject] || subject;

        // Paramètres transmis au template EmailJS
        const templateParams = {
            firstname:  firstname,
            lastname:   lastname,
            name:       `${firstname} ${lastname}`,
            user_name:  `${firstname} ${lastname}`,
            email:      email,
            user_email: email,
            reply_to:   email,
            subject:    subjectLabel,
            message:    message
        };

        try {
            // 1. Envoi de l'e-mail de notification pour vous (Sacha)
            const response = await emailjs.send(
                config.serviceId,
                config.templateId,
                templateParams,
                config.publicKey
            );

            // 2. Envoi optionnel de l'e-mail de confirmation pour le visiteur
            const hasAutoReply = config.templateAutoReplyId &&
                                 config.templateAutoReplyId !== 'VOTRE_TEMPLATE_AUTOREPLY_ID' &&
                                 config.templateAutoReplyId.trim() !== '';

            if (hasAutoReply) {
                try {
                    await emailjs.send(
                        config.serviceId,
                        config.templateAutoReplyId,
                        templateParams,
                        config.publicKey
                    );
                } catch (autoReplyErr) {
                    console.warn("Avertissement EmailJS (Auto-Reply visiteur non distribué) :", autoReplyErr);
                }
            }

            if (response.status === 200) {
                showToast({
                    message: "Message envoyé avec succès !",
                    detail: "Merci pour votre démarche, je reviendrai vers vous très vite.",
                    type: "success"
                });
                contactForm.reset();
            } else {
                throw new Error("Statut de réponse inattendu : " + response.status);
            }
        } catch (err) {
            console.error("Erreur d'envoi EmailJS :", err);
            showToast({
                message: "Erreur lors de l'envoi",
                detail: "Impossible d'acheminer le message via EmailJS. Vous pouvez m'écrire directement à sachaguitterphoto@gmail.com",
                type: "error"
            });
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    /**
     * Affiche une notification toast accessible qui slide depuis le bas
     * @param {Object} options - { message, detail, type: 'success'|'error'|'info' }
     */
    function showToast({ message, detail = "", type = "success" }) {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.classList.remove('toast-show');
            setTimeout(() => existingToast.remove(), 350);
        }

        const icons = {
            success: `<svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>`,
            error:   `<svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>`,
            info:    `<svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>`
        };

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="toast-icon-wrap">
                ${icons[type]}
            </div>
            <div class="toast-body">
                <span class="toast-title">${message}</span>
                ${detail ? `<span class="toast-detail">${detail}</span>` : ''}
            </div>
            <button class="toast-close" aria-label="Fermer la notification">
                <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            <div class="toast-progress">
                <div class="toast-progress-bar"></div>
            </div>
        `;

        document.body.appendChild(toast);

        void toast.offsetWidth;
        toast.classList.add('toast-show');

        toast.querySelector('.toast-close').addEventListener('click', () => {
            dismissToast(toast);
        });

        const autoClose = setTimeout(() => dismissToast(toast), 5000);

        toast.addEventListener('mouseenter', () => {
            clearTimeout(autoClose);
            toast.querySelector('.toast-progress-bar').style.animationPlayState = 'paused';
        });
        toast.addEventListener('mouseleave', () => {
            toast.querySelector('.toast-progress-bar').style.animationPlayState = 'running';
            setTimeout(() => dismissToast(toast), 2000);
        });
    }

    function dismissToast(toast) {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 400);
    }
});
