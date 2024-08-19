const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navbar-right');
const navlist_display = document.querySelector('.navbar-left');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navlist_display.classList.toggle('hidden');
});


const themeButton = document.querySelector('[data-theme-btn]');
const body = document.body;
themeButton.addEventListener('click', function () {
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
    }
});