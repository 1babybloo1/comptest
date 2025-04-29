// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyDWFPys8dbSgis98tbm5PVqMuHqnCpPIxI", // Replace with your actual API key if this is public placeholder
    authDomain: "poxelcomp.firebaseapp.com",
    projectId: "poxelcomp",
    storageBucket: "poxelcomp.firebasestorage.app",
    messagingSenderId: "620490990104",
    appId: "1:620490990104:web:709023eb464c7d886b996d",
};

// --- Initialize Firebase ---
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = "djttn4xvk"; // <-- REPLACE with your Cloudinary Cloud Name
const CLOUDINARY_UPLOAD_PRESET = "compmanage"; // <-- REPLACE with your unsigned Upload Preset name

// --- URL Parameter Parsing ---
const urlParams = new URLSearchParams(window.location.search);
const profileUidFromUrl = urlParams.get('uid');

// --- Admin Emails ---
const adminEmails = [
    'trixdesignsofficial@gmail.com',
    'jackdmbell@outlook.com',
    'myrrr@myrrr.myrrr'
].map(email => email.toLowerCase());

// --- Badge Configuration ---
const badgeConfig = {
    verified: { emails: ['jackdmbell@outlook.com', 'myrrr@myrrr.myrrr'].map(e => e.toLowerCase()), className: 'badge-verified', title: 'Verified' },
    creator: { emails: ['jackdmbell@outlook.com'].map(e => e.toLowerCase()), className: 'badge-creator', title: 'Content Creator' },
    moderator: { emails: ['jackdmbell@outlook.com', 'mod_team@sample.org'].map(e => e.toLowerCase()), className: 'badge-moderator', title: 'Moderator' }
};

// --- DOM Elements ---
const profileContentWrapper = document.getElementById('profile-content-wrapper');
const profileContent = document.getElementById('profile-content');
const loadingIndicator = document.getElementById('loading-profile');
const messageContainer = document.getElementById('message-container');
const messageText = document.getElementById('message-text');
// Profile Pic Elements
const profilePicDiv = document.getElementById('profile-pic');
const profileImage = document.getElementById('profile-image');
const profileInitials = document.getElementById('profile-initials');
const editProfilePicIcon = document.getElementById('edit-profile-pic-icon');
const profilePicInput = document.getElementById('profile-pic-input');
// Other Profile Elements
const usernameDisplay = document.getElementById('profile-username');
const emailDisplay = document.getElementById('profile-email');
const competitiveStatsDisplay = document.getElementById('stats-display');
const profileLogoutBtn = document.getElementById('profile-logout-btn');
const adminTag = document.getElementById('admin-tag');
const rankDisplay = document.getElementById('profile-rank');
const titleDisplay = document.getElementById('profile-title');
const profileIdentifiersDiv = document.querySelector('.profile-identifiers');
const profileBadgesContainer = document.getElementById('profile-badges-container');
const poxelStatsSection = document.getElementById('poxel-stats-section');
const poxelStatsDisplay = document.getElementById('poxel-stats-display');
const friendActionContainer = document.getElementById('friend-action-container');
// Modal Elements
const editModal = document.getElementById('edit-modal');
const modalImage = document.getElementById('image-to-crop');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalApplyBtn = document.getElementById('modal-apply-btn');
const modalSpinner = modalApplyBtn.querySelector('.spinner'); // Get spinner inside apply button

// --- Global/Scoped Variables ---
let loggedInUser = null; // Updated by auth listener
let loggedInUserProfileData = null; // Cache logged-in user's data for friend checks
let allAchievements = null;
let viewingUserProfileData = {}; // Holds { profile: {...}, stats: {...} } of viewed user
let isTitleSelectorOpen = false;
let titleSelectorElement = null;
let cropper = null; // To hold the Cropper.js instance
let isOwnProfile = false; // Flag to check if viewing own profile

// =============================================================================
// --- UTILITY & HELPER FUNCTIONS ---
// =============================================================================

// --- Show Message Function ---
function showMessage(message, isError = false) {
    loadingIndicator.style.display = 'none';
    profileContentWrapper.style.display = 'none';
    messageText.textContent = message;
    messageText.style.color = isError ? '#f8d7da' : 'var(--text-secondary)'; // Reddish for errors
    messageContainer.style.borderColor = isError ? '#d9534f' : 'var(--border-light)'; // Reddish border for errors
    messageContainer.style.display = 'flex';
}

// --- Reset UI to Initial/Loading State ---
function resetUI() {
    loadingIndicator.style.display = 'flex'; // Show loading initially
    profileContentWrapper.style.display = 'none'; // Hide content
    messageContainer.style.display = 'none'; // Hide messages

    // Clear dynamic content
    usernameDisplay.textContent = '...';
    emailDisplay.textContent = '...';
    profileImage.style.display = 'none';
    profileImage.src = '';
    profileInitials.textContent = '?';
    profileInitials.style.display = 'flex';
    editProfilePicIcon.style.display = 'none';
    adminTag.style.display = 'none';
    profileBadgesContainer.innerHTML = '';
    updateProfileTitlesAndRank(null, false);
    competitiveStatsDisplay.innerHTML = '<p>Loading...</p>';
    poxelStatsDisplay.innerHTML = '<p>Loading...</p>';
    poxelStatsSection.style.display = 'none';
    friendActionContainer.innerHTML = '';
    profileLogoutBtn.style.display = 'none';
    profileContent.classList.remove('has-background');
    profileContent.style.removeProperty('--profile-bg-image');
    closeTitleSelector();
    closeEditModal();
}

// --- Helper: Compare Leaderboard Stats ---
function areStatsDifferent(newStats, existingProfileStats) {
    // (Keep the existing areStatsDifferent function as it was)
    const normNew = newStats || {};
    const normExisting = existingProfileStats || {};
    const statKeys = ['wins', 'points', 'kdRatio', 'matchesPlayed', 'matches', 'losses']; // Expand if needed
    let different = false;
    for (const key of statKeys) {
        const newValue = normNew[key] ?? null;
        const existingValue = normExisting[key] ?? null;

        // Handle potential floating point comparisons carefully for ratios
        if (key === 'kdRatio' && typeof newValue === 'number' && typeof existingValue === 'number') {
             if (Math.abs(newValue - existingValue) > 0.001) { // Check if difference is significant
                 different = true; break;
             }
        } else if (newValue !== existingValue) {
            // Handle cases like null vs 0, undefined vs null etc. If one has a value and other doesn't, they are different.
            if ((newValue !== null && newValue !== undefined) !== (existingValue !== null && existingValue !== undefined)) {
                different = true; break;
            }
             // If both have values (or both are null/undefined) but values differ
            if (newValue !== existingValue) {
                 different = true; break;
            }
        }
    }
     // Optional: Check if keys themselves changed if just relying on keys presence isn't enough
     if (!different) {
        const newRelevantKeys = Object.keys(normNew).filter(k => statKeys.includes(k) && normNew[k] !== null && normNew[k] !== undefined);
        const existingRelevantKeys = Object.keys(normExisting).filter(k => statKeys.includes(k) && normExisting[k] !== null && normExisting[k] !== undefined);
         if (newRelevantKeys.length !== existingRelevantKeys.length) {
            different = true;
         } else {
             const newSet = new Set(newRelevantKeys);
             if (!existingRelevantKeys.every(key => newSet.has(key))) { different = true; }
         }
     }
    return different;
}

// --- Helper: Create a Single Stat Item Element ---
function createStatItem(title, value) {
    // (Keep the existing createStatItem function as it was)
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('stat-item');
    const titleH4 = document.createElement('h4');
    titleH4.textContent = title;
    const valueP = document.createElement('p');
    valueP.textContent = (value !== null && value !== undefined) ? value : '-';
    itemDiv.appendChild(titleH4);
    itemDiv.appendChild(valueP);
    return itemDiv;
}

