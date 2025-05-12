// Constants for sensor sizes (width in mm)
const SENSOR_SIZES = {
    "1/4": 3.6, 
    "1/3.6": 4.0, 
    "1/3.2": 4.5, 
    "1/3": 4.8,
    "1/2.9": 5.0, 
    "1/2.8": 5.35, 
    "1/2.7": 5.37, 
    "1/2.5": 5.76,
    "1/2": 6.4, 
    "1/1.8": 7.18, 
    "1/1.7": 7.6, 
    "1/1.2": 10.2,
    "2/3": 8.8
};

// const SENSOR_SIZES = {
//     "1/4": 3.2,
//     "1/3": 4.8,
//     "1/2.8": 5.5,
//     "1/2.7": 5.7,
//     "1/2": 6.4,
//     "1/1.8": 7.2,
//     "2/3": 8.8,
//     "1/1.2": 10.8,
//     "1/1": 12.8
// };

// Resolution approximations (megapixels to width in pixels)
const RESOLUTION_MAP = {
    1: 1280,
    1.3: 1280,
    2: 1920,
    3: 2048,
    3.6:2560,
    4: 2688,
    5: 2560,
    6: 3072,
    8: 3840,
    12: 4000
};

// DORI thresholds (pixels per meter)
const DORI_THRESHOLDS = {
    "Ідентифікація (чітко іден. особу)": 250,
    "Розпізнавання (впізнати знайому особу)": 125,
    "Огляд (деталі особи/одяг)": 62,
    "Детекція (виявити рух/наявність людини)": 25
};

// Face recognition thresholds
const FACE_RECOGNITION_THRESHOLDS = {
    "👤 Базове виявлення обличчя (мінімум для виявлення)": 50,
    "👥 Впізнавання (пошук в БД)": 100,
    "🔍 Високоточне розпізнавання (погане освітлення, рух)": 145
};

// Other special features
const OTHER_FEATURES = {
    "💵 Розпізнавання купюр": 300,
    "🚗 Читання номерів авто": 150,
    "🚙 Часткове читання номерів": 90
};

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
            .map(Number)
            .reduce((prev, curr) => 
                Math.abs(curr - megapixels) < Math.abs(prev - megapixels) ? curr : prev
            );
        const widthPx = RESOLUTION_MAP[closestMp];
        
        // Calculate field of view
        const fovDegrees = (2 * Math.atan(sensorWidthMm / (2 * focalLength)) * 180 / Math.PI);
        
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
        <div class="result-cctvheader"><i class="bi bi-binoculars-fill result-cctvicon"></i> <strong>Результати прогнозу дальності:</strong></div>
        
        <table class="result-cctvtable zebra-table">
            <tr>
                <td class="label"><i class="bi bi-camera"></i> Роздільна здатність:</td>
                <td class="value">~${data.megapixels} MP → ${data.widthPx} px</td>
            </tr>
            <tr>
                <td class="label"><i class="bi bi-arrows-angle"></i> Фокусна відстань:</td>
                <td class="value">${data.focalLength} мм</td>
            </tr>
            <tr>
                <td class="label"><i class="bi bi-aspect-ratio"></i> Теоретичний кут огляду:</td>
                <td class="value">~${data.fovDegrees.toFixed(1)}°</td>
            </tr>
            <tr>
                <td class="label"><i class="bi bi-cpu"></i> Сенсор:</td>
                <td class="value">${data.sensorType}</td>
            </tr>`;
    
    if (data.heightM > 0) {
        html += `
            <tr>
                <td class="label"><i class="bi bi-arrows-vertical"></i> Висота встановлення:</td>
                <td class="value">${data.heightM.toFixed(2)} м</td>
            </tr>`;
    }
    
    html += `
        </table>
        
        <div class="result-cctvheader" style="margin-top:15px;"><i class="bi bi-layers-half result-cctvicon"></i> <strong>DORI-зони (стандарт для оператора):</strong></div>
        <table class="result-cctvtable zebra-table">`;
    
    data.doriResults.forEach(item => {
        html += `
            <tr>
                <td class="label">${item.label}:</td>
                <td class="value"><strong>${item.distance.toFixed(1)} м</strong> <span class="result-width">(Ширина: ${item.width.toFixed(1)} м)</span></td>
            </tr>`;
    });
    
    html += `
        </table>
        
        <div class="result-cctvheader" style="margin-top:15px;"><i class="bi bi-person-bounding-box result-cctvicon"></i> <strong>Розпізнавання обличчя (функції ШІ):</strong></div>
        <table class="result-cctvtable zebra-table">`;
    
    data.faceResults.forEach(item => {
        html += `
            <tr>
                <td class="label">${item.label}:</td>
                <td class="value"><strong>${item.distance.toFixed(1)} м</strong></td>
            </tr>`;
    });
    
    html += `
        </table>
        
        <div class="result-cctvheader" style="margin-top:15px;"><i class="bi bi-stars result-cctvicon"></i> <strong>Спеціальні можливості:</strong></div>
        <table class="result-cctvtable zebra-table">`;
    
    data.otherResults.forEach(item => {
        html += `
            <tr>
                <td class="label">${item.label}:</td>
                <td class="value"><strong>${item.distance.toFixed(1)} м</strong></td>
            </tr>`;
    });
    
    html += `
        </table>`;
    
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
