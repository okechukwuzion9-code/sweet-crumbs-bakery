/* =====================================================
   SWEET CRUMBS CAFÉ & BAKERY
   Main JavaScript
===================================================== */


/* ================= MOBILE NAVIGATION ================= */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");


menuToggle.addEventListener("click", () => {

    const isOpen = navMenu.classList.toggle("open");

    menuToggle.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", isOpen);

    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );
});


/*
    Close the mobile navigation when
    the user clicks a navigation link.
*/

navLinks.forEach((link) => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("open");

        menuToggle.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );
    });

});


/* ================= ACTIVE NAVIGATION ================= */

/*
    Highlights the navigation link belonging
    to the section currently visible.
*/

const sections = document.querySelectorAll("main section[id]");

const updateActiveNavigation = () => {

    let currentSection = "";

    sections.forEach((section) => {

        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            currentSection = section.getAttribute("id");
        }

    });


    navLinks.forEach((link) => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }

    });

};

window.addEventListener("scroll", updateActiveNavigation);


/* ================= CONTACT FORM ================= */

const contactForm = document.getElementById("contactForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const messageError = document.getElementById("messageError");

const formSuccess = document.getElementById("formSuccess");


/*
    Display an error message for a form field.
*/

function showError(input, errorElement, message) {

    input.classList.add("invalid");

    errorElement.textContent = message;

}


/*
    Remove an error from a form field.
*/

function clearError(input, errorElement) {

    input.classList.remove("invalid");

    errorElement.textContent = "";

}


/*
    Validate email format using a regular expression.
*/

function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

}


/*
    Validate the contact form when submitted.
*/

contactForm.addEventListener("submit", (event) => {

    event.preventDefault();

    let isValid = true;


    /* Hide previous success message */

    formSuccess.classList.remove("show");


    /* ================= NAME VALIDATION ================= */

    const name = nameInput.value.trim();

    if (name === "") {

        showError(
            nameInput,
            nameError,
            "Please enter your name."
        );

        isValid = false;

    } else if (name.length < 2) {

        showError(
            nameInput,
            nameError,
            "Name must contain at least 2 characters."
        );

        isValid = false;

    } else {

        clearError(nameInput, nameError);

    }


    /* ================= EMAIL VALIDATION ================= */

    const email = emailInput.value.trim();

    if (email === "") {

        showError(
            emailInput,
            emailError,
            "Please enter your email address."
        );

        isValid = false;

    } else if (!isValidEmail(email)) {

        showError(
            emailInput,
            emailError,
            "Please enter a valid email address."
        );

        isValid = false;

    } else {

        clearError(emailInput, emailError);

    }


    /* ================= MESSAGE VALIDATION ================= */

    const message = messageInput.value.trim();

    if (message === "") {

        showError(
            messageInput,
            messageError,
            "Please enter your message."
        );

        isValid = false;

    } else if (message.length < 10) {

        showError(
            messageInput,
            messageError,
            "Message must contain at least 10 characters."
        );

        isValid = false;

    } else {

        clearError(messageInput, messageError);

    }


    /* ================= FORM SUCCESS ================= */

    if (isValid) {

        formSuccess.classList.add("show");

        contactForm.reset();

        /*
            Hide the success message after
            five seconds.
        */

        setTimeout(() => {
            formSuccess.classList.remove("show");
        }, 5000);

    }

});


/* ================= REAL-TIME ERROR REMOVAL ================= */

/*
    Remove validation errors as the user
    starts correcting their input.
*/

nameInput.addEventListener("input", () => {

    if (nameInput.value.trim().length >= 2) {
        clearError(nameInput, nameError);
    }

});


emailInput.addEventListener("input", () => {

    if (isValidEmail(emailInput.value.trim())) {
        clearError(emailInput, emailError);
    }

});


messageInput.addEventListener("input", () => {

    if (messageInput.value.trim().length >= 10) {
        clearError(messageInput, messageError);
    }

});


/* ================= CURRENT YEAR ================= */

const currentYear = document.getElementById("currentYear");

currentYear.textContent = new Date().getFullYear();


/* ================= INITIALIZE ================= */

updateActiveNavigation();
/* ================= DARK MODE ================= */

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const darkModeEnabled =
        document.body.classList.contains("dark-mode");

    themeToggle.textContent =
        darkModeEnabled ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        darkModeEnabled
            ? "Switch to light mode"
            : "Switch to dark mode"
    );

    localStorage.setItem(
        "darkMode",
        darkModeEnabled
    );
});


/* Remember the user's theme preference */

if (localStorage.getItem("darkMode") === "true") {

    document.body.classList.add("dark-mode");

    themeToggle.textContent = "☀️";

    themeToggle.setAttribute(
        "aria-label",
        "Switch to light mode"
    );
}

/* ================= CHARACTER COUNTER ================= */

const characterCount = document.getElementById("characterCount");

messageInput.addEventListener("input", () => {

    characterCount.textContent =
        messageInput.value.length;

});

const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        message: document.getElementById("message").value.trim()
    })
});

const result = await response.json();

if (!response.ok) {
    throw new Error(result.error || "Message could not be saved.");
}

console.log(result.message);
