// Дані щодо інсоляції по регіонам (кВт·год/м²/день)
const INSOLATION_DATA = {
    'kyiv': [1.07, 1.89, 2.94, 3.92, 5.19, 5.3, 5.16, 4.68, 3.21, 1.97, 1.10, 0.9],
    'vinn': [1.13, 1.96, 2.98, 4.05, 5.25, 5.32, 5.22, 4.66, 3.27, 2.07, 1.15, 0.94],
    'lutsk': [1.02, 1.77, 2.83, 3.91, 5.05, 5.18, 4.98, 4.47, 3.07, 1.87, 1.04, 0.83],
    'dnip': [1.21, 2.00, 2.98, 4.05, 5.55, 5.57, 5.6, 5.01, 3.66, 2.27, 1.2, 0.96],
    'done': [1.21, 1.99, 2.94, 4.04, 5.48, 5.55, 5.66, 5.09, 3.67, 2.24, 1.23, 0.96],
    'zhyto': [1.01, 1.82, 2.87, 3.88, 5.16, 5.19, 5.04, 4.66, 3.06, 1.87, 1.04, 0.83],
    'zapor': [1.21, 2.01, 2.98, 4.05, 5.6, 5.67, 5.71, 5.14, 3.71, 2.3, 1.25, 0.98],
    'ifra': [1.19, 1.93, 2.84, 3.68, 4.54, 4.75, 4.76, 4.4, 3.05, 2.00, 1.2, 0.94],
    'krop': [1.25, 1.98, 2.96, 4, 5.38, 5.46, 5.53, 5.03, 3.55, 2.25, 1.23, 1.02],
    'luhan': [1.23, 2.01, 3.05, 4.05, 5.46, 5.57, 5.65, 5.01, 3.62, 2.23, 1.26, 0.93],
    'lviv': [1.08, 1.83, 2.82, 3.78, 4.67, 4.83, 4.83, 4.45, 3.00, 1.85, 1.06, 0.83],
    'myko': [1.25, 2.1, 3.07, 4.38, 5.65, 5.85, 6.03, 5.34, 3.93, 2.52, 1.36, 1.04],
    'odes': [1.25, 2.11, 3.08, 4.38, 5.65, 5.85, 6.04, 5.33, 3.93, 2.52, 1.36, 1.04],
    'polt': [1.18, 1.96, 2.96, 3.96, 5.21, 5.3, 5.32, 4.72, 3.33, 2.13, 1.16, 0.9],
    'rivn': [1, 1.76, 2.84, 3.85, 5.08, 5.17, 4.98, 4.58, 3.02, 1.87, 1.04, 0.81],
    'sumy': [1.13, 1.87, 2.95, 3.96, 5.25, 5.38, 5.27, 4.64, 3.07, 1.91, 1.1, 0.86],
    'symf': [1.27, 2.06, 3.05, 4.3, 5.44, 5.82, 6.29, 5.55, 4.07, 2.56, 1.45, 1.07],
    'tern': [1.09, 1.86, 2.85, 3.85, 4.84, 5.04, 4.93, 4.51, 3.08, 1.91, 1.09, 0.85],
    'uzho': [1.1, 1.89, 2.94, 3.92, 4.8, 5.01, 5.01, 4.64, 3.28, 2.02, 1.13, 0.88],
    'khark': [1.19, 1.95, 2.96, 3.96, 5.25, 5.38, 5.37, 4.73, 3.27, 2.06, 1.17, 0.9],
    'kher': [1.3, 2.13, 3.08, 4.36, 5.68, 5.76, 6.00, 5.29, 4.00, 2.57, 1.36, 1.04],
    'kmel': [1.13, 1.91, 2.88, 3.85, 5.08, 5.21, 5.04, 4.71, 3.11, 1.98, 1.1, 0.9],
    'cher': [1.15, 1.91, 2.94, 3.99, 5.21, 5.3, 5.25, 4.67, 3.27, 2.07, 1.15, 0.93],
    'chrn': [1.09, 1.86, 2.85, 3.94, 5.19, 5.32, 5.25, 4.57, 3.13, 1.98, 1.1, 0.86],
    'chrv': [1.13, 1.95, 3.01, 4.14, 5.72, 5.76, 5.86, 5.14, 3.66, 2.24, 1.23, 0.95]
};

