// Карта роздільних здатностей мегапікселів до ширини в пікселях
const RESOLUTION_MAP = {
    12.0: 4000, 8.0: 3840, 6.0: 3072, 5.0: 2560, 4.0: 2688,
    3.6: 2560, 3.0: 2048, 2.0: 1920, 1.3: 1280, 1.0: 1280
};

// Порогові значення для DORI
const DORI_THRESHOLDS = {
    "🆔 Ідентифікація": 250, 
    "👤 Розпізнавання": 125,
    "👀 Огляд": 62, 
    "🔍 Детекція": 25
};

// Порогові значення для розпізнавання обличчя
const FACE_RECOGNITION_THRESHOLDS = {
    "👤 Базове виявлення обличчя": 50,
    "👥 Впізнавання": 100,
    "🔍 Високоточне розпізнавання": 145
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
    return ["⚠️ Не підтримується", 0];
}

// Ініціалізація сторінки після завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('megapixels');
    const form = document.getElementById('pixelWizardForm');
    const resultBox = document.getElementById('resultBox');
    const resultContent = document.getElementById('resultContent');
    
    // Елементи повзунків та текстових полів
    const fovSlider = document.getElementById('fovSlider');
    const fovInput = document.getElementById('fov');
    const distanceSlider = document.getElementById('distanceSlider');
    const distanceInput = document.getElementById('distance');
    const fovValue = document.getElementById('fovValue');
    const distanceValue = document.getElementById('distanceValue');
    
    // Додаємо доступ до контейнера та поля для кастомної роздільної здатності
    const customResolutionContainer = document.getElementById('customResolutionContainer');
    const customResolutionInput = document.getElementById('customResolution');
    
    // Функції для нелінійного перетворення відстані
    function percentToDistance(percent) {
        // Перетворення відсотків повзунка (0-100) в метри (1-2000)
        if (percent <= 25) {
            // 0-25% -> 1-30 метрів (лінійно)
            return 1 + (percent / 25) * 29;
        } else if (percent <= 50) {
            // 25-50% -> 30-100 метрів (лінійно)
            return 30 + ((percent - 25) / 25) * 70;
        } else {
            // 50-100% -> 100-2000 метрів (лінійно)
            return 100 + ((percent - 50) / 50) * 1900;
        }
    }
    
    function distanceToPercent(distance) {
        // Перетворення метрів (1-2000) у відсотки повзунка (0-100)
        if (distance <= 30) {
            // 1-30 метрів -> 0-25%
            return ((distance - 1) / 29) * 25;
        } else if (distance <= 100) {
            // 30-100 метрів -> 25-50%
            return 25 + ((distance - 30) / 70) * 25;
        } else {
            // 100-2000 метрів -> 50-100%
            return 50 + ((distance - 100) / 1900) * 50;
        }
    }
    
    // Синхронізація повзунка FOV із текстовим полем
    fovSlider.addEventListener('input', function() {
        fovInput.value = this.value;
    });
    
    fovInput.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (!isNaN(value) && value >= 1 && value <= 360) {
            fovSlider.value = Math.min(value, 180); // Обмежуємо повзунок до 180
        }
    });
    
    // Синхронізація повзунка відстані із текстовим полем (нелінійна шкала)
    distanceSlider.addEventListener('input', function() {
        const percent = parseFloat(this.value);
        const distance = percentToDistance(percent);
        distanceInput.value = distance.toFixed(1);
    });
    
    distanceInput.addEventListener('input', function() {
        const distance = parseFloat(this.value);
        if (!isNaN(distance) && distance >= 1 && distance <= 2000) {
            const percent = distanceToPercent(distance);
            distanceSlider.value = percent;
        }
    });
    
    // Заповнення випадаючого списку роздільних здатностей
    selectElement.innerHTML = '';
    
    // Додаємо опції для кожного значення MP
    sortedMpValues.forEach(mp => {
        const option = document.createElement('option');
        option.value = mp;
        option.textContent = `${mp} MP (${RESOLUTION_MAP[mp]} px)`;
        option.selected = mp === 4.0;
        selectElement.appendChild(option);
    });
    
    // Додаємо опцію для ручного введення роздільної здатності
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Ввести вручну';
    selectElement.appendChild(customOption);
    
    // Додаємо обробник події для відображення/приховування поля ручного введення
    selectElement.addEventListener('change', function() {
        if (this.value === 'custom') {
            customResolutionContainer.style.display = 'flex';
        } else {
            customResolutionContainer.style.display = 'none';
        }
    });
    
    // Додаємо обробник події для форми
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Отримати та валідувати вхідні дані
        const megapixelsValue = document.getElementById('megapixels').value;
        const fovDegrees = parseFloat(document.getElementById('fov').value);
        const distanceM = parseFloat(document.getElementById('distance').value);
        
        // Перевіряємо, чи вибрано кастомну роздільну здатність
        let width_px;
        let megapixels;
        
        if (megapixelsValue === 'custom') {
            width_px = parseInt(customResolutionInput.value);
            megapixels = 'custom';
            
            if (isNaN(width_px) || width_px <= 0) {
                alert("Роздільна здатність має бути більше 0");
                return;
            }
        } else {
            megapixels = parseFloat(megapixelsValue);
            width_px = RESOLUTION_MAP[megapixels];
            
            if (isNaN(megapixels) || megapixels <= 0) {
                alert("Роздільна здатність має бути більше 0");
                return;
            }
        }
        
        if (fovDegrees <= 0 || distanceM <= 0) {
            alert("Усі параметри мають бути більше 0");
            return;
        }
        
        // Основні розрахунки
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
            doriLevel, doriThreshold, faceRecognition, specialFeatures, width_px
        );
        
        resultBox.style.display = 'block';
        resultBox.scrollIntoView({ behavior: 'smooth' });
    });
});

