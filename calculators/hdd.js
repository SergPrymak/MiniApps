let tg = window.Telegram.WebApp;
let cameraCount = 1;

// Resolution map (MP to pixels)
const RESOLUTION_MAP = {
    12.0: 4000, 8.0: 3840, 6.0: 3200, 4.0: 2688,
    3.6: 2560, 3.0: 2304, 2.0: 1920, 1.0: 1280
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp
    tg.expand();
    
    // Add camera button
    document.getElementById('add-camera').addEventListener('click', addCameraGroup);
    
    // Form submission
    document.getElementById('hdd-calculator-form').addEventListener('submit', calculateHDD);
});

function addCameraGroup() {
    const camerasContainer = document.getElementById('cameras-container');
    cameraCount++;
    
    const cameraDiv = document.createElement('div');
    cameraDiv.className = 'camera-group';
    
    cameraDiv.innerHTML = `
        <h3>Камера ${cameraCount} <button type="button" class="remove-camera" style="background: none; color: red; border: none; float: right; cursor: pointer;">×</button></h3>
        <div class="form-group">
            <label for="resolution-${cameraCount-1}">Роздільна здатність:</label>
            <select id="resolution-${cameraCount-1}" class="resolution-select">
                <option value="1.0">1 MP (720p)</option>
                <option value="2.0" selected>2 MP (1080p)</option>
                <option value="3.0">3 MP (1536p)</option>
                <option value="4.0">4 MP (1440p)</option>
                <option value="6.0">6 MP (2736p)</option>
                <option value="8.0">8 MP (4K)</option>
                <option value="12.0">12 MP (4000p)</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="fps-${cameraCount-1}">Частота кадрів (FPS):</label>
            <select id="fps-${cameraCount-1}" class="fps-select">
                <option value="6">6 FPS</option>
                <option value="12">12 FPS</option>
                <option value="15" selected>15 FPS</option>
                <option value="20">20 FPS</option>
                <option value="25">25 FPS</option>
                <option value="30">30 FPS</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="codec-${cameraCount-1}">Кодек:</label>
            <select id="codec-${cameraCount-1}" class="codec-select">
                <option value="0.1">H.265</option>
                <option value="0.2" selected>H.264</option>
                <option value="0.4">MJPEG</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="count-${cameraCount-1}">Кількість камер:</label>
            <input type="number" id="count-${cameraCount-1}" class="camera-count" min="1" value="1" required>
        </div>
    `;
    
    camerasContainer.appendChild(cameraDiv);
    
    // Add event listener to remove button
    cameraDiv.querySelector('.remove-camera').addEventListener('click', function() {
        camerasContainer.removeChild(cameraDiv);
    });
}

function calculateHDD(e) {
    e.preventDefault();
    
    const days = parseInt(document.getElementById('days').value);
    const recordingMode = parseFloat(document.getElementById('recording-mode').value);
    
    if (isNaN(days) || days <= 0) {
        alert('Термін зберігання повинен бути більше 0');
        return;
    }
    
    // Get all camera groups
    const cameraGroups = document.querySelectorAll('.camera-group');
    let totalStorageGB = 0;
    let cameraConfigs = [];
    
    cameraGroups.forEach((group, index) => {
        const resolution = parseFloat(group.querySelector('.resolution-select').value);
        const fps = parseInt(group.querySelector('.fps-select').value);
        const codec = parseFloat(group.querySelector('.codec-select').value);
        const count = parseInt(group.querySelector('.camera-count').value);
        
        if (isNaN(count) || count <= 0) {
            alert('Кількість камер повинна бути більше 0');
            return;
        }
        
        // Calculate bitrate in Mbps: (resolution * fps * codec coefficient)
        const width = RESOLUTION_MAP[resolution] || 1920;
        const height = width * 0.5625; // 16:9 aspect ratio
        const pixels = width * height;
        const bitrate = (pixels / 2073600) * fps * codec; // normalized to 1080p @ 30fps
        
        // Calculate storage per day in GB
        const storagePerdayGB = (bitrate * 0.125 * 3600 * 24 * recordingMode) / 1024;
        const totalStoragePerCameraGB = storagePerdayGB * days;
        const groupStorageGB = totalStoragePerCameraGB * count;
        
        totalStorageGB += groupStorageGB;
        
        cameraConfigs.push({
            resolution: resolution,
            fps: fps,
            codec: group.querySelector('.codec-select').options[group.querySelector('.codec-select').selectedIndex].text,
            count: count,
            storageGB: groupStorageGB
        });
    });
    
    // Format storage size
    let storageFormatted;
    if (totalStorageGB < 1000) {
        storageFormatted = `${totalStorageGB.toFixed(1)} GB`;
    } else {
        storageFormatted = `${(totalStorageGB / 1000).toFixed(2)} TB`;
    }
    
    // Recommend HDD configurations
    let recommendedHDD = [];
    if (totalStorageGB <= 1000) {
        recommendedHDD.push(`1× ${Math.ceil(totalStorageGB / 1000) * 1000} GB HDD`);
    } else if (totalStorageGB <= 2000) {
        recommendedHDD.push('1× 2 TB HDD');
    } else if (totalStorageGB <= 4000) {
        recommendedHDD.push('1× 4 TB HDD');
        recommendedHDD.push('2× 2 TB HDD');
    } else if (totalStorageGB <= 6000) {
        recommendedHDD.push('1× 6 TB HDD');
        recommendedHDD.push('2× 3 TB HDD');
    } else if (totalStorageGB <= 8000) {
        recommendedHDD.push('1× 8 TB HDD');
        recommendedHDD.push('2× 4 TB HDD');
    } else if (totalStorageGB <= 12000) {
        recommendedHDD.push('1× 12 TB HDD');
        recommendedHDD.push('2× 6 TB HDD');
        recommendedHDD.push('3× 4 TB HDD');
    } else {
        const numDisks = Math.ceil(totalStorageGB / 12000);
        recommendedHDD.push(`${numDisks}× 12 TB HDD`);
    }
    
    // Display results
    const resultDiv = document.getElementById('result');
    
    let cameraDetails = '';
    cameraConfigs.forEach((config, index) => {
        cameraDetails += `
            <div class="camera-details">
                <p><strong>Камера ${index+1}:</strong> ${config.resolution} MP, ${config.fps} FPS, ${config.codec}, ${config.count} шт.</p>
                <p>Необхідний простір: ${config.storageGB.toFixed(1)} GB</p>
            </div>
        `;
    });
    
    resultDiv.innerHTML = `
        <h2>Результати розрахунку:</h2>
        <p><strong>Термін зберігання:</strong> ${days} днів</p>
        <p><strong>Режим запису:</strong> ${document.getElementById('recording-mode').options[document.getElementById('recording-mode').selectedIndex].text}</p>
        
        <h3>Конфігурація камер:</h3>
        ${cameraDetails}
        
        <h3>Загальний необхідний об'єм:</h3>
        <p>${storageFormatted}</p>
        
        <h3>Рекомендовані конфігурації HDD:</h3>
        <ul>
            ${recommendedHDD.map(hdd => `<li>${hdd}</li>`).join('')}
        </ul>
    `;
    
    resultDiv.style.display = 'block';
    
    // Send data back to Telegram if needed
    tg.MainButton.setText('Готово');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        tg.sendData(JSON.stringify({
            calculator: 'hdd',
            days: days,
            totalStorageGB: totalStorageGB
        }));
    });
}
