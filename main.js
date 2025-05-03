let tg = window.Telegram.WebApp;

// Initialize Telegram WebApp
document.addEventListener('DOMContentLoaded', function() {
    // Expand to full size
    tg.expand();
    
    // Set theme colors from Telegram
    applyTelegramTheme();
});

// Apply Telegram theme colors to CSS variables
function applyTelegramTheme() {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#5288c1');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f0f0f0');
}

// Open a specific calculator
function openCalculator(calcType) {
    window.location.href = `calculators/${calcType}.html`;
}