// --- Helper Function: Client-Side User Profile Document Creation ---
async function createUserProfileDocument(userId, authUser) {
    console.warn(`Client-side: Creating missing user profile doc for UID: ${userId}`);
    if (!userId || !authUser) {
        console.error("Cannot create profile document: Invalid userId or authUser.");
        return null;
    }
    const userDocRef = db.collection("users").doc(userId);
    const displayName = authUser.displayName || `User_${userId.substring(0, 5)}`;
    const defaultProfileData = {
        email: authUser.email || null, // Store normalized email
        displayName: displayName,
        currentRank: "Unranked",
        equippedTitle: "",
        availableTitles: [],
        friends: [], // Initialize empty friends list
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        leaderboardStats: {},
        profilePictureUrl: authUser.photoURL || null // Use photoURL from provider if available
    };

    try {
        await userDocRef.set(defaultProfileData); // Use set without merge for initial creation
        console.log(`Successfully created user profile document for UID: ${userId} via client`);
        return { id: userId, ...defaultProfileData }; // Return the structure including the ID
    } catch (error) {
        console.error(`Error creating user profile document client-side for UID ${userId}:`, error);
        // Avoid alert here, handle error in calling function (loadCombinedUserData)
        throw new Error("Error setting up your profile details. Please try again later.");
    }
}

// =============================================================================
// --- DATA FETCHING & PROCESSING ---
// =============================================================================

// --- Fetch Poxel.io Stats from API ---
async function fetchPoxelStats(username) {
     // (Keep the existing fetchPoxelStats function as it was)
    if (!username || typeof username !== 'string' || username.trim() === '') {
        console.warn("fetchPoxelStats: Invalid username provided.");
        poxelStatsSection.style.display = 'none'; // Hide section if no username
        return null;
    }
    console.log(`Fetching Poxel.io stats for: ${username}`);
    poxelStatsSection.style.display = 'block'; // Show section, display loading message later
    displayPoxelStats(null, true); // Show loading state

    try {
        const apiUrl = `https://dev-usa-1.poxel.io/api/profile/stats/${encodeURIComponent(username)}`;
        const res = await fetch(apiUrl, { headers: { "Content-Type": "application/json" } });

        if (!res.ok) {
            let errorMsg = `Poxel API error ${res.status}`;
            try { const errorData = await res.json(); errorMsg = errorData.message || errorData.error || errorMsg; } catch (e) { /* Ignore parse error */ }
            throw new Error(errorMsg);
        }

        const data = await res.json();
        console.log("Poxel.io API Stats Received:", data);

        if (typeof data !== 'object' || data === null || data.error || data.status === 'error') {
            throw new Error(data?.message || data?.error || "Invalid data format or API error.");
        }
        return data; // Return successful data
    } catch (e) {
        console.error("Error fetching Poxel.io stats:", e.message || e);
        return null; // Return null on error
    }
}

// --- Fetch all achievement definitions ---
async function fetchAllAchievements() {
     // (Keep the existing fetchAllAchievements function as it was)
    if (allAchievements) return allAchievements;
    try {
        const snapshot = await db.collection('achievements').get();
        allAchievements = {};
        snapshot.forEach(doc => {
            allAchievements[doc.id] = { id: doc.id, ...doc.data() };
        });
        console.log("Fetched achievement definitions:", allAchievements);
        return allAchievements;
    } catch (error) {
        console.error("Error fetching achievement definitions:", error);
        return null;
    }
}

// --- Check and Grant Achievements ---
async function checkAndGrantAchievements(userId, currentUserProfile, competitiveStats) {
    // (Keep the existing checkAndGrantAchievements function as it was, ensuring it updates locally and commits to DB)
     if (!allAchievements || !userId || !currentUserProfile || !competitiveStats) {
        // console.log("Skipping achievement check due to missing data.");
        return null;
    }
    // console.log(`Checking achievements for UID ${userId} using stats:`, competitiveStats);
    try {
        const userAchievementsRef = db.collection('userAchievements').doc(userId);
        const userAchievementsDoc = await userAchievementsRef.get();
        const unlockedIds = userAchievementsDoc.exists ? (userAchievementsDoc.data()?.unlocked || []) : [];

        let newAchievementsUnlocked = [];
        let rewardsToApply = { titles: [], rank: null }; // Keep track of rewards
        let needsDbUpdate = false;

        for (const achievementId in allAchievements) {
            if (unlockedIds.includes(achievementId)) continue; // Already unlocked

            const achievement = allAchievements[achievementId];
            let criteriaMet = false;

            // Example Criteria Check (Expand as needed)
            if (achievement.criteria?.stat && competitiveStats[achievement.criteria.stat] !== undefined) {
                const statValue = competitiveStats[achievement.criteria.stat];
                const targetValue = achievement.criteria.value;
                switch (achievement.criteria.operator) {
                    case '>=': criteriaMet = statValue >= targetValue; break;
                    case '==': criteriaMet = statValue == targetValue; break; // Use == for loose comparison if needed
                    case '>':  criteriaMet = statValue > targetValue; break;
                     // Add more operators (e.g., '<', '<=')
                    default: console.warn(`Unsupported achievement operator: ${achievement.criteria.operator}`);
                }
            } // Add other criteria types (e.g., account age, multiple stats, etc.)

            if (criteriaMet) {
                console.log(`Criteria MET for achievement: ${achievement.name || achievementId}`);
                newAchievementsUnlocked.push(achievementId);
                needsDbUpdate = true;
                 // Aggregate rewards
                if (achievement.rewards?.title) rewardsToApply.titles.push(achievement.rewards.title);
                if (achievement.rewards?.rank) {
                    // Simple logic: take the 'best' rank if multiple are unlocked at once (needs definition of 'best')
                    // Or just overwrite with the last one found (simplest)
                    rewardsToApply.rank = achievement.rewards.rank;
                 }
            }
        }

        if (needsDbUpdate && newAchievementsUnlocked.length > 0) {
            console.log(`Unlocking ${newAchievementsUnlocked.length} new achievement(s):`, newAchievementsUnlocked);
            console.log("Applying rewards:", rewardsToApply);

            const batch = db.batch();
            const userProfileRef = db.collection('users').doc(userId);

            // Update unlocked achievements list
            batch.set(userAchievementsRef, { unlocked: firebase.firestore.FieldValue.arrayUnion(...newAchievementsUnlocked) }, { merge: true });

            // Prepare profile updates
            const profileUpdateData = {};
            let updatedLocalProfile = JSON.parse(JSON.stringify(currentUserProfile)); // Deep copy for local modification

            // Ensure arrays/strings exist before updating
            if (!updatedLocalProfile.availableTitles) updatedLocalProfile.availableTitles = [];
            if (updatedLocalProfile.equippedTitle === undefined) updatedLocalProfile.equippedTitle = "";
            if (updatedLocalProfile.currentRank === undefined) updatedLocalProfile.currentRank = "Unranked";

            if (rewardsToApply.titles.length > 0) {
                profileUpdateData.availableTitles = firebase.firestore.FieldValue.arrayUnion(...rewardsToApply.titles);
                 // Update local copy immediately
                updatedLocalProfile.availableTitles = [...new Set([...updatedLocalProfile.availableTitles, ...rewardsToApply.titles])];
                // Auto-equip first new title if none is equipped
                if (!updatedLocalProfile.equippedTitle && rewardsToApply.titles[0]) {
                    profileUpdateData.equippedTitle = rewardsToApply.titles[0];
                    updatedLocalProfile.equippedTitle = rewardsToApply.titles[0];
                    console.log(`Auto-equipping title: ${rewardsToApply.titles[0]}`);
                }
            }
            if (rewardsToApply.rank) { // Implement rank comparison logic if needed, otherwise just apply last
                 // Example: Define rank order (higher number is better)
                 // const rankOrder = { "Unranked": 0, "Bronze": 1, "Silver": 2, "Gold": 3, "Veteran": 4, "Legend": 5 };
                 // if (!updatedLocalProfile.currentRank || (rankOrder[rewardsToApply.rank] > rankOrder[updatedLocalProfile.currentRank])) {
                profileUpdateData.currentRank = rewardsToApply.rank;
                updatedLocalProfile.currentRank = rewardsToApply.rank;
                 // }
            }


            if (Object.keys(profileUpdateData).length > 0) {
                batch.update(userProfileRef, profileUpdateData);
            }

            await batch.commit();
            console.log(`Firestore batch committed successfully for UID ${userId} (Achievements).`);
            return updatedLocalProfile; // Return the potentially modified local profile

        } else {
            // console.log(`No new achievements unlocked for UID ${userId}.`);
            return null; // No changes
        }
    } catch (error) {
        console.error(`Error checking/granting achievements for UID ${userId}:`, error);
        return null; // Indicate error or no change
    }
}


// =============================================================================
// --- FRIENDSHIP FUNCTIONS ---
// =============================================================================

