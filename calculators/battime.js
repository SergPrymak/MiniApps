let tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp
    tg.expand();
    
    // Add device button
    document.getElementById('add-device').addEventListener('click', addDeviceRow);
    
    // Form submission
    document.getElementById('battime-calculator-form').addEventListener('submit', calculateBatteryTime);
});

function addDeviceRow() {
    const devicesContainer = document.getElementById('devices-container');
    const deviceCount = devicesContainer.children.length + 1;
    
    const deviceDiv = document.createElement('div');
    deviceDiv.className = 'form-group device-group';
    
    deviceDiv.innerHTML = `
        <label>Пристрій ${deviceCount}:</label>
        <div style="display: flex; gap: 8px;">
            <input type="number" min="1" class="device-count" placeholder="Кількість" required>
            <input type="number" min="0.1" step="0.1" class="device-power" placeholder="Споживання (Вт)" required>
            <button type="button" class="remove-device" style="width: auto; padding: 0 10px;">×</button>
        </div>
    `;
    
    devicesContainer.appendChild(deviceDiv);
    
    // Add event listener to remove button
    deviceDiv.querySelector('.remove-device').addEventListener('click', function() {
        devicesContainer.removeChild(deviceDiv);
    });
}

function calculateBatteryTime(e) {
    e.preventDefault();
    
    // Get capacity and voltage
    const capacity = parseFloat(document.getElementById('capacity').value);
    const voltage = parseFloat(document.getElementById('voltage').value);
    
    if (isNaN(capacity) || capacity <= 0 || isNaN(voltage) || voltage <= 0) {
        alert('Ємність та напруга повинні бути більше 0');
        return;
    }
    
    // Get devices
    const deviceGroups = document.querySelectorAll('.device-group');
    let totalWatts = 0;
    let devices = [];
    
    deviceGroups.forEach(group => {
        const count = parseInt(group.querySelector('.device-count').value);
        const watts = parseFloat(group.querySelector('.device-power').value);
        
        if (isNaN(count) || count <= 0 || isNaN(watts) || watts <= 0) {
            alert('Кількість та споживання повинні бути більше 0');
            return;
        }
        
        const deviceTotalWatts = count * watts;
        totalWatts += deviceTotalWatts;
        devices.push(`${count}× ${watts}W`);
    });
    
    if (totalWatts <= 0) {
        alert('Сумарне споживання не може бути 0');
        return;
    }
    
    // Calculate energy and time
    const energyWh = (voltage <= 4) ? (capacity * voltage / 1000) : (capacity * voltage);
    const hours = energyWh / totalWatts;
    
    // Format time as hours and minutes
    const hoursInt = Math.floor(hours);
    const minutes = Math.floor((hours - hoursInt) * 60);
    const timeFormatted = `${hoursInt} год ${minutes} хв`;
    
    // Display results
    const resultDiv = document.getElementById('result');
    const capacityUnit = voltage < 4 ? 'mAh' : 'Ah';
    
    resultDiv.innerHTML = `
        <h2>Результати розрахунку:</h2>
        <p><strong>Акумулятор:</strong> ${capacity.toFixed(0)}${capacityUnit} ${voltage}V</p>
        <p><strong>Пристрої:</strong> ${devices.join(' + ')}</p>
        <p><strong>Споживання:</strong> ${totalWatts}W</p>
        <p><strong>Доступна енергія:</strong> ${energyWh.toFixed(2)}Wh</p>
        <h3>Тривалість роботи:</h3>
        <p>${timeFormatted}</p>
        <p><em>Примітка: Реальний час може бути меншим через втрати та спрацювання АКБ</em></p>
    `;
    
    resultDiv.style.display = 'block';
    
    // Send data back to Telegram if needed
    tg.MainButton.setText('Готово');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        tg.sendData(JSON.stringify({
            calculator: 'battime',
            capacity: capacity,
            voltage: voltage,
            totalWatts: totalWatts,
            runTime: timeFormatted
        }));
    });
}
