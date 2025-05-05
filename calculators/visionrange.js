// Імпорт констант з config.js
import { RESOLUTION_MAP, DORI_THRESHOLDS, FACE_RECOGNITION_THRESHOLDS, OTHER_DETECTION_FEATURES as OTHER_FEATURES, SENSOR_SIZES } from './config.js';

// Коментуємо константи, які тепер в config.js
// const SENSOR_SIZES = {...}
// const RESOLUTION_MAP = {...}
// const DORI_THRESHOLDS = {...}
// const FACE_RECOGNITION_THRESHOLDS = {...}
// const OTHER_FEATURES = {...}

// Initialize form handling when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('visionRangeForm');
    if (form) {
        form.addEventListener('submit', calculateVisionRange);
    }
    
    // Initialize Telegram WebApp if available
    window.tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : { 
        expand: function(){}, 
        MainButton: { setText: function(){}, show: function(){}, onClick: function(){} },
        sendData: function(){}
    };
    tg.expand();
});

// Main calculation function
function calculateVisionRange(e) {
    e.preventDefault();
    
    try {
        // Get input values
        const megapixels = parseFloat(document.getElementById('megapixels').value);
        const focalLength = parseFloat(document.getElementById('focalLength').value);
        const sensorType = document.getElementById('sensor').value;
        const heightInput = document.getElementById('height').value;
        
        // Validate inputs
        if (isNaN(megapixels) || megapixels <= 0) {
            throw new Error("Роздільна здатність має бути більше 0");
        }
        if (isNaN(focalLength) || focalLength <= 0) {
            throw new Error("Фокусна відстань має бути більше 0");
        }
        
        // Set sensor width and height values
        const sensorWidthMm = SENSOR_SIZES[sensorType];
        const heightM = heightInput ? parseFloat(heightInput) : 0;
        const targetHeightM = 1.6; // Approximate face height
        const adjustedHeight = Math.max(heightM - targetHeightM, 0);
        
        // Get closest resolution
        const closestMp = Object.keys(RESOLUTION_MAP)
            .map(mp => parseFloat(mp))
            .reduce((prev, curr) => 
                Math.abs(curr - megapixels) < Math.abs(prev - megapixels) ? curr : prev
            );
        const widthPx = RESOLUTION_MAP[String(closestMp)];
        
        // Calculate field of view
        const fovDegrees = (2 * Math.atan(sensorWidthMm / (2 * focalLength)) * 180 / Math.PI) * 1.085;
        
        // Create a working copy of OTHER_FEATURES without banknote recognition if height is specified
        let workingOtherFeatures = {...OTHER_FEATURES};
        if (heightM > 0) {
            delete workingOtherFeatures["💵 Розпізнавання купюр"];
        }
        
        // Function to compute distance for a given PPM (pixels per meter)
        function computeDistance(ppm) {
            const dRaw = (focalLength * widthPx) / (ppm * sensorWidthMm);
            const dHorizontal = Math.sqrt(Math.max(Math.pow(dRaw, 2) - Math.pow(adjustedHeight, 2), 0));
            const width = dRaw * sensorWidthMm / focalLength;
            return [dHorizontal, width];
        }
        
        // Calculate results for all categories
        const doriResults = Object.entries(DORI_THRESHOLDS).map(([label, ppm]) => {
            const [distance, width] = computeDistance(ppm);
            return { label, distance, width };
        });
        
        const faceResults = Object.entries(FACE_RECOGNITION_THRESHOLDS).map(([label, ppm]) => {
            const [distance, width] = computeDistance(ppm);
            return { label, distance, width };
        });
        
        const otherResults = Object.entries(workingOtherFeatures).map(([label, ppm]) => {
            const [distance, width] = computeDistance(ppm);
            return { label, distance, width };
        });
        
        // Display results
        displayResults({
            megapixels,
            focalLength,
            sensorType,
            heightM,
            widthPx,
            fovDegrees,
            doriResults,
            faceResults,
            otherResults
        });
        
    } catch (error) {
        alert("Помилка: " + error.message);
    }
}

// Display the calculation results
function displayResults(data) {
    const resultContent = document.getElementById('resultContent');
    const resultBox = document.getElementById('resultBox');
    
    let html = `
        <div><i class="bi bi-binoculars-fill"></i> <strong>Результати прогнозу дальності:</strong></div>
        
        <div style="margin-top:10px;"><i class="bi bi-sliders"></i> <strong>Вхідні параметри:</strong></div>
        <div>- Роздільна здатність: ~${data.megapixels} MP → ${data.widthPx} px</div>
        <div>- Фокусна відстань: ${data.focalLength} мм</div>
        <div>- Теоретичний кут огляду: ~${data.fovDegrees.toFixed(1)}°</div>
        <div>- Сенсор: ${data.sensorType}</div>
    `;
    
    if (data.heightM > 0) {
        html += `<div>- Висота встановлення камери: ${data.heightM.toFixed(2)} м</div>`;
    }
    
    html += `<div class="result-section"><i class="bi bi-layers-half"></i> <strong>DORI-зони (стандарт для оператора):</strong></div>`;
    data.doriResults.forEach(item => {
        html += `<div>- ${item.label}: <strong>${item.distance.toFixed(1)} м</strong> (Ширина: ${item.width.toFixed(1)} м)</div>`;
    });
    
    html += `<div class="result-section"><i class="bi bi-person-bounding-box"></i> <strong>Розпізнавання обличчя (функції ШІ):</strong></div>`;
    data.faceResults.forEach(item => {
        html += `<div>- ${item.label}: <strong>${item.distance.toFixed(1)} м</strong></div>`;
    });
    
    html += `<div class="result-section"><i class="bi bi-stars"></i> <strong>Спеціальні можливості:</strong></div>`;
    data.otherResults.forEach(item => {
        html += `<div>- ${item.label}: <strong>${item.distance.toFixed(1)} м</strong></div>`;
    });
    
    resultContent.innerHTML = html;
    resultBox.style.display = 'block';
    
    // Telegram integration
    tg.MainButton.setText('Готово');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        tg.sendData(JSON.stringify({
            calculator: 'visionrange',
            parameters: {
                megapixels: data.megapixels,
                focalLength: data.focalLength,
                sensor: data.sensorType,
                height: data.heightM
            },
            results: {
                dori: data.doriResults.map(r => ({label: r.label, distance: r.distance})),
                face: data.faceResults.map(r => ({label: r.label, distance: r.distance})),
                other: data.otherResults.map(r => ({label: r.label, distance: r.distance}))
            }
        }));
    });
}