// Назви регіонів українською
const REGION_NAMES = {
    'kyiv': 'Київ',
    'vinn': 'Вінниця',
    'lutsk': 'Луцьк',
    'dnip': 'Дніпро',
    'done': 'Донецьк',
    'zhyto': 'Житомир',
    'zapor': 'Запоріжжя',
    'ifra': 'Івано-Франківськ',
    'krop': 'Кропивницький',
    'luhan': 'Луганськ',
    'lviv': 'Львів',
    'myko': 'Миколаїв',
    'odes': 'Одеса',
    'polt': 'Полтава',
    'rivn': 'Рівне',
    'sumy': 'Суми',
    'symf': 'Сімферополь',
    'tern': 'Тернопіль',
    'uzho': 'Ужгород',
    'khark': 'Харків',
    'kher': 'Херсон',
    'kmel': 'Хмельницький',
    'cher': 'Черкаси',
    'chrn': 'Чернігів',
    'chrv': 'Чернівці'
};

// Словник назв місяців українською
const MONTHS_UA = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

// Технічні коефіцієнти системи
const SYSTEM_EFFICIENCY = 0.8;      // ефективність системи (20% втрат)
const CHARGE_EFFICIENCY = 0.95;     // ефективність зарядки (5% втрат)
const SAFETY_MARGIN = 1.2;          // запас потужності (20%)

// Ініціалізація сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Заповнюємо список регіонів
    const regionSelect = document.getElementById('region');
    
    // Сортуємо регіони за назвою українською
    const sortedRegions = Object.entries(REGION_NAMES)
        .sort((a, b) => a[1].localeCompare(b[1], 'uk'));
    
    for (const [regionCode, regionName] of sortedRegions) {
        const option = document.createElement('option');
        option.value = regionCode;
        option.textContent = regionName;
        regionSelect.appendChild(option);
    }
    
    // Налаштування обробників подій
    document.getElementById('solarWizardForm').addEventListener('submit', calculateSolarSystem);
    document.getElementById('addDeviceBtn').addEventListener('click', addDeviceRow);
    
    // Налаштування початкового рядка пристроїв
    setupDeviceRowEvents(document.querySelector('.device-row'));
});

// Додавання нового рядка для пристрою
function addDeviceRow() {
    const devicesContainer = document.getElementById('devicesContainer');
    
    const deviceRow = document.createElement('div');
    deviceRow.className = 'device-row';
    
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.className = 'device-input device-count';
    quantityInput.min = '1';
    quantityInput.step = '1';
    quantityInput.value = '1';
    quantityInput.placeholder = 'К-сть';
    quantityInput.required = true;
    quantityInput.style.width = '80px';
    
    const wattageInput = document.createElement('input');
    wattageInput.type = 'number';
    wattageInput.className = 'device-input';
    wattageInput.min = '0.1';
    wattageInput.step = '0.1';
    wattageInput.value = '4';
    wattageInput.placeholder = 'Споживання (Вт)';
    wattageInput.required = true;
    wattageInput.style.flexGrow = '1';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.setAttribute('tabindex', '-1');
    removeBtn.setAttribute('aria-label', 'Видалити');
    removeBtn.innerHTML = '<i class="bi bi-x-circle"></i>';
    
    deviceRow.appendChild(quantityInput);
    deviceRow.appendChild(wattageInput);
    deviceRow.appendChild(removeBtn);
    
    devicesContainer.appendChild(deviceRow);
    
    setupDeviceRowEvents(deviceRow);
}

// Налаштування обробників подій для рядка пристрою
function setupDeviceRowEvents(deviceRow) {
    const removeBtn = deviceRow.querySelector('.remove-btn');
    removeBtn.addEventListener('click', function() {
        const deviceRows = document.querySelectorAll('.device-row');
        if (deviceRows.length > 1) {
            deviceRow.remove();
        } else {
            alert('Потрібен хоча б один пристрій');
        }
    });
}

