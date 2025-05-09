document.addEventListener('DOMContentLoaded', function() {
    // Делегування подій для radio-group
    document.querySelectorAll('.radio-group').forEach(group => {
        // Перевіряємо, чи є атрибут data-for, щоб уникнути помилок з групами без нього (якщо такі є)
        if (!group.hasAttribute('data-for')) {
            // Якщо немає data-for, можливо, це група, яка не керує hidden input,
            // або помилка в розмітці. Пропускаємо або логуємо.
            // console.warn("Radio group doesn't have data-for attribute:", group);
            // return; // Якщо такі групи не повинні оброблятися тут
        }

        group.addEventListener('click', function(e) {
            const btn = e.target.closest('.radio-button');
            if (!btn) return;
            
            const groupElement = e.currentTarget; // Елемент .radio-group, на якому спрацювала подія
            
            // Активуємо тільки цю кнопку в поточній групі
            groupElement.querySelectorAll('.radio-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Знаходимо hidden input по атрибуту data-for з елемента .radio-group
            const hiddenId = groupElement.getAttribute('data-for');
            if (!hiddenId) {
                console.warn('Атрибут data-for не знайдено для групи:', groupElement);
                return;
            }
            const hiddenInput = document.getElementById(hiddenId);
            if (!hiddenInput) {
                console.warn('Приховане поле з ID', hiddenId, 'не знайдено.');
                return;
            }
            
            hiddenInput.value = btn.dataset.value;

            // Додаткова логіка для перемикання полів введення, тепер використовуємо hiddenId
            if (hiddenId === 'voltageType') {
                document.getElementById('cosPhiGroup').style.display = (btn.dataset.value === 'ac') ? 'block' : 'none';
            }
            if (hiddenId === 'paramType') {
                document.getElementById('powerInputGroup').style.display = (btn.dataset.value === 'power') ? 'block' : 'none';
                document.getElementById('currentInputGroup').style.display = (btn.dataset.value === 'power') ? 'none' : 'block';
            }
            if (hiddenId === 'sectionType') {
                const cableType = document.getElementById('cableType').value;
                // Видаляємо особливу логіку для "twisted" - працюємо однаково для всіх типів кабелю
                document.getElementById('sectionInputGroup').style.display = (btn.dataset.value === 'section') ? 'block' : 'none';
                document.getElementById('diameterInputGroup').style.display = (btn.dataset.value === 'section') ? 'none' : 'block';
            }
            if (hiddenId === 'cableType') {
                if (btn.dataset.value === 'twisted') {
                    document.getElementById('pairModeGroup').style.display = 'block';
                    
                    // Встановлюємо значення за замовчуванням для витої пари
                    document.getElementById('section').value = 0.2; // Переріз 0.2 мм²
                    document.getElementById('diameter').value = 0.51; // Діаметр 0.51 мм
                    
                    // Не змінюємо видимість полів і не встановлюємо режим "діаметр" примусово
                    // Використовуємо поточний вибір користувача
                } else {
                    document.getElementById('pairModeGroup').style.display = 'none';
                    // Встановлюємо звичайні значення за замовчуванням
                    document.getElementById('section').value = 2.5;
                    document.getElementById('diameter').value = 1.8;
                }
            }
        });
    });
    
    // Ініціалізація початкового стану
    function initializeFormState() {
        // Ініціалізація voltageType
        const initialVoltageType = document.getElementById('voltageType').value;
        document.getElementById('cosPhiGroup').style.display = (initialVoltageType === 'ac') ? 'block' : 'none';

        // Ініціалізація paramType
        const initialParamType = document.getElementById('paramType').value;
        document.getElementById('powerInputGroup').style.display = (initialParamType === 'power') ? 'block' : 'none';
        document.getElementById('currentInputGroup').style.display = (initialParamType === 'power') ? 'none' : 'block';
        
        // Ініціалізація cableType та залежних полів
        const initialCableType = document.getElementById('cableType').value;
        if (initialCableType === 'twisted') {
            document.getElementById('pairModeGroup').style.display = 'block';
            
            // Встановлюємо значення за замовчуванням для витої пари
            document.getElementById('section').value = 0.2;
            document.getElementById('diameter').value = 0.51;
            
            // Не застосовуємо примусово режим "діаметр"
        } else {
            document.getElementById('pairModeGroup').style.display = 'none';
            document.getElementById('section').value = 2.5;
            document.getElementById('diameter').value = 1.8;
        }
        
        // Відображаємо поля відповідно до вибраного типу вводу перерізу
        const initialSectionType = document.getElementById('sectionType').value;
        document.getElementById('sectionInputGroup').style.display = (initialSectionType === 'section') ? 'block' : 'none';
        document.getElementById('diameterInputGroup').style.display = (initialSectionType === 'diameter') ? 'block' : 'none';
    }
    initializeFormState(); // Викликаємо функцію ініціалізації
    
    // Обробник форми калькулятора втрат у кабелі
    const form = document.getElementById('cableLossCalcForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Отримання введених значень
        const metalType = document.getElementById('metalType').value;
        const voltageType = document.getElementById('voltageType').value;
        const voltage = parseFloat(document.getElementById('voltage').value);
        const paramType = document.getElementById('paramType').value;
        let sectionType = document.getElementById('sectionType').value; // let, бо може змінитися для витої пари
        const cableLength = parseFloat(document.getElementById('cableLength').value);
        
        const cosPhi = voltageType === 'ac' ? 
            parseFloat(document.getElementById('cosPhi').value) : 1.0;
        
        let current, power, sectionValue;
        
        if (paramType === 'power') {
            power = parseFloat(document.getElementById('power').value);
            current = voltageType === 'ac' ? power / (voltage * cosPhi) : power / voltage;
        } else {
            current = parseFloat(document.getElementById('current').value);
            power = voltageType === 'ac' ? voltage * current * cosPhi : voltage * current;
        }
        
        const cableTypeValue = document.getElementById('cableType').value;
        if (cableTypeValue === 'twisted') {
            sectionType = 'diameter'; // Примусово для витої пари
        }

        if (sectionType === 'section') {
            sectionValue = parseFloat(document.getElementById('section').value);
        } else {
            const diameter = parseFloat(document.getElementById('diameter').value);
            sectionValue = Math.PI * (diameter / 2) * (diameter / 2);
        }
        
        const resistivityCopper = 0.0168; 
        const resistivityAluminum = 0.0265;
        const resistivity = metalType === 'copper' ? resistivityCopper : resistivityAluminum;
        
        let lengthMultiplier = 2;
        let pairFactor = 1;
        
        if (cableTypeValue === 'twisted') {
            const pairMode = document.getElementById('pairMode').value;
            if (pairMode === 'double') {
                pairFactor = 0.5;
            }
        }
        
        const resistance = (resistivity * cableLength * lengthMultiplier) / sectionValue * pairFactor; 
        const voltageLoss = current * resistance;
        const powerLoss = current * current * resistance;
        const calculatedPowerLossPercent = (powerLoss / power) * 100;

        const loadVoltage = voltage - voltageLoss;
        const voltageLossPercent = (voltageLoss / voltage) * 100;
        
        // Розрахунок потужності на навантаженні
        const loadPower = voltageType === 'ac' ? 
            loadVoltage * current * cosPhi : 
            loadVoltage * current;

        let hasCritical = false;
        let hasWarnings = false;

        // Якщо втрати напруги перевищують вхідну напругу, це критична ситуація
        if (voltageLoss >= voltage) {
            hasCritical = true;
        }

        const maxCurrentMap = { "0.5": 2, "0.75": 4, "1.0": 6, "1.5": 10, "2.5": 16, "4.0": 25, "6.0": 32, "10.0": 50, "16.0": 80 };
        let maxCurrent = 0; // Ініціалізація
         for (const [s, c] of Object.entries(maxCurrentMap)) {
            if (sectionValue >= parseFloat(s)) maxCurrent = c; else break;
        }

        if (calculatedPowerLossPercent > 10) hasWarnings = true;
        if (voltageLossPercent > 15) hasWarnings = true;
        if (maxCurrent > 0 && current > maxCurrent * 1.5) hasWarnings = true;


        if (calculatedPowerLossPercent > 10 || voltageLossPercent > 15 || (maxCurrent > 0 && current > maxCurrent * 1.5) ) {
            hasCritical = true;
        } else if (calculatedPowerLossPercent > 5 || voltageLossPercent > 5 || (maxCurrent > 0 && current > maxCurrent) || resistance > 100 /*maxSafeResistance*/) {
            hasWarnings = true; // hasWarnings вже може бути true, це нормально
        }
        
        let recommendedSection = sectionValue;
        if (hasWarnings || hasCritical) { // Рекомендація потрібна якщо є будь-які попередження або критичні помилки
            for (const [s, c] of Object.entries(maxCurrentMap)) {
                if (c >= current * 1.25) { recommendedSection = parseFloat(s); break; }
            }
             if (recommendedSection < sectionValue) recommendedSection = sectionValue; // Не рекомендувати менший переріз
        }


        let cableTypeText = cableTypeValue === 'standard' ? 'Звичайний кабель' : 'Вита пара';
        let pairModeText = '';
        if (cableTypeValue === 'twisted') {
            pairModeText = document.getElementById('pairMode').value === 'single' ? ' (одна пара)' : ' (дві пари)';
        }
        let metalTypeText = metalType === 'copper' ? 'Мідь (Cu)' : 'Алюміній (Al)';
        let voltageTypeText = voltageType === 'dc' ? 'Постійна (DC)' : 'Змінна (AC)';
                        
        let statusIcon, statusClass, statusText;
        if (hasCritical) {
            statusIcon = 'bi-exclamation-triangle-fill'; statusClass = 'danger'; statusText = 'Критичні параметри';
        } else if (hasWarnings) {
            statusIcon = 'bi-exclamation-triangle'; statusClass = 'warning'; statusText = 'Є зауваження';
        } else {
            statusIcon = 'bi-check-circle'; statusClass = 'success'; statusText = 'Параметри в нормі';
        }
        
        let resultContentHtml = `
            <table class="result-table">
               <i class="bi bi-ethernet"></i> <strong>Результати розрахунку</stong>
                <tr><td><i class="bi bi-diagram-3"></i> Тип кабелю:</td><td>${cableTypeText}${pairModeText}</td></tr>
                <tr><td><i class="bi bi-tools"></i> Матеріал:</td><td>${metalTypeText}</td></tr>
                <tr><td><i class="bi bi-arrows-angle-expand"></i> Переріз:</td><td><strong>${sectionValue.toFixed(2)} мм²</strong></td></tr>
                <tr><td><i class="bi bi-rulers"></i> Довжина:</td><td><strong>${cableLength} м</strong></td></tr>
                <tr><td><i class="bi bi-activity"></i> Опір:</td><td><strong>${resistance.toFixed(3)} Ом</strong></td></tr>
            </table>
            
            <table class="result-table">
                <i class="bi bi-lightning-charge-fill"></i> Електричні параметри <tr>
                <td><i class="bi bi-toggles"></i> Тип напруги:</td><td>${voltageTypeText}</td></tr>`;
        if (voltageType === 'ac') {
            resultContentHtml += `<tr><td><i class="bi bi-percent"></i> cos φ:</td><td><strong>${cosPhi.toFixed(2)}</strong></td></tr>`;
        }
        resultContentHtml += `
                <tr><td><i class="bi bi-lightning"></i> Напруга:</td><td><strong>${voltage.toFixed(1)} В</strong></td></tr>
                <tr><td><i class="bi bi-lightning-fill"></i> Струм:</td><td><strong>${current.toFixed(2)} А</strong></td></tr>
                <tr><td><i class="bi bi-battery-half"></i> Потужність:</td><td><strong>${power.toFixed(2)} Вт</strong></td></tr>
            </table>
            
            <table class="result-table">
                <caption><i class="bi bi-graph-down-arrow"></i> Втрати та ефективність</caption>
                <tr><td><i class="bi bi-lightning-charge"></i> Падіння напруги:</td><td><strong>${voltageLoss.toFixed(2)} В</strong> (<strong>${voltageLossPercent.toFixed(1)}%</strong>)</td></tr>
                <tr><td><i class="bi bi-plug"></i> Напруга на навантаженні:</td><td><strong>${voltageLoss >= voltage ? "відсутня" : loadVoltage.toFixed(2) + " В"}</strong> ${voltageLoss >= voltage ? "" : `(<strong>${(100 - voltageLossPercent).toFixed(1)}%</strong>)`}</td></tr>
                <tr><td><i class="bi bi-fire"></i> Втрати потужності:</td><td><strong>${powerLoss.toFixed(2)} Вт</strong> (<strong>${calculatedPowerLossPercent.toFixed(1)}%</strong>)</td></tr>
                <tr><td><i class="bi bi-lightbulb"></i> Потужність на навантаженні:</td><td><strong>${voltageLoss >= voltage ? "відсутня" : loadPower.toFixed(2) + " Вт"}</strong> ${voltageLoss >= voltage ? "" : `(<strong>${(100 - calculatedPowerLossPercent).toFixed(1)}%</strong>)`}</td></tr>
            </table>
            
            <table class="result-table">
                <caption><i class="bi bi-shield-check"></i> Оцінка та рекомендації</caption>
                <tr><td colspan="2" style="padding: 1px 0;"><div class="result-checks">
                    <div class="check-item ${statusClass}">
                        <i class="bi ${statusIcon}"></i>
                        <div class="check-text">
                            <strong>${statusText}</strong>
                            <span>${getStatusDescription(hasCritical, hasWarnings)}</span>
                        </div>
                    </div>`;
        
        // Рекомендації залишаються без змін, оскільки вони вже мають відповідні іконки
        if (calculatedPowerLossPercent > 10) {
            resultContentHtml += getRecommendationHTML('danger', 'Критичні втрати потужності', `${calculatedPowerLossPercent.toFixed(1)}%`, 'Значно збільшіть переріз або зменшіть довжину.');
        } else if (calculatedPowerLossPercent > 5) {
            resultContentHtml += getRecommendationHTML('warning', 'Підвищені втрати потужності', `${calculatedPowerLossPercent.toFixed(1)}%`, 'Рекомендовано збільшити переріз кабелю.');
        }
        
        if (voltageLossPercent > 15) {
            resultContentHtml += getRecommendationHTML('danger', 'Критичне падіння напруги', `${voltageLossPercent.toFixed(1)}%`, 'Обладнання може працювати некоректно.');
        } else if (voltageLossPercent > 5) {
            resultContentHtml += getRecommendationHTML('warning', 'Значне падіння напруги', `${voltageLossPercent.toFixed(1)}%`, 'Розгляньте збільшення перерізу.');
        }
        
        if (maxCurrent > 0 && current > maxCurrent * 1.5) {
            resultContentHtml += getRecommendationHTML('danger', 'Небезпечно високий струм', `${current.toFixed(1)}А для ${sectionValue.toFixed(2)}мм² (макс. ${maxCurrent * 1.5}А)`, 'Ризик перегріву та пожежі!');
        } else if (maxCurrent > 0 && current > maxCurrent) {
            resultContentHtml += getRecommendationHTML('warning', 'Підвищений струм', `${current.toFixed(1)}А для ${sectionValue.toFixed(2)}мм² (макс. ${maxCurrent}А)`, `Рекомендований переріз: ${recommendedSection.toFixed(2)}мм².`);
        }
        
        if (resistance > 100) { // maxSafeResistance
            resultContentHtml += getRecommendationHTML('warning', 'Високий опір кабелю', `${resistance.toFixed(1)} Ом`, 'Може спричинити нестабільну роботу.');
        }

        if (!hasCritical && !hasWarnings) {
             resultContentHtml += getRecommendationHTML('success', 'Оптимальні параметри', `Втрати в нормі. Переріз ${sectionValue.toFixed(2)}мм² підходить.`, '');
        } else if (recommendedSection > sectionValue && (hasWarnings || hasCritical)) {
             resultContentHtml += getRecommendationHTML('info', 'Рекомендація щодо перерізу', `Для зниження втрат та/або струмового навантаження, розгляньте переріз ${recommendedSection.toFixed(2)} мм².`, '');
        }
        
        resultContentHtml += `</div></td></tr></table>`;
        
        document.getElementById('cableLossResultContent').innerHTML = resultContentHtml;
        document.getElementById('cableLossResult').style.display = 'block';
        document.getElementById('cableLossResult').scrollIntoView({ behavior: 'smooth' });
    });
});

function getStatusDescription(hasCritical, hasWarnings) {
    if (hasCritical) return 'Виявлено критичні параметри. Необхідно внести зміни.';
    if (hasWarnings) return 'Є зауваження до параметрів. Рекомендується перевірка.';
    return 'Всі розрахункові параметри в межах допустимих норм.';
}

function getRecommendationHTML(type, title, description, recommendation) {
    let icon = type === 'danger' ? 'bi-exclamation-triangle-fill' : 
              (type === 'warning' ? 'bi-exclamation-triangle' : 
              (type === 'info' ? 'bi-info-circle-fill' : 'bi-check-circle-fill'));
    let recommendationText = recommendation ? `<span><i class="bi bi-arrow-right-short"></i> <strong>${recommendation}</strong></span>` : '';
    return `
        <div class="check-item ${type}">
            <i class="bi ${icon}"></i>
            <div class="check-text">
                <strong>${title}</strong>
                <span>${description}</span>
                ${recommendationText}
            </div>
        </div>`;
}