/**
 * Checks friendship status and pending requests between loggedInUser and viewedUserId.
 * Returns an object: { status: 'none' | 'friends' | 'request_sent' | 'request_received', requestDocId?: string }
 */
async function checkFriendshipStatus(loggedInUid, viewedUserId) {
    if (!loggedInUid || !viewedUserId || loggedInUid === viewedUserId) {
        return { status: 'none' };
    }

    // 1. Fetch logged-in user's data (prioritize cache)
    if (!loggedInUserProfileData || loggedInUserProfileData.id !== loggedInUid) {
        try {
            // console.log(`Fetching logged-in user data (${loggedInUid}) for friend check...`);
            const userDoc = await db.collection('users').doc(loggedInUid).get();
            if (userDoc.exists) {
                loggedInUserProfileData = { id: userDoc.id, ...userDoc.data() };
                 // Ensure friends array exists
                if (!loggedInUserProfileData.friends) loggedInUserProfileData.friends = [];
            } else {
                console.warn("Logged-in user profile not found for friend check.");
                return { status: 'none' }; // Cannot determine status
            }
        } catch (error) {
            console.error("Error fetching logged-in user data for friend check:", error);
            return { status: 'none' }; // Error state
        }
    } else {
         // Ensure friends array exists on cached data too
         if (!loggedInUserProfileData.friends) loggedInUserProfileData.friends = [];
    }


    // 2. Check if already friends
    if (loggedInUserProfileData.friends.includes(viewedUserId)) {
        return { status: 'friends' };
    }

    // 3. Check for pending requests (concurrently)
    const requestSentRef = db.collection('users').doc(viewedUserId).collection('friendRequests').doc(loggedInUid);
    const requestReceivedRef = db.collection('users').doc(loggedInUid).collection('friendRequests').doc(viewedUserId);

    try {
        const [requestSentSnap, requestReceivedSnap] = await Promise.all([
            requestSentRef.get({ source: 'server' }), // Force server check for requests
            requestReceivedRef.get({ source: 'server' })
        ]);

        if (requestSentSnap.exists && requestSentSnap.data()?.status === 'pending') {
            return { status: 'request_sent' };
        }
        if (requestReceivedSnap.exists && requestReceivedSnap.data()?.status === 'pending') {
            // For profile page, just indicate request was received. Acceptance/Denial elsewhere.
             return { status: 'request_received' };
             // return { status: 'request_received', requestDocId: viewedUserId }; // If handling accept/decline here
        }

    } catch (error) {
        console.error("Error checking friend requests:", error);
        // Fall through to 'none' on error
    }

    // 4. No friendship, no pending requests found
    return { status: 'none' };
}


/**
 * Renders the appropriate friend action button based on the status.
 */
async function displayFriendActionButton(viewedUserId) {
    friendActionContainer.innerHTML = ''; // Clear previous

    if (!loggedInUser || loggedInUser.uid === viewedUserId) {
        return; // No button for own profile or if not logged in
    }

    const loggedInUid = loggedInUser.uid;
    let statusResult;
    try {
        statusResult = await checkFriendshipStatus(loggedInUid, viewedUserId);
    } catch(error) {
         console.error("Failed to check friendship status:", error);
         friendActionContainer.innerHTML = `<small style="color: var(--text-secondary);">Couldn't load friend status</small>`;
         return;
    }

    const { status } = statusResult;
    // console.log(`Friendship status with ${viewedUserId}: ${status}`);

    let buttonHTML = '';
    let buttonId = '';
    let buttonClasses = ['btn']; // Base class
    let buttonText = '';
    let isDisabled = false;
    let clickHandler = null;

    switch (status) {
        case 'friends':
            buttonId = 'remove-friend-btn';
            buttonClasses.push('btn-secondary', 'btn-remove-friend'); // Specific styling
            buttonText = 'Remove Friend';
            clickHandler = () => removeFriend(loggedInUid, viewedUserId);
            break;
        case 'request_sent':
            buttonId = 'request-sent-btn';
            buttonClasses.push('btn-secondary'); // Use secondary style
            buttonText = 'Request Sent';
            isDisabled = true;
            break;
        case 'request_received':
             // Show status only on profile page. Handle actions elsewhere (e.g., notifications)
            buttonId = 'request-received-btn';
            buttonClasses.push('btn-secondary');
            buttonText = 'Request Received';
            isDisabled = true;
            break;
        case 'none':
        default: // Includes error cases
            buttonId = 'add-friend-btn';
            buttonClasses.push('btn-primary'); // Primary action style
            buttonText = 'Add Friend';
            clickHandler = () => sendFriendRequest(loggedInUid, viewedUserId);
            break;
    }

    if (buttonId) {
        // Ensure no duplicate classes
        buttonClasses = [...new Set(buttonClasses)];

        buttonHTML = `<button id="${buttonId}" class="${buttonClasses.join(' ')}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>`;
        friendActionContainer.innerHTML = buttonHTML;

        const buttonElement = document.getElementById(buttonId);
        if (buttonElement && clickHandler && !isDisabled) {
             buttonElement.addEventListener('click', clickHandler);
        }
         // Optional: Add tooltip for disabled buttons
         if (buttonElement && isDisabled) {
            buttonElement.title = (status === 'request_sent') ? 'Friend request is pending.' : (status === 'request_received') ? 'This user sent you a friend request. Check your notifications.' : '';
        }
    }
}


/**
 * Sends a friend request from senderUid to recipientUid.
 */
async function sendFriendRequest(senderUid, recipientUid) {
    if (!senderUid || !recipientUid || senderUid === recipientUid) return;
    console.log(`Sending friend request from ${senderUid} to ${recipientUid}`);

    const button = document.getElementById('add-friend-btn');
    if (button) {
        button.disabled = true;
        button.textContent = 'Sending...';
    }

    const requestRef = db.collection('users').doc(recipientUid).collection('friendRequests').doc(senderUid);
    const requestData = {
        senderUid: senderUid,
        recipientUid: recipientUid,
        status: 'pending', // Explicitly set status
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await requestRef.set(requestData);
        console.log("Friend request sent successfully.");
        // TODO: Implement sending a notification to the recipient user (e.g., via Cloud Function writing to a 'notifications' collection).
        alert("Friend request sent!"); // Simple feedback for now

         // Refresh button state
         await displayFriendActionButton(recipientUid);

    } catch (error) {
        console.error("Error sending friend request:", error);
        alert("Failed to send friend request. Please try again.");
        // Restore button state on error
        if (button) { // Check if button still exists
            await displayFriendActionButton(recipientUid); // This should restore it correctly
        }
    }
}

/**
 * Removes the friendship between userId1 and userId2 (reciprocal).
 */
async function removeFriend(userId1, userId2) {
    if (!userId1 || !userId2 || userId1 === userId2) return;


    if (!confirm(`Are you sure you want to remove this friend?`)) {
        return;
    }

     console.log(`Removing friendship between ${userId1} and ${userId2}`);
    const button = document.getElementById('remove-friend-btn');
    if (button) {
        button.disabled = true;
        button.textContent = 'Removing...';
    }

    const user1Ref = db.collection('users').doc(userId1);
    const user2Ref = db.collection('users').doc(userId2);
    const batch = db.batch();

    // Remove each user from the other's friend list
    batch.update(user1Ref, { friends: firebase.firestore.FieldValue.arrayRemove(userId2) });
    batch.update(user2Ref, { friends: firebase.firestore.FieldValue.arrayRemove(userId1) });

    // Optional: Consider deleting any related pending friend requests between them
     const requestRef1 = db.collection('users').doc(userId1).collection('friendRequests').doc(userId2);
     const requestRef2 = db.collection('users').doc(userId2).collection('friendRequests').doc(userId1);
     batch.delete(requestRef1); // Okay if doesn't exist
     batch.delete(requestRef2); // Okay if doesn't exist

    try {
        await batch.commit();
        console.log("Friend removed successfully from both users.");
        alert("Friend removed.");

        // Invalidate relevant cached data
        if (loggedInUserProfileData && loggedInUserProfileData.id === userId1) {
            // Update local cache directly or clear it
             const friendIndex = loggedInUserProfileData.friends.indexOf(userId2);
             if(friendIndex > -1) loggedInUserProfileData.friends.splice(friendIndex, 1);
             // OR simply: loggedInUserProfileData = null; // to force refetch next time
        }
        localStorage.removeItem(`poxelProfileCombinedData_${userId2}`); // Invalidate viewed user's cache

        // Refresh button state
        await displayFriendActionButton(userId2);

    } catch (error) {
        console.error("Error removing friend:", error);
        alert("Failed to remove friend. Please try again.");
        // Restore button state on error
        if (button) { // Check if button still exists
             await displayFriendActionButton(userId2); // Re-render to show "Remove Friend" again
        }
    }
}

