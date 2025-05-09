// Tab switching
const capacityTabBtn = document.getElementById('capacityTabBtn');
const timeTabBtn = document.getElementById('timeTabBtn');
const capacityTab = document.getElementById('capacityTab');
const timeTab = document.getElementById('timeTab');

// Set default active tab
capacityTabBtn.classList.add('active');

capacityTabBtn.onclick = function() {
    capacityTabBtn.classList.add('active');
    timeTabBtn.classList.remove('active');
    capacityTab.style.display = '';
    timeTab.style.display = 'none';
};

timeTabBtn.onclick = function() {
    timeTabBtn.classList.add('active');
    capacityTabBtn.classList.remove('active');
    timeTab.style.display = '';
    capacityTab.style.display = 'none';
};

// Battery voltage selector
const v12Btn = document.getElementById('v12Btn');
const v37Btn = document.getElementById('v37Btn');
const voltageInput = document.getElementById('voltage');
const capacityInput = document.getElementById('capacity');

// Додамо клас active для v12Btn за замовчуванням
v12Btn.classList.add('active');

v12Btn.onclick = function() {
    v12Btn.classList.add('active');
    v37Btn.classList.remove('active');
    voltageInput.value = '12';
    // Adjust placeholder and default value when switching to 12V (Ah)
    if (capacityInput.value > 1000) {
        capacityInput.value = Math.round(capacityInput.value / 1000);
    }
};

v37Btn.onclick = function() {
    v37Btn.classList.add('active');
    v12Btn.classList.remove('active');
    voltageInput.value = '3.7';
    // Adjust placeholder and default value when switching to 3.7V (mAh)
    if (capacityInput.value < 1000) {
        capacityInput.value = capacityInput.value * 1000;
    }
};

// Add/remove device rows
function addDeviceItem(containerId) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'device-row';
    row.innerHTML = `
        <input type="number" class="device-input device-count" min="1" value="1" required placeholder="К-сть" style="width: 80px;">
        <input type="number" class="device-input" min="1" value="4" required placeholder="Споживання (Вт)" style="flex-grow: 1;">
        <button type="button" class="remove-btn" tabindex="-1" aria-label="Видалити"><i class="bi bi-x-circle"></i></button>
    `;
    row.querySelector('.remove-btn').onclick = function() {
        if (container.querySelectorAll('.device-row').length > 1) row.remove();
    };
    container.appendChild(row);
}

document.getElementById('addDeviceCapacity').onclick = function() { 
    addDeviceItem('devicesCapacity'); 
};

document.getElementById('addDeviceTime').onclick = function() { 
    addDeviceItem('devicesTime'); 
};

// Remove device row for initial rows
document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = function() {
        const container = btn.closest('div[id^="devices"]');
        if (container.querySelectorAll('.device-row').length > 1) 
            btn.closest('.device-row').remove();
    };
});

// Parse device data
function parseDeviceData(containerId) {
    const container = document.getElementById(containerId);
    let total_power = 0;
    let total_devices = 0;
    let device_details = [];
    container.querySelectorAll('.device-row').forEach(item => {
        const count = parseInt(item.querySelector('.device-count').value) || 0;
        const power = parseInt(item.querySelectorAll('.device-input')[1].value) || 0;
        if (count > 0 && power > 0) {
            total_devices += count;
            total_power += count * power;
            device_details.push(`${count} × ${power} Вт`);
        }
    });
    return { total_power, total_devices, device_details };
}

