// Карта роздільних здатностей мегапікселів до ширини в пікселях
const RESOLUTION_MAP = {
    12.0: 4000, 8.0: 3840, 6.0: 3072, 5.0: 2560, 4.0: 2688,
    3.6: 2560, 3.0: 2048, 2.0: 1920, 1.3: 1280, 1.0: 1280
};

// Порогові значення для DORI
const DORI_THRESHOLDS = {
    "🆔 Ідентифікація (чітко іден. особу)": 250, 
    "👤 Розпізнавання (впізнати знайому особу)": 125,
    "👀 Огляд (деталі особи/одяг)": 62, 
    "🔍 Детекція (виявити рух/наявність людини)": 25
};

// Порогові значення для розпізнавання обличчя
const FACE_RECOGNITION_THRESHOLDS = {
    "👤 Базове виявлення обличчя (мінімум для виявлення)": 50,
    "👥 Впізнавання (пошук в БД)": 100,
    "🔍 Високоточне розпізнавання (погане освітлення, рух)": 145
};

// Інші спеціальні можливості
const OTHER_DETECTION_FEATURES = {
    "💵 Розпізнавання купюр": 300,
    "🚗 Читання номерів авто": 150,
    "🚙 Часткове читання номерів": 90
};

// Кешуємо відсортовані пороги для кращої продуктивності
const sortedDoriThresholds = Object.entries(DORI_THRESHOLDS)
    .sort((a, b) => b[1] - a[1]);
const sortedFaceThresholds = Object.entries(FACE_RECOGNITION_THRESHOLDS)
    .sort((a, b) => b[1] - a[1]);
const sortedMpValues = Object.keys(RESOLUTION_MAP).map(Number).sort((a, b) => b - a);

// Функція для пошуку відповідного рівня за порогом
function findMatchingLevel(thresholds, pxPerM) {
    for (const [level, threshold] of thresholds) {
        if (pxPerM >= threshold) return [level, threshold];
    }
    return [null, 0];
}

// Ініціалізація сторінки після завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('megapixels');
    const form = document.getElementById('pixelWizardForm');
    const resultBox = document.getElementById('resultBox');
    const resultContent = document.getElementById('resultContent');
    
    // Заповнення випадаючого списку роздільних здатностей
    selectElement.innerHTML = '';
    
    // Додаємо опції для кожного значення MP
    sortedMpValues.forEach(mp => {
        const option = document.createElement('option');
        option.value = mp;
        option.textContent = `${mp} MP (${RESOLUTION_MAP[mp]} px)`;
        option.selected = mp === 2.0;
        selectElement.appendChild(option);
    });
    
    // Додаємо обробник події для форми
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Отримати та валідувати вхідні дані
        const megapixels = parseFloat(document.getElementById('megapixels').value);
        const fovDegrees = parseFloat(document.getElementById('fov').value);
        const distanceM = parseFloat(document.getElementById('distance').value);
        
        if (megapixels <= 0 || fovDegrees <= 0 || distanceM <= 0) {
            alert("Усі параметри мають бути більше 0");
            return;
        }
        
        // Основні розрахунки
        const width_px = RESOLUTION_MAP[megapixels];
        const widthM = 2 * distanceM * Math.tan((fovDegrees / 2) * (Math.PI / 180));
        const pxPerM = width_px / widthM;
        
        // Визначення рівня DORI і можливостей розпізнавання
        const [doriLevel, doriThreshold] = findMatchingLevel(sortedDoriThresholds, pxPerM) || 
            ["⚠️ Нижче мінімального DETECT", 0];
        
        const [faceRecognition] = findMatchingLevel(sortedFaceThresholds, pxPerM) || 
            ["⚠️ Недостатньо для розпізнавання облич"];
        
        // Аналіз спеціальних можливостей
        const specialFeatures = [];
        let hasFullPlate = false;

        // Збираємо всі доступні спеціальні можливості
        for (const [feature, threshold] of Object.entries(OTHER_DETECTION_FEATURES)) {
            if (pxPerM >= threshold) {
                if (feature === "🚗 Читання номерів авто") hasFullPlate = true;
                specialFeatures.push(feature);
            }
        }

        // Якщо є "читання номерів авто", виключаємо "часткове читання"
        if (hasFullPlate) {
            const partialReadIndex = specialFeatures.indexOf("🚙 Часткове читання номерів");
            if (partialReadIndex !== -1) specialFeatures.splice(partialReadIndex, 1);
        }
        
        // Формування результату
        resultContent.innerHTML = generateResultHTML(
            megapixels, fovDegrees, distanceM, widthM, pxPerM,
            doriLevel, doriThreshold, faceRecognition, specialFeatures
        );
        
        resultBox.style.display = 'block';
        resultBox.scrollIntoView({ behavior: 'smooth' });
    });
});

// Винесена функція для генерації HTML результату
function generateResultHTML(megapixels, fovDegrees, distanceM, widthM, pxPerM, 
                          doriLevel, doriThreshold, faceRecognition, specialFeatures) {
    let html = `
        <div><i class="bi bi-graph-up"></i> <strong>Результати аналізу піксельної щільності:</strong></div>
        
        <div style="margin-top:10px;"><i class="bi bi-sliders"></i> <strong>Вхідні параметри:</strong></div>
        <div>- Роздільна здатність: ${megapixels} MP</div>
        <div>- Кут огляду: ${fovDegrees}°</div>
        <div>- Відстань до об'єкта: ${distanceM} м</div>
        <div>- Ширина зони: ${widthM.toFixed(1)} м</div>
        
        <div class="result-section"><i class="bi bi-rulers"></i> <strong>Розрахункові значення:</strong></div>
        <div>- Піксельна щільність: <strong>${pxPerM.toFixed(1)} px/м</strong></div>
        
        <div class="result-section"><i class="bi bi-shield-check"></i> <strong>Стандарт DORI:</strong></div>
        <div>- ${doriLevel} (${doriThreshold}+ px/м)</div>
        
        <div class="result-section"><i class="bi bi-person-bounding-box"></i> <strong>Можливості ШІ (розпізнавання обличчя):</strong></div>
        <div>- ${faceRecognition}</div>
        
        <div class="result-section"><i class="bi bi-stars"></i> <strong>Спеціальні можливості:</strong></div>
    `;
    
    if (specialFeatures.length > 0) {
        specialFeatures.forEach(feature => {
            html += `<div>- ${feature}</div>`;
        });
    } else {
        html += '<div>- ⚠️ Недостатня щільність для спецможливостей</div>';
    }
    
    return html;
}
