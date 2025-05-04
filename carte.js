
  const map = L.map('map').setView([48.75, -0.57], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

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

        allMarkers.forEach(m => {
          const distance = center ? map.distance(center, m.coords) / 1000 : 0;
          const dansRayon = !center || distance <= rayon;
          const typeOK = filtre === 'all' || m.type === filtre;

          if (dansRayon && typeOK) {
            map.addLayer(m.leaflet);

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
      };

      const params = new URLSearchParams(window.location.search);
      const query = params.get('query');
      const radiusParam = parseInt(params.get('radius')) || 20;
      const filterParam = params.get('filter') || 'all';

      if (query) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              const { lat, lon } = data[0];
              const center = [parseFloat(lat), parseFloat(lon)];
              map.setView(center, 13);
              document.querySelector('input[name=query]').value = query;
              document.querySelector('select[name=radius]').value = radiusParam;
              document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
              document.querySelector(`.filters button[data-filter="${filterParam}"]`)?.classList.add('active');
              afficherMarqueursFiltres(center, radiusParam, filterParam);
            }
          })
          .catch(err => {
            console.error('Erreur géocodage :', err);
          });
      }

      document.querySelector('.search-form').addEventListener('submit', e => {
        e.preventDefault();
        const ville = e.target.query.value.trim();
        const rayon = parseInt(e.target.radius.value);
        const filtreActif = document.querySelector('.filters .active')?.dataset.filter || 'all';

        if (!ville) return;

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ville)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              const { lat, lon } = data[0];
              const center = [parseFloat(lat), parseFloat(lon)];
              map.setView(center, 13);
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
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ville)}`)
              .then(res => res.json())
              .then(data => {
                if (data && data.length > 0) {
                  const { lat, lon } = data[0];
                  const center = [parseFloat(lat), parseFloat(lon)];
                  map.setView(center, 13);
                  afficherMarqueursFiltres(center, rayon, type);
                }
              });
          } else {
            afficherMarqueursFiltres(null, 0, type);
          }
        });
      });
    });

