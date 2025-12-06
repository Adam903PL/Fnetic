document.addEventListener("DOMContentLoaded", function () {

    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    const icon = btn ? btn.querySelector('i') : null;
    const links = document.querySelectorAll('.mobile-link');
    let isOpen = false;

    function closeMenu() {
        if (!menu || !icon) return;
        isOpen = false;
        menu.classList.add('opacity-0', 'pointer-events-none', '-translate-y-5');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = ''; 
    }

    function openMenu() {
        if (!menu || !icon) return;
        isOpen = true;
        menu.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-5');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        document.body.style.overflow = 'hidden';
    }

    if (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (isOpen) closeMenu();
            else openMenu();
        });
    }

    if (links.length > 0) {
        links.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }


    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && isOpen) {
            closeMenu();
        }
    });

    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.classList.add('bg-[#020617]/80', 'backdrop-blur-xl', 'border-b', 'border-white/10', 'shadow-lg');
                navbar.classList.remove('border-b-0', 'py-3', 'md:py-4');
                navbar.classList.add('py-2', 'md:py-3'); 
            } else {
                navbar.classList.remove('bg-[#020617]/80', 'backdrop-blur-xl', 'border-b', 'border-white/10', 'shadow-lg', 'py-2', 'md:py-3');
                navbar.classList.add('border-b-0', 'py-3', 'md:py-4');
            }
        });
    }
});


(function () {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const icon = btn ? btn.querySelector('i') : null;
    const links = document.querySelectorAll('.mobile-link');
    let isOpen = false;

    function closeMenu() {
        isOpen = false;
        menu.classList.add('opacity-0', 'pointer-events-none', '-translate-y-5');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        document.body.style.overflow = '';
    }

    function openMenu() {
        isOpen = true;
        menu.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-5');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
        document.body.style.overflow = 'hidden';
    }

    if (btn && menu && icon) {

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });


        links.forEach(link => {
            link.addEventListener('click', closeMenu);
        });



        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && isOpen) {
                closeMenu();
            }
        });
    } else {
        console.error('Mobile menu elements not found inside header.');
    }
})();




AOS.init({ once: true, offset: 100, duration: 800 });


if (window.VANTA) {
    VANTA.NET({
        el: "#vanta-hero",
        mouseControls: true, touchControls: true, gyroControls: false,
        minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00,
        color: 0x06b6d4, backgroundColor: 0x020617,
        points: 12.00, maxDistance: 22.00, spacing: 18.00, showDots: true
    })
}


new Typed('#terminal-content', {
    strings: [
        '<span class="text-green-400">➜</span> <span class="text-blue-400">~</span> git push origin production^1000\n`Enumerating objects: 15, done.`\n`Total 15 (delta 4), reused 0 (delta 0)`\n<br>\n<span class="text-green-400">➜</span> <span class="text-blue-400">~</span> <span class="text-yellow-400">Starting Pipeline...</span>\n`[PIPELINE] Building Docker image...` <span class="text-green-400">[DONE]</span>\n`[PIPELINE] Running unit tests...` <span class="text-green-400">[PASS]</span>\n`[SECURITY] Scanning dependencies...` <span class="text-green-400">[SAFE]</span>\n<br>\n<span class="text-green-400">➜</span> <span class="text-blue-400">~</span> terraform apply -auto-approve^1000\n`aws_instance.app_server: Modifying...`\n<span class="text-brand-accent font-bold">Apply complete! Resources: 2 added.</span>'
    ],
    typeSpeed: 30, backSpeed: 0, cursorChar: '_', loop: true, contentType: 'html', smartBackspace: false
});

const cards = document.querySelectorAll('.magic-card');
const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
};
for (const card of cards) { card.addEventListener('mousemove', handleMouseMove); }


const counters = document.querySelectorAll('.counter');
const runCounter = (el) => {
    const target = +el.getAttribute('data-target');
    const speed = 200;
    const increment = target / speed;
    const updateCount = () => {
        const count = +el.innerText;
        if (count < target) {
            el.innerText = Math.ceil(count + increment);
            setTimeout(updateCount, 20);
        } else {
            el.innerText = target;
        }
    };
    updateCount();
};
const observerOptions = { threshold: 0.5 };
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);
counters.forEach(counter => observer.observe(counter));