// Константи
const SYSTEM_EFFICIENCY = 0.75; // Ефективність системи (75%)
const PDV = 0.195; // Податок на додану вартість (19.5%)
const GREEN_TARIFF = 0.16; // Зелений тариф (євро за кВт·год)
const DOMESTIC_PRICE = 2.64; // Вартість електроенергії для домогосподарств (грн за кВт·год)

// Назви місяців українською
const MONTHS_UA = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

// Назви регіонів
const REGION_NAMES = {
    'vinn': 'Вінниця', 'dnip': 'Дніпро', 'done': 'Донецьк', 'zhyto': 'Житомир',
    'zapor': 'Запоріжжя', 'ifra': 'Івано-Франківськ', 'kyiv': 'Київ', 'krop': 'Кропивницький',
    'lutsk': 'Луцьк', 'luhan': 'Луганськ', 'lviv': 'Львів', 'myko': 'Миколаїв',
    'odes': 'Одеса', 'polt': 'Полтава', 'rivn': 'Рівне', 'sumy': 'Суми',
    'symf': 'Сімферополь', 'tern': 'Тернопіль', 'uzho': 'Ужгород', 'khark': 'Харків',
    'kher': 'Херсон', 'kmel': 'Хмельницький', 'cher': 'Черкаси', 'chrn': 'Чернігів',
    'chrv': 'Чернівці'
};

// Дані інсоляції для регіонів (кВт·год/м²/день)
const INSOLATION_DATA = {
    'vinn': [1.07, 1.89, 2.94, 3.92, 5.19, 5.3, 5.16, 4.68, 3.21, 1.97, 1.10, 0.9],
    'dnip': [1.15, 1.91, 2.94, 4.04, 5.19, 5.32, 5.38, 4.67, 3.31, 2.11, 1.15, 0.91],
    'done': [1.21, 1.99, 2.98, 4.05, 5.25, 5.42, 5.34, 4.68, 3.36, 2.13, 1.17, 0.96],
    'zhyto': [1.01, 1.82, 2.87, 3.88, 5.16, 5.19, 5.04, 4.66, 3.06, 1.87, 1.04, 0.83],
    'zapor': [1.21, 2.00, 2.98, 4.05, 5.26, 5.42, 5.34, 4.67, 3.36, 2.13, 1.17, 0.96],
    'ifra': [1.19, 1.93, 2.84, 3.68, 4.54, 4.75, 4.76, 4.4, 3.06, 2.00, 1.20, 0.94],
    'kyiv': [1.07, 1.87, 2.95, 3.96, 5.25, 5.22, 5.25, 4.67, 3.12, 1.94, 1.02, 0.86],
    'krop': [1.20, 1.95, 2.96, 4.07, 5.47, 5.49, 5.57, 4.92, 3.42, 2.11, 1.15, 0.96],
    'lutsk': [1.01, 1.77, 2.83, 3.91, 5.05, 5.11, 4.97, 4.67, 3.05, 1.83, 1.05, 0.79],
    'luhan': [1.23, 2.06, 3.05, 4.05, 5.46, 5.57, 5.65, 4.99, 3.62, 2.23, 1.26, 0.93],
    'lviv': [1.08, 1.83, 2.82, 3.78, 4.67, 4.83, 4.83, 4.45, 3.00, 1.85, 1.06, 0.83],
    'myko': [1.25, 2.10, 3.07, 4.38, 5.65, 5.85, 6.03, 5.34, 3.93, 2.52, 1.36, 1.04],
    'odes': [1.25, 2.11, 3.08, 4.38, 5.65, 5.85, 6.04, 5.33, 3.93, 2.52, 1.36, 1.04],
    'polt': [1.18, 1.96, 2.99, 4.00, 5.40, 5.44, 5.51, 4.87, 3.42, 2.11, 1.15, 0.91],
    'rivn': [1.03, 1.83, 2.84, 3.88, 5.04, 5.17, 5.00, 4.70, 3.01, 1.86, 1.04, 0.81],
    'sumy': [1.13, 1.93, 2.94, 3.99, 5.25, 5.31, 5.37, 4.72, 3.27, 2.02, 1.08, 0.86],
    'symf': [1.27, 2.08, 3.01, 4.19, 5.44, 5.65, 5.88, 5.18, 4.01, 2.55, 1.43, 1.06],
    'tern': [1.09, 1.86, 2.85, 3.85, 4.84, 5.00, 4.93, 4.51, 3.08, 1.91, 1.09, 0.85],
    'uzho': [1.13, 1.91, 2.84, 3.74, 4.56, 4.75, 4.76, 4.4, 3.05, 1.96, 1.19, 0.88],
    'khark': [1.19, 2.02, 3.05, 4.05, 5.46, 5.57, 5.65, 4.99, 3.62, 2.23, 1.26, 0.95],
    'kher': [1.23, 2.06, 3.08, 4.36, 5.68, 5.76, 6.00, 5.29, 4.00, 2.57, 1.36, 1.04],
    'kmel': [1.09, 1.86, 2.85, 3.85, 4.84, 4.99, 4.92, 4.50, 3.08, 1.91, 1.09, 0.85],
    'cher': [1.15, 1.91, 2.94, 3.99, 5.21, 5.30, 5.25, 4.70, 3.28, 2.06, 1.13, 0.9],
    'chrn': [1.09, 1.89, 2.94, 3.92, 5.19, 5.30, 5.15, 4.68, 3.21, 1.97, 1.09, 0.9],
    'chrv': [1.19, 1.93, 2.84, 3.68, 4.54, 4.75, 4.76, 4.4, 3.06, 2.00, 1.19, 0.94]
};

