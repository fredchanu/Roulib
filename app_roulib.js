console.log('Roulib JS chargé');

let leafletMarkers = [];
let globalData = [];

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function applyAllFilters(page = 1) {
  const selectedService = document.getElementById('serviceFilter').value.toLowerCase();
  const villeCible = document.getElementById('villeCible').value.toLowerCase();
  const rayon = parseFloat(document.getElementById('rayonKm').value);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  leafletMarkers.forEach(({ marker }) => map.removeLayer(marker));
  leafletMarkers = [];

  let referenceVille = null;
  if (villeCible && !isNaN(rayon)) {
    referenceVille = globalData.find(r => r.ville.toLowerCase() === villeCible);
    if (!referenceVille) {
      alert("Ville de référence non trouvée pour le rayon.");
      return;
    }
  }

  const filteredData = globalData.filter(reparateur => {
    const serviceMatch = selectedService === "" || reparateur.services.join(', ').toLowerCase().includes(selectedService);
    let rayonMatch = true;
    if (referenceVille) {
      const dist = getDistance(referenceVille.lat, referenceVille.lng, reparateur.lat, reparateur.lng);
      rayonMatch = dist <= rayon;
    }
    return serviceMatch && rayonMatch;
  });

  const itemsPerPage = 5;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = filteredData.slice(start, end);

  pageData.forEach(reparateur => {
    const card = document.createElement('div');
    card.classList.add('reparateur-card');

    card.innerHTML = `
      <h3>${reparateur.name}</h3>
      <p><strong>Ville :</strong> ${reparateur.ville}</p>
      <p><strong>Services :</strong> ${reparateur.services.join(', ')}</p>
      <a href="profile.html?id=${reparateur.id}" class="btn-primary">Voir la fiche</a>
    `;

    resultsDiv.appendChild(card);

    const marker = L.marker([reparateur.lat, reparateur.lng], {
      icon: L.icon({
        iconUrl: 'marker-mint.png',
        iconSize: [45, 45],
        iconAnchor: [22, 45]
      })
    }).addTo(map);

    marker.bindPopup(`<strong>${reparateur.name}</strong><br>${reparateur.ville}`);
    leafletMarkers.push({ marker });
  });

  renderPagination(filteredData.length, page, itemsPerPage);
}

function renderPagination(resultCount, currentPage, itemsPerPage) {
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = '';

  const pageCount = Math.ceil(resultCount / itemsPerPage);
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = (i === currentPage) ? 'active' : '';
    btn.onclick = () => applyAllFilters(i);
    paginationDiv.appendChild(btn);
  }
}

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    globalData = data;
    applyAllFilters();

    document.getElementById('serviceFilter').addEventListener('change', () => applyAllFilters());
    document.getElementById('filtrerRayon').addEventListener('click', () => applyAllFilters());
  })
  .catch(error => {
    console.error('Erreur lors du chargement des réparateurs :', error);
  });

const map = L.map('map').setView([49.1, -0.5], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
