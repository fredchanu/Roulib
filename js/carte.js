const map = L.map('map');
map.setView([48.75, -0.57], 8); // Normandie par défaut

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function saveFiltersToStorage(ville, rayon, filtre) {
  localStorage.setItem("roulib_filters", JSON.stringify({ ville, rayon, filtre }));
}

function loadFiltersFromStorage() {
  const saved = JSON.parse(localStorage.getItem("roulib_filters"));
  if (!saved) return null;
  return saved;
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("reset") === "1") {
  localStorage.removeItem("roulib_filters");
}

const queryParam = urlParams.get("query");
const radiusParam = parseInt(urlParams.get("radius")) || 20;
const filterParam = urlParams.get("filter") || "all";

const saved = loadFiltersFromStorage();
const query = queryParam || saved?.ville || '';

const allMarkers = [];

fetch('data.json')
  .then(res => res.json())
  .then(markers => {
    markers.forEach(marker => {
      const icon = L.divIcon({
        className: `custom-marker marker-${marker.type}`,
        iconSize: [28, 36],
        popupAnchor: [0, -16]
      });
      const leafletMarker = L.marker(marker.coords, { icon }).bindPopup(`<strong>${marker.name}</strong>`);
      allMarkers.push({ ...marker, leaflet: leafletMarker });
    });

    const afficherMarqueursFiltres = (center, rayon, filtre) => {
      const profileContainer = document.querySelector('.profiles');
      profileContainer.innerHTML = '';
      let bounds = [];

      allMarkers.forEach(m => {
        const distance = center ? map.distance(center, m.coords) / 1000 : 0;
        const dansRayon = !center || distance <= rayon;
        const typeOK = filtre === 'all' || m.type === filtre;

        if (dansRayon && typeOK) {
          map.addLayer(m.leaflet);
          bounds.push(m.coords);

          const card = document.createElement('div');
          card.className = 'profile-card';
          card.innerHTML = `
            <h3>${m.name}</h3>
            <p>Type : ${m.type === 'repair' ? 'Réparateur' : 'Club'}</p>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-map">Voir sur carte</button>
              <button class="btn-fiche">Voir la fiche</button>
            </div>
          `;
          card.querySelector('.btn-map').addEventListener('click', () => {
            map.setView(m.coords, 15);
            m.leaflet.openPopup();
          });
          card.querySelector('.btn-fiche').addEventListener('click', () => {
            window.location.href = `profile.html?name=${encodeURIComponent(m.name)}`;
          });
          profileContainer.appendChild(card);
        } else {
          map.removeLayer(m.leaflet);
        }
      });

      const filler = document.createElement('div');
      filler.style.height = '100px';
      profileContainer.appendChild(filler);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    if (query) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const center = [parseFloat(lat), parseFloat(lon)];
            document.querySelector('input[name=query]').value = query;
            document.querySelector('select[name=radius]').value = radiusParam;
            document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
            document.querySelector(`.filters button[data-filter="${filterParam}"]`)?.classList.add('active');
            afficherMarqueursFiltres(center, radiusParam, filterParam);
          }
        });
    }

    document.querySelector('.search-form').addEventListener('submit', e => {
      e.preventDefault();
      const ville = e.target.query.value.trim();
      const rayon = parseInt(e.target.radius.value);
      const filtreActif = document.querySelector('.filters .active')?.dataset.filter || 'all';

      if (!ville) return;

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ville)}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const center = [parseFloat(lat), parseFloat(lon)];
            saveFiltersToStorage(ville, rayon, filtreActif);
            afficherMarqueursFiltres(center, rayon, filtreActif);
          }
        });
    });

    document.querySelectorAll('.filters button').forEach(button => {
      button.addEventListener('click', () => {
        const type = button.dataset.filter;
        document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        const rayon = parseInt(document.querySelector('select[name=radius]').value);
        const ville = document.querySelector('input[name=query]').value.trim();

        if (ville) {
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ville)}&limit=1`)
            .then(res => res.json())
            .then(data => {
              if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const center = [parseFloat(lat), parseFloat(lon)];
                saveFiltersToStorage(ville, rayon, type);
                afficherMarqueursFiltres(center, rayon, type);
              }
            });
        } else {
          afficherMarqueursFiltres(null, 0, type);
        }
      });
    });
  });