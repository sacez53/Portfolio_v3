document.addEventListener("DOMContentLoaded", () => {
    // Déterminer le bon chemin vers infos.json de manière robuste
    const isSubpage = window.location.pathname.includes('/html/') || !!document.querySelector('script[src^="../"]');
    const jsonPath = isSubpage ? '../json/infos.json' : 'json/infos.json';

    fetch(jsonPath + '?v=' + new Date().getTime(), { cache: "no-store" })
        .then(response => response.json())
        .then(data => {
            // Mettre à jour les emails
            document.querySelectorAll('.info-email').forEach(el => {
                if (el.tagName === 'A') {
                    el.href = `mailto:${data.email}`;
                    // S'il n'y a pas de texte spécifique (ex: "Contacter"), on met l'email en texte
                    if (!el.hasAttribute('data-keep-text')) {
                        el.textContent = data.email;
                    }
                } else {
                    el.textContent = data.email;
                }
            });

            // Mettre à jour le téléphone
            document.querySelectorAll('.info-phone').forEach(el => {
                if (el.tagName === 'A') {
                    // On supprime les espaces pour le lien tel:
                    const telClean = data.phone.replace(/\s+/g, '');
                    el.href = `tel:${telClean}`;
                    el.textContent = data.phone;
                } else {
                    el.textContent = data.phone;
                }
            });

            // Mettre à jour la localisation
            document.querySelectorAll('.info-location').forEach(el => {
                el.textContent = data.location;
            });
            
            // Mettre à jour la localisation de la carte si présente
            document.querySelectorAll('.info-map-location').forEach(el => {
                el.textContent = data.mapLocation;
            });

            // Mettre à jour les réseaux sociaux
            document.querySelectorAll('.info-linkedin').forEach(el => {
                if (el.tagName === 'A') el.href = data.socials.linkedin;
            });
            document.querySelectorAll('.info-instagram').forEach(el => {
                if (el.tagName === 'A') el.href = data.socials.instagram;
            });
            document.querySelectorAll('.info-kardeme').forEach(el => {
                if (el.tagName === 'A') el.href = data.socials.kardeme;
            });
        })
        .catch(error => console.error("Erreur lors du chargement des informations :", error));
});
