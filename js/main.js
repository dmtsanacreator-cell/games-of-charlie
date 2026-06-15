import { initializeApp } from "https://gstatic.com";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://gstatic.com";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://gstatic.com";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://gstatic.com";

// Configuration
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Elements
const loginNavBtn = document.getElementById('loginNavBtn');
const authSection = document.getElementById('authSection');
const adminBtn = document.getElementById('adminBtn');
const adminSection = document.getElementById('adminSection');
const gamesGrid = document.getElementById('gamesGrid');

const authTitle = document.getElementById('authTitle');
const btnAuthSubmit = document.getElementById('btnAuthSubmit');
const btnAuthToggle = document.getElementById('btnAuthToggle');
const toggleText = document.getElementById('toggleText');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const logoutBtn = document.getElementById('logoutBtn');

let isLoginMode = true;

// 1. Alada Login Button Click Behavior
loginNavBtn.addEventListener('click', () => {
    adminSection.classList.add('hidden'); // Upload section band karein
    authSection.classList.toggle('hidden'); // Login box kholein/band karein
});

// Admin Panel Link Click Behavior
adminBtn.addEventListener('click', (e) => {
    e.preventDefault();
    authSection.classList.add('hidden'); // Login section band karein
    adminSection.classList.toggle('hidden'); // Upload section kholein
});

// Toggle Login vs Register andar wala button
btnAuthToggle.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authTitle.innerText = "Admin Login";
        btnAuthSubmit.innerText = "Sign In";
        toggleText.innerHTML = 'Account nahi hai? <button class="auth-toggle" id="btnAuthToggle">Register Karein</button>';
    } else {
        authTitle.innerText = "Register Admin Account";
        btnAuthSubmit.innerText = "Sign Up";
        toggleText.innerHTML = 'Pehle se account hai? <button class="auth-toggle" id="btnAuthToggle">Login Karein</button>';
    }
    // Re-attach event to dynamic button
    document.getElementById('btnAuthToggle').addEventListener('click', () => btnAuthToggle.click());
});

// Track Auth State (User login status monitor)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Logged In Status
        loginNavBtn.classList.add('hidden'); // Login button chupayein
        authSection.classList.add('hidden'); // Auth form chupayein
        adminBtn.classList.remove('hidden'); // Admin Panel link dikhayein
        
        userEmailDisplay.innerText = "👑 Admin: " + user.email;
    } else {
        // Logged Out Status
        loginNavBtn.classList.remove('hidden');
        adminBtn.classList.add('hidden');
        adminSection.classList.add('hidden');
    }
});

// Submit Authentication (Login/Register trigger)
btnAuthSubmit.addEventListener('click', () => {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if(!email || !password) {
        alert("Please fill all fields.");
        return;
    }

    if (isLoginMode) {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => alert("Logged in successfully!"))
            .catch(err => alert("Login Error: " + err.message));
    } else {
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => alert("Account registered successfully!"))
            .catch(err => alert("Registration Error: " + err.message));
    }
});

// Logout Operation
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        alert("Logged Out!");
        location.reload(); // Page refresh to reset state clean
    });
});

// Load Games dynamically
async function loadGames() {
    gamesGrid.innerHTML = '';
    try {
        const q = query(collection(db, "games"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        if(querySnapshot.empty) {
            gamesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:20px;">No games uploaded yet.</p>';
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

loadGames();

// Grid click events
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

// Form File Upload Functionality
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
        const storageRef = ref(storage, 'mods/' + Date.now() + '_' + file.name);
        const snapshot = await uploadBytes(storageRef, file);
        
        status.innerText = "File uploaded! Generating download link... 🔗";
        const downloadUrl = await getDownloadURL(snapshot.ref);

        status.innerText = "Saving game data to database... 💾";
        
        await addDoc(collection(db, "games"), {
            name: name,
            type: type,
            fileUrl: downloadUrl,
            timestamp: Date.now()
        });

        status.innerText = "Success! Game is now permanently live. 🎉";
        document.getElementById('uploadForm').reset();
        loadGames();

    } catch (error) {
        status.innerText = "Error: " + error.message;
        console.error(error);
    } finally {
        submitBtn.disabled = false;
    }
});
