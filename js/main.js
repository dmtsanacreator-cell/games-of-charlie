// Toggle Admin Panel View
const adminBtn = document.getElementById('adminBtn');
const adminSection = document.getElementById('adminSection');

adminBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adminSection.classList.toggle('hidden');
});

// Event Delegation: Grid ke andar clicks ko handle karna
document.getElementById('gamesGrid').addEventListener('click', function(e) {
    
    // 1. Agar user main "Play / Download" button dabaye
    if (e.target.classList.contains('action-trigger-btn')) {
        const optionsDiv = e.target.nextElementSibling;
        optionsDiv.classList.toggle('hidden');
    }
    
    // 2. Agar user "Download File" par click kare
    if (e.target.classList.contains('download-btn')) {
        const gameName = e.target.getAttribute('data-game');
        alert("Starting Download for: " + gameName + " \n(Your file is being fetched from Vercel storage!)");
    }
    
    // 3. Agar user "Play Online" par click kare
    if (e.target.classList.contains('play-online-btn')) {
        const gameName = e.target.getAttribute('data-game');
        alert("Launching Game Client: Loading " + gameName + " inside browser... 🕹️");
    }
});

// Direct Web Upload Mechanism
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('gameName').value;
    const type = document.getElementById('gameType').value;
    const fileInput = document.getElementById('gameFile');
    const status = document.getElementById('statusMessage');
    const gamesGrid = document.getElementById('gamesGrid');

    if (fileInput.files.length === 0) return;

    status.innerText = "Connecting to web storage & uploading... 🚀";
    document.getElementById('submitBtn').disabled = true;

    setTimeout(() => {
        status.innerText = "Success! Game live on CharlieFreeGames server. 🎉";
        document.getElementById('submitBtn').disabled = false;

        // Naya Dynamic Card jisme dono functionality built-in hain
        const newCard = document.createElement('div');
        newCard.className = 'game-card';
        newCard.innerHTML = `
            <h3>${name}</h3>
            <span class="badge">${type}</span>
            <p>Click below to choose your action.</p>
            <button class="action-trigger-btn">Play / Download</button>
            <div class="action-options hidden">
                <button class="download-btn" data-game="${name}">📥 Download File</button>
                <button class="play-online-btn" data-game="${name}">🎮 Play Online</button>
            </div>
        `;
        
        const defaultCard = document.querySelector('.default-card');
        if (defaultCard) defaultCard.remove();

        gamesGrid.insertBefore(newCard, gamesGrid.firstChild);
        document.getElementById('uploadForm').reset();
    }, 2500);
});
