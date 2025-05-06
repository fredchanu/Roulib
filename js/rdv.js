let selectedSlot = null;

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("prestation-select");
  const slotsSection = document.getElementById("slots-section");
  const slotsContainer = document.getElementById("slots-container");
  const reserverBtn = document.getElementById("confirm-booking"); // bouton de confirmation

  // Charger les prestations
  fetch('prestations.json')
    .then(res => res.json())
    .then(data => {
      data.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.nom} (${p.durée} min)`;
        select.appendChild(opt);
      });
    });

  // Sélection d'une prestation → afficher les créneaux
  select.addEventListener("change", () => {
    if (!select.value) {
      slotsSection.classList.add("hidden");
      reserverBtn.classList.add("hidden");
      return;
    }

    fetch('planning.json')
      .then(res => res.json())
      .then(data => {
        slotsContainer.innerHTML = "";
        data.forEach(jour => {
          const titre = document.createElement("h3");
          titre.textContent = jour.date;
          slotsContainer.appendChild(titre);

          jour.heures.forEach(h => {
            const btn = document.createElement("button");
            btn.className = "slot-button";
            btn.textContent = h;
            btn.addEventListener("click", () => {
              document.querySelectorAll(".slot-button").forEach(b => b.classList.remove("selected"));
              btn.classList.add("selected");
              selectedSlot = { date: jour.date, heure: h };
              reserverBtn.classList.remove("hidden");
            });
            slotsContainer.appendChild(btn);
          });
        });

        slotsSection.classList.remove("hidden");
      });
  });

  // Clic sur "Réserver ce créneau"
  if (reserverBtn) {
    reserverBtn.addEventListener("click", function () {
      if (!selectedSlot) return;

      const overlay = document.getElementById("overlay");
      if (overlay) {
        console.log("CLIC détecté → overlay affiché");
        overlay.classList.remove("overlay-hidden");
      }
      

      setTimeout(() => {
        window.location.href = "confirmation.html";
      }, 2000);
    });
  }
});
