// Import CSS files
import './styles.css';

// Simple JavaScript functionality
document.addEventListener('DOMContentLoaded', function () {
    console.log('Webpack Critical CSS Plugin Example loaded!');

    // Add some interactivity to the CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function () {
            alert('Critical CSS is working! This button interaction loads after the critical CSS has been inlined.');
        });
    }

    // Add hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // Log performance information
    if (window.performance) {
        window.addEventListener('load', function () {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);

                // Check if critical CSS was inlined
                const hasInlineStyles = document.querySelector('style') !== null;
                console.log(`Critical CSS inlined: ${hasInlineStyles}`);
            }, 100);
        });
    }
}); 