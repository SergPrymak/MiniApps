document.addEventListener('DOMContentLoaded', function() {
    // Змінні для розрахунків
    let calculationMode = 'hdd'; // 'hdd' or 'days'
    
    // Перемикання між режимами
    document.getElementById('calc-hdd').addEventListener('click', function() {
        setCalculationMode('hdd');
    });
    
    document.getElementById('calc-days').addEventListener('click', function() {
        setCalculationMode('days');
    });
    
    // Додавання/видалення камер
    document.getElementById('add-camera').addEventListener('click', addCameraInput);
    
    // Початкова ініціалізація видалення камер
    updateRemoveCameraHandlers();
    
    // Функція розрахунку
    document.getElementById('calculate').addEventListener('click', calculate);
    
    // Оновлення сумарного бітрейту при зміні параметрів
    document.getElementById('camera-container').addEventListener('input', updateTotalBitrate);
    
    // Функція перемикання режиму
    function setCalculationMode(mode) {
        calculationMode = mode;
        
        // Оновлення кнопок
        document.getElementById('calc-hdd').classList.toggle('active', mode === 'hdd');
        document.getElementById('calc-days').classList.toggle('active', mode === 'days');
        
        // Показ/приховування форми
        document.getElementById('calc-hdd-form').style.display = mode === 'hdd' ? 'block' : 'none';
        document.getElementById('calc-days-form').style.display = mode === 'days' ? 'block' : 'none';
        
        // Приховування результатів
        document.getElementById('result').style.display = 'none';
    }
    
    // Функція додавання нової групи камер
    function addCameraInput() {
        const container = document.getElementById('camera-container');
        const newInput = document.createElement('div');
        newInput.className = 'camera-input';
        newInput.innerHTML = `
            <input type="number" class="camera-count" min="1" placeholder="Кількість камер">
            <input type="number" class="camera-bitrate" min="1" placeholder="Бітрейт (Kbps)">
            <button class="remove-camera">×</button>
        `;
        container.appendChild(newInput);
        updateRemoveCameraHandlers();
    }
    
    // Оновлення обробників для кнопок видалення
    function updateRemoveCameraHandlers() {
        document.querySelectorAll('.remove-camera').forEach(button => {
            button.onclick = function() {
                const cameraInputs = document.querySelectorAll('.camera-input');
                if (cameraInputs.length > 1) {
                    this.parentElement.remove();
                    updateTotalBitrate();
                }
            };
        });
    }
    
    // Оновлення сумарного бітрейту
    function updateTotalBitrate() {
        const cameraInputs = document.querySelectorAll('.camera-input');
        let totalBitrate = 0;
        
        cameraInputs.forEach(input => {
            const count = parseInt(input.querySelector('.camera-count').value) || 0;
            const bitrate = parseInt(input.querySelector('.camera-bitrate').value) || 0;
            totalBitrate += count * bitrate;
        });
        
        document.getElementById('bitrate-total').textContent = `Сумарний бітрейт: ${totalBitrate} Kbps`;
    }
    
    // Функція розрахунку
    function calculate() {
        try {
            // Отримання параметрів камер
            const cameraData = parseCameraData();
            
            if (cameraData.totalCameras === 0) {
                throw new Error("Необхідно вказати камери для розрахунку");
            }
            
            let result = '';
            
            if (calculationMode === 'hdd') {
                // Розрахунок HDD
                const days = parseInt(document.getElementById('days').value);
                if (!days || days <= 0) {
                    throw new Error("Вкажіть коректну кількість днів");
                }
                
                const totalBits = cameraData.totalBitrate * days * 24 * 60 * 60;
                const totalTB = totalBits / 8 / 1024 / 1024 / 1024;
                
                result = `
                    <h2 class="result-title">Результати розрахунку</h2>
                    <div class="result-description">На основі вказаних параметрів</div>
                    <div class="result-items">
                        <div class="result-item">
                            <span class="result-label">Дні архіву:</span>
                            <span class="result-value">${days}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Загальна кількість камер:</span>
                            <span class="result-value">${cameraData.totalCameras}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Сумарний бітрейт:</span>
                            <span class="result-value">${cameraData.totalBitrate} Kbps</span>
                        </div>
                        <div class="result-item highlight">
                            <span class="result-label">Необхідний обсяг HDD:</span>
                            <span class="result-value">${totalTB.toFixed(2)} TB</span>
                        </div>
                    </div>
                    <div class="result-notes">
                        <p class="result-note">💡 Рекомендовано додати 10-15% запасу для службових даних</p>
                    </div>
                `;
            } else {
                // Розрахунок днів
                const hddTB = parseFloat(document.getElementById('hdd-size').value);
                if (!hddTB || hddTB <= 0) {
                    throw new Error("Вкажіть коректний обсяг HDD");
                }
                
                const totalBitsPerSecond = cameraData.totalBitrate * 1024;
                const hddBits = hddTB * 8 * 1024 * 1024 * 1024 * 1024;
                const totalDays = hddBits / (totalBitsPerSecond * 24 * 60 * 60) * 0.909;
                
                result = `
                    <h2 class="result-title">Результати розрахунку</h2>
                    <div class="result-description">На основі вказаних параметрів</div>
                    <div class="result-items">
                        <div class="result-item">
                            <span class="result-label">Обсяг HDD:</span>
                            <span class="result-value">${hddTB} TB</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Загальна кількість камер:</span>
                            <span class="result-value">${cameraData.totalCameras}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Сумарний бітрейт:</span>
                            <span class="result-value">${cameraData.totalBitrate} Kbps</span>
                        </div>
                        <div class="result-item highlight">
                            <span class="result-label">Тривалість запису:</span>
                            <span class="result-value">${totalDays.toFixed(1)} днів</span>
                        </div>
                    </div>
                    <div class="result-notes">
                        <p class="result-note">💡 Розрахунок включає коефіцієнт форматування диска 0.909</p>
                    </div>
                `;
            }
            
            const resultElement = document.getElementById('result');
            resultElement.innerHTML = result;
            resultElement.style.display = 'block';
            
            // Прокрутка до результатів
            resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
        } catch (error) {
            const resultElement = document.getElementById('result');
            resultElement.innerHTML = `
                <div class="error-message">
                    <p>❌ Помилка: ${error.message}</p>
                </div>
            `;
            resultElement.style.display = 'block';
        }
    }
    
    // Парсинг даних по камерах
    function parseCameraData() {
        const cameraInputs = document.querySelectorAll('.camera-input');
        let totalBitrate = 0;
        let totalCameras = 0;
        const details = [];
        
        cameraInputs.forEach(input => {
            const countInput = input.querySelector('.camera-count');
            const bitrateInput = input.querySelector('.camera-bitrate');
            
            const count = parseInt(countInput.value);
            const bitrate = parseInt(bitrateInput.value);
            
            if (count && bitrate) {
                totalCameras += count;
                totalBitrate += count * bitrate;
                details.push(`${count} камер з бітрейтом ${bitrate} Kbps`);
            }
        });
        
        return {
            totalBitrate: totalBitrate,
            totalCameras: totalCameras,
            details: details
        };
    }
});
