<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile - Poxel Competitive</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="https://res.cloudinary.com/djttn4xvk/image/upload/v1744016662/iv8s8dkwdzxgnubsnhla.ico">

    <!-- Cropper.js CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css" rel="stylesheet">
    <!-- Font Awesome for Pencil Icon (Optional) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <!-- Main Stylesheet Link -->
    <link rel="stylesheet" href="profile-styles.css">
    <!-- Inline styles only for immediate modifications/additions needed -->
    <style>
        /* --- BASE STYLES & VARIABLES (from previous examples) --- */
        :root {
            --bg-dark: #121212;
            --bg-secondary: #1e1e1e;
            --text-light: #e0e0e0;
            --text-dark: #121212; /* Text on orange elements */
            --primary-orange: #ff6600;
            --primary-orange-darker: #e65c00;
            --border-light: #444;
            --rank-bronze-bg: #cd7f32;
            --rank-silver-bg: #c0c0c0;
            --rank-gold-bg: #ffd700;
            --rank-default-bg: #555; /* For unranked/other */
            --text-secondary: #aaa;
            /* Badge Colors */
            --badge-verified-bg: #00acee; /* Blue */
            --badge-creator-bg: #a970ff;  /* Purple */
            --badge-moderator-bg: #ff6600; /* Orange (matches primary) */
            --badge-tick-color: #ffffff;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Poppins', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-light);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        main { flex-grow: 1; padding: 0; }
        header, footer { width: 100%; } /* Ensure full width */

        /* --- SHARED COMPONENTS (Header, Footer, Buttons - from previous examples) --- */
        header { background-color: var(--bg-secondary); padding: 1rem 0; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); }
        .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
        .logo { font-size: 1.8rem; font-weight: 700; color: var(--text-light); text-decoration: none; }
        .auth-buttons { display: flex; align-items: center; gap: 0.8rem; }
        .auth-buttons button, .auth-buttons a.btn { margin: 0; }

        .btn { padding: 0.7rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: background-color 0.3s ease, color 0.3s ease, transform 0.1s ease, border-color 0.3s ease, box-shadow 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; line-height: 1.2; text-align: center; }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background-color: var(--primary-orange); color: var(--text-dark); border: 2px solid var(--primary-orange); }
        .btn-primary:hover { background-color: var(--primary-orange-darker); border-color: var(--primary-orange-darker); box-shadow: 0 0 10px rgba(255, 102, 0, 0.5); color: var(--text-dark); }
        .btn-secondary { background-color: transparent; color: var(--text-light); border: 2px solid var(--border-light); }
        .btn-secondary:hover { background-color: rgba(224, 224, 224, 0.1); border-color: var(--text-light); color: var(--text-light); }
        .btn:disabled, .btn[disabled] { background-color: var(--border-light) !important; border-color: var(--border-light) !important; color: var(--text-secondary) !important; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn:disabled:hover, .btn[disabled]:hover { background-color: var(--border-light) !important; } /* Prevent hover effect */

        footer { text-align: center; padding: 1.5rem; margin-top: auto; background-color: var(--bg-secondary); color: var(--text-secondary); font-size: 0.9rem; }


        /* ======================================== */
        /* PROFILE PAGE SPECIFIC STYLES            */
        /* ======================================== */
        #profile-content-wrapper { /* Added wrapper for margin */
             max-width: 850px;
             margin: 3rem auto;
             padding: 0 1rem; /* Padding for smaller screens */
        }
        .profile-container {
            padding: 2.5rem 3rem;
            background-color: var(--bg-secondary);
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
            text-align: center;
            /* Background Image Styling */
            position: relative;
            z-index: 1;
            overflow: hidden; /* Contain the pseudo-element */
            --profile-bg-image: none; /* CSS Variable for background */
        }
        .profile-container::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: var(--profile-bg-image);
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
            opacity: 0; /* Hidden by default */
            z-index: -1; /* Behind content */
            transition: opacity 0.5s ease-in-out;
            filter: blur(10px) brightness(0.5); /* Blur and dim background */
            transform: scale(1.1); /* Avoid hard edges from blur */
        }
        .profile-container.has-background::before {
            opacity: 1; /* Show with effects when class is added */
        }


        /* --- Profile Header Layout --- */
        .profile-header {
            display: flex;
            flex-direction: column; /* Default mobile layout */
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 3rem;
            position: relative; /* For action buttons absolute positioning if needed */
            text-align: center;
        }

        /* Profile Pic Specific Styles */
        #profile-pic {
            position: relative; /* For edit icon positioning */
            width: 120px;
            height: 120px;
            background-color: var(--bg-secondary); /* Fallback color */
            color: var(--text-light); /* Fallback text color */
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 4.5rem;
            font-weight: 700;
            line-height: 1;
            border: 4px solid var(--primary-orange);
            box-shadow: 0 0 15px rgba(255, 102, 0, 0.4);
            text-transform: uppercase;
            overflow: hidden; /* Important */
            cursor: default;
            flex-shrink: 0; /* Prevent shrinking */
        }
        #profile-pic img { display: block; width: 100%; height: 100%; object-fit: cover; }
        #edit-profile-pic-icon { /* Style for edit pencil icon */
            position: absolute; bottom: 5px; right: 5px;
            background-color: rgba(0, 0, 0, 0.6); color: white; border-radius: 50%;
            width: 30px; height: 30px; display: none; /* Hidden by default */
            justify-content: center; align-items: center; cursor: pointer; font-size: 0.9rem;
            border: 1px solid rgba(255, 255, 255, 0.5); transition: background-color 0.2s ease;
        }
        #edit-profile-pic-icon:hover { background-color: rgba(0, 0, 0, 0.8); }

        /* Container for user details below/beside picture */
        .profile-details {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .profile-identity {
            /* Styles for username, badges, rank, title, email container */
            margin-bottom: 1rem; /* Space between identity and actions */
        }

        .profile-name-container { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.2rem; }
        #profile-username { font-size: 2.2rem; font-weight: 700; color: var(--text-light); margin: 0; }
        #profile-badges-container { display: inline-flex; align-items: center; gap: 0.4rem; line-height: 1; vertical-align: middle; }
        .profile-badge { /* Badge Styling */
            display: inline-flex; align-items: center; justify-content: center;
            width: 1.8em; height: 1.8em; border-radius: 50%;
            font-size: 0.8em; font-weight: bold; color: var(--badge-tick-color);
            line-height: 1; vertical-align: middle; position: relative;
        }
        .profile-badge::before { content: '✔'; display: block; } /* Simple tick */
        .badge-verified { background-color: var(--badge-verified-bg); }
        .badge-creator { background-color: var(--badge-creator-bg); }
        .badge-moderator { background-color: var(--badge-moderator-bg); }
        .admin-tag { /* Admin Tag Styling */
             display: none; background-color: var(--primary-orange); color: var(--text-dark);
             padding: 0.3em 0.6em; border-radius: 4px; font-size: 0.8rem; font-weight: 700;
             text-transform: uppercase; vertical-align: middle; line-height: 1;
         }
        #profile-email { font-size: 1rem; color: var(--text-secondary); font-weight: 400; margin-top: 0; word-break: break-all; }

        /* Rank, Title, Title Selector */
        .profile-identifiers { margin-top: 0.5rem; margin-bottom: 0.3rem; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.8rem; position: relative; min-height: 25px; /* Ensure space */ }
        .profile-rank-display { background-color: var(--rank-default-bg); color: var(--text-light); padding: 0.2em 0.7em; border-radius: 15px; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2; display: inline-block; transition: background-color 0.3s ease, color 0.3s ease; }
        .rank-unranked { background-color: var(--rank-default-bg); color: #ccc; }
        /* Add other rank classes (rank-bronze, etc.) */
        .profile-title-display { color: var(--primary-orange); font-size: 1rem; font-weight: 600; font-style: italic; display: inline-block; transition: color 0.2s ease; }
        #profile-title.selectable-title { cursor: pointer; text-decoration: underline; text-decoration-style: dotted; text-decoration-color: var(--primary-orange); }
        #profile-title.selectable-title:hover { color: var(--primary-orange-darker); text-decoration-color: var(--primary-orange-darker); }
        #profile-title.no-title-placeholder { color: var(--text-secondary); font-style: normal; }
        .title-selector { display: none; position: absolute; top: calc(100% + 5px); left: 50%; transform: translateX(-50%); min-width: 180px; max-width: 250px; background-color: var(--bg-dark); border: 1px solid var(--border-light); border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); padding: 0.5rem 0; z-index: 10; max-height: 200px; overflow-y: auto; text-align: left; }
        .title-option { display: block; background: none; border: none; color: var(--text-light); padding: 0.6rem 1rem; width: 100%; cursor: pointer; font-size: 0.95rem; transition: background-color 0.2s ease; white-space: nowrap; position: relative; text-align: left; }
        .title-option:hover { background-color: var(--bg-secondary); }
        .title-option.currently-equipped { font-weight: bold; color: var(--primary-orange); padding-left: 2.2rem; }
        .title-option.currently-equipped::before { content: '✔'; position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: var(--primary-orange); }

        /* --- Action Buttons (Friend, Logout) --- */
        .profile-actions {
            display: flex;
            justify-content: center; /* Center horizontally */
            align-items: center;
            gap: 1rem; /* Space between friend button and logout button */
            margin-top: 1.5rem; /* Space above action buttons */
            min-height: 40px; /* Ensure container has height even when empty */
            flex-wrap: wrap; /* Allow buttons to wrap */
        }
        #friend-action-container { /* Container specifically for friend button */
             min-width: 130px; /* Prevent width collapsing */
             text-align: center; /* Center button if alone */
         }
        #friend-action-container button { min-width: 130px; }

        /* Specific styles for Remove Friend Button */
        #friend-action-container button.btn-remove-friend {
            background-color: transparent;
            border: 2px solid #d9534f; /* Red border */
            color: #d9534f;
        }
        #friend-action-container button.btn-remove-friend:hover {
            background-color: rgba(217, 83, 79, 0.1); /* Light red bg on hover */
            color: #d9534f;
            border-color: #d9534f;
            box-shadow: 0 0 8px rgba(217, 83, 79, 0.4);
        }

        /* --- Stats Sections --- */
        .profile-stats { margin-top: 3rem; border-top: 1px solid var(--border-light); padding-top: 3rem; }
        .profile-stats h3 { margin-bottom: 2rem; color: var(--primary-orange); font-size: 1.7rem; font-weight: 600; text-align: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.8rem; text-align: left; }
        .stats-grid > p { color: var(--text-secondary); font-style: italic; grid-column: 1 / -1; text-align: center; padding: 1rem 0; }
        .stat-item { background-color: var(--bg-dark); padding: 1.3rem 1.6rem; border-radius: 8px; border-left: 5px solid var(--primary-orange); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; }
        .stat-item:hover { transform: translateY(-4px); box-shadow: 0 5px 10px rgba(0, 0, 0, 0.4); }
        .stat-item h4 { margin-bottom: 0.6rem; color: #ccc; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-item p { font-size: 1.7rem; font-weight: 700; color: var(--primary-orange); line-height: 1.2; margin: 0; }

        /* --- Loading / Not Logged In / Error States --- */
        .state-container { /* Replaces profile-container for these messages */
            max-width: 800px;
            margin: 3rem auto;
            padding: 4rem 2rem;
            background-color: var(--bg-secondary);
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
            text-align: center;
            font-size: 1.2rem;
            color: var(--text-secondary);
            min-height: 300px; /* Ensure minimum height */
            display: flex; /* Keep using flex for centering */
            justify-content: center;
            align-items: center;
        }
        #profile-content-wrapper { display: none; } /* Hide main content initially */


        /* --- IMAGE EDITING MODAL STYLES (from previous example) --- */
        .modal-overlay { /* Modal Overlay */
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.8); display: none; /* Hidden by default */
            justify-content: center; align-items: center; z-index: 1000; padding: 20px;
        }
        .modal-content { /* Modal Box */
            background-color: var(--bg-secondary); padding: 25px 30px; border-radius: 10px;
            max-width: 600px; width: 90%; max-height: 90vh; display: flex; flex-direction: column;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .modal-header { /* Modal Header */
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
            border-bottom: 1px solid var(--border-light); padding-bottom: 15px;
        }
        .modal-header h3 { color: var(--primary-orange); margin: 0; font-size: 1.6rem; }
        .modal-close-btn { background: none; border: none; color: var(--text-secondary); font-size: 1.8rem; cursor: pointer; line-height: 1; padding: 5px; }
        .modal-close-btn:hover { color: var(--text-light); }
        .modal-body { flex-grow: 1; margin-bottom: 20px; overflow: hidden; max-height: calc(90vh - 180px); }
        #cropper-image-container { width: 100%; height: 100%; min-height: 300px; }
        #image-to-crop { display: block; max-width: 100%; opacity: 0; } /* Hide until ready */
        /* Cropper specific overrides */
        .cropper-view-box, .cropper-face { border-radius: 50%; }
        .modal-footer { /* Modal Footer */
             display: flex; justify-content: flex-end; gap: 10px;
             padding-top: 15px; border-top: 1px solid var(--border-light);
        }
        /* Spinner for apply button */
        .spinner {
             border: 4px solid rgba(255, 255, 255, 0.3); border-radius: 50%;
             border-top-color: var(--primary-orange); /* Use consistent color */
             width: 20px; height: 20px; animation: spin 1s linear infinite;
             display: none; /* Hidden initially */
         }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        /* Ensure spinner takes no space when hidden */
        #modal-apply-btn .spinner { display: none; }
        #modal-apply-btn.is-loading .spinner { display: inline-block; margin-left: 8px; vertical-align: middle; }
        #modal-apply-btn.is-loading span.btn-text { vertical-align: middle; }


        /* --- RESPONSIVE ADJUSTMENTS --- */
        @media (min-width: 600px) {
             .profile-header {
                flex-direction: row; /* Side-by-side layout */
                text-align: left;
                align-items: flex-start; /* Align items to the top */
             }
             .profile-details {
                 align-items: flex-start; /* Align text left */
                 flex-grow: 1; /* Take remaining space */
             }
            .profile-name-container { justify-content: flex-start; }
            .profile-identifiers { justify-content: flex-start; }
            .profile-actions { justify-content: flex-start; }
             #profile-pic {
                 width: 140px;
                 height: 140px;
                 font-size: 5rem;
             }
             #edit-profile-pic-icon { width: 35px; height: 35px; font-size: 1rem; bottom: 8px; right: 8px; }
        }

        @media (max-width: 768px) {
            .nav-container { flex-direction: column; gap: 1rem; padding: 0 1rem; }
             #profile-content-wrapper { margin: 2rem auto; }
            .profile-container { padding: 2rem; }
            #profile-pic { width: 100px; height: 100px; font-size: 3.5rem; }
            #edit-profile-pic-icon { width: 28px; height: 28px; font-size: 0.8rem; bottom: 4px; right: 4px; }
            #profile-username { font-size: 1.9rem; }
            .profile-badge { font-size: 0.75em; }
            .profile-stats h3 { font-size: 1.5rem; }
            .stats-grid { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1.2rem; }
            .stat-item p { font-size: 1.5rem; }
            .state-container { min-height: 250px; padding: 3rem 1.5rem; }
        }
        @media (max-width: 480px) {
            .logo { font-size: 1.5rem; }
            .btn { padding: 0.6rem 1.2rem; font-size: 0.9rem; }
             #profile-content-wrapper { margin: 1.5rem auto; }
            .profile-container { padding: 1.5rem 1.2rem; border-radius: 8px; }
            .profile-header { margin-bottom: 2rem; }
            #profile-pic { width: 85px; height: 85px; font-size: 3rem; border-width: 3px; }
            #edit-profile-pic-icon { width: 25px; height: 25px; font-size: 0.7rem; bottom: 3px; right: 3px; }
            #profile-username { font-size: 1.6rem; }
            #profile-email { font-size: 0.9rem; }
             .profile-badge { font-size: 0.7em; }
            .profile-stats { padding-top: 1.8rem; }
            .profile-stats h3 { font-size: 1.4rem; margin-bottom: 1.5rem; }
            .stats-grid { grid-template-columns: 1fr; gap: 1rem; } /* Stack stats */
            .stat-item { padding: 1rem 1.2rem; }
            .stat-item h4 { font-size: 0.85rem; }
            .stat-item p { font-size: 1.4rem; }
            .state-container { min-height: 200px; padding: 2rem 1rem; font-size: 1.1rem; }
            .profile-name-container { gap: 0.3rem; }
            .profile-identifiers { gap: 0.5rem; }
            .profile-rank-display { font-size: 0.8rem; padding: 0.2em 0.6em; }
            .profile-title-display { font-size: 0.9rem; }
            .title-selector { min-width: 150px; }
            .title-option { font-size: 0.9rem; padding: 0.5rem 0.8rem; }
            .profile-actions { flex-direction: column; gap: 0.8rem; width: 100%; }
            #friend-action-container, #friend-action-container button, #profile-logout-btn { width: 100%; max-width: 280px; } /* Full width buttons on mobile */
            .modal-content { padding: 20px 15px; } /* Adjust modal padding */
            .modal-header h3 { font-size: 1.4rem; }
            #cropper-image-container { min-height: 250px; }
        }

    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="nav-container">
            <a href="index.html" class="logo">Poxel Competitive</a>
            <div class="auth-buttons">
                <a href="main.html" class="btn btn-secondary">Matches</a>
                 <!-- Logout button appears here when logged in, controlled by JS -->
                <div id="logout-button-container"></div> <!-- Placeholder for logout button -->
                 <!-- Login/Signup might be handled elsewhere -->
            </div>
        </div>
    </header>

    <!-- Main Content Area -->
    <main>
        <!-- Loading State -->
        <div class="state-container" id="loading-profile">
            <p>Loading profile...</p>
        </div>

        <!-- Not Logged In / User Not Found / Error State -->
        <div class="state-container" id="message-container" style="display: none;">
            <p id="message-text">Message goes here.</p>
        </div>

        <!-- Profile Content (Initially Hidden) -->
        <div id="profile-content-wrapper">
            <div class="profile-container" id="profile-content">
                <div class="profile-header">
                    <!-- Profile Picture Area -->
                    <div id="profile-pic">
                        <span id="profile-initials">?</span> <!-- Fallback Initials -->
                        <img id="profile-image" src="" alt="Profile Picture" style="display: none;"> <!-- Image Tag -->
                        <span id="edit-profile-pic-icon" title="Edit Profile Picture">
                            <i class="fas fa-pencil-alt"></i> <!-- Font Awesome Icon -->
                        </span>
                    </div>
                     <!-- Hidden File Input -->
                    <input type="file" id="profile-pic-input" accept="image/png, image/jpeg, image/gif" style="display: none;">

                    <!-- User Details & Actions Container -->
                    <div class="profile-details">
                        <!-- User Identity Block -->
                        <div class="profile-identity">
                             <div class="profile-name-container">
                                <h2 id="profile-username">Username</h2>
                                <span id="profile-badges-container"></span>
                                <span id="admin-tag" class="admin-tag">Admin</span>
                            </div>
                            <div class="profile-identifiers">
                                <span id="profile-rank" class="profile-rank-display">...</span>
                                <span id="profile-title" class="profile-title-display" style="display: none;"></span>
                                <!-- Title selector div appended here by JS -->
                            </div>
                            <p id="profile-email">user@example.com</p>
                        </div>

                        <!-- Action Buttons Block -->
                        <div class="profile-actions">
                            <!-- Friend action button goes here -->
                            <div id="friend-action-container"></div>
                             <!-- Logout button may also go here or stay in header -->
                             <button class="btn btn-secondary" id="profile-logout-btn" style="display: none;">Logout</button>
                        </div>
                    </div>

                </div> <!-- End profile-header -->

                <!-- Competitive Stats Section -->
                <div class="profile-stats" id="competitive-stats-section">
                    <h3>Competitive Stats</h3>
                    <div class="stats-grid" id="stats-display">
                        <p>Loading competitive stats...</p>
                    </div>
                </div>

                <!-- Poxel.io Stats Section -->
                <div class="profile-stats" id="poxel-stats-section" style="display: none;">
                    <h3>Poxel.io Stats</h3>
                    <div class="stats-grid" id="poxel-stats-display">
                        <p>Loading Poxel.io stats...</p>
                    </div>
                </div>

            </div><!-- End profile-container -->
        </div><!-- End profile-content-wrapper -->

    </main>

    <!-- Footer -->
    <footer>
        <p>© 2024 Poxel Competitive. All rights reserved.</p>
    </footer>

    <!-- Image Editing Modal -->
    <div class="modal-overlay" id="edit-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Profile Picture</h3>
                <button class="modal-close-btn" id="modal-close-btn">×</button>
            </div>
            <div class="modal-body">
                <div id="cropper-image-container">
                    <img id="image-to-crop" src="" alt="Image to crop">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
                <button class="btn btn-primary" id="modal-apply-btn">
                    <span class="btn-text">Apply</span>
                    <span class="spinner"></span>
                 </button>
            </div>
        </div>
    </div>


    <!-- Firebase SDK Scripts -->
    <script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js"></script>

    <!-- Cropper.js Script -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>

    <!-- NOTE: Cloudinary Widget Script is NOT used if using direct Fetch upload -->
    <!-- <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript"></script> -->

    <!-- Your Profile Script -->
    <script src="profile.js"></script>

</body>
</html>
