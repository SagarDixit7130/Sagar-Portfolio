// Smooth scroll and active nav state
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement;
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const contactModalOverlay = document.getElementById('contactModalOverlay');
const contactModalOk = document.getElementById('contactModalOk');

// Update copyright year
const yearEl = document.getElementById('year');
if (yearEl) {
	yearEl.textContent = new Date().getFullYear();
}

// Mobile nav toggle
if (navToggle && navList) {
	navToggle.addEventListener('click', () => {
		const isOpen = navList.classList.toggle('open');
		navToggle.setAttribute('aria-expanded', String(isOpen));
	});

	navLinks.forEach((link) => {
		link.addEventListener('click', () => {
			if (navList.classList.contains('open')) {
				navList.classList.remove('open');
				navToggle.setAttribute('aria-expanded', 'false');
			}
		});
	});
}

// Smooth scrolling with header offset
navLinks.forEach((link) => {
	link.addEventListener('click', (event) => {
		const href = link.getAttribute('href');
		if (!href || !href.startsWith('#')) return;

		const target = document.querySelector(href);
		if (!target) return;

		event.preventDefault();

		const headerHeight = header ? header.offsetHeight : 0;
		const targetTop = target.getBoundingClientRect().top + window.scrollY;

		window.scrollTo({
			top: targetTop - headerHeight - 12,
			behavior: 'smooth',
		});
	});
});

// Intersection observer for active nav link
if ('IntersectionObserver' in window) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const id = entry.target.getAttribute('id');
				if (!id) return;

				const correspondingLink = document.querySelector(`.nav-link[href="#${id}"]`);
				if (!correspondingLink) return;

				if (entry.isIntersecting) {
					navLinks.forEach((l) => l.classList.remove('active'));
					correspondingLink.classList.add('active');
				}
			});
		},
		{
			root: null,
			threshold: 0.4,
		}
	);

	sections.forEach((section) => observer.observe(section));
}

// Theme toggle (dark / light)
const setTheme = (theme) => {
	if (!root) return;
	root.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
	if (themeToggle) {
		const next = theme === 'dark' ? 'light' : 'dark';
		themeToggle.setAttribute('aria-label', `Activate ${next} theme`);
	}
};

(() => {
	if (!root) return;
	const storedTheme = localStorage.getItem('theme');
	const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	const initial = storedTheme || (prefersDark ? 'dark' : 'light');
	setTheme(initial);
})();

if (themeToggle) {
	themeToggle.addEventListener('click', () => {
		const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
		const next = current === 'light' ? 'dark' : 'light';
		setTheme(next);
	});
}

// Contact form handling with custom thank-you modal
const openContactModal = () => {
	if (!contactModalOverlay) return;
	contactModalOverlay.classList.add('is-visible');
	contactModalOverlay.setAttribute('aria-hidden', 'false');
	if (contactModalOk) {
		contactModalOk.focus();
	}
};

const closeContactModal = () => {
	if (!contactModalOverlay) return;
	contactModalOverlay.classList.remove('is-visible');
	contactModalOverlay.setAttribute('aria-hidden', 'true');
	if (contactForm) {
		contactForm.querySelector('button[type="submit"]').focus();
	}
};

if (contactModalOverlay && contactModalOk) {
	contactModalOk.addEventListener('click', closeContactModal);
	contactModalOverlay.addEventListener('click', (event) => {
		if (event.target === contactModalOverlay) {
			closeContactModal();
		}
	});
	window.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && contactModalOverlay.classList.contains('is-visible')) {
			closeContactModal();
		}
	});
}

if (contactForm) {
	contactForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (!contactForm.checkValidity()) {
			contactForm.reportValidity();
			return;
		}

		if (formFeedback) {
			formFeedback.textContent = '';
			formFeedback.classList.remove('error', 'success');
		}

		const formData = new FormData(contactForm);
		try {
			const response = await fetch(contactForm.action, {
				method: 'POST',
				body: formData,
				headers: { Accept: 'application/json' },
			});

			if (response.ok) {
				if (formFeedback) {
					formFeedback.textContent = '';
				}
				contactForm.reset();
				openContactModal();
			} else {
				if (formFeedback) {
					formFeedback.textContent = 'Something went wrong. Please try again.';
					formFeedback.classList.add('error');
				}
			}
		} catch (error) {
			if (formFeedback) {
				formFeedback.textContent = 'Unable to send right now. Please check your connection and try again.';
				formFeedback.classList.add('error');
			}
		}
	});
}



