// --- Scroll Logic ---
window.addEventListener('scroll', () => {
    const hero = document.getElementById('slideshow-container');
    const scrollY = window.scrollY;
    
    // Easing for smooth cinematic fade
    const fadeRange = 600; 
    let rawOpacity = Math.min(scrollY / fadeRange, 1);
    let easedOpacity = Math.pow(rawOpacity, 2); 
    
    // Pass the variable to the body for all elements to use
    document.body.style.setProperty('--scroll-opacity', easedOpacity);
    
    // Shrink hero only
    // if (scrollY > 5) {
    //     hero.classList.add('shrunk');
    // } else {
    //     hero.classList.remove('shrunk');
    // }
}, { passive: true });

// --- Dynamic Image Loader (GitHub Optimized) ---
async function loadPortfolio() {
    try {
        // This fetch works perfectly on GitHub Pages
        const response = await fetch('images.txt');
        const text = await response.text();
        
        // Split by lines and filter out empty lines
        const lines = text.split('\n').filter(line => line.trim() !== '');

        const slideshow = document.querySelector('.slideshow');
        const grid = document.querySelector('.portfolio-grid');
        
        slideshow.innerHTML = '';
        grid.innerHTML = ''; 

        lines.forEach((line, index) => {
            const [filename, caption] = line.split(',');
            if (!filename) return;

            const path = `photos/${filename.trim()}`;

            // Add to Slideshow
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `url('${path}')`;
            slideshow.appendChild(slide);

            // Add to Grid
            const item = document.createElement('div');
            item.className = 'portfolio-item';
            item.innerHTML = `<img src="${path}" alt="${caption ? caption.trim() : 'Work'}">`;
            grid.appendChild(item);
        });

        // Initialize Slideshow Loop
        let slides = document.querySelectorAll('.slide');
        let index = 0;
        if (slides.length > 0) {
            setInterval(() => {
                slides[index].classList.remove('active');
                index = (index + 1) % slides.length;
                slides[index].classList.add('active');
            }, 4000);
        }

    } catch (error) {
        console.error("Error loading images.txt:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadPortfolio);
