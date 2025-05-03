let tg = window.Telegram.WebApp;

// Sensor sizes in mm
const SENSOR_SIZES = {
    "1/4": 3.6, "1/3.6": 4.0, "1/3.2": 4.5, "1/3": 4.8,
    "1/2.9": 5.0, "1/2.8": 5.35, "1/2.7": 5.37, "1/2.5": 5.76,
    "1/2": 6.4, "1/1.8": 7.18, "1/1.7": 7.6, "1/1.2": 10.2,
    "2/3": 8.8
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp
    tg.expand();
    
    // Switch between calculation types
    const calcType = document.getElementById('calc-type');
    const fovCalc = document.getElementById('fov-calc');
    const focalCalc = document.getElementById('focal-calc');
    
    calcType.addEventListener('change', function() {
        if (this.value === 'fov') {
            fovCalc.style.display = 'block';
            focalCalc.style.display = 'none';
        } else {
            fovCalc.style.display = 'none';
            focalCalc.style.display = 'block';
        }
    });
    
    // Form submission
    document.getElementById('lens-calculator-form').addEventListener('submit', calculateLens);
});

function calculateLens(e) {
    e.preventDefault();
    
    const calcType = document.getElementById('calc-type').value;
    let result = '';
    
    if (calcType === 'fov') {
        const focalLength = parseFloat(document.getElementById('focal-length').value);
        const sensorType = document.getElementById('sensor-size').value;
        
        if (isNaN(focalLength) || focalLength <= 0) {
            alert('Фокусна відстань повинна бути більше 0');
            return;
        }
        
        const sensorSize = SENSOR_SIZES[sensorType];
        
        // Calculate FOV in degrees
        // Using 2 * atan(sensor_size / (2 * focal_length))
        const fovHorizontal = 2 * Math.atan(sensorSize / (2 * focalLength)) * (180 / Math.PI);
        const fovVertical = 2 * Math.atan((sensorSize * 0.75) / (2 * focalLength)) * (180 / Math.PI);
        const fovDiagonal = 2 * Math.atan(Math.sqrt(Math.pow(sensorSize, 2) + Math.pow(sensorSize * 0.75, 2)) / (2 * focalLength)) * (180 / Math.PI);
        
        result = `
            <h2>Результати розрахунку кута огляду:</h2>
            <p><strong>Фокусна відстань:</strong> ${focalLength} мм</p>
            <p><strong>Розмір сенсора:</strong> ${sensorType}" (${sensorSize} мм)</p>
            <h3>Кути огляду:</h3>
            <p>- Горизонтальний: ${fovHorizontal.toFixed(1)}°</p>
            <p>- Вертикальний: ${fovVertical.toFixed(1)}°</p>
            <p>- Діагональний: ${fovDiagonal.toFixed(1)}°</p>
        `;
    } else {
        const viewAngle = parseFloat(document.getElementById('view-angle').value);
        const sensorType = document.getElementById('sensor-size-focal').value;
        
        if (isNaN(viewAngle) || viewAngle <= 0 || viewAngle >= 180) {
            alert('Кут огляду повинен бути в межах від 1° до 180°');
            return;
        }
        
        const sensorSize = SENSOR_SIZES[sensorType];
        
        // Calculate focal length in mm
        // Using sensor_size / (2 * tan(view_angle / 2))
        const focalLength = sensorSize / (2 * Math.tan((viewAngle * Math.PI) / 360));
        
        result = `
            <h2>Результати розрахунку фокусної відстані:</h2>
            <p><strong>Кут огляду:</strong> ${viewAngle}°</p>
            <p><strong>Розмір сенсора:</strong> ${sensorType}" (${sensorSize} мм)</p>
            <h3>Необхідна фокусна відстань:</h3>
            <p>${focalLength.toFixed(1)} мм</p>
            <p><em>Рекомендований об'єктив: ${Math.round(focalLength)} мм</em></p>
        `;
    }
    
    // Display results
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = result;
    resultDiv.style.display = 'block';
    
    // Send data back to Telegram if needed
    tg.MainButton.setText('Готово');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        tg.sendData(JSON.stringify({
            calculator: 'lens',
            type: calcType
        }));
    });
}