// Основна функція розрахунку
function calculateSolarSystem(event) {
    event.preventDefault();
    
    try {
        // Отримання вхідних даних
        const region = document.getElementById('region').value;
        const maxDischargePercent = parseFloat(document.getElementById('batteryDischarge').value);
        const cloudyDays = parseInt(document.getElementById('cloudyDays').value);
        
        // Валідація даних
        if (maxDischargePercent <= 0 || maxDischargePercent > 100) {
            throw new Error('Рівень розряду АКБ має бути від 1 до 100%');
        }
        
        if (cloudyDays <= 0) {
            throw new Error('Кількість днів без сонця має бути більше 0');
        }
        
        // Збір даних про пристрої
        const deviceRows = document.querySelectorAll('.device-row');
        let totalPowerConsumption = 0;
        const devicesInfo = [];
        
        deviceRows.forEach(row => {
            const quantity = parseInt(row.querySelector('.device-count').value);
            const wattage = parseFloat(row.querySelector('.device-input:not(.device-count)').value);
            
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error('Кількість пристроїв має бути більше 0');
            }
            
            if (isNaN(wattage) || wattage <= 0) {
                throw new Error('Споживання пристрою має бути більше 0');
            }
            
            totalPowerConsumption += quantity * wattage;
            devicesInfo.push(`${quantity}×${wattage}W`);
        });
        
        // Розрахунок енергоспоживання та ємності АКБ
        const dailyConsumptionWh = totalPowerConsumption * 24;
        const batteryCapacityWh = (dailyConsumptionWh * cloudyDays) / (maxDischargePercent / 100);
        
        // Розрахунок інсоляції для різних сезонів
        const minInsolWinter = Math.min(...INSOLATION_DATA[region]);
        const minInsolSpring = Math.min(...INSOLATION_DATA[region].slice(2, 11));
        const minInsolSummer = Math.min(...INSOLATION_DATA[region].slice(5, 8));
        
        // Розрахунок потужності сонячних панелей
        const solarPanelsPowerWinter = ((dailyConsumptionWh * (1 + cloudyDays)) / 
                                      (minInsolWinter * SYSTEM_EFFICIENCY * CHARGE_EFFICIENCY)) * SAFETY_MARGIN;
        const solarPanelsPowerSpring = ((dailyConsumptionWh * (1 + cloudyDays)) / 
                                      (minInsolSpring * SYSTEM_EFFICIENCY * CHARGE_EFFICIENCY)) * SAFETY_MARGIN;
        const solarPanelsPowerSummer = ((dailyConsumptionWh * (1 + cloudyDays)) / 
                                      (minInsolSummer * SYSTEM_EFFICIENCY * CHARGE_EFFICIENCY)) * SAFETY_MARGIN;
        
        // Формування результату
        const resultContent = document.getElementById('resultContent');
        resultContent.innerHTML = `
            <div><i class="bi bi-sun-fill"></i> <strong>Сонячна автономна система ${REGION_NAMES[region]}</strong></div>
            
            <div style="margin-top:10px;"><i class="bi bi-lightning-fill"></i> <strong>Енергетичний аналіз:</strong></div>
            <div>- Пристрої: ${devicesInfo.join(' + ')}</div>
            <div>- Сумарне навантаження: <strong>${totalPowerConsumption.toFixed(1)} Вт</strong></div>
            <div>- Добова потреба: <strong>${dailyConsumptionWh.toFixed(1)} Вт·год</strong></div>
            
            <div class="result-section"><i class="bi bi-battery-charging"></i> <strong>Акумуляторний банк:</strong></div>
            <div>- Ємність: <strong>${batteryCapacityWh.toFixed(1)} Вт·год</strong></div>
            <div>- Автономія: ${cloudyDays} дні(-в) без сонця</div>
            <div>- Глибина розряду: ${maxDischargePercent}%</div>
            
            <div class="result-section"><i class="bi bi-brightness-high"></i> <strong>Сонячні панелі:</strong></div>
            
            <div class="result-section"><i class="bi bi-snow"></i> <strong>Зимовий режим</strong></div>
            <div>- Потужність: <strong>${Math.round(solarPanelsPowerWinter)} Вт</strong></div>
            <div>- Інсоляція: ${minInsolWinter} кВт·год/м²</div>
            
            <div class="result-section"><i class="bi bi-flower1"></i> <strong>Міжсезоння</strong></div>
            <div>- Потужність: <strong>${Math.round(solarPanelsPowerSpring)} Вт</strong></div>
            <div>- Інсоляція: ${minInsolSpring} кВт·год/м²</div>
            
            <div class="result-section"><i class="bi bi-brightness-alt-high"></i> <strong>Літній режим</strong></div>
            <div>- Потужність: <strong>${Math.round(solarPanelsPowerSummer)} Вт</strong></div>
            <div>- Інсоляція: ${minInsolSummer} кВт·год/м²</div>
            
            <div class="result-section"><i class="bi bi-info-circle"></i> <strong>Технічні примітки:</strong></div>
            <div>- Повне заряджання за 1 день</div>
            <div>- Враховано втрати: 20% (система) + 5% (зарядка)</div>
            <div>- Запас потужності: 20%</div>
            <div>- Дані інсоляції для регіону ${REGION_NAMES[region]}</div>
        `;
        
        // Показуємо результат
        document.getElementById('resultBox').style.display = 'block';
        
        // Прокручуємо до результату
        document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        alert(`Помилка: ${error.message}`);
    }
}
