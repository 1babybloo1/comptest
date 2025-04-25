// profile.js

// Ensure Firebase Config is loaded first
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Cloudinary details (Replace with your actual details)
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload'; // <--- REPLACE
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UNSIGNED_UPLOAD_PRESET'; // <--- REPLACE

// DOM Elements
const profileLoading = document.getElementById('profile-loading');
const profileContent = document.getElementById('profile-content');
const profileError = document.getElementById('profile-error');
const profileBanner = document.getElementById('profile-banner');
const profileAvatarImg = document.getElementById('profile-avatar-img');
const profileUsername = document.getElementById('profile-username');
const profileEmail = document.getElementById('profile-email');
const profileMatches = document.getElementById('profile-matches');
const profileWins = document.getElementById('profile-wins');
const profileLosses = document.getElementById('profile-losses');
const profilePoints = document.getElementById('profile-points');
const avatarInput = document.getElementById('avatar-input');
const bannerInput = document.getElementById('banner-input');
const changeAvatarBtn = document.getElementById('change-avatar-btn');
const changeBannerBtn = document.getElementById('change-banner-btn');
const logoutButton = document.getElementById('logout-button');

let currentUserId = null; // Store the logged-in user's ID

// --- Load User Data ---
async function loadUserProfile(userId) {
    profileLoading.style.display = 'block';
    profileContent.style.display = 'none';
    profileError.style.display = 'none';

    try {
        const userDocRef = db.collection('users').doc(userId);
        const doc = await userDocRef.get();

        if (doc.exists) {
            const userData = doc.data();
            console.log("User Profile Data:", userData);

            // Populate Profile Info
            profileUsername.textContent = userData.username || 'N/A';
            profileEmail.textContent = userData.email || 'N/A';

            // Populate Avatar & Banner (use placeholders if null/empty)
            profileAvatarImg.src = userData.avatarUrl || 'default-avatar.png'; // Replace with your default path/URL
            if (userData.bannerUrl) {
                profileBanner.style.backgroundImage = `url(${userData.bannerUrl})`;
            } else {
                 profileBanner.style.backgroundImage = 'none'; // Or set a default banner
                 profileBanner.style.backgroundColor = '#333'; // Default background color
            }


            // Populate Stats
            // Assuming stats are stored in the 'users' document.
            // If they come from 'leaderboard', you'd need another query here.
            profileMatches.textContent = userData.matches || 0;
            profileWins.textContent = userData.wins || 0;
            profileLosses.textContent = userData.losses || 0;
            profilePoints.textContent = userData.points || 0;


            profileLoading.style.display = 'none';
            profileContent.style.display = 'block'; // Show content
        } else {
            console.error("No profile document found for user:", userId);
            showProfileError("Profile data not found.");
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        showProfileError("Error loading profile data.");
    }
}

function showProfileError(message) {
    profileLoading.style.display = 'none';
    profileContent.style.display = 'none';
    profileError.textContent = message;
    profileError.style.display = 'block';
}


// --- Image Upload Logic ---

async function uploadImage(file, isBanner = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Indicate uploading visually (e.g., disable button, show spinner)
    const button = isBanner ? changeBannerBtn : changeAvatarBtn;
    button.textContent = '...'; // Simple indicator
    button.disabled = true;

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }

        const data = await response.json();
        const imageUrl = data.secure_url; // Use the secure URL
        console.log(`Uploaded ${isBanner ? 'banner' : 'avatar'}:`, imageUrl);

        // Update Firestore
        const userDocRef = db.collection('users').doc(currentUserId);
        const updateData = {};
        if (isBanner) {
            updateData.bannerUrl = imageUrl;
        } else {
            updateData.avatarUrl = imageUrl;
        }
        await userDocRef.update(updateData);
        console.log("Firestore updated with new image URL.");

        // Update UI immediately
        if (isBanner) {
            profileBanner.style.backgroundImage = `url(${imageUrl})`;
        } else {
            profileAvatarImg.src = imageUrl;
            // Also update the header icon if it's visible
             const headerIcon = document.querySelector('#auth-container #user-profile-link img');
             if(headerIcon) headerIcon.src = imageUrl;
        }

    } catch (error) {
        console.error(`Error uploading ${isBanner ? 'banner' : 'avatar'}:`, error);
        alert(`Failed to upload ${isBanner ? 'banner' : 'avatar'}. Please try again.`);
    } finally {
        // Restore button state
        button.textContent = isBanner ? '🖼️' : '📷';
        button.disabled = false;
        // Reset file input
        if (isBanner) bannerInput.value = ''; else avatarInput.value = '';
    }
}

// Event Listeners for File Inputs
avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && currentUserId) {
        uploadImage(file, false); // false for avatar
    }
});

bannerInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && currentUserId) {
        uploadImage(file, true); // true for banner
    }
});


// --- Logout ---
logoutButton.addEventListener('click', async () => {
    try {
        await auth.signOut();
        // onAuthStateChanged in auth.js will handle UI changes.
        // Redirect to home page after logout
        window.location.href = 'index.html';
        console.log("User logged out.");
    } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
    }
});


// --- Initialization based on Auth State ---
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, load their profile
        currentUserId = user.uid;
        console.log("Profile page: User detected", currentUserId);
        loadUserProfile(currentUserId);
    } else {
        // User is signed out, redirect or show error
        console.log("Profile page: No user detected");
         // Optionally, show a message and redirect after a delay
         showProfileError("You must be logged in to view your profile. Redirecting...");
         setTimeout(() => {
              window.location.href = 'index.html'; // Redirect to login/home page
         }, 3000);
    }
});

// Initial check might be handled by onAuthStateChanged firing
