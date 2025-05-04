document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');

  if (!name) return;

  fetch('data.json')
    .then(res => res.json())
    .then(profiles => {
      const profile = profiles.find(p => p.name === name);

      if (!profile) {
        document.querySelector('.container').innerHTML = '<p>Profil introuvable.</p>';
        return;
      }

      document.getElementById('profile-name').textContent = profile.name;
      document.getElementById('profile-type').textContent = 'Type : ' + (profile.type === 'repair' ? 'Réparateur' : 'Club');
      document.getElementById('profile-address').innerHTML = `<strong>Adresse :</strong> ${profile.address}`;
      document.getElementById('profile-hours').innerHTML = `<strong>Horaires :</strong> ${profile.hours}`;
      document.querySelector('#profile-website a').href = profile.website;
      document.querySelector('#profile-website a').textContent = profile.website;
      document.querySelector('#profile-social a').href = profile.facebook;
      document.querySelector('#profile-social a').textContent = profile.facebook;
      document.getElementById('btn-appointment').href = 'rendezvous.html?name=' + encodeURIComponent(profile.name);

      // Ajout de la description si présente
      const desc = document.getElementById('profile-description');
      desc.textContent = profile.description || "Ce professionnel n'a pas encore rédigé de présentation.";
      
      // Gestion de l'image avec fallback
      const imgEl = document.getElementById('profile-photo');
      const imageName = profile.name.toLowerCase().replace(/\s+/g, '') + '.jpg';
      const imagePath = `images/${imageName}`;
      imgEl.onerror = () => {
        imgEl.src = 'images/default.jpg';
      };
      imgEl.src = imagePath;
    })
    .catch(error => {
      console.error('Erreur lors du chargement du profil :', error);
      document.querySelector('.container').innerHTML = '<p>Erreur de chargement du profil.</p>';
    });
});
