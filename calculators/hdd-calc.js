// Tab switching
const capacityTabBtn = document.getElementById('capacityTabBtn');
const daysTabBtn = document.getElementById('daysTabBtn');
const capacityTab = document.getElementById('capacityTab');
const daysTab = document.getElementById('daysTab');

// Set default active tab
capacityTabBtn.style.background = '#2563eb';

capacityTabBtn.onclick = function() {
    capacityTabBtn.style.background = '#2563eb';
    daysTabBtn.style.background = '#3b82f6';
    capacityTab.style.display = '';
    daysTab.style.display = 'none';
};

daysTabBtn.onclick = function() {
    daysTabBtn.style.background = '#2563eb';
    capacityTabBtn.style.background = '#3b82f6';
    daysTab.style.display = '';
    capacityTab.style.display = 'none';
};

// Add/remove camera rows
function addCameraItem(containerId) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'device-row';
    row.innerHTML = `
        <input type="number" class="device-input camera-count" min="1" value="1" required placeholder="К-сть" style="width: 80px; min-width: 60px; max-width: 110px;">
        <input type="number" class="device-input" min="128" value="2048" required placeholder="Бітрейт (Kbps)" style="flex-grow: 1; min-width: 120px; max-width: calc(100% - 140px);">
        <button type="button" class="remove-btn" tabindex="-1" aria-label="Видалити"><i class="bi bi-x-circle"></i></button>
    `;
    
    row.querySelector('.remove-btn').onclick = function() {
        if (container.querySelectorAll('.device-row').length > 1) row.remove();
    };
    
    container.appendChild(row);
}

document.getElementById('addCameraHdd').onclick = function() { 
    addCameraItem('camerasHdd'); 
};

document.getElementById('addCameraDays').onclick = function() { 
    addCameraItem('camerasDays'); 
};

// Remove camera row for initial rows
document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = function() {
        const container = btn.closest('div[id^="cameras"]');
        if (container.querySelectorAll('.device-row').length > 1) 
            btn.closest('.device-row').remove();
    };
});

// Parse camera data
function parseCameraData(containerId) {
    const container = document.getElementById(containerId);
    let total_bitrate = 0;
    let total_cameras = 0;
    let camera_details = [];
    
    container.querySelectorAll('.device-row').forEach(item => {
        const count = parseInt(item.querySelector('.camera-count').value) || 0;
        const bitrate = parseInt(item.querySelectorAll('.device-input')[1].value) || 0;
        
        if (count > 0 && bitrate > 0) {
            total_cameras += count;
            total_bitrate += count * bitrate;
            camera_details.push(`${count} × ${bitrate} Kbps (${((count * bitrate) / 1024).toFixed(1)} Mbps)`);
        }
    });
    
    return { total_bitrate, total_cameras, camera_details };
}

// HDD Size Calculation
document.getElementById('hddCalcForm').onsubmit = function(e) {
    e.preventDefault();
    try {
        const days = parseInt(document.getElementById('days').value);
        if (days <= 0) throw new Error("Кількість днів має бути більше 0");
        
        const { total_bitrate, total_cameras, camera_details } = parseCameraData('camerasHdd');
        if (total_cameras === 0) throw new Error("Додайте хоча б одну камеру з бітрейтом");
        
        // Формула розрахунку (біти -> байти -> кілобайти -> мегабайти -> гігабайти -> терабайти)
        const total_bits = total_bitrate * days * 24 * 60 * 60;
        const total_tb = total_bits / 8 / 1024 / 1024 / 1024;
        
        document.getElementById('hddResultContent').innerHTML = `
            <div><i class="bi bi-bar-chart-fill result-cctvicon"></i> <strong>Результати розрахунку:</strong></div>
            <table class="result-cctvtable zebra-table">
                <tr>
                    <td class="label"><i class="bi bi-calendar3"></i> Глибина архіву:</td>
                    <td class="value">${days} днів</td>
                </tr>
                <tr>
                    <td class="label"><i class="bi bi-camera-video"></i> Камер загалом:</td>
                    <td class="value">${total_cameras}</td>
                </tr>
                <tr>
                    <td class="label"><i class="bi bi-list-check"></i> Конфігурація камер:</td>
                    <td class="value">
                        <ul style="margin:0; padding-left:20px; line-height:1.1;">
                            ${camera_details.map(d => `<li>${d}</li>`).join('')}
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td class="label"><i class="bi bi-speedometer2"></i> Сумарний бітрейт:</td>
                    <td class="value"><strong>${total_bitrate} Kbps (${(total_bitrate/1024).toFixed(1)} Mbps)</strong></td>
                </tr>
                <tr>
                    <td class="label"><i class="bi bi-hdd-fill"></i> Номінальна ємність:</td>
                    <td class="value"><strong>${(total_tb / 0.909).toFixed(2)} TB (реал. ${total_tb.toFixed(2)} TB)</strong></td>
                </tr>
            </table>
        `;
        document.getElementById('hddResult').style.display = '';
    } catch (err) {
        alert("Помилка: " + err.message);
    }
};

// Days Calculation
document.getElementById('daysCalcForm').onsubmit = function(e) {
    e.preventDefault();
    try {
        const hdd_tb = parseFloat(document.getElementById('hddSize').value);
        if (hdd_tb <= 0) throw new Error("Об'єм HDD має бути більше 0");
        
        const { total_bitrate, total_cameras, camera_details } = parseCameraData('camerasDays');
        if (total_cameras === 0) throw new Error("Додайте хоча б одну камеру з бітрейтом");
        
        // Формула розрахунку (терабайти -> біти/секунду)
        const total_bits_per_second = total_bitrate * 1024; // Kbps -> Kb/s
        const hdd_bits = hdd_tb * 8 * 1024 * 1024 * 1024 * 1024; // Кількість бітів на диску
        
        // Розрахунок днів з урахуванням коефіцієнта форматування диска (0.909)
        const total_days = hdd_bits / (total_bits_per_second * 24 * 60 * 60) * 0.909;
        
        document.getElementById('daysResultContent').innerHTML = `
    <div class="result-cctvheader"><i class="bi bi-bar-chart-fill result-cctvicon"></i> <strong>Результати розрахунку:</strong></div>
    <table class="result-cctvtable zebra-table">
        <tr>
            <td class="label"><i class="bi bi-hdd-fill"></i> Доступна ємність:</td>
            <td class="value">${hdd_tb} TB</td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-camera-video"></i> Камер загалом:</td>
            <td class="value">${total_cameras}</td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-list-check"></i> Конфігурація камер:</td>
            <td class="value">
                <ul class="camera-list">
                    ${camera_details.map(d => `<li>${d}</li>`).join('')}
                </ul>
            </td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-speedometer2"></i> Сумарний бітрейт:</td>
            <td class="value"><strong>${total_bitrate} Kbps (${(total_bitrate/1024).toFixed(1)} Mbps)</strong></td>
        </tr>
        <tr>
            <td class="label"><i class="bi bi-calendar3"></i> Глибина архіву:</td>
            <td class="value"><strong>${total_days.toFixed(1)} днів</strong></td>
        </tr>
    </table>
`;
document.getElementById('daysResult').style.display = '';
    } catch (err) {
        alert("Помилка: " + err.message);
    }
};