// Виправлення: додамо параметр megapixels у функцію generateDiagramTopView
function generateDiagramTopView(distanceM, fovDegrees, pxPerM, megapixels, width_px) {
    // SVG розміри - змінюємо для адаптивності
    const svgWidth = 340; // Базова ширина для розрахунків
    const svgHeight = 250; // Базова висота для розрахунків
    const padding = 20;
    const cameraX = padding;
    const cameraY = (svgHeight / 2);

    // Масштаб: максимальна відстань (об'єкт або 1.2*distanceM для запасу)
    const maxDistance = Math.max(distanceM * 1.1, 1.2 * distanceM);
    const scale = (svgWidth - 2 * padding) / maxDistance;

    // Об'єкт
    const objectX = cameraX + distanceM * scale;
    const objectY = cameraY;
    const objectW = 16;
    const objectH = 24;

    // Кут огляду
    const fovRad = (fovDegrees / 2) * (Math.PI / 180);
    const fovLineLen = (svgWidth - 2 * padding);

    // DORI зони (радіуси в метрах)
    const doriZones = [
        { name: "🆔 Ідентифікація", color: "#ff6600", fill: "rgba(236, 122, 122, 0.95)", px: DORI_THRESHOLDS["🆔 Ідентифікація"] },
        { name: "👤 Розпізнавання", color: "#cc3399", fill: "rgba(233, 229, 8, 0.85)", px: DORI_THRESHOLDS["👤 Розпізнавання"] },
        { name: "👀 Огляд", color: "#33cc33", fill: "rgba(15, 184, 15, 0.61)", px: DORI_THRESHOLDS["👀 Огляд"] },
        { name: "🔍 Детекція", color: "#3399ff", fill: "rgba(126, 196, 147, 0.5)", px: DORI_THRESHOLDS["🔍 Детекція"] }
    ];

    // Функція для малювання сектора
    function sectorPath(cx, cy, r, angle) {
        const startAngle = -angle;
        const endAngle = angle;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = angle > Math.PI / 2 ? 1 : 0;
        return [
            `M ${cx} ${cy}`,
            `L ${x1} ${y1}`,
            `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');
    }

    // Малюємо зони DORI (від більшої до меншої)
    let doriSectors = '';
    
    // Отримуємо ширину в пікселях
    const actual_width_px = megapixels === 'custom' ? width_px : RESOLUTION_MAP[megapixels];
    
    for (let i = doriZones.length - 1; i >= 0; i--) {
        const zone = doriZones[i];
        
        try {
            // Обчислюємо максимальну відстань для зони і перевіряємо наявність помилок
            const maxRange = (actual_width_px / zone.px) / (2 * Math.tan(fovRad));
            
            const zoneDist = maxRange;
            const r = zoneDist * scale;
            
            doriSectors += `<path d="${sectorPath(cameraX, cameraY, r, fovRad)}" 
                          fill="${zone.fill}" stroke="${zone.color}" 
                          stroke-width="1.5" stroke-opacity="0.9"/>`;
        } catch (e) {
            console.error(`Помилка при побудові зони ${zone.name}:`, e);
        }
    }

    // Лінії кута огляду
    const fovX = cameraX + fovLineLen;
    const fovY1 = cameraY - Math.tan(fovRad) * fovLineLen;
    const fovY2 = cameraY + Math.tan(fovRad) * fovLineLen;

    // Визначаємо, в якій зоні знаходиться об'єкт
    let objectZone = "Поза зонами";
    for (const zone of doriZones) {
        if (pxPerM >= zone.px) {
            objectZone = zone.name;
            break;
        }
    }

    // Генеруємо шкалу в метрах
    let scaleMarks = '';
    // Виправлено: змінено відстань шкали від центру для кращого центрування
    const scaleY = cameraY + 90; // Змінено з +60 на +50
    const scaleStart = cameraX;
    const scaleEnd = cameraX + maxDistance * scale;
    const majorStep = Math.ceil(maxDistance / 5); // Крок для великих поділок (кратний 5)
    
    // Основна лінія шкали
    scaleMarks += `<line x1="${scaleStart}" y1="${scaleY}" x2="${scaleEnd}" y2="${scaleY}" stroke="#666" stroke-width="1"/>`;
    
    // Мітки та підписи шкали
    for (let i = 0; i <= maxDistance; i += majorStep) {
        const x = scaleStart + i * scale;
        if (x <= scaleEnd) {
            scaleMarks += `<line x1="${x}" y1="${scaleY-5}" x2="${x}" y2="${scaleY+5}" stroke="#666" stroke-width="1"/>`;
            scaleMarks += `<text x="${x}" y="${scaleY+18}" font-size="10" text-anchor="middle" fill="#666">${i} м</text>`;
        }
    }

    // Розрахунок ширини зони огляду на відстані об'єкта
    const widthAtObjectDistance = 2 * distanceM * Math.tan(fovRad);
    const halfWidth = widthAtObjectDistance / 2 * scale;

    return `
<svg width="100%" height="auto" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="background:#f5f9ff; border-radius:8px; max-width:100%;">
    <!-- DORI зони -->
    ${doriSectors}
    <!-- Кут огляду -->
    <line x1="${cameraX}" y1="${cameraY}" x2="${fovX}" y2="${fovY1}" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3,2"/>
    <line x1="${cameraX}" y1="${cameraY}" x2="${fovX}" y2="${fovY2}" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3,2"/>
    <!-- Відрізок до об'єкта -->
    <line x1="${cameraX}" y1="${cameraY}" x2="${objectX}" y2="${objectY}" stroke="#888" stroke-width="1.5" stroke-dasharray="4,3"/>
    
    <!-- Вертикальна лінія ширини зони огляду -->
    <line x1="${objectX}" y1="${cameraY - halfWidth}" x2="${objectX}" y2="${cameraY + halfWidth}" 
          stroke="#666" stroke-width="1" stroke-dasharray="5,3"/>
    <text x="${objectX-45}" y="${objectY-20}" 
          font-size="10" text-anchor="start" fill="#666" transform="rotate(90, ${objectX + 7}, ${objectY})">
          Ширина FOV ${widthAtObjectDistance.toFixed(2)} м
    </text>
    
    <!-- Камера -->
    <rect x="${cameraX-16}" y="${cameraY-5}" width="20" height="10" rx="3" fill="#3b82f6" />
    <circle cx="${cameraX+4}" cy="${cameraY}" r="3" fill="#fff"/>
    <!-- Об'єкт -->
    <rect x="${objectX-objectW/2}" y="${objectY-objectH/2}" width="${objectW}" height="${objectH}" rx="2" fill="#ff6b6b" stroke="#c00" stroke-width="1"/>
    <text x="${((objectX-cameraX)/2)+53}" y="${objectY+objectH/2}" font-size="11" text-anchor="middle" fill="#444">Відстань ${distanceM} м</text>
    <text x="${objectX}" y="${objectY-objectH/2-6}" font-size="11" text-anchor="middle" fill="#444">Об'єкт</text>
    <!-- Шкала в метрах -->
    ${scaleMarks}
    <!-- Текст FOV -->
    <text x="${cameraX-16}" y="${cameraY-12}" font-size="14" fill="#00267f">FOV ${fovDegrees}°</text>
    <!-- Підпис зони об'єкта -->
    <text x="${objectX-15}" y="${objectY+objectH/2+13}" font-size="11" text-anchor="middle" fill="#00267f">${objectZone}</text>
</svg>
    `;
}

function generateResultHTML(megapixels, fovDegrees, distanceM, widthM, pxPerM, 
                          doriLevel, doriThreshold, faceRecognition, specialFeatures, width_px) {
    // Перевірка на null значення
    doriLevel = doriLevel || "⚠️ Не підтримується";
    faceRecognition = faceRecognition || "⚠️ Не підтримується";
    
    let featuresHTML = '';
    if (specialFeatures.length > 0) {
        featuresHTML = `<ul class="camera-list">
            ${specialFeatures.map(feature => `<li>${feature}</li>`).join('')}
        </ul>`;
    } else {
        featuresHTML = '⚠️ Недостатня щільність для спецможливостей';
    }
    
    // Генеруємо схему зон
    // Передаємо width_px як п'ятий аргумент для користувацької роздільної здатності
    const diagram = generateDiagramTopView(distanceM, fovDegrees, pxPerM, megapixels, width_px);
    
    // Формуємо відображення роздільної здатності
    let resolutionDisplay;
    if (megapixels === 'custom') {
        resolutionDisplay = `Власна (${width_px} px)`;
    } else {
        resolutionDisplay = `${megapixels} MP (${RESOLUTION_MAP[megapixels]} px)`;
    }
    
    let html = `
    <div class="result-cctvheader"><i class="bi bi-bar-chart-fill result-cctvicon"></i> <strong>Результати аналізу піксельної щільності:</strong></div>
    <table class="result-cctvtable zebra-table">
        <tr>
            <td class="label"><i class="bi bi-camera"></i> Роздільна здатність:</td>
            <td class="value">${resolutionDisplay}</td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-aspect-ratio"></i> Кут огляду (FOV):</td>
            <td class="value">${fovDegrees}°</td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-rulers"></i> Відстань до об'єкта:</td>
            <td class="value">${distanceM} м</td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-box"></i>Ширина зони огляду:</td>
            <td class="value"><strong>${widthM.toFixed(1)} м</strong></td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-grid-3x3"></i> Піксельна щільність:</td>
            <td class="value"><strong>${pxPerM.toFixed(1)} px/м</strong></td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-shield-check"></i> Стандарт DORI:</td>
            <td class="value"><strong>${doriLevel} (${doriThreshold}+ px/м)</strong></td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-person-bounding-box"></i> Розпізнавання обличчя ШІ:</td>
            <td class="value">
                <strong>
                    ${faceRecognition}
                </strong>
            </td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-stars"></i> Спеціальні можливості:</td>
            <td class="value">
                <strong>
                ${featuresHTML}
                </strong>
            </td>
        </tr>
    </table>
    
    <div style="margin-top:15px; width:100%;">
        <div style="margin-bottom:10px;"><i class="bi bi-camera-video"></i> <strong>Схема зони покриття (вигляд зверху):</strong></div>
        ${diagram}
    </div>
    `;
    
    return html;
}
