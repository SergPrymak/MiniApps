// Імпорт констант з config.js
import { RESOLUTION_MAP, DORI_THRESHOLDS, FACE_RECOGNITION_THRESHOLDS, OTHER_DETECTION_FEATURES } from './config.js';

// Ініціалізація сторінки після завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, RESOLUTION_MAP:', RESOLUTION_MAP);
    
    // Діагностика: перевірка наявності select#megapixels у DOM
    const selectElement = document.getElementById('megapixels');
    if (!selectElement) {
        console.error('Елемент з ID "megapixels" не знайдено у DOM!');
        console.log('HTML DOM:', document.body.innerHTML);
        return;
    }
    
    // Очистимо попередні значення
    selectElement.innerHTML = '';
    
    // Діагностика: перевірка RESOLUTION_MAP
    if (!RESOLUTION_MAP || typeof RESOLUTION_MAP !== 'object') {
        console.error('RESOLUTION_MAP не визначено або не є об\'єктом:', RESOLUTION_MAP);
        return;
    }
    
    // Отримуємо список ключів (MP) та сортуємо їх за числовим значенням (спадання)
    const mpValues = Object.keys(RESOLUTION_MAP)
        .map(mp => parseFloat(mp))
        .sort((a, b) => b - a);
    console.log('MP values:', mpValues);

    // Додаємо опції для кожного значення MP
    let added = 0;
    mpValues.forEach(mp => {
        const px = RESOLUTION_MAP[String(mp)];
        if (!px) {
            console.warn('RESOLUTION_MAP не містить:', mp);
            return;
        }
        const option = document.createElement('option');
        option.value = mp;
        option.textContent = `${mp} MP (${px} px)`;
        if (mp === 2.0) {
            option.selected = true;
        }
        selectElement.appendChild(option);
        added++;
    });
    if (added === 0) {
        console.error('Жодної опції не додано до select#megapixels!');
    }
    
    // Додаємо обробник події для форми
    const formElement = document.getElementById('pixelWizardForm');
    if (!formElement) {
        console.error('Елемент з ID "pixelWizardForm" не знайдено у DOM!');
        return;
    }
    formElement.addEventListener('submit', function(e) {
        e.preventDefault();
        calculatePixelDensity();
    });
});

function calculatePixelDensity() {
    // Отримати вхідні дані
    const megapixels = parseFloat(document.getElementById('megapixels').value);
    const fovDegrees = parseFloat(document.getElementById('fov').value);
    const distanceM = parseFloat(document.getElementById('distance').value);
    
    // Валідація вхідних даних
    if (megapixels <= 0 || fovDegrees <= 0 || distanceM <= 0) {
        alert("Усі параметри мають бути більше 0");
        return;
    }
    
    // Отримуємо ширину в пікселях
    const width_px = RESOLUTION_MAP[String(megapixels)];
    
    // Основні розрахунки
    const widthM = 2 * distanceM * Math.tan((fovDegrees / 2) * (Math.PI / 180));
    const pxPerM = width_px / widthM;
    
    // Визначення рівня DORI
    let doriLevel = "⚠️ Нижче мінімального DETECT";
    let doriThreshold = 0;
    
    // Сортуємо пороги DORI за спаданням
    const sortedDoriThresholds = Object.entries(DORI_THRESHOLDS)
        .sort((a, b) => b[1] - a[1]);
    
    // Знаходимо перший поріг, який менший або рівний pxPerM
    for (const [level, threshold] of sortedDoriThresholds) {
        if (pxPerM >= threshold) {
            doriLevel = level;
            doriThreshold = threshold;
            break;
        }
    }
    
    // Аналіз можливостей розпізнавання обличчя (ШІ)
    let faceRecognition = "⚠️ Недостатньо для розпізнавання облич";
    
    // Сортуємо пороги розпізнавання обличчя за спаданням
    const sortedFaceThresholds = Object.entries(FACE_RECOGNITION_THRESHOLDS)
        .sort((a, b) => b[1] - a[1]);
    
    // Знаходимо перший поріг, який менший або рівний pxPerM
    for (const [feature, threshold] of sortedFaceThresholds) {
        if (pxPerM >= threshold) {
            faceRecognition = feature;
            break;
        }
    }
    
    // Аналіз інших спеціальних можливостей
    const specialFeatures = [];
    
    for (const [feature, threshold] of Object.entries(OTHER_DETECTION_FEATURES)) {
        if (pxPerM >= threshold) {
            specialFeatures.push(feature);
        }
    }
    
    // Формування результату
    let resultHTML = `
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
            resultHTML += `<div>- ${feature}</div>`;
        });
    } else {
        resultHTML += '<div>- ⚠️ Недостатня щільність для спецможливостей</div>';
    }
    
    // Відображення результату
    document.getElementById('resultContent').innerHTML = resultHTML;
    document.getElementById('resultBox').style.display = 'block';
    
    // Прокрутка до результату
    document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth' });
}
