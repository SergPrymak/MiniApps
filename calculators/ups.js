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
    
    // Активний режим (за замовчуванням - розрахунок ємності)
    let activeMode = 'capacity-mode';
    
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
            resultContainer.style.display = 'none';
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
                <label>Пристрій ${deviceCount}:</label>
                <button type="button" class="remove-device" style="border: none; background: none; color: red; cursor: pointer;">✖</button>
            </div>
            <div style="display: flex; gap: 8px;">
                <input type="number" min="1" class="device-count" placeholder="Кількість" required>
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

    // Обробка відправки форми
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Збір даних про пристрої
        const deviceGroups = document.querySelectorAll('.device-group');
        const devices = [];
        
        deviceGroups.forEach(group => {
            const count = parseFloat(group.querySelector('.device-count').value);
            const power = parseFloat(group.querySelector('.device-power').value);
            
            if (!isNaN(count) && !isNaN(power)) {
                devices.push({ count, power });
            }
        });
        
        // Перевірка наявності пристроїв
        if (devices.length === 0) {
            alert('Додайте хоча б один пристрій');
            return;
        }
        
        // Розрахунок загальної потужності
        const totalPower = devices.reduce((sum, device) => sum + (device.count * device.power), 0);
        
        let resultHTML = '';
        
        if (activeMode === 'capacity-mode') {
            // Режим розрахунку ємності АКБ
            const hours = parseFloat(document.getElementById('hours').value);
            
            if (isNaN(hours)) {
                alert('Введіть коректний час роботи');
                return;
            }
            
            // Розрахунок ємності (з урахуванням ефективності інвертора 0.85)
            const capacityWh = (totalPower * hours) / 0.85;
            const capacity12V = capacityWh / 12;
            const capacity24V = capacityWh / 24;
            
            resultHTML = `
                <h3>Результати розрахунку:</h3>
                <p>Загальна потужність: <strong>${totalPower.toFixed(1)} Вт</strong></p>
                <p>Необхідна ємність акумуляторів для роботи протягом ${hours} год:</p>
                <ul>
                    <li>При напрузі 12V: <strong>${capacity12V.toFixed(1)} Ah</strong></li>
                    <li>При напрузі 24V: <strong>${capacity24V.toFixed(1)} Ah</strong></li>
                    <li>Загальна ємність: <strong>${capacityWh.toFixed(1)} Wh</strong></li>
                </ul>
            `;
            
        } else {
            // Режим розрахунку часу роботи
            const capacity = parseFloat(document.getElementById('battery-capacity').value);
            const voltage = parseFloat(document.getElementById('battery-voltage').value);
            
            if (isNaN(capacity) || isNaN(voltage)) {
                alert('Введіть коректні значення ємності та напруги АКБ');
                return;
            }
            
            // Розрахунок часу роботи (з урахуванням ефективності інвертора 0.85)
            const capacityWh = capacity * voltage;
            const runtimeHours = (capacityWh * 0.85) / totalPower;
            const runtimeMinutes = Math.floor((runtimeHours % 1) * 60);
            
            resultHTML = `
                <h3>Результати розрахунку:</h3>
                <p>Загальна потужність: <strong>${totalPower.toFixed(1)} Вт</strong></p>
                <p>Ємність АКБ: <strong>${capacity} Ah</strong> при <strong>${voltage}V</strong> (${capacityWh.toFixed(1)} Wh)</p>
                <p>Розрахунковий час роботи: <strong>${Math.floor(runtimeHours)} год ${runtimeMinutes} хв</strong></p>
            `;
        }
        
        resultContainer.innerHTML = resultHTML;
        resultContainer.style.display = 'block';
    });
});