// =============================================================================
// --- UI DISPLAY FUNCTIONS ---
// =============================================================================

// --- Display Core Profile Data ---
function displayProfileData(profileData, competitiveStatsData, isOwner) {
    if (!profileData) {
        // Handled by showMessage("User not found") before calling this
        return;
    }

    const displayName = profileData.displayName || 'Anonymous';
    const email = profileData.email || 'No email provided';

    usernameDisplay.textContent = displayName;
    emailDisplay.textContent = email;

    // Profile Picture
    if (profileData.profilePictureUrl) {
        profileImage.src = profileData.profilePictureUrl;
        profileImage.onerror = () => { // Fallback if image fails to load
            console.error("Failed to load profile image:", profileData.profilePictureUrl);
            profileImage.style.display = 'none';
            profileInitials.textContent = displayName.charAt(0).toUpperCase() || '?';
            profileInitials.style.display = 'flex';
            profileContent.classList.remove('has-background'); // Remove background on error
        };
        profileImage.onload = () => { // Only show image once loaded
            profileImage.style.display = 'block';
            profileInitials.style.display = 'none';
             updateProfileBackground(profileData.profilePictureUrl); // Set background
        };
         // Hide initials while image loads
         profileInitials.style.display = 'none';
         profileImage.style.display = 'block'; // Set to block, relies on onerror/onload

    } else { // No picture URL
        profileImage.style.display = 'none';
        profileImage.src = '';
        profileInitials.textContent = displayName.charAt(0).toUpperCase() || '?';
        profileInitials.style.display = 'flex';
         updateProfileBackground(null); // Clear background
    }

    editProfilePicIcon.style.display = isOwner ? 'flex' : 'none'; // Show edit icon only for owner

    // Badges & Admin Tag
    displayUserBadges(profileData);

    // Rank & Title
    updateProfileTitlesAndRank(profileData, isOwner); // Pass owner status for interaction

    // Competitive Stats
    displayCompetitiveStats(competitiveStatsData); // Pass competitive stats

    // Display content area
    loadingIndicator.style.display = 'none';
    messageContainer.style.display = 'none';
    profileContentWrapper.style.display = 'block';
    profileContent.style.display = 'block'; // Ensure inner container is visible too

}

// --- Update Profile Background ---
function updateProfileBackground(imageUrl) {
    // (Keep the existing updateProfileBackground function)
     if (imageUrl) {
        profileContent.style.setProperty('--profile-bg-image', `url('${imageUrl}')`);
        profileContent.classList.add('has-background');
    } else {
        profileContent.style.removeProperty('--profile-bg-image');
        profileContent.classList.remove('has-background');
    }
}


// --- Display User Badges & Admin Tag ---
function displayUserBadges(profileData) {
     // (Keep the existing displayUserBadges function)
     profileBadgesContainer.innerHTML = ''; // Clear previous
    adminTag.style.display = 'none'; // Hide by default

    const userEmail = profileData?.email;
    if (!userEmail) return;

    const emailLower = userEmail.toLowerCase();

    // Display Admin Tag
    if (adminEmails.includes(emailLower)) {
        adminTag.style.display = 'inline-block';
    }

    // Display Configured Badges
    for (const badgeType in badgeConfig) {
        const config = badgeConfig[badgeType];
        if (config.emails.includes(emailLower)) {
            const badgeSpan = document.createElement('span');
            badgeSpan.classList.add('profile-badge', config.className);
            badgeSpan.setAttribute('title', config.title);
             // badgeSpan.textContent = 'B'; // Or initials/icons if needed
            profileBadgesContainer.appendChild(badgeSpan);
        }
    }
}

// --- Display COMPETITIVE Stats Grid ---
function displayCompetitiveStats(statsData) {
     // (Keep the existing displayCompetitiveStats function)
    competitiveStatsDisplay.innerHTML = ''; // Clear previous

    if (!statsData || typeof statsData !== 'object' || Object.keys(statsData).length === 0) {
         // Handle empty or explicitly null/undefined stats
         if(statsData === null || statsData === undefined) {
              competitiveStatsDisplay.innerHTML = '<p>Competitive stats unavailable for this user.</p>';
         } else { // It's an object, but empty
              competitiveStatsDisplay.innerHTML = '<p>No competitive stats recorded yet.</p>';
         }
        return;
    }

    // Prioritize specific keys, handle aliases like matches/matchesPlayed
    const statsMap = {
        wins: 'Wins',
        points: 'Points',
        kdRatio: 'K/D Ratio',
        matchesPlayed: 'Matches Played', // Primary key
        matches: 'Matches Played',       // Alias
        losses: 'Losses'
    };
    let statsAdded = 0;
    const addedDisplayTitles = new Set(); // Track which titles (e.g., 'Matches Played') have been added

    for (const key in statsMap) {
        let value = undefined;
        const displayTitle = statsMap[key];

        // Check if this display title was already handled (e.g., by alias)
        if (addedDisplayTitles.has(displayTitle)) {
            continue;
        }

        // Find the value using the primary key or aliases
        if (statsData.hasOwnProperty(key)) {
            value = statsData[key];
        } else if (key === 'matchesPlayed' && statsData.hasOwnProperty('matches')) {
            value = statsData.matches;
        } else if (key === 'matches' && statsData.hasOwnProperty('matchesPlayed')) {
            // This case is less likely needed if iterating in order, but good practice
            value = statsData.matchesPlayed;
        }

        // Skip if value is explicitly null or undefined, or title already added
        if (value === undefined || value === null) {
            continue;
        }

        let displayValue = value;
        if (key === 'kdRatio' && typeof value === 'number') {
            displayValue = value.toFixed(2);
        }

        competitiveStatsDisplay.appendChild(createStatItem(displayTitle, displayValue));
        addedDisplayTitles.add(displayTitle); // Mark this display title as added
        statsAdded++;
    }


    if (statsAdded === 0) {
        competitiveStatsDisplay.innerHTML = '<p>No specific competitive stats found.</p>';
    }
}


// --- Display Poxel.io Stats Grid ---
function displayPoxelStats(poxelData, loading = false) {
     // (Keep the existing displayPoxelStats function, but ensure section is shown/hidden correctly)
      if (!poxelStatsDisplay || !poxelStatsSection) return;

    // Always clear previous content first
    poxelStatsDisplay.innerHTML = '';

    if (loading) {
        poxelStatsSection.style.display = 'block'; // Show section
        poxelStatsDisplay.innerHTML = '<p>Loading Poxel.io stats...</p>';
        return;
    }

    if (!poxelData) {
         poxelStatsSection.style.display = 'block'; // Still show section for the message
         poxelStatsDisplay.innerHTML = '<p>Could not load Poxel.io stats for this user.</p>';
         return;
    }

    // Now we have data, ensure the section is visible
    poxelStatsSection.style.display = 'block';

     // Adjust keys based on actual API response logged previously
    const statsMap = {
         kills: 'Kills', deaths: 'Deaths', wins: 'Wins', losses: 'Losses',
         level: 'Level', playtimeHours: 'Playtime (Hrs)', gamesPlayed: 'Games Played'
         // Add or remove based on actual API output
    };
    let statsAdded = 0;

    // Display mapped stats
    for (const key in statsMap) {
         if (poxelData.hasOwnProperty(key) && poxelData[key] !== null && poxelData[key] !== undefined) {
              // Handle potential formatting, e.g., playtime
             let value = poxelData[key];
             if (key === 'playtimeHours' && typeof value === 'number') value = value.toFixed(1);

             poxelStatsDisplay.appendChild(createStatItem(statsMap[key], value));
             statsAdded++;
         }
    }

     // Calculate and add K/D Ratio explicitly if data exists
    if (poxelData.hasOwnProperty('kills') && poxelData.hasOwnProperty('deaths')) {
        const kills = Number(poxelData.kills) || 0;
        const deaths = Number(poxelData.deaths) || 0;
        const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2); // Handle division by zero
        poxelStatsDisplay.appendChild(createStatItem('K/D Ratio', kd));
        statsAdded++;
    }

     // Add any other relevant direct fields if needed
     // if (poxelData.elo) poxelStatsDisplay.appendChild(createStatItem('ELO', poxelData.elo));


    if (statsAdded === 0) {
        // This means the API returned data, but none of the mapped keys or K/D were present/valid
        poxelStatsDisplay.innerHTML = '<p>No relevant Poxel.io stats found.</p>';
    }
}