// Кількість днів у місяцях
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Форматування чисел
function formatNumber(number, decimals = 0) {
    return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Ініціалізація сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Заповнення випадаючого списку регіонів
    const regionSelect = document.getElementById('region');
    
    for (const region in REGION_NAMES) {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = REGION_NAMES[region];
        regionSelect.appendChild(option);
    }
    
    // Встановлення обробника для форми
    document.getElementById('solarGenWizardForm').addEventListener('submit', calculateSolar);
});

// Головна функція розрахунку
function calculateSolar(event) {
    event.preventDefault();
    
    // Отримання значень з форми
    const region = document.getElementById('region').value;
    const panelPower = parseFloat(document.getElementById('panelPower').value);
    const ownConsumption = parseFloat(document.getElementById('ownConsumption').value) || 0;
    
    // Перевірка коректності введених даних
    if (!region || !panelPower || panelPower <= 0) {
        alert('Будь ласка, заповніть усі обов\'язкові поля коректними значеннями.');
        return;
    }
    
    // Отримання даних інсоляції для вибраного регіону
    const monthlyInsolation = INSOLATION_DATA[region];
    
    // Розрахунок генерації по місяцях
    const monthlyGeneration = [];
    for (let i = 0; i < 12; i++) {
        const gen = monthlyInsolation[i] * panelPower * DAYS_IN_MONTH[i] * SYSTEM_EFFICIENCY;
        monthlyGeneration.push(gen);
    }
    
    // Загальна річна генерація
    const totalGeneration = monthlyGeneration.reduce((sum, gen) => sum + gen, 0);
    
    // Розрахунок прибутку за зеленим тарифом
    const profit = totalGeneration * GREEN_TARIFF;
    
    // Розрахунок власного споживання та економії
    let ownMonthly = [];
    let gridMonthly = [];
    let remainingMonthly = [];
    let usedForOwnTotal = 0;
    let gridTotal = 0;
    
    if (ownConsumption > 0) {
        for (let i = 0; i < 12; i++) {
            const ownNeed = ownConsumption;
            const solarGen = monthlyGeneration[i];
            const usedFromSolar = Math.min(solarGen, ownNeed);
            const takenFromGrid = Math.max(0, ownNeed - solarGen);
            const remaining = Math.max(0, solarGen - usedFromSolar);
            
            ownMonthly.push(usedFromSolar);
            gridMonthly.push(takenFromGrid);
            remainingMonthly.push(remaining);
            
            usedForOwnTotal += usedFromSolar;
            gridTotal += takenFromGrid;
        }
    }
    
    // Формування результату
    let resultHTML = `
        <h1>Результати розрахунку:</h1>
        <p>🌍 <strong>Регіон:</strong> ${REGION_NAMES[region]}</p>
        <p>⚡ <strong>Потужність СЕС:</strong> ${panelPower} кВт</p>
        <p>🔋 <strong>Річна генерація:</strong> ${formatNumber(totalGeneration)} кВт·год</p>
    `;
    
    if (ownConsumption > 0) {
        // Розрахунок для власного споживання
        const annualConsumption = ownConsumption * 12;
        const coveragePercent = (annualConsumption > 0) ? (usedForOwnTotal / annualConsumption) * 100 : 0;
        const savingsUAH = usedForOwnTotal * DOMESTIC_PRICE;
        const remainingForSale = Math.max(0, totalGeneration - usedForOwnTotal);
        const remainingProfit = remainingForSale * GREEN_TARIFF * (1 - PDV);
        
        resultHTML += `
            <h3>🏠 Аналіз споживання:</h1>
            <p>• ☀️ <strong>Використано сонячної енергії:</strong> ${formatNumber(usedForOwnTotal)} кВт·год (${coveragePercent.toFixed(1)}% потреб)</p>
            <p>• ⚡ <strong>Енергії з мережі:</strong> ${formatNumber(gridTotal)} кВт·год</p>
            <p>• 💰 <strong>Економія:</strong> ${formatNumber(usedForOwnTotal)} кВт·год (≈ ${formatNumber(savingsUAH)} грн для домогосподарств)</p>
            <p>• 🟢 <strong>Надлишок для продажу:</strong> ${formatNumber(remainingForSale)} кВт·год</p>
            <p>• 💵 <strong>Дохід (після податків):</strong> ${formatNumber(remainingProfit, 2)} €</p>
        `;
    } else {
        // Розрахунок лише прибутку
        const profitAfterPDV = profit * (1 - PDV);
        resultHTML += `
            <p>💵 <strong>Дохід (після податків):</strong> ${formatNumber(profitAfterPDV, 2)} €</p>
        `;
    }
    
    // Додавання щомісячних показників
    resultHTML += `<h1>📅 Місячні показники:</h1><div class="monthly-data">`;
    
    for (let i = 0; i < 12; i++) {
        resultHTML += `<div class="month-row">`;
        resultHTML += `<span class="month-name">${MONTHS_UA[i].slice(0, 3)}:</span>`;
        resultHTML += `<span class="generation">☀️ ${formatNumber(monthlyGeneration[i])}</span>`;
        
        if (ownConsumption > 0) {
            resultHTML += `<span class="own-use">🏠 ${formatNumber(ownMonthly[i])}</span>`;
            resultHTML += `<span class="grid-use">⚡ ${formatNumber(gridMonthly[i])}</span>`;
            resultHTML += `<span class="remaining">🟢 ${formatNumber(remainingMonthly[i])}</span>`;
        }
        
        resultHTML += `</div>`;
    }
    
    resultHTML += `</div>`;
    
    // Відображення результату
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = resultHTML;
    
    // Показ блоку з результатами
    document.getElementById('resultBox').style.display = 'block';
    
    // Прокрутка до результату
    document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth' });
}
