let tg = window.Telegram.WebApp;

// Дані інсоляції для регіонів України
const INSOLATION_DATA = {
    'vinn': [1.07, 1.89, 2.94, 3.92, 5.19, 5.30, 5.16, 4.68, 3.21, 1.97, 1.10, 0.90],  // Вінниця
    'dnip': [1.21, 1.99, 2.98, 4.05, 5.55, 5.57, 5.70, 5.08, 3.66, 2.27, 1.20, 0.96],  // Дніпро
    'done': [1.21, 1.99, 2.94, 4.04, 5.48, 5.55, 5.66, 5.09, 3.67, 2.24, 1.23, 0.96],  // Донецьк
    'zhyto': [1.01, 1.82, 2.87, 3.88, 5.16, 5.19, 5.04, 4.66, 3.06, 1.87, 1.04, 0.83], // Житомир
    'zapor': [1.21, 2.00, 2.91, 4.20, 5.62, 5.72, 5.88, 5.18, 3.87, 2.44, 1.25, 0.95], // Запоріжжя
    'ifra': [1.19, 1.93, 2.84, 3.68, 4.54, 4.75, 4.76, 4.40, 3.06, 2.00, 1.20, 0.94],  // Івано-Франківськ
    'kyiv': [1.07, 1.87, 2.95, 3.96, 5.25, 5.22, 5.25, 4.67, 3.12, 1.94, 1.02, 0.86],  // Київ
    'krop': [1.20, 1.95, 2.96, 4.07, 5.47, 5.49, 5.57, 4.92, 3.57, 2.24, 1.14, 0.96],  // Кропивницький
    'lutsk': [1.02, 1.77, 2.83, 3.91, 5.05, 5.08, 4.94, 4.55, 3.01, 1.83, 1.05, 0.79], // Луцьк
    'luhan': [1.23, 2.06, 3.05, 4.05, 5.46, 5.57, 5.65, 4.99, 3.62, 2.23, 1.26, 0.93], // Луганськ
    'lviv': [1.08, 1.83, 2.82, 3.78, 4.67, 4.83, 4.83, 4.45, 3.00, 1.85, 1.06, 0.83],  // Львів
    'myko': [1.25, 2.10, 3.07, 4.38, 5.65, 5.85, 6.03, 5.34, 3.93, 2.52, 1.36, 1.04],  // Миколаїв
    'odes': [1.25, 2.11, 3.08, 4.38, 5.65, 5.85, 6.04, 5.33, 3.93, 2.52, 1.36, 1.04],  // Одеса
    'polt': [1.18, 1.96, 3.05, 4.00, 5.40, 5.44, 5.51, 4.87, 3.42, 2.11, 1.15, 0.91],  // Полтава
    'rivn': [1.01, 1.81, 2.83, 3.87, 5.08, 5.17, 4.98, 4.58, 3.02, 1.87, 1.04, 0.81],  // Рівне
    'sumy': [1.13, 1.93, 3.05, 3.98, 5.27, 5.32, 5.38, 4.67, 3.19, 1.98, 1.10, 0.86],  // Суми
    'symf': [1.27, 2.06, 3.05, 4.30, 5.44, 5.84, 6.20, 5.34, 4.07, 2.67, 1.55, 1.07],  // Сімферополь
    'tern': [1.09, 1.86, 2.85, 3.85, 4.84, 5.00, 4.93, 4.51, 3.08, 1.91, 1.09, 0.85],  // Тернопіль
    'uzho': [1.13, 1.91, 3.01, 4.03, 5.01, 5.31, 5.25, 4.82, 3.33, 2.02, 1.19, 0.88],  // Ужгород
    'khark': [1.19, 2.02, 3.05, 3.92, 5.38, 5.46, 5.56, 4.88, 3.49, 2.10, 1.19, 0.90], // Харків
    'kher': [1.30, 2.13, 3.08, 4.36, 5.68, 5.76, 6.00, 5.29, 4.00, 2.57, 1.36, 1.04],  // Херсон
    'kmel': [1.09, 1.86, 2.87, 3.85, 5.08, 5.21, 5.04, 4.58, 3.14, 1.98, 1.10, 0.87],  // Хмельницький
    'cher': [1.15, 1.91, 2.94, 3.99, 5.44, 5.46, 5.54, 4.87, 3.40, 2.13, 1.09, 0.91],  // Черкаси
    'chrn': [0.99, 1.80, 2.92, 3.96, 5.17, 5.19, 5.12, 4.54, 3.00, 1.86, 0.98, 0.75],  // Чернігів
    'chrv': [1.19, 1.93, 2.84, 3.96, 4.54, 4.75, 4.76, 4.40, 3.06, 2.00, 1.20, 0.94]   // Чернівці
};

// Constants for calculations
const MONTHS_UA = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
const GREEN_TARIFF = 0.16;     // Зелений тариф (Євро/кВт·год)
const DOMESTIC_PRICE = 4.32;   // Тариф для населення (грн/кВт·год)
const PDV = 0.23;              // ПДВ (23%)
const SYSTEM_EFFICIENCY = 0.85; // ККД системи (85%)
const SAFETY_MARGIN = 1.2;      // Запас потужності (20%)

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp
    tg.expand();
    
    // Form submission
    document.getElementById('solar-calculator-form').addEventListener('submit', calculateSolar);
});