// --- Update Rank/Title Display & Interaction ---
function updateProfileTitlesAndRank(profileData, allowInteraction) {
     // (Keep the existing updateProfileTitlesAndRank function, handling selectable class)
    if (!rankDisplay || !titleDisplay) return;

    // Reset state
    titleDisplay.classList.remove('selectable-title', 'no-title-placeholder');
    titleDisplay.onclick = null; // Remove previous listener directly
    closeTitleSelector();

    if (profileData && typeof profileData === 'object') {
        const rank = profileData.currentRank || 'Unranked';
        const equippedTitle = profileData.equippedTitle || '';
        const availableTitles = profileData.availableTitles || [];

        // Update Rank Display
        rankDisplay.textContent = rank;
         // Generate class name from rank, making it lowercase and replacing spaces
         const rankClass = `rank-${rank.toLowerCase().replace(/\s+/g, '-')}`;
        // Reset classes first, then add the specific one
         rankDisplay.className = 'profile-rank-display'; // Reset to base class
        rankDisplay.classList.add(rankClass); // Add specific rank class

        // Update Title Display and Interaction
        titleDisplay.style.display = 'inline-block'; // Always display the span now for structure

        if (equippedTitle) { // Has an equipped title
            titleDisplay.textContent = equippedTitle;
            titleDisplay.classList.remove('no-title-placeholder'); // Ensure not placeholder style
            if (allowInteraction && availableTitles.length > 0) {
                titleDisplay.classList.add('selectable-title');
                titleDisplay.onclick = handleTitleClick; // Add listener
            }
        } else { // No equipped title
            if (allowInteraction && availableTitles.length > 0) { // Can choose a title
                titleDisplay.textContent = '[Choose Title]';
                titleDisplay.classList.add('selectable-title', 'no-title-placeholder');
                titleDisplay.onclick = handleTitleClick; // Add listener
            } else { // No titles available or not allowed to interact
                titleDisplay.textContent = ''; // Clear text
                titleDisplay.style.display = 'none'; // Hide if completely empty and not interactive
            }
        }
    } else {
        // Default/Loading State
        rankDisplay.textContent = '...';
        rankDisplay.className = 'profile-rank-display rank-unranked'; // Default class
        titleDisplay.textContent = '';
        titleDisplay.style.display = 'none';
    }
}


// =============================================================================
// --- TITLE SELECTION UI ---
// =============================================================================

// --- Handle Clicking the Title Area ---
function handleTitleClick(event) {
     // (Keep existing handleTitleClick)
    event.stopPropagation();
    if (!isOwnProfile || !viewingUserProfileData.profile) return;

    if (isTitleSelectorOpen) {
        closeTitleSelector();
    } else {
        openTitleSelector(); // Opens only if there are titles available
    }
}

// --- Open Title Selector Dropdown ---
function openTitleSelector() {
     // (Keep existing openTitleSelector, ensures it uses profileIdentifiersDiv)
    if (isTitleSelectorOpen || !profileIdentifiersDiv || !viewingUserProfileData.profile?.availableTitles?.length) {
        // console.log("Cannot open title selector: Already open, no parent, or no titles.");
        return;
    }

    const availableTitles = viewingUserProfileData.profile.availableTitles;
    const currentEquippedTitle = viewingUserProfileData.profile.equippedTitle || '';

    if (!titleSelectorElement) { // Create if doesn't exist
        titleSelectorElement = document.createElement('div');
        titleSelectorElement.className = 'title-selector';
        profileIdentifiersDiv.appendChild(titleSelectorElement); // Append to the correct parent
    }
    titleSelectorElement.innerHTML = ''; // Clear previous options

    // Add "Remove Title" option first if a title is equipped
    if (currentEquippedTitle) {
        const unequipOption = document.createElement('button');
        unequipOption.className = 'title-option title-option-unequip';
        unequipOption.dataset.title = ""; // Empty string indicates unequip
        unequipOption.type = 'button';
        unequipOption.textContent = '[Remove Title]';
        unequipOption.onclick = handleTitleOptionClick; // Use onclick for simplicity here
        titleSelectorElement.appendChild(unequipOption);
    }

    // Add available titles
    availableTitles.forEach(titleOptionText => {
        const optionElement = document.createElement('button');
        optionElement.className = 'title-option';
        optionElement.dataset.title = titleOptionText;
        optionElement.type = 'button';
        optionElement.textContent = titleOptionText;

        if (titleOptionText === currentEquippedTitle) {
            optionElement.classList.add('currently-equipped');
            optionElement.disabled = true; // Optionally disable the already equipped one
        }
        optionElement.onclick = handleTitleOptionClick;
        titleSelectorElement.appendChild(optionElement);
    });

    titleSelectorElement.style.display = 'block';
    isTitleSelectorOpen = true;

    // Add listener to close when clicking outside
    // Use setTimeout to ensure this listener is added after the current event finishes
    setTimeout(() => {
        document.addEventListener('click', handleClickOutsideTitleSelector, { capture: true, once: true });
    }, 0);
}

// --- Close Title Selector Dropdown ---
function closeTitleSelector() {
     // (Keep existing closeTitleSelector)
    if (!isTitleSelectorOpen || !titleSelectorElement) return;
    titleSelectorElement.style.display = 'none';
    isTitleSelectorOpen = false;
    document.removeEventListener('click', handleClickOutsideTitleSelector, { capture: true }); // Clean up just in case
}

// --- Handle Click Outside Selector ---
function handleClickOutsideTitleSelector(event) {
    // (Keep existing handleClickOutsideTitleSelector)
      // This listener has { once: true }, so it automatically removes itself after firing.
    if (!isTitleSelectorOpen) return; // Should technically not be needed

     // Check if the click happened inside the selector OR on the title display element itself
    const clickedInsideSelector = titleSelectorElement && titleSelectorElement.contains(event.target);
     const clickedOnTitleDisplay = titleDisplay && titleDisplay.contains(event.target);

     // If the click was outside BOTH the dropdown and the trigger element, close it.
    if (!clickedInsideSelector && !clickedOnTitleDisplay) {
         // console.log("Clicked outside title selector and trigger.");
        closeTitleSelector();
    } else {
         // console.log("Clicked inside title selector or on the trigger again.");
         // If the click was *inside* the selector (e.g., on scrollbar), or on the trigger itself again,
         // we need to re-attach the listener for the *next* outside click.
          document.addEventListener('click', handleClickOutsideTitleSelector, { capture: true, once: true });
     }
}

// --- Handle Selecting a Title Option ---
async function handleTitleOptionClick(event) {
     // (Keep existing handleTitleOptionClick, ensure Firestore update and UI refresh)
    event.stopPropagation(); // Stop event from bubbling up further
    const selectedTitle = event.currentTarget.dataset.title; // Title string or "" for remove
    const currentUserId = loggedInUser?.uid;

     // Basic validation
    if (!currentUserId || !viewingUserProfileData.profile || currentUserId !== viewingUserProfileData.profile.id) {
        console.error("Mismatch in user or profile data during title change.");
        closeTitleSelector();
        return;
    }

    const currentEquipped = viewingUserProfileData.profile.equippedTitle || '';

     // If clicked the same title (or remove when none is equipped), do nothing.
     // Note: The 'currently-equipped' button might be disabled, preventing this, but check anyway.
     if (selectedTitle === currentEquipped) {
         closeTitleSelector();
         return;
     }

    closeTitleSelector(); // Close the selector UI

    // Optimistic UI Update (or indicate loading)
    titleDisplay.textContent = "Updating...";
    titleDisplay.classList.remove('selectable-title', 'no-title-placeholder');
    titleDisplay.onclick = null; // Disable click while updating

    try {
        const userProfileRef = db.collection('users').doc(currentUserId);
        await userProfileRef.update({ equippedTitle: selectedTitle });

        console.log(`Firestore updated title to "${selectedTitle || 'None'}" for UID ${currentUserId}`);

        // Update local state and cache
        viewingUserProfileData.profile.equippedTitle = selectedTitle;
        saveCombinedDataToCache(currentUserId, viewingUserProfileData);

        // Re-render the title/rank section with interaction enabled
        updateProfileTitlesAndRank(viewingUserProfileData.profile, true);

    } catch (error) {
        console.error("Error updating equipped title in Firestore:", error);
        alert("Failed to update title. Please try again.");
        // Revert optimistic UI on error
        if (viewingUserProfileData.profile) {
             viewingUserProfileData.profile.equippedTitle = currentEquipped; // Restore previous
        }
        updateProfileTitlesAndRank(viewingUserProfileData.profile, true); // Re-render with old data/state
    }
}

