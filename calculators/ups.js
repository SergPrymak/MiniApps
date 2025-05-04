document.addEventListener('DOMContentLoaded', function() {
    // Ініціалізація Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.expand();
        tg.ready();
    }

    // Елементи інтерфейсу
    const form = document.getElementById('ups-calculator-form');
    const addDeviceBtn = document.getElementById('add-device');
    const devicesContainer = document.getElementById('devices-container');
    const resultContainer = document.getElementById('result');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const calculationModes = document.querySelectorAll('.calculation-mode');
    const batteryTypeSelector = document.getElementById('battery-type');
    const calculateBtn = document.getElementById('calculate-btn');
    
    // Діагностика
    console.log("Форма знайдена:", form !== null);
    console.log("Кнопка розрахунку знайдена:", calculateBtn !== null);
    
    // Перевірка наявності всіх необхідних елементів
    if (!form) console.error("Форма не знайдена!");
    if (!resultContainer) console.error("Контейнер результатів не знайдений!");
    if (!calculateBtn) console.error("Кнопка розрахунку не знайдена!");
    
    // Активний режим (за замовчуванням - розрахунок ємності)
    let activeMode = 'capacity-mode';
    
    // Перемикання між типами батарей
    if (batteryTypeSelector) {
        batteryTypeSelector.addEventListener('change', function() {
            const upsInputs = document.querySelectorAll('.battery-input-ups');
            const mobileInputs = document.querySelectorAll('.battery-input-mobile');
            
            if (this.value === 'ups') {
                upsInputs.forEach(el => el.style.display = 'block');
                mobileInputs.forEach(el => el.style.display = 'none');
                
                // Просто знімаємо required, замість відключення полів
                document.getElementById('mobile-capacity').required = false;
                document.getElementById('battery-capacity').required = true;
            } else {
                mobileInputs.forEach(el => el.style.display = 'block');
                upsInputs.forEach(el => el.style.display = 'none');
                
                // Просто знімаємо required, замість відключення полів
                document.getElementById('battery-capacity').required = false;
                document.getElementById('mobile-capacity').required = true;
            }
        });
        
        // Ініціалізуємо стан полів при завантаженні
        if (batteryTypeSelector.value === 'ups') {
            document.querySelectorAll('.battery-input-mobile input').forEach(input => input.disabled = true);
        } else {
            document.querySelectorAll('.battery-input-ups input').forEach(input => input.disabled = true);
        }
    }
    
    // Перемикання між режимами
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const selectedMode = this.dataset.mode;
            
            // Оновлення активних кнопок
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Оновлення активного режиму
            calculationModes.forEach(mode => {
                mode.classList.remove('active');
                if (mode.id === selectedMode) {
                    mode.classList.add('active');
                }
            });
            
            activeMode = selectedMode;
            
            // Скидання форми при зміні режиму
            form.reset();
            resultContainer.style.display = 'none';
            
            // Ініціалізуємо стан полів при зміні режиму
            if (activeMode === 'time-mode') {
                if (batteryTypeSelector.value === 'ups') {
                    document.querySelectorAll('.battery-input-mobile input').forEach(input => input.disabled = true);
                    document.querySelectorAll('.battery-input-ups input').forEach(input => input.disabled = false);
                } else {
                    document.querySelectorAll('.battery-input-ups input').forEach(input => input.disabled = true);
                    document.querySelectorAll('.battery-input-mobile input').forEach(input => input.disabled = false);
                }
            }
        });
    });

    // Додавання нового пристрою
    let deviceCount = 1;
    addDeviceBtn.addEventListener('click', function() {
        deviceCount++;
        
        const deviceGroup = document.createElement('div');
        deviceGroup.className = 'form-group device-group';
        
        deviceGroup.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center">
                <label style="white-space: nowrap;">Пристрій ${deviceCount}:</label>
                <button type="button" class="remove-device" style="border: none; background: none; color: red; cursor: pointer;">✖</button>
            </div>
            <div style="display: flex; gap: 8px;">
                <input type="number" min="1" value="1" class="device-count" placeholder="Кількість" required>
                <input type="number" min="0.1" step="0.1" class="device-power" placeholder="Споживання (Вт)" required>
            </div>
        `;
        
        devicesContainer.appendChild(deviceGroup);
        
        // Додаємо обробник для видалення пристрою
        const removeBtn = deviceGroup.querySelector('.remove-device');
        removeBtn.addEventListener('click', function() {
            deviceGroup.remove();
        });
    });

    // Обробка кнопки розрахунку (замість обробки відправки форми)
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            calculateResults();
        });
    }
    
    // Функція для проведення розрахунків
    function calculateResults() {
        console.log("Починаю розрахунок. Активний режим:", activeMode);
        
        try {
            // Збір даних про пристрої
            const deviceGroups = document.querySelectorAll('.device-group');
            const devices = [];
            
            deviceGroups.forEach(group => {
                const countInput = group.querySelector('.device-count');
                const powerInput = group.querySelector('.device-power');
                
                if (!countInput || !powerInput) {
                    console.error('Не знайдені поля для введення кількості або потужності');
                    return;
                }
                
                const count = parseFloat(countInput.value);
                const power = parseFloat(powerInput.value);
                
                if (!isNaN(count) && !isNaN(power)) {
                    devices.push({ count, power });
                }
            });
            
            console.log('Пристрої:', devices);
            
            // Перевірка наявності пристроїв
            if (devices.length === 0) {
                alert('Додайте хоча б один пристрій');
                return;
            }
            
            // Розрахунок загальної потужності
            const totalPower = devices.reduce((sum, device) => sum + (device.count * device.power), 0);
            console.log('Загальна потужність:', totalPower);
            
            let resultHTML = '';
            
            if (activeMode === 'capacity-mode') {
                // Режим розрахунку ємності АКБ
                const hoursInput = document.getElementById('hours');
                
                if (!hoursInput) {
                    console.error('Не знайдено поле для введення годин');
                    alert('Помилка: не знайдено поле для введення годин');
                    return;
                }
                
                if (!hoursInput.value) {
                    alert('Введіть час роботи');
                    hoursInput.focus();
                    return;
                }
                
                const hours = parseFloat(hoursInput.value);
                
                if (isNaN(hours)) {
                    alert('Введіть коректний час роботи');
                    hoursInput.focus();
                    return;
                }
                
                console.log('Години:', hours);
                
                const capacityWh = (totalPower * hours);
                const capacity12V = capacityWh / 12;
                const capacity24V = capacityWh / 24;
                const capacity3_7V = (capacityWh / 3.7) * 1000; // Конвертація в mAh для 3.7V
                
                resultHTML = `
                    <h3>Результати розрахунку:</h3>
                    <p>Загальна потужність: <strong>${totalPower.toFixed(1)} Вт</strong></p>
                    <p>Необхідна ємність акумуляторів для роботи протягом ${hours} год:</p>
                    <ul>
                        <li>UPS батарея 12V: <strong>${capacity12V.toFixed(1)} Ah</strong></li>
                        <li>UPS батарея 24V: <strong>${capacity24V.toFixed(1)} Ah</strong></li>
                        <li>DC UPS 3.7V: <strong>${Math.round(capacity3_7V)} mAh</strong></li>
                        <li>Загальна ємність: <strong>${capacityWh.toFixed(1)} Wh</strong></li>
                    </ul>
                `;
                
            } else {
                // Режим розрахунку часу роботи
                const batteryTypeSelect = document.getElementById('battery-type');
                console.log("Тип батареї:", batteryTypeSelect ? batteryTypeSelect.value : "не знайдено");
                
                if (!batteryTypeSelect) {
                    console.error('Не знайдено селектор типу батареї');
                    alert('Помилка: не знайдено селектор типу батареї');
                    return;
                }
                
                const batteryType = batteryTypeSelect.value;
                let capacityWh = 0;
                let capacityInfo = '';
                
                if (batteryType === 'ups') {
                    const capacityInput = document.getElementById('battery-capacity');
                    console.log("Знайдено поле ємності UPS:", capacityInput ? "так" : "ні");
                    console.log("Значення поля:", capacityInput ? capacityInput.value : "N/A");
                    
                    if (!capacityInput) {
                        console.error('Не знайдено поле для ємності UPS батареї');
                        alert('Помилка: не знайдено поле для ємності UPS батареї');
                        return;
                    }
                    
                    if (!capacityInput.value) {
                        alert('Введіть ємність АКБ');
                        capacityInput.focus();
                        return;
                    }
                    
                    const capacity = parseFloat(capacityInput.value);
                    const voltage = 12; // Фіксована напруга для UPS батареї
                    
                    if (isNaN(capacity)) {
                        alert('Введіть коректне значення ємності АКБ');
                        capacityInput.focus();
                        return;
                    }
                    
                    capacityWh = capacity * voltage;
                    capacityInfo = `<p>Ємність АКБ: <strong>${capacity} Ah</strong> при <strong>${voltage}V</strong> (${capacityWh.toFixed(1)} Wh)</p>`;
                } else {
                    const mobileCapacityInput = document.getElementById('mobile-capacity');
                    console.log("Знайдено поле ємності DC UPS:", mobileCapacityInput ? "так" : "ні");
                    console.log("Значення поля:", mobileCapacityInput ? mobileCapacityInput.value : "N/A");
                    
                    if (!mobileCapacityInput) {
                        console.error('Не знайдено поле для ємності DC UPS');
                        alert('Помилка: не знайдено поле для ємності DC UPS');
                        return;
                    }
                    
                    if (!mobileCapacityInput.value) {
                        alert('Введіть ємність DC UPS');
                        mobileCapacityInput.focus();
                        return;
                    }
                    
                    const mobileCapacity = parseFloat(mobileCapacityInput.value);
                    const voltage = 3.7; // Фіксована напруга для DC UPS
                    
                    if (isNaN(mobileCapacity)) {
                        alert('Введіть коректне значення ємності DC UPS');
                        mobileCapacityInput.focus();
                        return;
                    }
                    
                    capacityWh = (mobileCapacity / 1000) * voltage;
                    capacityInfo = `<p>Ємність DC UPS: <strong>${mobileCapacity} mAh</strong> при <strong>${voltage}V</strong> (${capacityWh.toFixed(1)} Wh)</p>`;
                }
                
                // Перевірка наявності пристроїв перед розрахунком
                if (devices.length === 0) {
                    alert('Додайте хоча б один пристрій зі споживанням');
                    return;
                }
                
                // Розрахунок часу роботи (з урахуванням ефективності інвертора 0.85)
                const runtimeHours = (capacityWh * 0.85) / totalPower;
                const runtimeMinutes = Math.floor((runtimeHours % 1) * 60);
                
                resultHTML = `
                    <h3>Результати розрахунку:</h3>
                    <p>Загальна потужність: <strong>${totalPower.toFixed(1)} Вт</strong></p>
                    ${capacityInfo}
                    <p>Розрахунковий час роботи: <strong>${Math.floor(runtimeHours)} год ${runtimeMinutes} хв</strong></p>
                `;
            }
            
            console.log('Результат готовий до відображення');
            resultContainer.innerHTML = resultHTML;
            resultContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Помилка при розрахунку:', error);
            alert('Сталася помилка при розрахунку: ' + error.message);
        }
    }

    // Видаляємо обробник submit форми, оскільки тепер використовуємо кнопку
    // form.addEventListener('submit', function(e) { ... });

    console.log('Скрипт ініціалізовано');
});
