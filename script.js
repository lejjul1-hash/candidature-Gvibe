const WEBHOOK = 'https://canary.discord.com/api/webhooks/1510677988847390831/md7BKx6GzcyMUA-kuI2ZwBqI5pLHoGbwFbzEiAHWOE5vJgPeJQ-vBC6pk2Ws4oLfB4b6';
const ROLE_ID = '1520122808309645413';
const WHITELIST_IP = '';

function updateProgress(step) {
  const bar = document.getElementById('progressBar');
  const label1 = document.getElementById('labelStep1');
  const label2 = document.getElementById('labelStep2');

  if (step === 1) {
    bar.style.width = '50%';
    label1.classList.add('active');
    label2.classList.remove('active');
  } else {
    bar.style.width = '100%';
    label1.classList.remove('active');
    label2.classList.add('active');
  }
}

function nextStep() {
  document.getElementById('step1').style.display = 'none';
  const step2 = document.getElementById('step2');
  step2.style.display = 'block';
  step2.style.animation = 'none';
  requestAnimationFrame(() => {
    step2.style.animation = '';
  });
  updateProgress(2);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep() {
  document.getElementById('step2').style.display = 'none';
  const step1 = document.getElementById('step1');
  step1.style.display = 'block';
  step1.style.animation = 'none';
  requestAnimationFrame(() => {
    step1.style.animation = '';
  });
  updateProgress(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function getIP() {
  try {
    return await fetch('https://api.ipify.org').then(r => r.text());
  } catch {
    return 'unknown';
  }
}

async function sendForm() {
  const status = document.getElementById('status');
  const btn = document.querySelector('.btn-send');

  status.innerHTML = '⏳ Envoi en cours…';
  btn.disabled = true;

  const ip = await getIP();

  if (ip !== WHITELIST_IP) {
    const lastSubmit = localStorage.getItem('lastSubmit');
    if (lastSubmit && Date.now() - Number(lastSubmit) < 86400000) {
      status.innerHTML = '⛔ Vous devez attendre 24h avant de refaire une candidature.';
      btn.disabled = false;
      return;
    }
  }

  const posteSelect = document.getElementById('poste').value;
  const autrePoste = document.getElementById('autrePoste').value.trim();
  const poste = (posteSelect === 'Autre' && autrePoste !== '') ? autrePoste : posteSelect;

  const data = {
    irl:        document.getElementById('irl').value,
    discord:    document.getElementById('discord').value,
    discordId:  document.getElementById('discordId').value,
    prenom:     document.getElementById('prenom').value,
    age:        document.getElementById('age').value,
    dispos:     document.getElementById('dispos').value,
    poste:      poste,
    motivations:document.getElementById('motivations').value,
    why:        document.getElementById('why').value,
    qualites:   document.getElementById('qualites').value,
    definition: document.getElementById('definition').value,
    experience: document.getElementById('experience').value,
    extra:      document.getElementById('extra').value,
  };

  const payload = {
    content: '<@&' + ROLE_ID + '>',
    embeds: [{
      title: '📥 Nouvelle Candidature Staff',
      color: 0xe879a6,
      description: 'Une nouvelle candidature vient d\'être envoyée pour le poste **' + data.poste + '**.',
      fields: [
        { name: '👤 Pseudo Discord',              value: data.discord    || 'Non renseigné', inline: true },
        { name: '🆔 ID Discord',                  value: data.discordId  || 'Non renseigné', inline: true },
        { name: '📌 Poste demandé',               value: data.poste      || 'Non renseigné', inline: true },
        { name: '📄 Présentation IRL',            value: '**Prénom :** ' + data.prenom + '\n**Âge :** ' + data.age + '\n\n**Présentation :**\n' + (data.irl || 'Non renseignée') },
        { name: '🕒 Disponibilités',              value: data.dispos     || 'Non renseigné' },
        { name: '🔥 Motivations',                 value: data.motivations|| 'Non renseigné' },
        { name: '❓ Pourquoi lui ?',              value: data.why        || 'Non renseigné' },
        { name: '⭐ Qualités',                    value: data.qualites   || 'Non renseigné' },
        { name: '🛡 Définition Modérateur / CM',  value: data.definition || 'Non renseigné' },
        { name: '📚 Expérience',                  value: data.experience || 'Aucune' },
        { name: '➕ Informations supplémentaires',value: data.extra      || 'Aucune' },
      ],
      footer: { text: '💼 Système de candidature — GtaVice' },
      timestamp: new Date().toISOString(),
    }],
  };

  try {
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (ip !== WHITELIST_IP) {
      localStorage.setItem('lastSubmit', Date.now());
    }

    status.innerHTML = '✅ Candidature envoyée avec succès !';
    setTimeout(() => location.reload(), 2000);

  } catch (err) {
    status.innerHTML = '❌ Une erreur est survenue. Réessaie.';
    btn.disabled = false;
  }
}

function toggleAutrePoste() {
  const select = document.getElementById('poste');
  const box = document.getElementById('autrePosteBox');
  if (!select || !box) return;
  box.style.display = select.value === 'Autre' ? 'flex' : 'none';
}
