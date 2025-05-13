// Constants for sensor sizes (diagonal in mm)
const SENSOR_SIZES = {
    "1/4": 4.5, 
    "1/3.6": 5, 
    "1/3.2": 5.6, 
    "1/3": 6,
    "1/2.9": 6.25, 
    "1/2.8": 6.46, 
    "1/2.7": 6.7, 
    "1/2.5": 7.2,
    "1/2": 8, 
    "1/2.3": 7.8, 
    "1/1.8": 8.9, 
    "1/1.7": 9.4, 
    "1/1.2": 10.2,
};

// Пропорції матриць для різних роздільних здатностей
const ASPECT_RATIOS = {
    "1.3": "4:3",
    "3": "4:3",
    "5": "4:3",
    "12": "4:3",
    "default": "16:9"
};

// Функція для розрахунку ширини та висоти матриці на основі діагоналі та пропорцій
function calculateSensorDimensions(diagonal, aspectRatio) {
    let width, height;
    
    if (aspectRatio === "4:3") {
        width = diagonal * 0.8;  // 4/5
        height = diagonal * 0.6; // 3/5
    } else { // 16:9
        width = diagonal * 0.8716; // 16/√(337)
        height = diagonal * 0.4903; // 9/√(337)
    }
    
    return { width, height };
}

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
    
    // Ініціалізація повзунка фокусної відстані
    const focalLengthSlider = document.getElementById('focalLengthSlider');
    const focalLengthInput = document.getElementById('focalLength');
    
    // Функції для нелінійного перетворення фокусної відстані
    function percentToFocalLength(percent) {
        // Перетворення відсотків повзунка (0-100) в міліметри (2.7-335)
        if (percent <= 20) {
            // 0-20% -> 2.7-6 мм (ширококутні)
            return 2.7 + (percent / 20) * 3.3;
        } else if (percent <= 40) {
            // 20-40% -> 6-12 мм (середні)
            return 6 + ((percent - 20) / 20) * 6;
        } else if (percent <= 70) {
            // 40-70% -> 12-50 мм (телеоб'єктиви)
            return 12 + ((percent - 40) / 30) * 38;
        } else {
            // 70-100% -> 50-335 мм (супертелеоб'єктиви)
            return 50 + ((percent - 70) / 30) * 285;
        }
    }
    
    function focalLengthToPercent(focalLength) {
        // Перетворення міліметрів (2.7-335) у відсотки повзунка (0-100)
        if (focalLength <= 6) {
            // 2.7-6 мм -> 0-20%
            return ((focalLength - 2.7) / 3.3) * 20;
        } else if (focalLength <= 12) {
            // 6-12 мм -> 20-40%
            return 20 + ((focalLength - 6) / 6) * 20;
        } else if (focalLength <= 50) {
            // 12-50 мм -> 40-70%
            return 40 + ((focalLength - 12) / 38) * 30;
        } else {
            // 50-335 мм -> 70-100%
            return 70 + ((focalLength - 50) / 285) * 30;
        }
    }
    
    // Синхронізація повзунка фокусної відстані з текстовим полем
    focalLengthSlider.addEventListener('input', function() {
        const percent = parseFloat(this.value);
        const focalLength = percentToFocalLength(percent);
        focalLengthInput.value = focalLength.toFixed(1);
    });
    
    focalLengthInput.addEventListener('input', function() {
        const focalLength = parseFloat(this.value);
        if (!isNaN(focalLength) && focalLength >= 0.1 && focalLength <= 100) {
            const percent = focalLengthToPercent(focalLength);
            focalLengthSlider.value = percent;
        }
    });
    
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
        
        // Визначаємо пропорції матриці на основі роздільної здатності
        const aspectRatio = ASPECT_RATIOS[megapixels.toString()] || ASPECT_RATIOS["default"];
        
        // Отримуємо діагональ сенсора
        const sensorDiagonal = SENSOR_SIZES[sensorType];
        
        // Розраховуємо ширину та висоту сенсора
        const { width: sensorWidthMm } = calculateSensorDimensions(sensorDiagonal, aspectRatio);
        
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
                <td class="label"><i class="bi bi-camera" style="width: 150px"></i> Роздільна здатність:</td>
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