// Battery Capacity Calculation
document.getElementById('capacityCalcForm').onsubmit = function(e) {
    e.preventDefault();
    try {
        const hours = parseFloat(document.getElementById('hours').value);
        if (hours <= 0) throw new Error("Час автономії має бути більше 0");
        const { total_power, total_devices, device_details } = parseDeviceData('devicesCapacity');
        if (total_devices === 0) throw new Error("Додайте хоча б один пристрій з потужністю");
        // Розрахунок необхідної ємності акумуляторів
        const total_wh = total_power * hours; // Ват-години
        // Для 12V системи (Ah)
        const ah_12v = total_wh / 12;
        // Для 3.7V системи (mAh)
        const mah_37v = (total_wh / 3.7) * 1000;
        document.getElementById('capacityResultContent').innerHTML = `
            <div class="result-header"><i class="bi bi-bar-chart-fill"></i> <strong>Результати розрахунку:</strong></div>
            <table class="result-table zebra-table">
                <tr>
                    <td><i class="bi bi-clock"></i> Час автономії:</td>
                    <td><strong>${hours} годин</strong></td>
                </tr>
                <tr>
                    <td><i class="bi bi-pc-display"></i> Всього пристроїв:</td>
                    <td><strong>${total_devices}</strong></td>
                </tr>
                <tr>
                    <td colspan="2"><i class="bi bi-list-check"></i> Конфігурація пристроїв:</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <ul style="margin:4px 0 8px 20px;padding:0;">
                            ${device_details.map(d => `<li>${d}</li>`).join('')}
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><i class="bi bi-lightning"></i> Загальне споживання:</td>
                    <td><strong>${total_power} Вт</strong></td>
                </tr>
                <tr>
                    <td><i class="bi bi-plug"></i> Загальна потреба в енергії:</td>
                    <td><strong>${total_wh.toFixed(2)} Wh</strong></td>
                </tr>
                <tr class="highlight-row">
                    <td><i class="bi bi-battery-full"></i> Для 12V системи:</td>
                    <td><strong>${ah_12v.toFixed(2)} Ah</strong></td>
                </tr>
                <tr class="highlight-row">
                    <td><i class="bi bi-battery-half"></i> Для 3.7V (Li-Ion):</td>
                    <td><strong>${Math.round(mah_37v)} mAh</strong></td>
                </tr>
            </table>
        `;
        document.getElementById('capacityResult').style.display = '';
    } catch (err) {
        alert("Помилка: " + err.message);
    }
};

// Battery Runtime Calculation
document.getElementById('timeCalcForm').onsubmit = function(e) {
    e.preventDefault();
    try {
        const capacity = parseFloat(document.getElementById('capacity').value);
        if (capacity <= 0) throw new Error("Ємність АКБ має бути більше 0");
        const voltage = parseFloat(document.getElementById('voltage').value);
        const { total_power, total_devices, device_details } = parseDeviceData('devicesTime');
        if (total_devices === 0) throw new Error("Додайте хоча б один пристрій з потужністю");
        if (total_power <= 0) throw new Error("Загальне споживання має бути більше 0");
        // Розрахунок часу автономної роботи від акумулятора
        // Якщо напруга 3.7V, ємність в mAh, переводимо в Ah
        const energy_wh = (voltage <= 4) ? 
            (capacity * voltage / 1000) : // Для Li-Ion (mAh)
            (capacity * voltage);          // Для звичайних АКБ (Ah)
        const hours = energy_wh / total_power;
        const hours_int = Math.floor(hours);
        const minutes = Math.round((hours - hours_int) * 60);
        const capacity_unit = (voltage <= 4) ? 'mAh' : 'Ah';
        document.getElementById('timeResultContent').innerHTML = `
            <div class="result-header"><i class="bi bi-bar-chart-fill"></i> <strong>Результати розрахунку:</strong></div>
            <table class="result-table zebra-table">
                <tr>
                    <td><i class="bi bi-battery-full"></i> Ємність акумулятора:</td>
                    <td><strong>${capacity} ${capacity_unit} / ${voltage}V</strong></td>
                </tr>
                <tr>
                    <td><i class="bi bi-pc-display"></i> Всього пристроїв:</td>
                    <td><strong>${total_devices}</strong></td>
                </tr>
                <tr>
                    <td colspan="2"><i class="bi bi-list-check"></i> Конфігурація пристроїв:</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <ul style="margin:4px 0 8px 20px;padding:0;">
                            ${device_details.map(d => `<li>${d}</li>`).join('')}
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><i class="bi bi-lightning"></i> Загальне споживання:</td>
                    <td><strong>${total_power} Вт</strong></td>
                </tr>
                <tr>
                    <td><i class="bi bi-plug"></i> Доступна енергія:</td>
                    <td><strong>${energy_wh.toFixed(2)} Wh</strong></td>
                </tr>
                <tr class="highlight-row">
                    <td><i class="bi bi-clock"></i> Тривалість роботи:</td>
                    <td><strong>${hours_int} год ${minutes} хв</strong></td>
                </tr>
                <tr class="note-row">
                    <td colspan="2"><i class="bi bi-exclamation-circle"></i> Реальний час може бути меншим через втрати та спрацювання АКБ</td>
                </tr>
            </table>
        `;
        document.getElementById('timeResult').style.display = '';
    } catch (err) {
        alert("Помилка: " + err.message);
    }
};
