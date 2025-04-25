// auth.js

// Ensure Firebase Config is loaded first (usually via script tag order)
// Initialize Firebase if it hasn't been already
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore(); // Firestore needed for creating user docs

// DOM Elements for Auth
const authContainer = document.getElementById('auth-container');
const modal = document.getElementById('auth-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const registerUsernameInput = document.getElementById('register-username');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const authErrorElement = document.getElementById('auth-error');
const authErrorRegisterElement = document.getElementById('auth-error-register'); // Register specific error

const modalTitle = document.getElementById('modal-title');
const switchToRegisterBtn = document.getElementById('switch-to-register');
const switchToLoginBtn = document.getElementById('switch-to-login');
const switchToRegisterText = document.getElementById('switch-to-register-text');
const switchToLoginText = document.getElementById('switch-to-login-text');

// --- Modal Control ---
function openModal(type = 'login') {
    authErrorElement.textContent = ''; // Clear errors
    authErrorRegisterElement.textContent = '';
    loginForm.reset();
    registerForm.reset();

    if (type === 'register') {
        modalTitle.textContent = 'Register';
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        switchToRegisterText.style.display = 'none';
        switchToLoginText.style.display = 'block';
    } else {
        modalTitle.textContent = 'Login';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        switchToRegisterText.style.display = 'block';
        switchToLoginText.style.display = 'none';
    }
    modal.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
     // Reset to login view for next time
     setTimeout(() => { // Delay reset slightly for animation
          modalTitle.textContent = 'Login';
          loginForm.style.display = 'block';
          registerForm.style.display = 'none';
          switchToRegisterText.style.display = 'block';
          switchToLoginText.style.display = 'none';
          authErrorElement.textContent = '';
          authErrorRegisterElement.textContent = '';
          loginForm.reset();
          registerForm.reset();
     }, 300); // Match CSS transition duration
}

// --- Event Listeners ---
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => { // Close if clicked outside content
    if (event.target == modal) {
        closeModal();
    }
});

switchToRegisterBtn.addEventListener('click', () => openModal('register'));
switchToLoginBtn.addEventListener('click', () => openModal('login'));


// --- Authentication Logic ---

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authErrorElement.textContent = ''; // Clear previous error
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        closeModal();
        // onAuthStateChanged will handle UI update
        console.log("User logged in successfully");
    } catch (error) {
        console.error("Login Error:", error.message);
        authErrorElement.textContent = error.message; // Display error
    }
});

// Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authErrorRegisterElement.textContent = ''; // Clear previous error
    const username = registerUsernameInput.value.trim();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    if (username.length < 3) {
        authErrorRegisterElement.textContent = 'Username must be at least 3 characters.';
        return;
    }
    // Basic validation done by type="email" and minlength="6" in HTML

    try {
        // 1. Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log("User registered in Auth:", user.uid);

        // 2. Create a corresponding user document in Firestore
        const userRef = db.collection('users').doc(user.uid);
        await userRef.set({
            uid: user.uid,
            username: username,
            email: email,
            avatarUrl: null, // Default: no avatar
            bannerUrl: null, // Default: no banner
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            // Initialize stats (optional, sync later or fetch from leaderboard)
            matches: 0,
            wins: 0,
            losses: 0,
            points: 0
        });
        console.log("User document created in Firestore for:", username);

        // User is now logged in, onAuthStateChanged will update UI.
        // Optionally redirect to profile page after registration
        // window.location.href = 'profile.html';
        closeModal();

    } catch (error) {
        console.error("Registration Error:", error);
        authErrorRegisterElement.textContent = error.message; // Display error
    }
});

// --- Auth State Listener (Crucial for UI updates) ---
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in
        console.log("Auth state changed: User is logged in", user.uid);
        try {
            // Fetch user data from Firestore to get profile pic, username etc.
            const userDoc = await db.collection('users').doc(user.uid).get();
            let displayName = user.email; // Fallback
            let profilePicUrl = 'path/to/default/avatar.png'; // Default avatar

            if (userDoc.exists) {
                const userData = userDoc.data();
                displayName = userData.username || user.email; // Use username if available
                if (userData.avatarUrl) {
                    profilePicUrl = userData.avatarUrl;
                }
                 console.log("User data fetched for header:", userData.username);
            } else {
                // Should not happen if registration creates the doc, but handle anyway
                console.warn("User document not found in Firestore for UID:", user.uid);
            }

            // Update header UI
            authContainer.innerHTML = `
                <a href="profile.html" id="user-profile-link" title="${displayName}">
                    <img src="${profilePicUrl}" alt="${displayName}">
                </a>
            `;
        } catch (error) {
            console.error("Error fetching user data for header:", error);
            // Show basic logged-in state without profile pic
            authContainer.innerHTML = `
                <a href="profile.html" id="user-profile-link" title="Profile">👤</a> <!-- Simple icon fallback -->
            `;
        }

    } else {
        // User is signed out
        console.log("Auth state changed: User is logged out");
        // Update header UI
        authContainer.innerHTML = `
            <button id="login-register-btn">Login / Register</button>
        `;
        // Add listener to the newly created button
        const loginRegBtn = document.getElementById('login-register-btn');
        if (loginRegBtn) {
             loginRegBtn.addEventListener('click', () => openModal('login')); // Default to login view
        } else {
             console.error("Login/Register button not found after logout render.");
        }
    }
});

// Initial check in case the script loads after auth state is resolved
// Handled by onAuthStateChanged setting the initial state correctly.