// =============================================================================
// --- PROFILE PICTURE EDITING ---
// =============================================================================

// --- Initialize Edit Listeners ---
function setupProfilePicEditing() {
     // (Keep existing setupProfilePicEditing)
      if (!isOwnProfile || !editProfilePicIcon || !profilePicInput) return;

     // Ensure elements are visible and listeners attached
     editProfilePicIcon.style.display = 'flex';
     editProfilePicIcon.onclick = () => {
         profilePicInput.click(); // Trigger file input
     };

     profilePicInput.onchange = handleFileSelect; // Handle file selection
}

// --- Handle File Selection ---
function handleFileSelect(event) {
     // (Keep existing handleFileSelect)
     const file = event.target.files[0];
    if (!file) return; // No file selected

    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, GIF, WebP).');
        event.target.value = null; // Reset input
        return;
    }

     // Optional: Check file size (e.g., limit to 5MB)
     const maxSizeMB = 5;
     if (file.size > maxSizeMB * 1024 * 1024) {
         alert(`File is too large. Please select an image smaller than ${maxSizeMB} MB.`);
         event.target.value = null; // Reset input
         return;
     }

    const reader = new FileReader();
    reader.onload = (e) => {
        modalImage.src = e.target.result; // Set image source for the modal
        openEditModal(); // Open the modal AFTER the source is set
    };
    reader.onerror = (err) => {
        console.error("FileReader error:", err);
        alert("Error reading the selected file.");
    };
    reader.readAsDataURL(file);
    event.target.value = null; // Reset input value so the same file can be selected again
}

// --- Open Image Editing Modal ---
function openEditModal() {
     // (Keep existing openEditModal, initialize Cropper.js)
     if (!editModal || !modalImage || !modalImage.src) {
          console.error("Cannot open modal: Elements missing or image source not set.");
         return;
      }

      editModal.style.display = 'flex';
      modalImage.style.opacity = 0; // Hide image until Cropper is ready

      // Allow modal display/layout paint before initializing Cropper
     setTimeout(() => {
         if (cropper) { // Destroy previous instance
            try { cropper.destroy(); } catch(e) {}
            cropper = null;
         }

         try {
              cropper = new Cropper(modalImage, {
                 aspectRatio: 1 / 1,
                 viewMode: 1,
                 dragMode: 'move',
                 background: false,
                 autoCropArea: 0.9, // Start with a large crop area
                 responsive: true,
                 modal: true, // Dark overlay behind image
                 guides: true,
                 center: true,
                 highlight: false,
                 cropBoxMovable: true, // Allow moving the box relative to image
                 cropBoxResizable: true, // Allow resizing the box
                 toggleDragModeOnDblclick: false,
                 ready: () => {
                      modalImage.style.opacity = 1; // Show image now
                      console.log("Cropper is ready.");
                       // Reset button state in case it was left loading
                       resetModalApplyButton();
                 },
                  crop: (event) => {
                      // Optional: log crop details if needed for debugging
                      // console.log(event.detail.x, event.detail.y, event.detail.width, event.detail.height);
                  }
             });
         } catch (cropperError) {
             console.error("Error initializing Cropper:", cropperError);
             alert("Could not initialize image editor. The image might be invalid or too large. Please try reloading or a different image.");
             closeEditModal(); // Close modal if initialization fails
             return; // Stop execution
         }

         // Ensure buttons are interactive
         modalCloseBtn.onclick = closeEditModal;
         modalCancelBtn.onclick = closeEditModal;
         modalApplyBtn.onclick = handleApplyCrop;

          // Clicking overlay closes modal
          editModal.onclick = (event) => {
              if (event.target === editModal) {
                  closeEditModal();
              }
          };

     }, 100); // Short delay

}


// --- Close Image Editing Modal ---
function closeEditModal() {
     // (Keep existing closeEditModal, ensure Cropper destroyed, UI reset)
     if (!editModal) return;

     if (cropper) {
         try {
             cropper.destroy();
             // console.log("Cropper instance destroyed.");
         } catch (e) { console.warn("Minor error destroying cropper:", e); }
         cropper = null;
     }
     editModal.style.display = 'none';
     modalImage.src = '#'; // Use '#' or empty string to clear source effectively

     // Reset button state
      resetModalApplyButton();


     // Remove listeners to prevent potential leaks if modal is reused complexly
     modalCloseBtn.onclick = null;
     modalCancelBtn.onclick = null;
     modalApplyBtn.onclick = null;
     editModal.onclick = null;
}

// --- Reset Apply button in Modal ---
function resetModalApplyButton() {
     if (!modalApplyBtn) return;
     modalApplyBtn.disabled = false;
     modalApplyBtn.classList.remove('is-loading'); // Controls spinner visibility via CSS potentially
     const textSpan = modalApplyBtn.querySelector('.btn-text');
     if (textSpan) textSpan.textContent = 'Apply';
      // Hide spinner explicitly if not controlled by class alone
      if(modalSpinner) modalSpinner.style.display = 'none';
}

// --- Handle Apply Crop and Upload ---
async function handleApplyCrop() {
     // (Keep existing handleApplyCrop, ensure loading state, upload, Firestore save, UI update)
    if (!cropper || !loggedInUser) {
        console.error("Cropper not ready or user not logged in.");
        alert("Cannot apply crop. Please try again.");
        return;
    }

    // Show loading state on button
     modalApplyBtn.disabled = true;
     modalApplyBtn.classList.add('is-loading');
     const textSpan = modalApplyBtn.querySelector('.btn-text');
     if (textSpan) textSpan.textContent = 'Applying';
     if(modalSpinner) modalSpinner.style.display = 'inline-block'; // Show spinner


    try {
        // Get cropped canvas data as a Blob
        const canvas = cropper.getCroppedCanvas({
            width: 512, // Standardize output width
            height: 512, // Standardize output height
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
            fillColor: '#ffffff' // Add white background for transparency handling if needed
        });

         if (!canvas) throw new Error("Failed to get cropped canvas.");

         canvas.toBlob(async (blob) => {
             if (!blob) {
                 throw new Error("Failed to create blob from canvas.");
             }
             console.log("Blob created, type:", blob.type, "size:", (blob.size / 1024).toFixed(2), "KB");

            try {
                // 1. Upload to Cloudinary
                 const imageUrl = await uploadToCloudinary(blob);
                 console.log("Uploaded to Cloudinary:", imageUrl);

                 // 2. Save URL to Firestore
                 await saveProfilePictureUrl(loggedInUser.uid, imageUrl);
                 console.log("Saved URL to Firestore.");

                 // 3. Update UI immediately
                 profileImage.src = imageUrl; // Update image src
                 profileImage.style.display = 'block';
                 profileInitials.style.display = 'none';
                 updateProfileBackground(imageUrl); // Update background too

                 // 4. Update local cache
                 if (viewingUserProfileData && viewingUserProfileData.profile && viewingUserProfileData.profile.id === loggedInUser.uid) {
                     viewingUserProfileData.profile.profilePictureUrl = imageUrl;
                     saveCombinedDataToCache(loggedInUser.uid, viewingUserProfileData);
                 }

                 // 5. Close modal on full success
                 closeEditModal();

             } catch (uploadOrSaveError) {
                 console.error("Error during upload or save:", uploadOrSaveError);
                 alert(`Failed to update profile picture: ${uploadOrSaveError.message || 'Please try again.'}`);
                 resetModalApplyButton(); // Reset button on inner error
            }

        // Specify preferred output format and quality
        }, 'image/jpeg', 0.90); // Use JPEG with high quality for photos

    } catch (cropError) {
        console.error("Error getting cropped canvas or creating blob:", cropError);
        alert("Failed to process the image crop. Please try again or use a different image.");
        resetModalApplyButton(); // Reset button on outer error
    }
}

