import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://gstatic.com";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://gstatic.com";

// Same Configuration (Isay main.js mein bhi initialize karna zaroori hai)
const firebaseConfig = {
    apiKey: "AIzaSyCwmGUz0kylp1c9O4kvMk0rdefQAnYnM5w",
    authDomain: "://firebaseapp.com",
    projectId: "charlie-games",
    storageBucket: "charlie-games.firebasestorage.app",
    messagingSenderId: "412741482088",
    appId: "1:412741482088:web:9f8c92c9e4839b6ee7b56d",
    measurementId: "G-8LMY2QETZT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const gamesGrid = document.getElementById('gamesGrid');

// 1. Database se Games Load karke Screen par Dikhana (On Page Load)
async function loadGames() {
    gamesGrid.innerHTML = ''; // Pehle grid khali karein
    try {
        const q = query(collection(db, "games"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        if(querySnapshot.empty) {
            gamesGrid.innerHTML = '<p style="grid-column: 1/-1;">No games uploaded yet.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const game = doc.data();
            renderGameCard(game.name, game.type, game.fileUrl);
        });
    } catch (error) {
        console.error("Error loading games: ", error);
    }
}

// Card Render Karne Ka Function
function renderGameCard(name, type, fileUrl) {
    const newCard = document.createElement('div');
    newCard.className = 'game-card';
    newCard.innerHTML = `
        <h3>${name}</h3>
        <span class="badge">${type}</span>
        <p>Click below to choose your action.</p>
        <button class="action-trigger-btn">Play / Download</button>
        <div class="action-options hidden">
            <a href="${fileUrl}" target="_blank" class="download-btn" style="text-decoration:none; display:inline-block; border-radius:5px;" data-game="${name}">📥 Download File</a>
            <button class="play-online-btn" data-game="${name}">🎮 Play Online</button>
        </div>
    `;
    gamesGrid.appendChild(newCard);
}

// Page load hote hi games load karein
loadGames();

// 2. Event Delegation: Grid ke buttons handling
gamesGrid.addEventListener('click', function(e) {
    if (e.target.classList.contains('action-trigger-btn')) {
        const optionsDiv = e.target.nextElementSibling;
        optionsDiv.classList.toggle('hidden');
    }
    
    if (e.target.classList.contains('play-online-btn')) {
        const gameName = e.target.getAttribute('data-game');
        alert("Launching Game Client: Loading " + gameName + " inside browser... 🕹️");
    }
});

// 3. Asli Firebase Upload Mechanism
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('gameName').value;
    const type = document.getElementById('gameType').value;
    const fileInput = document.getElementById('gameFile');
    const status = document.getElementById('statusMessage');
    const submitBtn = document.getElementById('submitBtn');

    if (fileInput.files.length === 0) return;
    const file = fileInput.files[0];

    status.innerText = "Uploading file to cloud storage... 🚀";
    submitBtn.disabled = true;

    try {
        // A. File ko Firebase Storage mein upload karna
        const storageRef = ref(storage, 'mods/' + Date.now() + '_' + file.name);
        const snapshot = await uploadBytes(storageRef, file);
        
        status.innerText = "File uploaded! Generating download link... 🔗";
        const downloadUrl = await getDownloadURL(snapshot.ref);

        status.innerText = "Saving game data to database... 💾";
        
        // B. Data ko Firestore Database mein save karna
        await addDoc(collection(db, "games"), {
            name: name,
            type: type,
            fileUrl: downloadUrl,
            timestamp: Date.now()
        });

        status.innerText = "Success! Game is now permanently live. 🎉";
        document.getElementById('uploadForm').reset();
        
        // C. List ko reload karna taake naya card dikh jaye
        loadGames();

    } catch (error) {
        status.innerText = "Error: " + error.message;
        console.error(error);
    } finally {
        submitBtn.disabled = false;
    }
});
