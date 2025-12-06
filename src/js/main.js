document.addEventListener("DOMContentLoaded", function () {

    try {
        VANTA.NET({ el: "#vanta-hero", mouseControls: true, touchControls: true, gyroControls: false, minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00, color: 0x06b6d4, backgroundColor: 0x020617, points: 14.00, maxDistance: 20.00, spacing: 16.00 });
    } catch (e) { console.error("Vanta Error:", e); }


    gsap.registerPlugin(ScrollTrigger, Flip);
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
    heroTl.from(".gsap-hero-reveal > *", { y: 50, opacity: 0, stagger: 0.2, delay: 0.5 });

    gsap.utils.toArray('.gsap-reveal').forEach(element => {
        gsap.from(element, {
            scrollTrigger: { trigger: element, start: "top 85%", toggleActions: "play none none reverse" },
            y: 40, opacity: 0, duration: 1, ease: "power2.out"
        });
    });


    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-brand-dark/80', 'backdrop-blur-xl', 'border-b-white/10');
            navbar.classList.remove('border-b-0');
        } else {
            navbar.classList.remove('bg-brand-dark/80', 'backdrop-blur-xl', 'border-b-white/10');
            navbar.classList.add('border-b-0');
        }
    });


    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        gsap.to(counter, {
            scrollTrigger: { trigger: counter, start: "top 80%", toggleActions: "play none none none" },
            innerText: target, duration: 2, snap: { innerText: 1 }, ease: "power1.out",
            onUpdate: function () { this.targets()[0].innerText = Math.ceil(this.targets()[0].innerText).toLocaleString(); }
        });
    });
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