// --- Upload Blob to Cloudinary (using Fetch) ---
async function uploadToCloudinary(blob) {
    // (Keep existing uploadToCloudinary using Fetch)
     if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
          throw new Error("Cloudinary config missing. Cannot upload.");
      }
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const formData = new FormData();
      formData.append('file', blob, `profile_${loggedInUser.uid}_${Date.now()}.jpg`); // Filename hint
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
       // Optional context/tags:
      // formData.append('tags', 'poxelcomp_profile');
      // formData.append('context', `alt=Profile picture for ${loggedInUser.uid}`);

      console.log(`Uploading to Cloudinary (${CLOUDINARY_CLOUD_NAME})...`);

      try {
          const response = await fetch(url, { method: 'POST', body: formData });
          const data = await response.json();

          if (!response.ok || data.error) {
              console.error("Cloudinary Upload Error Response:", data);
              throw new Error(data.error?.message || `Cloudinary upload failed: ${response.statusText}`);
          }

          console.log("Cloudinary Upload Success:", data);
          if (!data.secure_url) {
              throw new Error("Cloudinary response did not include a secure_url.");
          }
          // Optionally apply transformations here if needed, e.g., enforce format/quality/size server-side via URL params
           // return data.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_512,h_512,c_fill,g_face/'); // Example transformation
           return data.secure_url; // Return the raw secure URL

      } catch (networkOrApiError) {
          console.error("Error during Cloudinary upload request:", networkOrApiError);
           throw new Error(`Upload failed: ${networkOrApiError.message}`); // Re-throw for handleApplyCrop
      }
}

// --- Save Profile Picture URL to Firestore ---
async function saveProfilePictureUrl(userId, imageUrl) {
    // (Keep existing saveProfilePictureUrl)
    if (!userId || !imageUrl || typeof imageUrl !== 'string') {
        throw new Error("Invalid user ID or image URL for saving.");
    }
    const userDocRef = db.collection("users").doc(userId);
    try {
        await userDocRef.update({ profilePictureUrl: imageUrl });
        console.log(`Firestore updated profilePictureUrl for user ${userId}`);
    } catch (error) {
        console.error(`Error updating profile picture URL in Firestore for ${userId}:`, error);
        throw new Error("Database error while saving picture URL."); // Re-throw
    }
}


// =============================================================================
// --- MAIN DATA LOADING FUNCTION ---
// =============================================================================
async function loadCombinedUserData(targetUserId) {
    resetUI(); // Start with loading indicator

    if (!targetUserId) {
        showMessage("No user specified.", true);
        return;
    }
     console.log(`--- Loading profile for TARGET UID: ${targetUserId} ---`);
     isOwnProfile = loggedInUser && loggedInUser.uid === targetUserId;
     console.log(`Is viewing own profile: ${isOwnProfile}`);

     // Try loading from cache first for instant feel (cache may be stale)
     const cacheLoaded = loadCombinedDataFromCache(targetUserId);
     if (cacheLoaded) {
         console.log("Displayed initial data from cache.");
          // If cache loaded, update interaction state based on *current* auth
          displayProfileData(viewingUserProfileData.profile, viewingUserProfileData.stats, isOwnProfile);
         if (!isOwnProfile && loggedInUser) {
              // Update friend button based on current auth, even if profile data is cached
             displayFriendActionButton(targetUserId).catch(console.error);
          } else {
               friendActionContainer.innerHTML = '';
          }
           // Set up editing if applicable based on current auth state
           if (isOwnProfile) { setupProfilePicEditing(); }
          else { if(editProfilePicIcon) editProfilePicIcon.style.display = 'none'; }
           // Logout button visibility
            profileLogoutBtn.style.display = isOwnProfile ? 'inline-block' : 'none';
     }

    // Fetch fresh data from Firestore
    try {
        const userProfileRef = db.collection('users').doc(targetUserId);
        const leaderboardStatsRef = db.collection('leaderboard').doc(targetUserId);

        // 1. Fetch User Profile Data (force server read)
        let profileSnap = await userProfileRef.get({ source: 'server' });
        let profileData = null;

        if (!profileSnap.exists) {
            console.warn(`User profile document NOT exist for UID: ${targetUserId}`);
            if (isOwnProfile && loggedInUser) {
                // Create profile doc *only* if it's the logged-in user's own missing profile
                try {
                    profileData = await createUserProfileDocument(targetUserId, loggedInUser);
                    if (!profileData) throw new Error("Profile creation function returned null.");
                } catch (creationError) {
                     console.error("Failed to create profile document:", creationError);
                     showMessage("Error setting up your profile. Please refresh or contact support.", true);
                     return; // Stop loading
                 }
            } else {
                // Viewing someone else's profile that doesn't exist
                showMessage("User profile not found.", false); // Not necessarily an error, just not found
                return;
            }
        } else {
            profileData = { id: profileSnap.id, ...profileSnap.data() };
            // Ensure core fields exist for consistency
             if (profileData.friends === undefined) profileData.friends = [];
            if (profileData.leaderboardStats === undefined) profileData.leaderboardStats = {};
            if (profileData.profilePictureUrl === undefined) profileData.profilePictureUrl = null;
             if (profileData.availableTitles === undefined) profileData.availableTitles = [];
             if (profileData.equippedTitle === undefined) profileData.equippedTitle = "";
             if (profileData.currentRank === undefined) profileData.currentRank = "Unranked";
        }

        // 2. Fetch Leaderboard Stats Data (can use cache potentially, but server often better)
         const statsSnap = await leaderboardStatsRef.get({ source: 'server' });
         const competitiveStatsData = statsSnap.exists ? { id: statsSnap.id, ...statsSnap.data() } : null;


        // 3. Sync Competitive Stats to Profile Document if needed
        if (profileData && competitiveStatsData) {
            if (areStatsDifferent(competitiveStatsData, profileData.leaderboardStats)) {
                console.log(`Competitive stats differ for ${targetUserId}. Updating 'users' doc.`);
                try {
                     // Prepare stats to save (remove ID if it was added)
                    const statsToSave = { ...competitiveStatsData };
                    delete statsToSave.id;
                    await userProfileRef.update({ leaderboardStats: statsToSave });
                    profileData.leaderboardStats = statsToSave; // Update local copy
                    console.log("Successfully synced leaderboard stats to user profile.");
                 } catch (updateError) {
                     console.error(`Error syncing competitive stats for ${targetUserId}:`, updateError);
                     // Continue with potentially stale stats in profileData.leaderboardStats
                 }
             } else if (!profileData.leaderboardStats || Object.keys(profileData.leaderboardStats).length === 0) {
                // If profile doc has *no* stats, but leaderboard does, sync them
                 console.log(`Profile for ${targetUserId} has no stats, syncing from leaderboard.`);
                  try {
                     const statsToSave = { ...competitiveStatsData };
                     delete statsToSave.id;
                     await userProfileRef.update({ leaderboardStats: statsToSave });
                     profileData.leaderboardStats = statsToSave;
                     console.log("Successfully synced initial leaderboard stats to user profile.");
                  } catch (updateError) {
                     console.error(`Error syncing initial stats for ${targetUserId}:`, updateError);
                 }
             }
        }

        // 4. Update Global State & Cache (overwrite cache with fresh data)
        viewingUserProfileData = {
            profile: profileData,
            stats: competitiveStatsData // Store the potentially separate leaderboard stats too
        };
        saveCombinedDataToCache(targetUserId, viewingUserProfileData); // Save fresh data

        // 5. Display Fresh Core Profile & Competitive Stats
        displayProfileData(viewingUserProfileData.profile, profileData.leaderboardStats, isOwnProfile); // Use stats synced to profile


         // 6. Check Achievements (if viewing own profile) - uses profileData.leaderboardStats
        if (isOwnProfile && profileData.leaderboardStats) {
            if (!allAchievements) await fetchAllAchievements();
            if (allAchievements) {
                const updatedProfileFromAchievements = await checkAndGrantAchievements(
                    targetUserId,
                    viewingUserProfileData.profile, // Pass current profile data
                    profileData.leaderboardStats   // Pass relevant stats
                );
                if (updatedProfileFromAchievements) {
                    console.log("Achievements granted, updating UI and cache...");
                    viewingUserProfileData.profile = updatedProfileFromAchievements; // Update global state
                    saveCombinedDataToCache(targetUserId, viewingUserProfileData); // Update cache
                    // Re-display the relevant parts (Rank/Title potentially changed)
                     displayProfileData(viewingUserProfileData.profile, profileData.leaderboardStats, isOwnProfile); // Re-render all profile data
                    console.log("Profile UI updated after achievement grants.");
                }
            }
        }


        // 7. Display Friend Action Button (based on fresh data)
        if (!isOwnProfile && loggedInUser) {
            displayFriendActionButton(targetUserId).catch(err => {
                console.error("Error displaying friend action button after load:", err);
                 friendActionContainer.innerHTML = '<small>Error status</small>';
            });
        } else {
             friendActionContainer.innerHTML = ''; // Clear for own profile
        }

        // 8. Fetch and Display Poxel.io Stats (asynchronously, independent of profile data changes during load)
         if (profileData && profileData.displayName) {
             // Use .then/.catch for this non-critical path
             fetchPoxelStats(profileData.displayName)
                .then(poxelStatsData => displayPoxelStats(poxelStatsData)) // Success
                .catch(poxelError => { // Catch specific errors from the fetchPoxelStats chain
                    console.error("Final catch for Poxel.io stats:", poxelError);
                    displayPoxelStats(null); // Display error state explicitly
                });
         } else {
              console.warn("No displayName found in profile, cannot fetch Poxel.io stats.");
             poxelStatsSection.style.display = 'none'; // Hide Poxel section if no name
             displayPoxelStats(null); // Ensure cleared
         }

         // 9. Final setup for owner interactions
          if (isOwnProfile) { setupProfilePicEditing(); }
          else { if(editProfilePicIcon) editProfilePicIcon.style.display = 'none'; }

         // Ensure logout button visibility is correct based on final state
         profileLogoutBtn.style.display = isOwnProfile ? 'inline-block' : 'none';


    } catch (error) {
        console.error(`FATAL ERROR in loadCombinedUserData for ${targetUserId}:`, error);
         if (error.stack) console.error(error.stack);
        if (!cacheLoaded) { // Only show fatal error if nothing was loaded from cache
             showMessage("Error loading profile data. Please check the console or try again later.", true);
             resetUI(); // Ensure UI is fully reset on fatal error with no cache
        } else {
            // If cache was loaded, maybe just log the error and rely on cached view
             console.warn("Error fetching fresh data, displaying potentially stale cached view.");
             // Optionally try fetching Poxel stats using cached display name
             if (viewingUserProfileData.profile?.displayName) {
                 fetchPoxelStats(viewingUserProfileData.profile.displayName)
                    .then(poxelStatsData => displayPoxelStats(poxelStatsData))
                    .catch(e => displayPoxelStats(null)); // Display error/no stats
             } else {
                 poxelStatsSection.style.display = 'none';
                 displayPoxelStats(null);
             }
             // Ensure friend button matches current auth state even if profile load failed
              if (!isOwnProfile && loggedInUser) {
                 displayFriendActionButton(targetUserId).catch(console.error);
             } else {
                  friendActionContainer.innerHTML = '';
             }
         }
     }
}


