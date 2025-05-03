let tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp
    tg.expand();
    
    // Add device button
    document.getElementById('add-device').addEventListener('click', addDeviceRow);
    
    // Form submission
    document.getElementById('ups-calculator-form').addEventListener('submit', calculateUPS);
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

function calculateUPS(e) {
    e.preventDefault();
    
    // Get hours
    const hours = parseFloat(document.getElementById('hours').value);
    if (isNaN(hours) || hours <= 0) {
        alert('Кількість годин повинна бути більше 0');
        return;
    }
    
    // Get devices
    const deviceGroups = document.querySelectorAll('.device-group');
    let totalPower = 0;
    let devicesInfo = [];
    
    deviceGroups.forEach(group => {
        const count = parseInt(group.querySelector('.device-count').value);
        const power = parseFloat(group.querySelector('.device-power').value);
        
        if (isNaN(count) || count <= 0 || isNaN(power) || power <= 0) {
            alert('Кількість та споживання повинні бути більше 0');
            return;
        }
        
        const deviceTotalPower = count * power;
        totalPower += deviceTotalPower;
        devicesInfo.push(`${count}× ${power}W = ${deviceTotalPower}W`);
    });
    
    // Calculate results
    const totalWh = totalPower * hours;
    const ah12v = totalWh / 12;
    const mah37v = (totalWh / 3.7) * 1000;
    
    // Display results
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <h2>Результати розрахунку:</h2>
        <p><strong>Необхідний час роботи:</strong> ${hours} год</p>
        <p><strong>Конфігурація пристроїв:</strong></p>
        <ul>
            ${devicesInfo.map(info => `<li>${info}</li>`).join('')}
        </ul>
        <p><strong>Загальне споживання:</strong> ${totalPower}W</p>
        <p><strong>Загальна потреба в енергії:</strong> ${totalWh.toFixed(2)} Wh</p>
        <h3>Необхідна ємність:</h3>
        <p>- Для 12V системи: ${ah12v.toFixed(2)} Ah</p>
        <p>- Для 3.7V системи (Li-Ion): ${Math.round(mah37v)} mAh</p>
    `;
    
    resultDiv.style.display = 'block';
    
    // Send data back to Telegram if needed
    tg.MainButton.setText('Готово');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        tg.sendData(JSON.stringify({
            calculator: 'ups',
            hours: hours,
            totalPower: totalPower,
            ah12v: ah12v.toFixed(2),
            mah37v: Math.round(mah37v)
        }));
    });
}
