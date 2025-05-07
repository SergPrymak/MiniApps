// Константи та дані
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

const DORI_THRESHOLDS = {
    "DORI: Виявлення людини (Detection)": 25,
    "DORI: Розрізнення деталей одягу (Observation)": 62,
    "DORI: Впізнання знайомого (Recognition)": 125,
    "DORI: Чітка ідентифікація людини (Identification)": 250
};

// Додаємо спеціальні значення щільності пікселів
const SPECIAL_PIXEL_DENSITY = {
    "Face AI: Базове розпізнавання": 50,
    "Face AI: Розширене розпізнавання": 100,
    "Face AI: Детальне розпізнавання": 125,
    "Номери автомобілів": 150,
    "Номери автомобілів нечіткі": 90,
    "Розпізнавання купюр": 300
};

// Функції розрахунку

// Отримання ширини в пікселях для заданої роздільної здатності
function getWidthInPixels(mp) {
    return RESOLUTION_MAP[mp];
}

// Розрахунок фокусної відстані
function calculateFocalLength(megapixels, pixelDensity, distance, sensorWidth) {
    const widthPx = getWidthInPixels(megapixels);
    return (distance * pixelDensity * sensorWidth) / widthPx;
}

// Розрахунок кута огляду
function calculateFov(focalLength, sensorWidth) {
    return Math.degrees(2 * Math.atan(sensorWidth / (2 * focalLength)));
}

// Визначення типу камери за фокусною відстанню
function classifyCameraType(focalLength) {
    if (focalLength <= 12) {
        return "📹 Варіофокальна камера (стандартна)";
    } else if (focalLength <= 50) {
        return "🔭 Варіофокальна камера (long-range)";
    } else {
        return "🔄 PTZ SpeedDome камера";
    }
}

// Розрахунок ширини зони огляду
function calculateFovWidth(distance, focalLength, sensorWidth) {
    return distance * sensorWidth / focalLength;
}

// Оцінка практичності рішення за кутом огляду
function practicalScore(fov) {
    if (20 <= fov && fov <= 90) {
        return Math.abs(55 - fov);  // 55° як ідеальний середній кут
    } else {
        return 1000 + Math.abs(55 - fov);  // Менш практичні варіанти
    }
}

// Доповнення Math об'єкта функцією перетворення радіан у градуси
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

// Функція оновлення відображення полів для власного значення щільності
function toggleCustomDensity() {
    const densitySelect = document.getElementById('pixelDensity');
    const customContainer = document.getElementById('customDensityContainer');
    
    if (densitySelect.value === 'custom') {
        customContainer.style.display = 'block';
    } else {
        customContainer.style.display = 'none';
    }
}