// =============================================================================
// --- AUTHENTICATION & INITIALIZATION ---
// =============================================================================
auth.onAuthStateChanged(user => {
    const wasLoggedIn = !!loggedInUser;
    loggedInUser = user; // Update global user state
    loggedInUserProfileData = null; // Clear cached logged-in user profile data on any auth change

    const targetUid = profileUidFromUrl || loggedInUser?.uid; // Determine whose profile to load

    console.log(`Auth state changed: User: ${user ? user.uid.substring(0,5)+'...' : 'null'}, Target Profile UID: ${targetUid ? targetUid.substring(0,5)+'...' : 'null'}`);

    if (targetUid) {
        // User logged in OR URL provides a UID -> Attempt to load profile
         if (!allAchievements) fetchAllAchievements(); // Fetch global definitions if needed

         loadCombinedUserData(targetUid); // Call main loading function

    } else {
        // No user logged in AND no UID in URL -> Show message
        console.log('No user logged in and no profile UID specified.');
        showMessage('Please log in to view your profile, or provide a user ID in the URL (e.g., ?uid=USER_ID).');
        viewingUserProfileData = {}; // Clear global data
        isOwnProfile = false; // Reset flag
         resetUI(); // Perform full UI reset
    }
});

// --- Logout Button Event Listener ---
profileLogoutBtn.addEventListener('click', () => {
    const userId = loggedInUser?.uid; // Get UID before logout
    console.log('Logout button clicked.');

    // Cleanup potential listeners before logout (safer)
    if (titleDisplay) titleDisplay.onclick = null;
    closeTitleSelector();
    closeEditModal();
    // Remove friend button listeners implicitly by clearing innerHTML on page change/resetUI

    auth.signOut().then(() => {
        console.log('User signed out successfully.');
        // Clear any local storage for the logged out user
        if (userId) {
            localStorage.removeItem(`poxelProfileCombinedData_${userId}`);
            console.log(`Cleared cache for UID: ${userId}`);
        }
        // Reset global state variables
        viewingUserProfileData = {};
        loggedInUser = null; // Crucial: set loggedInUser to null
        loggedInUserProfileData = null;
        isOwnProfile = false;

        // Redirect or update UI to reflect logged-out state
         // Option 1: Redirect to login/home
         // window.location.href = '/login.html';
         // Option 2: Update UI in place (show login message) - this requires onAuthStateChanged to handle the null user state correctly
         showMessage('You have been logged out. Please log in or provide a user ID to view a profile.');
         resetUI(); // Clear profile details

    }).catch((error) => {
        console.error('Sign out error:', error);
        alert('Error signing out. Please try again.');
    });
});


// =============================================================================
// --- LOCAL STORAGE CACHING ---
// =============================================================================

function loadCombinedDataFromCache(viewedUserId) {
    if (!viewedUserId) return false;
    const cacheKey = `poxelProfileCombinedData_${viewedUserId}`;
    try {
        const cachedDataString = localStorage.getItem(cacheKey);
        if (!cachedDataString) return false;

        const cachedData = JSON.parse(cachedDataString);
        // Basic validation of cached data structure
        if (cachedData && cachedData.profile) {
             // Optional: Add timestamp to cache and check expiry
             // const cacheTimestamp = cachedData.timestamp;
             // const maxCacheAge = 15 * 60 * 1000; // 15 minutes
             // if (!cacheTimestamp || Date.now() - cacheTimestamp > maxCacheAge) {
             //     console.log("Cache expired for UID:", viewedUserId);
             //     localStorage.removeItem(cacheKey);
             //     return false;
             // }

            viewingUserProfileData = cachedData; // Load into global state
            console.log("Loaded profile data from cache for VIEWED UID:", viewedUserId);
            // We display using this cached data immediately in loadCombinedUserData
            // but interaction state (edit icon, friend button) depends on *current* loggedInUser status.
            return true; // Indicate success
        } else {
            console.warn(`Invalid cache structure found for UID: ${viewedUserId}. Removing.`);
            localStorage.removeItem(cacheKey);
            return false;
        }
    } catch (error) {
        console.error("Error parsing cached data:", error);
        localStorage.removeItem(cacheKey); // Remove potentially corrupted cache
        return false;
    }
}

function saveCombinedDataToCache(viewedUserId, combinedData) {
    if (!viewedUserId || !combinedData || !combinedData.profile) {
        console.warn("Attempted to save invalid data structure to cache. Aborting.");
        return;
    }
    const cacheKey = `poxelProfileCombinedData_${viewedUserId}`;
    try {
        // Optionally add timestamp for cache expiry logic
        // combinedData.timestamp = Date.now();
        localStorage.setItem(cacheKey, JSON.stringify(combinedData));
        // console.log(`Saved fresh data to cache for UID: ${viewedUserId}`);
    } catch (error) {
        console.error("Error saving data to cache:", error);
        // Handle potential QuotaExceededError if localStorage is full
        if (error.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded. Cannot cache profile data. Consider clearing storage.');
            // Future enhancement: Implement LRU cache cleanup
        }
    }
}

// --- Initial Log ---
console.log("Profile script initialized. Waiting for Auth state...");
