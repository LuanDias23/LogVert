document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DA ANIMAÇÃO DE PARTÍCULAS ---
    if (document.getElementById('page-particles') && typeof particlesJS !== 'undefined') {
        particlesJS("page-particles", {
            "particles": {
                "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.2, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.1, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "out_mode": "out" }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": false } },
            },
            "retina_detect": true
        });
    }

    // --- LÓGICA DO MENU MOBILE (COPIADA DO WELCOME.JS) ---
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
        });
    }

    // --- LÓGICA DAS ABAS (TABS) ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');

            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // --- LÓGICA DOS FILTROS ---
    const filterSearch = document.getElementById('filterSearch');
    const filterLocation = document.getElementById('filterLocation');
    const filterDepartment = document.getElementById('filterDepartment');
    const jobCards = document.querySelectorAll('.job-card');
    const noResultsMessage = document.getElementById('noResultsMessage');

    function filterJobs() {
        let resultsFound = 0;
        const searchText = filterSearch.value.toLowerCase();
        const locationValue = filterLocation.value;
        const departmentValue = filterDepartment.value;

        jobCards.forEach(card => {
            const cardTags = card.getAttribute('data-tags').toLowerCase();
            
            const searchMatch = cardTags.includes(searchText);
            const locationMatch = (locationValue === 'all' || cardTags.includes(locationValue));
            const departmentMatch = (departmentValue === 'all' || cardTags.includes(departmentValue));

            if (searchMatch && locationMatch && departmentMatch) {
                card.style.display = 'flex';
                resultsFound++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noResultsMessage) {
            if (resultsFound === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        }
    }

    if (filterSearch) filterSearch.addEventListener('input', filterJobs);
    if (filterLocation) filterLocation.addEventListener('change', filterJobs);
    if (filterDepartment) filterDepartment.addEventListener('change', filterJobs);
});