// Функція обробки форми
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Отримання значень з форми
    const megapixels = document.getElementById('megapixels').value;
    let pixelDensity;
    if (document.getElementById('pixelDensity').value === 'custom') {
        pixelDensity = parseFloat(document.getElementById('customDensity').value);
    } else {
        pixelDensity = parseFloat(document.getElementById('pixelDensity').value);
    }
    const distance = parseFloat(document.getElementById('distance').value);
    const sensorType = document.getElementById('sensor').value;
    const sensorWidth = SENSOR_SIZES[sensorType];
    
    // Валідація
    if (pixelDensity <= 0 || distance <= 0) {
        alert("Щільність пікселів та відстань повинні бути більше 0");
        return;
    }
    
    // Визначення DORI рівня
    let doriLevel = "⚠️ Нижче мінімального DETECT";
    for (const [level, threshold] of Object.entries(DORI_THRESHOLDS).sort((a, b) => a[1] - b[1])) {
        if (pixelDensity >= threshold) {
            doriLevel = level;
        }
    }
    
    // Розрахунок фокусної відстані
    const focalLength = calculateFocalLength(megapixels, pixelDensity, distance, sensorWidth);
    const fovDegrees = Math.degrees(2 * Math.atan(sensorWidth / (2 * focalLength)));
    const fovWidth = calculateFovWidth(distance, focalLength, sensorWidth);
    const cameraType = classifyCameraType(focalLength);
    
    // Перевірка практичності рішення
    const isPractical = (20 <= fovDegrees && fovDegrees <= 90);
    const isRealistic = (10 <= fovDegrees && fovDegrees <= 120);
    
    // Формування результату
    let resultHTML = `
        <div><i class="bi bi-binoculars-fill"></i> <strong>Результати розрахунку:</strong></div>
        
        <div style="margin-top:10px;"><i class="bi bi-sliders"></i> <strong>Вхідні параметри:</strong></div>
        <div>- Роздільна здатність: ${megapixels} MP (${RESOLUTION_MAP[megapixels]})</div>
        <div>- Щільність пікселів: ${pixelDensity} px/m</div>
        <div>- Рівень деталізації: ${doriLevel}</div>
        <div>- Відстань до цілі: ${distance} м</div>
        <div>- Розмір матриці: ${sensorType} (${sensorWidth} мм)</div>
        
        <div class="result-section"><i class="bi bi-camera-fill"></i> <strong>Розрахункові параметри:</strong></div>
        <div>- Необхідна фокусна відстань: <strong>${focalLength.toFixed(1)} мм</strong></div>
        <div>- Кут огляду (FOV): <strong>${fovDegrees.toFixed(1)}°</strong></div>
        <div>- Ширина зони на відстані ${distance} м: <strong>${fovWidth.toFixed(1)} м</strong></div>
        <div>- Рекомендований тип камери: <strong>${cameraType}</strong></div>
    `;
    
    // Додаємо оцінку рішення
    if (!isRealistic) {
        resultHTML += `
            <div class="result-section"><i class="bi bi-exclamation-triangle"></i> <strong>Увага!</strong></div>
            <div>Розрахована конфігурація не є реалістичною (кут огляду: ${fovDegrees.toFixed(1)}°).</div>
            <div>- Занадто висока щільність для вказаної відстані</div>
            <div>- Занадто низька роздільна здатність</div>
            <div>- Спробуйте зменшити відстань або знизити вимоги до щільності</div>
        `;
    } else if (!isPractical) {
        resultHTML += `
            <div class="result-section"><i class="bi bi-exclamation-triangle"></i> <strong>Увага!</strong></div>
            <div>Розрахована конфігурація можлива, але не оптимальна (кут огляду: ${fovDegrees.toFixed(1)}°).</div>
            <div>Оптимальний діапазон кутів огляду: 20-90°.</div>
        `;
    } else {
        resultHTML += `
            <div class="result-section"><i class="bi bi-check-circle"></i> <strong>Оптимальне рішення</strong></div>
            <div>Розрахована конфігурація є практичною та реалістичною.</div>
        `;
    }
    
    // Додаємо рекомендації
    if (focalLength > 50) {
        resultHTML += `
            <div class="result-section"><i class="bi bi-lightbulb"></i> <strong>Рекомендація</strong></div>
            <div>Для такої відстані і деталізації краще використовувати PTZ SpeedDome камеру з автоматичним фокусуванням та масштабуванням.</div>
        `;
    } else if (focalLength > 13.5) {
        resultHTML += `
            <div class="result-section"><i class="bi bi-lightbulb"></i> <strong>Рекомендація</strong></div>
            <div>Рекомендується варіофокальна камера з розширеним діапазоном фокусних відстаней (наприклад, 5-50 мм).</div>
        `;
    }
    
    // Відображення результату
    const resultBox = document.getElementById('resultBox');
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = resultHTML;
    resultBox.style.display = 'block';
    
    // Прокручування до результатів
    resultBox.scrollIntoView({ behavior: 'smooth' });
}

// Налаштування обробників подій після завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
    // Наповнення select#megapixels із RESOLUTION_MAP
    const mpSelect = document.getElementById('megapixels');
    Object.keys(RESOLUTION_MAP).forEach((mp) => {
        const opt = document.createElement('option');
        opt.value = mp;
        opt.textContent = `${mp} MP (${RESOLUTION_MAP[mp]})`;
        if (mp === "4") opt.selected = true;
        mpSelect.appendChild(opt);
    });
    
    // Наповнення select#pixelDensity із DORI_THRESHOLDS та SPECIAL_PIXEL_DENSITY
    const densitySelect = document.getElementById('pixelDensity');
    
    // Спочатку додаємо DORI значення
    Object.entries(DORI_THRESHOLDS).forEach(([label, value]) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = `${value} px/m (${label})`;
        if (value === 250) opt.selected = true; // DORI Identification як значення за замовчуванням
        densitySelect.appendChild(opt);
    });
    
    // Додаємо спеціальні значення
    Object.entries(SPECIAL_PIXEL_DENSITY).forEach(([label, value]) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = `${value} px/m (${label})`;
        densitySelect.appendChild(opt);
    });
    
    // Додаємо опцію "Інше значення..." в кінці
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = 'Інше значення...';
    densitySelect.appendChild(customOpt);
    
    // Наповнення select#sensor із SENSOR_SIZES
    const sensorSelect = document.getElementById('sensor');
    // Очищаємо наявні опції
    sensorSelect.innerHTML = '';
    
    // Додаємо опції з словника
    Object.keys(SENSOR_SIZES).forEach((sensorType) => {
        const opt = document.createElement('option');
        opt.value = sensorType;
        let displayText = `${sensorType}"`;
        
        // Додаємо додаткову інформацію для типових розмірів
        if (sensorType === "1/2.7") {
            displayText += " (типовий)";
            opt.selected = true; // Встановлюємо за замовчуванням
        }
        
        opt.textContent = displayText;
        sensorSelect.appendChild(opt);
    });
    
    // Обробник для показу/приховання поля вводу власного значення щільності
    document.getElementById('pixelDensity').addEventListener('change', toggleCustomDensity);
    
    // Обробник відправки форми
    document.getElementById('zoomWizardForm').addEventListener('submit', handleFormSubmit);
});
