(function () {
    let mapInitialized = false;

    function initLeafletMap() {
        const mapElement = document.getElementById('mapid');
        if (!mapElement || mapInitialized) return;

        // Si Leaflet n'est pas encore disponible (chargement CDN asynchrone), réessayer
        if (typeof L === 'undefined') {
            setTimeout(initLeafletMap, 120);
            return;
        }

        mapInitialized = true;

        const latitude = 47.84097671508789;
        const longitude = -0.3247646391391754;

        const isMobile = L.Browser.mobile || window.innerWidth <= 768;

        const map = L.map('mapid', {
            center: [latitude, longitude],
            zoom: 13,
            zoomControl: true,
            scrollWheelZoom: false,
            dragging: !isMobile,
            tap: true
        });

        // Sur mobile, réactiver le déplacement au doigt quand l'utilisateur touche la carte volontairement
        if (isMobile) {
            mapElement.addEventListener('click', () => {
                map.dragging.enable();
            });
        }

        // Tuiles OpenStreetMap officielles (haute disponibilité, sans clé d'API requise)
        // Le rendu éditorial noir et blanc est assuré par le filtre CSS grayscale sur #mapid
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs',
            maxZoom: 19
        }).addTo(map);

        // Marqueur minimaliste noir & blanc sur mesure
        const customIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: '<div style="width: 14px; height: 14px; background: #000000; border: 2px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 0 2px #000000;"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
            <div style="font-family: var(--font-body); padding: 4px; font-size: 13px; color: #000000;">
                <strong style="font-family: var(--font-display); font-size: 14px; text-transform: uppercase;">Sacha GUITTER</strong><br>
                <span class="info-map-location">Sablé-sur-Sarthe / Laval</span><br>
                <a href="mailto:sachaguitterphoto@gmail.com" style="color: #000000; font-weight: 700; text-decoration: underline;" class="info-email" data-keep-text="true">Contacter</a>
            </div>
        `).openPopup();

        // Recalculer la taille du conteneur (essentiel quand la section est révélée ou redimensionnée)
        function refreshSize() {
            if (map) {
                map.invalidateSize();
            }
        }

        setTimeout(refreshSize, 300);
        setTimeout(refreshSize, 1000);

        window.addEventListener('resize', refreshSize, { passive: true });

        // Surveiller l'apparition de la carte dans le viewport pour recalculer immédiatement les tuiles
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        refreshSize();
                    }
                });
            }, { threshold: 0.05 });
            observer.observe(mapElement);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLeafletMap);
    } else {
        initLeafletMap();
    }
})();