function calculateSolar(e) {
    e.preventDefault();
    
    const region = document.getElementById('region').value;
    const consumption = parseFloat(document.getElementById('consumption').value);
    const tariffType = document.getElementById('tariff-type').value;
    
    if (isNaN(consumption) || consumption <= 0) {
        alert('Споживання повинно бути більше 0');
        return;
    }
    
    // Get selected months
    const selectedMonths = [];
    document.querySelectorAll('input[name="month"]:checked').forEach(checkbox => {
        selectedMonths.push(parseInt(checkbox.value));
    });
    
    if (selectedMonths.length === 0) {
        alert('Виберіть принаймні один місяць для розрахунку');
        return;
    }
    
    // Get insolation data for the region
    const insolationData = INSOLATION_DATA[region];
    if (!insolationData) {
        alert('Не знайдено дані інсоляції для вибраного регіону');
        return;
    }
    
    // Calculate required panel power for each selected month
    const requiredPowerByMonth = [];
    for (const month of selectedMonths) {
        const insolation = insolationData[month];
        const requiredPower = (consumption / insolation / SYSTEM_EFFICIENCY) * SAFETY_MARGIN;
        requiredPowerByMonth.push({
            month: MONTHS_UA[month],
            insolation: insolation,
            requiredPower: requiredPower
        });
    }
    
    // Sort by required power (descending)
    requiredPowerByMonth.sort((a, b) => b.requiredPower - a.requiredPower);
    
    // Take the maximum required power for sizing
    const maxRequiredPower = requiredPowerByMonth[0].requiredPower;
    
    // Calculate energy production for each month with the sized system
    const productionByMonth = [];
    let totalProduction = 0;
    let totalConsumption = 0;
    
    for (let month = 0; month < 12; month++) {
        const insolation = insolationData[month];
        const production = maxRequiredPower * insolation * SYSTEM_EFFICIENCY / SAFETY_MARGIN;
        const monthlyConsumption = consumption * 30; // approx. 30 days per month
        
        totalProduction += production * 30;
        totalConsumption += monthlyConsumption;
        
        productionByMonth.push({
            month: MONTHS_UA[month],
            insolation: insolation,
            production: production,
            consumption: monthlyConsumption,
            difference: production * 30 - monthlyConsumption
        });
    }
    
    // Calculate financial metrics
    const averagePanelCostPerKw = 700; // EUR per kW
    const installationCost = maxRequiredPower * averagePanelCostPerKw;
    
    let annualSavings;
    if (tariffType === 'domestic') {
        annualSavings = Math.min(totalProduction, totalConsumption) * DOMESTIC_PRICE / 12;
    } else {
        annualSavings = (totalConsumption * DOMESTIC_PRICE + (totalProduction - totalConsumption) * GREEN_TARIFF * 37) / 12;
    }
    
    const paybackYears = installationCost * 37 / (annualSavings * 12);
    
    // Display results
    const resultDiv = document.getElementById('result');
    
    let monthlyTable = '<table class="production-table"><tr><th>Місяць</th><th>Інсоляція<br>(кВт·год/м²)</th><th>Виробництво<br>(кВт·год/день)</th><th>Споживання<br>(кВт·год/день)</th><th>Різниця<br>(кВт·год/міс)</th></tr>';
    
    for (const data of productionByMonth) {
        const differenceClass = data.difference >= 0 ? 'positive' : 'negative';
        monthlyTable += `
            <tr>
                <td>${data.month}</td>
                <td>${data.insolation.toFixed(2)}</td>
                <td>${data.production.toFixed(1)}</td>
                <td>${consumption.toFixed(1)}</td>
                <td class="${differenceClass}">${data.difference.toFixed(0)}</td>
            </tr>
        `;
    }
    
    monthlyTable += '</table>';
    
    resultDiv.innerHTML = `
        <h2>Результати розрахунку:</h2>
        <p><strong>Регіон:</strong> ${document.getElementById('region').options[document.getElementById('region').selectedIndex].text}</p>
        <p><strong>Добове споживання:</strong> ${consumption} кВт·год</p>
        <p><strong>Тип тарифу:</strong> ${document.getElementById('tariff-type').options[document.getElementById('tariff-type').selectedIndex].text}</p>
        
        <h3>Розмір системи</h3>
        <p>Необхідна потужність сонячних панелей: <strong>${maxRequiredPower.toFixed(2)} кВт</strong></p>
        <p>Для місяця з найгіршою інсоляцією: ${requiredPowerByMonth[0].month} (${requiredPowerByMonth[0].insolation.toFixed(2)} кВт·год/м²)</p>
        
        <h3>Фінансові показники</h3>
        <p>Орієнтовна вартість системи: <strong>${Math.round(installationCost)} €</strong> (${Math.round(installationCost * 37)} грн)</p>
        <p>Середньомісячна економія: <strong>${Math.round(annualSavings)} грн</strong></p>
        <p>Орієнтовний термін окупності: <strong>${paybackYears.toFixed(1)} років</strong></p>
        
        <h3>Помісячне виробництво</h3>
        ${monthlyTable}
        
        <p><em>Примітка: Розрахунки є приблизними і не враховують всі фактори, такі як втрати енергії, деградацію панелей з часом, тощо.</em></p>
    `;
    
    // Add custom styles for the table
    const style = document.createElement('style');
    style.textContent = `
        .production-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .production-table th, .production-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
        .production-table th {
            background-color: var(--tg-theme-secondary-bg-color);
        }
        .positive {
            color: green;
        }
        .negative {
            color: red;
        }
    `;
    document.head.appendChild(style);
    
    resultDiv.style.display = 'block';
    
    // Send data back to Telegram if needed
    tg.MainButton.setText('Готово');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        tg.sendData(JSON.stringify({
            calculator: 'solar',
            region: region,
            consumption: consumption,
            requiredPower: maxRequiredPower.toFixed(2),
            paybackYears: paybackYears.toFixed(1)
        }));
    });
}
