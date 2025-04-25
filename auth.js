--- START OF FILE auth.js ---
// --- START Firebase Config ---
// Make sure this matches the config in index.html
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // <--- REPLACE
    authDomain: "YOUR_AUTH_DOMAIN", // <--- REPLACE
    projectId: "YOUR_PROJECT_ID", // <--- REPLACE
    storageBucket: "YOUR_STORAGE_BUCKET", // <--- REPLACE
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- REPLACE
    appId: "YOUR_APP_ID" // <--- REPLACE
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Initialize Firestore
// --- END Firebase Config ---

const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authTitle = document.getElementById('authTitle');
const submitButton = document.getElementById('submitButton');
const toggleText = document.getElementById('toggleText');
const toggleAuthModeLink = document.getElementById('toggleAuthMode');
const errorMessage = document.getElementById('errorMessage');

let isLoginMode = true;

// Function to toggle between Login and Signup modes
function toggleMode() {
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? 'Login' : 'Sign Up';
    submitButton.textContent = isLoginMode ? 'Login' : 'Sign Up';
    toggleText.textContent = isLoginMode ? "Don't have an account? " : "Already have an account? ";
    toggleAuthModeLink.textContent = isLoginMode ? 'Sign up' : 'Login';
    errorMessage.textContent = ''; // Clear errors on mode toggle
    authForm.reset(); // Clear form fields
}

toggleAuthModeLink.addEventListener('click', toggleMode);

// Function to create a user document in Firestore upon signup
async function createUserProfileDocument(user, additionalData = {}) {
    if (!user) return;

    const userRef = db.doc(`users/${user.uid}`); // Document ID = user UID
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
        const { email } = user;
        const createdAt = new Date();
        try {
            await userRef.set({
                uid: user.uid,
                email,
                createdAt,
                displayName: email.split('@')[0], // Default display name
                profilePicUrl: null, // Default profile pic
                bannerUrl: null,     // Default banner
                gameUsername: null,  // No game username linked initially
                ...additionalData   // Any other data needed
            });
            console.log("User profile created in Firestore");
        } catch (error) {
            console.error("Error creating user profile:", error);
            errorMessage.textContent = "Failed to create user profile.";
        }
    }
    return userRef;
}


// Handle form submission
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = ''; // Clear previous errors
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        if (isLoginMode) {
            // --- Login ---
            await auth.signInWithEmailAndPassword(email, password);
            console.log('User logged in successfully');
            window.location.href = 'profile.html'; // Redirect to profile page
        } else {
            // --- Sign Up ---
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            console.log('User signed up successfully:', userCredential.user);
            // Create user profile in Firestore
            await createUserProfileDocument(userCredential.user);
            window.location.href = 'profile.html'; // Redirect to profile page after signup
        }
    } catch (error) {
        console.error('Authentication error:', error);
        errorMessage.textContent = error.message; // Display Firebase error message
    }
});

// Optional: Redirect if already logged in
auth.onAuthStateChanged(user => {
    if (user) {
        // If user is already logged in and tries to access auth.html, redirect them to profile
        // Check if the current page IS auth.html to prevent redirect loops from profile page check
        if (window.location.pathname.endsWith('auth.html')) {
             console.log("User already logged in, redirecting to profile.");
            // window.location.href = 'profile.html'; // Temporarily disable to avoid loops during dev
        }
    }
});

// Prevent right-click and dev tools on this page too
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 67 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) {
        e.preventDefault();
        return false;
    }
});
--- END OF FILE auth.js ---
