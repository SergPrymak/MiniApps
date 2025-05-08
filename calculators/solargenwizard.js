// Весь код виконуємо тільки після повного завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM завантажено, ініціалізуємо калькулятор...");
    
    // --- КОНСТАНТИ ТА ДОВІДКОВІ ДАНІ ---
    const INSOLATION_DATA = {
        vinn: [1.3,1.9,2.9,3.8,4.5,5.1,5.5,5.1,3.9,2.6,1.4,1.1],
        dnip: [1.6,2.3,3.5,4.6,5.3,5.9,6.2,5.7,4.2,2.7,1.6,1.3],
        done: [1.5,2.2,3.3,4.3,5.0,5.7,6.0,5.5,4.0,2.6,1.5,1.2],
        zhyto: [1.1,1.7,2.7,3.7,4.4,5.0,5.3,4.9,3.7,2.4,1.2,0.9],
        zapor: [1.7,2.4,3.6,4.7,5.4,6.0,6.3,5.8,4.3,2.8,1.7,1.4],
        ifra: [1.0,1.6,2.6,3.6,4.3,4.9,5.2,4.8,3.6,2.3,1.1,0.8],
        kyiv: [1.1,1.7,2.7,3.7,4.4,5.0,5.3,4.9,3.7,2.4,1.2,0.9],
        krop: [1.4,2.0,3.1,4.1,4.8,5.4,5.7,5.2,3.9,2.5,1.4,1.1],
        lutsk: [1.0,1.5,2.5,3.5,4.2,4.8,5.1,4.7,3.5,2.2,1.1,0.8],
        luhan: [1.5,2.2,3.3,4.3,5.0,5.7,6.0,5.5,4.0,2.6,1.5,1.2],
        lviv: [1.0,1.5,2.5,3.5,4.2,4.8,5.1,4.7,3.5,2.2,1.1,0.8],
        myko: [1.7,2.4,3.6,4.7,5.4,6.0,6.3,5.8,4.3,2.8,1.7,1.4],
        odes: [1.7,2.4,3.6,4.7,5.4,6.0,6.3,5.8,4.3,2.8,1.7,1.4],
        polt: [1.3,1.9,2.9,3.8,4.5,5.1,5.5,5.1,3.9,2.6,1.4,1.1],
        rivn: [1.0,1.5,2.5,3.5,4.2,4.8,5.1,4.7,3.5,2.2,1.1,0.8],
        sumy: [1.1,1.7,2.7,3.7,4.4,5.0,5.3,4.9,3.7,2.4,1.2,0.9],
        symf: [1.8,2.5,3.7,4.8,5.5,6.1,6.4,5.9,4.4,2.9,1.8,1.5],
        tern: [1.0,1.6,2.6,3.6,4.3,4.9,5.2,4.8,3.6,2.3,1.1,0.8],
        uzho: [1.0,1.5,2.5,3.5,4.2,4.8,5.1,4.7,3.5,2.2,1.1,0.8],
        khark: [1.2,1.8,2.8,3.8,4.5,5.1,5.4,5.0,3.8,2.5,1.3,1.0],
        kher: [1.8,2.5,3.7,4.8,5.5,6.1,6.4,5.9,4.4,2.9,1.8,1.5],
        kmel: [1.1,1.7,2.7,3.7,4.4,5.0,5.3,4.9,3.7,2.4,1.2,0.9],
        cher: [1.1,1.7,2.7,3.7,4.4,5.0,5.3,4.9,3.7,2.4,1.2,0.9],
        chrn: [1.1,1.7,2.7,3.7,4.4,5.0,5.3,4.9,3.7,2.4,1.2,0.9],
        chrv: [1.2,1.8,2.8,3.8,4.5,5.1,5.4,5.0,3.8,2.5,1.3,1.0]
    };
    const REGION_NAMES = {
        vinn: "Вінниця", dnip: "Дніпро", done: "Донецьк", zhyto: "Житомир", zapor: "Запоріжжя",
        ifra: "Івано-Франківськ", kyiv: "Київ", krop: "Кропивницький", lutsk: "Луцьк", luhan: "Луганськ",
        lviv: "Львів", myko: "Миколаїв", odes: "Одеса", polt: "Полтава", rivn: "Рівне", sumy: "Суми",
        symf: "Сімферополь", tern: "Тернопіль", uzho: "Ужгород", khark: "Харків", kher: "Херсон",
        kmel: "Хмельницький", cher: "Черкаси", chrn: "Чернігів", chrv: "Чернівці"
    };
    const MONTHS_UA = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
    const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
    const SYSTEM_EFFICIENCY = 0.8; // ККД системи
    const DOMESTIC_PRICE = 2.64; // грн/кВт·год
    const GREEN_TARIFF = 0.16; // €/кВт·год
    const PDV = 0.2; // 20% ПДВ
    
    // --- ОТРИМАННЯ ЕЛЕМЕНТІВ ФОРМИ ---
    const formElement = document.getElementById('solarWizardForm');
    const regionSelectElement = document.getElementById('regionSelect');
    const powerInputElement = document.getElementById('powerInput');
    const consumptionInputElement = document.getElementById('consumptionInput');
    const resultContentElement = document.getElementById('resultContent');
    const resultBoxElement = document.getElementById('resultBox');
    const autoPowerCheckboxElement = document.getElementById('autoPowerCheckbox');
    
    // Отримання елементів розширених параметрів
    const greenTariffInputElement = document.getElementById('greenTariffInput');
    const taxInputElement = document.getElementById('taxInput');
    const domesticPriceInputElement = document.getElementById('domesticPriceInput');
    const toggleAdvancedParamsElement = document.getElementById('toggleAdvancedParams');
    const advancedParamsElement = document.getElementById('advancedParams');
    const useGreenTariffCheckboxElement = document.getElementById('useGreenTariffCheckbox');
    
    // Додаємо обробник для чекбоксу продажу споживачам
    const enableConsumerSale = document.getElementById('enableConsumerSale');
    const consumerSaleParams = document.getElementById('consumerSaleParams');
    
    if (enableConsumerSale && consumerSaleParams) {
        enableConsumerSale.addEventListener('change', function() {
            consumerSaleParams.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    // --- ПЕРЕВІРКА НАЯВНОСТІ ЕЛЕМЕНТІВ ---
    if (!formElement || !regionSelectElement || !powerInputElement || !consumptionInputElement || !resultContentElement || !resultBoxElement) {
        console.error("Помилка: не всі елементи знайдені");
        alert("Критична помилка: не всі елементи форми знайдені. Перезавантажте сторінку.");
        return;
    }
    
    // --- ЗАПОВНЕННЯ СПИСКУ РЕГІОНІВ ---
    regionSelectElement.innerHTML = Object.entries(REGION_NAMES)
        .map(([key, name]) => `<option value="${key}">${name}</option>`)
        .join('');
    regionSelectElement.value = 'rivn';
    console.log("Заповнено список регіонів");
    
    // --- ФУНКЦІЇ РОЗРАХУНКУ ---
    function calculateGeneration(region, powerKW) {
        const monthlyInsolation = INSOLATION_DATA[region];
        let monthlyGeneration = [];
        
        for (let i = 0; i < 12; i++) {
            const generationForMonth = monthlyInsolation[i] * powerKW * DAYS_IN_MONTH[i] * SYSTEM_EFFICIENCY;
            monthlyGeneration.push(generationForMonth);
        }
        
        return monthlyGeneration;
    }
    
    function calculateConsumption(monthlyGeneration, monthlyConsumption) {
        let ownMonthly = []; // Використано власної енергії
        let gridMonthly = []; // Взято з мережі
        let remainingMonthly = []; // Залишок для продажу
        let usedForOwnTotal = 0; // Загалом використано власної
        let gridTotal = 0; // Загалом взято з мережі
        
        for (let i = 0; i < 12; i++) {
            const ownNeed = monthlyConsumption;
            const solarGeneration = monthlyGeneration[i];
            const usedFromSolar = Math.min(solarGeneration, ownNeed);
            const takenFromGrid = Math.max(0, ownNeed - solarGeneration);
            const remaining = Math.max(0, solarGeneration - usedFromSolar);
            
            ownMonthly.push(usedFromSolar);
            gridMonthly.push(takenFromGrid);
            remainingMonthly.push(remaining);
            usedForOwnTotal += usedFromSolar;
            gridTotal += takenFromGrid;
        }
        
        return {
            ownMonthly,
            gridMonthly,
            remainingMonthly,
            usedForOwnTotal,
            gridTotal
        };
    }
    
    // --- ФУНКЦІЯ ВИВЕДЕННЯ РЕЗУЛЬТАТУ ---
    function displayResult(html) {
        resultContentElement.innerHTML = html;
        resultBoxElement.style.display = 'block';
        console.log("Результат виведено");
    }
    
    // --- РОБОТА З РОЗШИРЕНИМИ ПАРАМЕТРАМИ ---
    toggleAdvancedParamsElement.addEventListener('click', function(e) {
        e.preventDefault();
        advancedParamsElement.style.display = advancedParamsElement.style.display === 'none' ? 'block' : 'none';
    });
    
    // --- ФУНКЦІЯ АВТОПІДБОРУ ПОТУЖНОСТІ ---
    function calculateOptimalPower(region, monthlyConsumption) {
        // Найменша інсоляція в регіоні
        const minInsolation = Math.min(...INSOLATION_DATA[region]);
        const minInsolationMonth = INSOLATION_DATA[region].indexOf(minInsolation);
        
        // Кількість днів у місяці з найменшою інсоляцією
        const daysInMinMonth = DAYS_IN_MONTH[minInsolationMonth];
        
        // Знайти необхідну потужність сонячних панелей для покриття споживання
        // в місяць з найменшою інсоляцією, за формулою:
        // потужність = місячне_споживання / (інсоляція * дні_в_місяці * ККД)
        const optimalPower = monthlyConsumption / (minInsolation * daysInMinMonth * SYSTEM_EFFICIENCY);
        
        return {
            power: optimalPower,
            minInsolation: minInsolation,
            month: MONTHS_UA[minInsolationMonth]
        };
    }
    
    // --- ФУНКЦІЯ ОНОВЛЕННЯ ПОТУЖНОСТІ ПРИ АВТОПІДБОРІ ---
    function updatePowerWithAutoCalculation() {
        if (!autoPowerCheckboxElement.checked) {
            return;
        }
        
        const region = regionSelectElement.value;
        const consumption = parseFloat(consumptionInputElement.value.replace(',', '.')) || 0;
        
        if (!region || !(region in INSOLATION_DATA) || consumption <= 0) {
            return;
        }
        
        const optimalPowerData = calculateOptimalPower(region, consumption);
        const roundedPower = Math.ceil(optimalPowerData.power * 10) / 10; // Округлюємо до 0.1 кВт
        
        powerInputElement.value = roundedPower.toFixed(1);
        
        // Додаємо пояснення розрахунку в контейнер для підказки
        const powerInfoElement = document.getElementById('powerAutoInfo');
        if (powerInfoElement) {
            powerInfoElement.innerHTML = `<i class="bi bi-info-circle"></i> Розраховано на основі споживання ${consumption} кВт·год/міс 
                у місяць з найменшою інсоляцією (${optimalPowerData.month}, ${optimalPowerData.minInsolation} кВт·год/м²/день)`;
            powerInfoElement.style.display = 'block';
        }
    }
    
    // --- ОБРОБНИК ДЛЯ АВТОПІДБОРУ ПОТУЖНОСТІ ---
    autoPowerCheckboxElement.addEventListener('change', function() {
        if (this.checked) {
            // Створюємо елемент для інформації про розрахунок, якщо він ще не існує
            if (!document.getElementById('powerAutoInfo')) {
                const infoElement = document.createElement('div');
                infoElement.id = 'powerAutoInfo';
                infoElement.className = 'auto-power-info';
                infoElement.style.display = 'none';
                powerInputElement.parentNode.appendChild(infoElement);
            }
            
            // Вимикаємо поле введення потужності
            powerInputElement.disabled = true;
            
            // Автоматично розраховуємо потужність
            updatePowerWithAutoCalculation();
        } else {
            // Вмикаємо поле введення потужності
            powerInputElement.disabled = false;
            
            // Приховуємо інформацію про розрахунок
            const powerInfoElement = document.getElementById('powerAutoInfo');
            if (powerInfoElement) {
                powerInfoElement.style.display = 'none';
            }
        }
    });
    
    // --- ОНОВЛЕННЯ ПОТУЖНОСТІ ПРИ ЗМІНІ ПАРАМЕТРІВ ---
    regionSelectElement.addEventListener('change', updatePowerWithAutoCalculation);
    consumptionInputElement.addEventListener('input', updatePowerWithAutoCalculation);
    
    // Оновлюємо стан поля "Зелений тариф" та "Податок" на основі вибору чекбоксу
    useGreenTariffCheckboxElement.addEventListener('change', function() {
        // Отримуємо контейнер з полями зеленого тарифу
        const tariffTaxGroup = document.querySelector('.tariff-tax-group');
        
        // Показуємо або приховуємо групу полів зеленого тарифу
        if (tariffTaxGroup) {
            // Використовуємо display: block замість flex для підтримки нової структури
            tariffTaxGroup.style.display = this.checked ? 'block' : 'none';
        }
        
        // Активуємо/деактивуємо поля (залишаємо для валідації)
        greenTariffInputElement.disabled = !this.checked;
        taxInputElement.disabled = !this.checked;
    });
    
    // --- ОБРОБКА ФОРМИ ---
    formElement.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log("Обробка форми...");
        
        try {
            // Отримання даних з форми
            const regionCode = regionSelectElement.value;
            const powerKW = parseFloat(powerInputElement.value.replace(',', '.'));
            const monthlyConsumption = parseFloat(consumptionInputElement.value.replace(',', '.')) || 0;
            
            // Отримання значень розширених параметрів (або використання значень за замовчуванням)
            const useGreenTariff = useGreenTariffCheckboxElement.checked;
            const greenTariff = useGreenTariff ? (parseFloat(greenTariffInputElement.value.replace(',', '.')) || GREEN_TARIFF) : 0;
            const taxPercent = parseFloat(taxInputElement.value.replace(',', '.')) || PDV * 100;
            const taxRate = taxPercent / 100;
            const domesticPrice = parseFloat(domesticPriceInputElement.value.replace(',', '.')) || DOMESTIC_PRICE;
            const installationCostPerKW = parseFloat(document.getElementById('installationCostInput').value.replace(',', '.')) || 800;
            
            // Отримуємо параметри для продажу споживачам
            const consumerSaleEnabled = enableConsumerSale && enableConsumerSale.checked;
            const consumerMaxConsumption = consumerSaleEnabled ? 
                (parseFloat(document.getElementById('consumerMaxConsumptionInput').value) || 1000) : 0;
            const consumerPrice = consumerSaleEnabled ? 
                (parseFloat(document.getElementById('consumerPriceInput').value) || 7.0) : 0;
            
            console.log("Вхідні дані:", { 
                regionCode, powerKW, monthlyConsumption,
                greenTariff, taxRate, domesticPrice, installationCostPerKW,
                consumerSaleEnabled, consumerMaxConsumption, consumerPrice
            });
            
            // Валідація введених даних
            if (!regionCode || !(regionCode in INSOLATION_DATA)) {
                displayResult("❌ Оберіть коректний регіон.");
                return;
            }
            if (isNaN(powerKW) || powerKW <= 0) {
                displayResult("❌ Потужність панелей має бути більше 0.");
                return;
            }
            if (monthlyConsumption < 0) {
                displayResult("❌ Власне споживання має бути невід'ємним.");
                return;
            }
            // Перевіряємо зелений тариф тільки якщо він увімкнений
            if (useGreenTariff && greenTariff <= 0) {
                displayResult("❌ Зелений тариф має бути більше 0.");
                return;
            }
            if (taxRate < 0 || taxRate > 1) {
                displayResult("❌ Податок має бути в межах від 0% до 100%.");
                return;
            }
            if (domesticPrice <= 0) {
                displayResult("❌ Ціна для домогосподарств має бути більше 0.");
                return;
            }
            
            // Розрахунок генерації
            const monthlyGeneration = calculateGeneration(regionCode, powerKW);
            const totalGeneration = monthlyGeneration.reduce((a, b) => a + b, 0);
            
            // Базовий HTML результату
            let resultHTML = `
<div class="result-header">
<div class="result-title">${REGION_NAMES[regionCode] || regionCode} - ${powerKW} кВт по панелям</div>
<div class="result-subtitle">🔋 Річна генерація: ${Math.round(totalGeneration).toLocaleString('uk-UA')} кВт·год</div>
</div>`;

            // Якщо увімкнено продаж споживачам, використовуємо нову логіку розрахунку
            if (consumerSaleEnabled) {
                // Місячний розрахунок з пріоритетом на споживачів
                let consumerUsedMonthly = [];
                let ownUsedMonthly = [];
                let gridTotalMonthly = [];
                let greenTariffMonthly = [];
                let unusedMonthly = [];

                let totalConsumerUsed = 0;
                let totalOwnUsed = 0;
                let totalGridFromNetwork = 0;
                let totalGridForConsumer = 0; // Додаємо змінну для обрахунку доходу від перепродажу
                let totalGridForOwn = 0; // Додаємо змінну для внутрішнього обрахунку
                let totalGreenTariff = 0;
                let totalUnused = 0;

                for (let i = 0; i < 12; i++) {
                    let solarAvailable = monthlyGeneration[i];
                    
                    // 1. Спочатку забезпечуємо споживачів
                    const consumerNeeds = consumerMaxConsumption;
                    const consumerUsed = Math.min(solarAvailable, consumerNeeds);
                    solarAvailable -= consumerUsed;
                    
                    // 2. Енергія з мережі, яка потрібна споживачам, якщо генерації не вистачає
                    const gridForConsumer = Math.max(0, consumerNeeds - consumerUsed);
                    
                    // 3. Залишок сонячної енергії йде на власні потреби
                    const ownNeeds = monthlyConsumption;
                    const ownUsed = Math.min(solarAvailable, ownNeeds);
                    solarAvailable -= ownUsed;
                    
                    // 4. Якщо і для власних потреб не вистачає - беремо з мережі
                    const gridForOwn = Math.max(0, ownNeeds - ownUsed);
                    
                    // 5. Загальне споживання з мережі (об'єднане)
                    const gridTotal = gridForConsumer + gridForOwn;
                    
                    // 6. Що залишилось - на зелений тариф або невикористано
                    const greenTariff = useGreenTariff ? solarAvailable : 0;
                    const unused = useGreenTariff ? 0 : solarAvailable;
                    
                    // Зберігаємо місячні показники
                    consumerUsedMonthly.push(consumerUsed);
                    ownUsedMonthly.push(ownUsed);
                    gridTotalMonthly.push(gridTotal);
                    greenTariffMonthly.push(greenTariff);
                    unusedMonthly.push(unused);
                    
                    // Сумуємо річні показники
                    totalConsumerUsed += consumerUsed;
                    totalOwnUsed += ownUsed;
                    totalGridFromNetwork += gridTotal;
                    totalGridForConsumer += gridForConsumer; // Додаємо для розрахунку доходу від перепродажу
                    totalGridForOwn += gridForOwn;
                    totalGreenTariff += greenTariff;
                    totalUnused += unused;
                }
                
                // Фінансові показники
                const eurRate = parseFloat(document.getElementById('euroRateInput').value) || 44;
                
                // 1. Економія на власному споживанні
                const savingsUAH = totalOwnUsed * domesticPrice;
                
                // 2. Дохід від продажу споживачам
                const incomeFromConsumerSolar = totalConsumerUsed * consumerPrice;
                
                // 3. Прибуток від перепродажу (споживачам з мережі)
                const resellMargin = consumerPrice - domesticPrice;
                const incomeFromResell = totalGridForConsumer * resellMargin;
                
                // 4. Дохід по зеленому тарифу
                const greenTariffIncome = totalGreenTariff * greenTariff * (1 - taxRate);
                
                // 5. Загальний річний дохід
                const totalProfitUAH = savingsUAH + incomeFromConsumerSolar + incomeFromResell;
                const totalProfitEUR = totalProfitUAH / eurRate + greenTariffIncome;
                
                // 6. Розрахунок окупності
                const costType = document.querySelector('input[name="costType"]:checked').value;
                let totalInstallationCost;
                if (costType === 'perKw') {
                    totalInstallationCost = installationCostPerKW * powerKW;
                } else {
                    totalInstallationCost = parseFloat(document.getElementById('totalSystemCostInput').value) || (powerKW * 1000);
                }
                const paybackPeriod = totalProfitEUR > 0 ? totalInstallationCost / totalProfitEUR : Infinity;
                
                // Формуємо таблицю розподілу електроенергії
                resultHTML += `
<table class="result-table consumption-table">
    <caption>🔌 Розподіл генерації</caption>
    <tr>
        <td>👥 Продано споживачам:</td>
        <td><b>${Math.round(totalConsumerUsed).toLocaleString('uk-UA')}</b> кВт·год</td>
    </tr>
    <tr>
        <td>🏠 Використано для себе:</td>
        <td><b>${Math.round(totalOwnUsed).toLocaleString('uk-UA')}</b> кВт·год</td>
    </tr>
    <tr>
        <td>🟢 Продано по зеленому тарифу:</td>
        <td><b>${Math.round(totalGreenTariff).toLocaleString('uk-UA')}</b> кВт·год</td>
    </tr>
    <tr>
        <td>⚡ Взято з мережі (загалом):</td>
        <td><b>${Math.round(totalGridFromNetwork).toLocaleString('uk-UA')}</b> кВт·год</td>
    </tr>
    <tr>
        <td>⛔ Невикористано:</td>
        <td><b>${Math.round(totalUnused).toLocaleString('uk-UA')}</b> кВт·год</td>
    </tr>
</table>`;
                
                // Формуємо таблицю фінансових показників
                resultHTML += `
<table class="result-table profit-table">
    <caption>💰 Фінансові статті</caption>
    <tr>
        <td>🏠 Економія (власне споживання):</td>
        <td><b>${Math.round(savingsUAH).toLocaleString('uk-UA')}</b> грн</td>
    </tr>
    <tr>
        <td>👥 Дохід від продажу споживачам (генерація):</td>
        <td><b>${Math.round(incomeFromConsumerSolar).toLocaleString('uk-UA')}</b> грн</td>
    </tr>
    <tr>
        <td>🔄 Дохід від перепродажу (маржа):</td>
        <td><b>${Math.round(incomeFromResell).toLocaleString('uk-UA')}</b> грн</td>
    </tr>
    <tr>
        <td>🟢 Дохід по зеленому тарифу (після податків):</td>
        <td><b>${greenTariffIncome.toLocaleString('uk-UA', {minimumFractionDigits:2, maximumFractionDigits:2})}</b> €</td>
    </tr>
    <tr class="total-profit-row">
        <td>📈 Сукупний річний дохід:</td>
        <td><b>${Math.round(totalProfitUAH).toLocaleString('uk-UA')}</b> грн + <b>${greenTariffIncome.toLocaleString('uk-UA', {minimumFractionDigits:2, maximumFractionDigits:2})}</b> €</td>
    </tr>
</table>`;
                
                // Формуємо таблицю окупності
                resultHTML += `
<table class="result-table roi-table">
    <caption>📈 Окупність інвестицій</caption>
    <tr>
        <td>💼 Вартість системи:</td>
        <td><b>${totalInstallationCost.toLocaleString('uk-UA')}</b> €</td>
    </tr>
    <tr>
        <td>💶 Річний дохід:</td>
        <td><b>${totalProfitEUR.toLocaleString('uk-UA', {minimumFractionDigits:2, maximumFractionDigits:2})}</b> €</td>
    </tr>
    <tr>
        <td>⏱️ Термін окупності:</td>
        <td><b>${paybackPeriod === Infinity ? '∞' : paybackPeriod.toFixed(1)}</b> років</td>
    </tr>
</table>`;
                
                // Формуємо місячну таблицю
                resultHTML += `
<table class="result-table monthly-table">
    <caption>📅 Місячні показники</caption>
    <tr class="table-header">
        <th>Міс</th>
        <th>Сонце </th>
        <th>Продаж</th>
        <th>Власне</th>
        <th>Зелений тариф</th>
        <th>З мережі</th>
    </tr>`;
                
                for (let i = 0; i < 12; ++i) {
                    resultHTML += `
    <tr>
        <td>${MONTHS_UA[i].slice(0,3)}</td>
        <td>☀️ ${Math.round(monthlyGeneration[i])}</td>
        <td>👥 ${Math.round(consumerUsedMonthly[i])}</td>
        <td>🏠 ${Math.round(ownUsedMonthly[i])}</td>
        <td>🟢 ${Math.round(greenTariffMonthly[i])}</td>
        <td>⚡ ${Math.round(gridTotalMonthly[i])}</td>
    </tr>`;
                }
                
                resultHTML += `</table>`;
                
                // Додаємо використані фінансові параметри
                resultHTML += `
<div class="result-params">
    <small><b>Використані фінансові параметри:</b> 
    Зелений тариф: ${greenTariff.toFixed(2)} €/кВт·год, 
    Податок: ${taxPercent}%, 
    Тариф з мережі: ${domesticPrice.toFixed(2)} грн/кВт·год,
    Тариф для споживача: ${consumerPrice.toFixed(2)} грн/кВт·год</small>
</div>`;
                
                displayResult(resultHTML);
                return;
            }
            
            // Стандартна логіка, якщо продаж споживачам вимкнено
            // Розрахунок для власного споживання
            if (monthlyConsumption > 0) {
                const consumption = calculateConsumption(monthlyGeneration, monthlyConsumption);
                const annualConsumption = monthlyConsumption * 12;
                const coveragePercent = annualConsumption > 0 ? (consumption.usedForOwnTotal / annualConsumption) * 100 : 0;
                const savingsUAH = Math.round(consumption.usedForOwnTotal * domesticPrice);
                const remainingForSale = Math.max(0, totalGeneration - consumption.usedForOwnTotal);
                const remainingProfit = remainingForSale * greenTariff * (1 - taxRate);
                
                // Розрахунок окупності
                const costType = document.querySelector('input[name="costType"]:checked').value;
                let totalInstallationCost;

                if (costType === 'perKw') {
                    // Розрахунок вартості по €/кВт
                    totalInstallationCost = installationCostPerKW * powerKW;
                } else {
                    // Використання введеної загальної вартості
                    totalInstallationCost = parseFloat(document.getElementById('totalSystemCostInput').value) || (powerKW * 1000);
                }
                const eurRate = parseFloat(document.getElementById('euroRateInput').value) || 44; // Використовуємо введений курс або 44 за замовчуванням
                const savingsEUR = savingsUAH / eurRate;
                const annualProfitEUR = savingsEUR + remainingProfit;
                const paybackPeriod = totalInstallationCost / annualProfitEUR;
                
                resultHTML += `
<table class="result-table consumption-table">
    <caption>🏠 Аналіз споживання</caption>
    <tr>
        <td>☀️ Використано сонячної енергії:</td>
        <td><b>${Math.round(consumption.usedForOwnTotal).toLocaleString('uk-UA')}</b> кВт·год (${coveragePercent.toFixed(1)}%)</td>
    </tr>
    <tr>
        <td>⚡ Енергії з мережі:</td>
        <td><b>${Math.round(consumption.gridTotal).toLocaleString('uk-UA')}</b> кВт·год</td>
    </tr>
    <tr>
        <td>💰 Економія:</td>
        <td><b>${Math.round(consumption.usedForOwnTotal).toLocaleString('uk-UA')}</b> кВт·год (≈ ${savingsUAH.toLocaleString('uk-UA')} грн)</td>
    </tr>
    <tr>
        <td>🟢 Надлишок для продажу:</td>
        <td>${useGreenTariff ? `<b>${Math.round(remainingForSale).toLocaleString('uk-UA')}</b> кВт·год` : `<span class="not-applicable">не враховано</span>`}</td>
    </tr>
    <tr>
        <td>💵 Дохід (після податків):</td>
        <td>${useGreenTariff ? `<b>${remainingProfit.toLocaleString('uk-UA', {minimumFractionDigits:2, maximumFractionDigits:2})} €</b>` : `<span class="not-applicable">0.00 €</span>`}</td>
    </tr>
</table>

<table class="result-table roi-table">
    <caption>📈 Окупність інвестицій</caption>
    <tr>
        <td>💼 Вартість системи:</td>
        <td><b>${totalInstallationCost.toLocaleString('uk-UA')}</b> €</td>
    </tr>
    <tr>
        <td>💶 Річний дохід:</td>
        <td><b>${annualProfitEUR.toLocaleString('uk-UA', {minimumFractionDigits:2, maximumFractionDigits:2})}</b> €</td>
    </tr>
    <tr>
        <td>⏱️ Термін окупності:</td>
        <td><b>${paybackPeriod.toFixed(1)}</b> років</td>
    </tr>
</table>

<table class="result-table monthly-table">
    <caption>📅 Місячні показники</caption>
    <tr class="table-header">
        <th>Місяць</th>
        <th>Генерація</th>
        <th>Власне</th>
        <th>З мережі</th>
        <th>На продаж</th>
    </tr>`;
                
                for (let i = 0; i < 12; ++i) {
                    resultHTML += `
    <tr>
        <td>${MONTHS_UA[i].slice(0,3)}</td>
        <td>☀️ ${Math.round(monthlyGeneration[i])}</td>
        <td>🏠 ${Math.round(consumption.ownMonthly[i])}</td>
        <td>⚡ ${Math.round(consumption.gridMonthly[i])}</td>
        <td>🟢 ${Math.round(consumption.remainingMonthly[i])}</td>
    </tr>`;
                }
                
                resultHTML += `</table>`;
            } else {
                const profitAfterTax = totalGeneration * greenTariff * (1 - taxRate);
                
                // Розрахунок окупності
                const costType = document.querySelector('input[name="costType"]:checked').value;
                let totalInstallationCost;

                if (costType === 'perKw') {
                    // Розрахунок вартості по €/кВт
                    totalInstallationCost = installationCostPerKW * powerKW;
                } else {
                    // Використання введеної загальної вартості
                    totalInstallationCost = parseFloat(document.getElementById('totalSystemCostInput').value) || (powerKW * 1000);
                }
                const paybackPeriod = totalInstallationCost / profitAfterTax;
                
                resultHTML += `
<div class="result-profit">
    <div>💵 Дохід (після податків): <b>${profitAfterTax.toLocaleString('uk-UA', {minimumFractionDigits:2, maximumFractionDigits:2})} €</b></div>
</div>

<table class="result-table roi-table">
    <caption>📈 Окупність інвестицій</caption>
    <tr>
        <td>💼 Вартість системи:</td>
        <td><b>${totalInstallationCost.toLocaleString('uk-UA')}</b> €</td>
    </tr>
    <tr>
        <td>💶 Річний дохід:</td>
        <td><b>${profitAfterTax.toLocaleString('uk-UA', {minimumFractionDigits:2, maximumFractionDigits:2})}</b> €</td>
    </tr>
    <tr>
        <td>⏱️ Термін окупності:</td>
        <td><b>${paybackPeriod.toFixed(1)}</b> років</td>
    </tr>
</table>

<table class="result-table monthly-table">
    <caption>📅 Місячні показники</caption>
    <tr class="table-header">
        <th>Місяць</th>
        <th>Генерація</th>
    </tr>`;
                
                for (let i = 0; i < 12; ++i) {
                    resultHTML += `
    <tr>
        <td>${MONTHS_UA[i].slice(0,3)}</td>
        <td>☀️ ${Math.round(monthlyGeneration[i])}</td>
    </tr>`;
                }
                
                resultHTML += `</table>`;
            }
            
            // Додаємо використані економічні параметри
            resultHTML += `
<div class="result-params">
<small><b>Використані фінансові параметри:</b> 
Зелений тариф: ${greenTariff.toFixed(2)} €/кВт·год, 
Податок: ${taxPercent}%, 
Тариф для домогосподарств: ${domesticPrice.toFixed(2)} грн/кВт·год</small>
</div>`;

            displayResult(resultHTML);
            
        } catch (error) {
            console.error("Помилка при обробці форми:", error);
            displayResult("❌ Помилка розрахунку: " + error.message);
        }
    });
    
    // Ініціалізація стану полів зеленого тарифу та податку при завантаженні
    if (useGreenTariffCheckboxElement) {
        // Отримуємо контейнер з полями зеленого тарифу
        const tariffTaxGroup = document.querySelector('.tariff-tax-group');
        
        // Встановлюємо початковий стан видимості контейнера
        if (tariffTaxGroup) {
            // Використовуємо display: block замість flex для підтримки нової структури
            tariffTaxGroup.style.display = useGreenTariffCheckboxElement.checked ? 'block' : 'none';
        }
        
        // Активуємо/деактивуємо поля для валідації
        greenTariffInputElement.disabled = !useGreenTariffCheckboxElement.checked;
        taxInputElement.disabled = !useGreenTariffCheckboxElement.checked;
    }
    
    // Додаємо обробник кнопки оновлення курсу
    document.getElementById('updateRateBtn').addEventListener('click', fetchEuroRate);
    
    // Спробуємо отримати курс євро при завантаженні сторінки
    window.addEventListener('load', function() {
        // Вже існуюча ініціалізація...
        
        // Спроба отримати курс євро
        fetchEuroRate().catch(err => {
            console.warn('Не вдалося автоматично отримати курс євро:', err);
        });
    });
    
    // Додаємо обробник для радіо-кнопок вибору методу розрахунку вартості
    const costTypeRadios = document.querySelectorAll('input[name="costType"]');
    const costPerKwContainer = document.getElementById('costPerKwContainer');
    const totalCostContainer = document.getElementById('totalCostContainer');
    const totalSystemCostInput = document.getElementById('totalSystemCostInput');

    // Функція для оновлення загальної вартості на основі потужності
    function updateTotalCost() {
        const powerKW = parseFloat(powerInputElement.value.replace(',', '.')) || 10;
        // Значення по-замовчуванню: 1000€ за кВт
        totalSystemCostInput.value = (powerKW * 1000).toFixed(0);
    }

    // Обробник зміни типу розрахунку вартості
    costTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'perKw') {
                costPerKwContainer.style.display = 'block';
                totalCostContainer.style.display = 'none';
            } else {
                costPerKwContainer.style.display = 'none';
                totalCostContainer.style.display = 'block';
                // Оновлюємо загальну вартість при переключенні
                updateTotalCost();
            }
        });
    });

    // Оновлюємо загальну вартість при зміні потужності системи
    powerInputElement.addEventListener('input', function() {
        if (document.getElementById('totalCostOption').checked) {
            updateTotalCost();
        }
    });

    // Ініціалізація загальної вартості при завантаженні
    window.addEventListener('load', function() {
        // Вже існуючий код...
        
        // Ініціалізуємо загальну вартість
        updateTotalCost();
    });

    console.log("Калькулятор ініціалізовано");
});

// Додамо функцію отримання курсу валют із НБУ
async function fetchEuroRate() {
    try {
        const rateStatus = document.getElementById('rateStatus');
        rateStatus.innerHTML = '<i class="bi bi-hourglass-split"></i> Отримання курсу...';
        rateStatus.className = 'rate-status loading';
        
        const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
        if (!response.ok) {
            throw new Error(`Помилка запиту: ${response.status}`);
        }
        
        const data = await response.json();
        const euroRate = data.find(curr => curr.cc === 'EUR');
        
        if (euroRate && euroRate.rate) {
            document.getElementById('euroRateInput').value = euroRate.rate.toFixed(2);
            rateStatus.innerHTML = `<i class="bi bi-check-circle"></i> Оновлено: ${new Date().toLocaleTimeString()}`;
            rateStatus.className = 'rate-status success';
            return euroRate.rate;
        } else {
            throw new Error('Курс євро не знайдено');
        }
    } catch (error) {
        console.error('Помилка при отриманні курсу євро:', error);
        const rateStatus = document.getElementById('rateStatus');
        rateStatus.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Не вдалося оновити курс`;
        rateStatus.className = 'rate-status error';
        return null;
    }
}
