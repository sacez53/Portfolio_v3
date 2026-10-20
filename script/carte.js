document.addEventListener('DOMContentLoaded', function () {
    const mapElement = document.getElementById('mapid');
    if (!mapElement || typeof L === 'undefined') return;

    let latitude = 47.84097671508789;
    let longitude = -0.3247646391391754;

    const map = L.map('mapid', {
        center: [latitude, longitude],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: !L.Browser.mobile, // Désactive le drag au doigt par défaut sur mobile pour ne pas bloquer le scroll de la page
        tap: true
    });

    // Sur mobile, réactiver le drag dès que l'utilisateur touche la carte volontairement
    if (L.Browser.mobile) {
        mapElement.addEventListener('click', () => {
            map.dragging.enable();
        });
    }

    // Tuiles CartoDB Positron (Style éditorial monochrome élégant)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Marqueur noir sur mesure
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
});
