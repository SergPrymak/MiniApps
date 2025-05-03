let tg = window.Telegram.WebApp;
let extenderCount = 0;
const MAX_EXTENDERS = 3;

// Constants from your config
const POE_STANDARDS = [
    { name: "802.3af (Type 1)", pse_power: 15.4, pd_power: 12.95, voltage: 48, min_pd_voltage: 37, pairs: 2, mode_b: true, max_current: 0.35 },
    { name: "802.3at (Type 2)", pse_power: 30, pd_power: 25.5, voltage: 53, min_pd_voltage: 42, pairs: 2, mode_b: true, max_current: 0.6 },
    { name: "802.3bt (Type 3)", pse_power: 60, pd_power: 51, voltage: 53, min_pd_voltage: 42, pairs: 4, mode_b: false, max_current: 0.6 },
    { name: "802.3bt (Type 4)", pse_power: 100, pd_power: 71, voltage: 53, min_pd_voltage: 42, pairs: 4, mode_b: false, max_current: 0.6 }
];
const EXTENDER_POWER = 2; // Power consumed by each extender
const MAX_SEGMENT = 100; // Maximum segment length for autocalculation
const MAX_TOTAL_LENGTH = 400; // Maximum total cable length
const MODE_B_MAX_DISTANCE = 250; // Maximum distance for Mode B

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp
    tg.expand();
    
    // Add extender button
    document.getElementById('add-extender').addEventListener('click', addExtenderInput);
    
    // Form submission
    document.getElementById('poewizard-form').addEventListener('submit', calculatePoe);
});

function addExtenderInput() {
    if (extenderCount >= MAX_EXTENDERS) {
        alert(`Максимальна кількість Extender'ів: ${MAX_EXTENDERS}`);
        return;
    }
    
    const extenderPositions = document.getElementById('extender-positions');
    extenderCount++;
    
    const positionDiv = document.createElement('div');
    positionDiv.style.display = 'flex';
    positionDiv.style.gap = '8px';
    positionDiv.style.marginBottom = '8px';
    
    positionDiv.innerHTML = `
        <input type="number" min="1" class="extender-position" placeholder="Відстань до Extender ${extenderCount}" required>
        <button type="button" class="remove-extender" style="width: auto; padding: 0 10px;">×</button>
    `;
    
    extenderPositions.appendChild(positionDiv);
    
    // Add event listener to remove button
    positionDiv.querySelector('.remove-extender').addEventListener('click', function() {
        extenderPositions.removeChild(positionDiv);
        extenderCount--;
    });
}

function calculatePoe(e) {
    e.preventDefault();
    
    // Get parameters
    const pdPower = parseFloat(document.getElementById('power').value);
    const totalDistance = parseFloat(document.getElementById('distance').value);
    
    if (isNaN(pdPower) || pdPower <= 0 || isNaN(totalDistance) || totalDistance <= 0) {
        alert('Потужність і відстань повинні бути більше 0');
        return;
    }
    
    // Get extender positions
    const positionInputs = document.querySelectorAll('.extender-position');
    let extenderPositions = [];
    
    positionInputs.forEach(input => {
        const position = parseFloat(input.value);
        if (!isNaN(position) && position > 0) {
            extenderPositions.push(position);
        }
    });
    
    // Sort positions
    extenderPositions.sort((a, b) => a - b);
    
    // Check if last extender position exceeds total distance
    if (extenderPositions.length > 0 && extenderPositions[extenderPositions.length - 1] >= totalDistance) {
        alert('Позиція Extender не може бути більше або дорівнювати загальній відстані');
        return;
    }
    
    // Convert positions to segments
    let customSegments = [];
    if (extenderPositions.length > 0) {
        let prevPos = 0;
        for (const pos of extenderPositions) {
            customSegments.push(pos - prevPos);
            prevPos = pos;
        }
        // Add final segment
        customSegments.push(totalDistance - prevPos);
    }
    
    // Calculate both variants
    const result = calculatePoeVariants(pdPower, totalDistance, customSegments, extenderPositions);
    
    // Display results
    displayResults(result, pdPower, totalDistance, extenderPositions);
}

function calculatePoeVariants(pdPower, totalDistance, customSegments, extenderPositions) {
    // Helper functions from your Python code
    function calcSegmentDrop(length, power, pairs = 2, supplyV = 56) {
        const RPer100 = pairs === 2 ? 9.4 : 4.7;
        const adjustedR = RPer100 * 1.15;
        const a = adjustedR / 100 * length;
        const b = -Math.pow(supplyV, 2);
        const c = Math.pow(supplyV, 2) * power;
        const d = Math.pow(b, 2) - 4 * a * c;
        const sqrtD = Math.sqrt(d);
        const needPse = (-b - sqrtD) / (2 * a);
        const pLoss = needPse - power;
        const vDrop = needPse * a / supplyV;
        return [vDrop, pLoss];
    }

    function findBestStandardPd(powerRequired, allowModeB = true) {
        for (const std of POE_STANDARDS) {
            if (powerRequired <= std.pd_power) {
                if (allowModeB && !std.mode_b) continue;
                return std;
            }
        }
        return null;
    }

    function findBestStandardPse(powerRequired) {
        for (const std of POE_STANDARDS) {
            if (powerRequired <= std.pse_power) {
                return std;
            }
        }
        return null;
    }

    // Result object
    const result = {
        noExt: null,
        withExt: null,
        extendersInfo: ""
    };

    // Variant 1: Without extenders (Mode B for af/at)
    if (totalDistance <= MODE_B_MAX_DISTANCE) {
        const bestPd = findBestStandardPd(pdPower, totalDistance > 100);
        
        if (bestPd) {
            const [vDrop, pLoss] = calcSegmentDrop(
                totalDistance,
                pdPower,
                bestPd.pairs,
                bestPd.voltage
            );
            
            const portPower = pdPower + pLoss;
            const bestNoext = findBestStandardPse(portPower);
            
            if (bestNoext) {
                const voltageAtPd = bestNoext.voltage - vDrop;
                
                if (voltageAtPd >= bestNoext.min_pd_voltage) {
                    result.noExt = {
                        ...bestNoext,
                        voltage_at_pd: voltageAtPd,
                        port_power: portPower,
                        v_drop: vDrop,
                        speed: totalDistance > 100 ? "10Mbps (Mode B Extended)" : "100/1000Mbps (Mode A)"
                    };
                }
            }
        }
    }

    // Variant 2: With Extenders
    if (totalDistance > 100 && totalDistance <= MAX_TOTAL_LENGTH) {
        // Determine number of segments and their lengths
        let segmentLengths, numExt;
        
        if (customSegments.length > 0) {
            segmentLengths = customSegments;
            numExt = segmentLengths.length - 1;
        } else {
            numExt = Math.min(Math.floor((totalDistance - 1) / MAX_SEGMENT), MAX_EXTENDERS);
            const segments = numExt + 1;
            segmentLengths = Array(segments).fill(totalDistance / segments);
        }
        
        let extenderOverload = false;
        
        // Calculate power for each segment (from end to start)
        let segmentPowers = [];
        let power = pdPower;
        let totalVdrop = 0;
        
        // Process segments in reverse (from PD to PSE)
        for (let i = segmentLengths.length - 1; i >= 0; i--) {
            const segmentLen = segmentLengths[i];
            const [vSeg, pLossSeg] = calcSegmentDrop(segmentLen, power, 2, 52);
            
            segmentPowers.push([power, vSeg, pLossSeg, segmentLen]);
            totalVdrop += vSeg;
            
            if (power > 25.5) {
                result.extendersInfo = "❌ Потужність перевищує допустиму для Extender'ів";
                extenderOverload = true;
                break;
            }
            
            power += EXTENDER_POWER + pLossSeg;
        }
        
        // Reverse segment powers to get PSE to PD order
        segmentPowers = segmentPowers.reverse();
        
        // Find appropriate standard
        const std = findBestStandardPse(power);
        
        if (std && !extenderOverload) {
            // Calculate voltage at PD
            const voltageAtPdExt = 52 - segmentPowers[0][1]; // Use voltage drop from last segment
            
            if (voltageAtPdExt >= std.min_pd_voltage) {
                result.withExt = {
                    num_ext: numExt,
                    segment_lengths: segmentLengths,
                    total_power: power,
                    segment_powers: segmentPowers,
                    standard: std,
                    voltage_at_pd: voltageAtPdExt,
                    total_vdrop: totalVdrop,
                    speed: "100 Мбіт/с"
                };
                
                // Check for long segments in manual configuration
                if (extenderPositions.length > 0) {
                    const longSegments = segmentLengths.filter(seg => seg > 100);
                    if (longSegments.length > 0) {
                        result.longSegmentsWarning = true;
                    }
                }
            } else {
                result.extendersInfo = "❌ Недостатня напруга на PD після Extender'ів";
            }
        } else if (!std) {
            result.extendersInfo = "❌ Не знайдено підходящий стандарт PoE для необхідної потужності";
        }
    } else if (totalDistance > MAX_TOTAL_LENGTH) {
        result.extendersInfo = `❌ Відстань ${totalDistance}м > ${MAX_TOTAL_LENGTH}м (навіть з ${MAX_EXTENDERS} Extender'ами)`;
    }

    return result;
}

function displayResults(result, pdPower, totalDistance, extenderPositions) {
    const resultDiv = document.getElementById('result');
    let resultHtml = `<h2>PoE розрахунок для ${pdPower}Вт на ${totalDistance}м:</h2>`;
    
    // Variant 1: Without Extenders
    resultHtml += `<h3>Варіант 1: Тільки POE Світч</h3>`;
    
    if (result.noExt) {
        resultHtml += `
            <p><strong>🔌 Стандарт:</strong> ${result.noExt.name}</p>
            <p><strong>⚡ Портова потужність:</strong> ${result.noExt.port_power.toFixed(2)} Вт</p>
            <p><strong>📉 Падіння напруги:</strong> ${result.noExt.v_drop.toFixed(2)} В</p>
            <p><strong>🔋 Напруга на PD:</strong> ${result.noExt.voltage_at_pd.toFixed(2)} В</p>
            <p><strong>🚀 Швидкість:</strong> ${result.noExt.speed}</p>
        `;
    } else {
        resultHtml += `<p>❌ <strong>Недоступно</strong> (перевищення потужності або недостатня напруга)</p>`;
    }
    
    // Variant 2: With Extenders
    resultHtml += `<h3>Варіант 2: З Extender'ами</h3>`;
    
    if (result.withExt) {
        // Build topology
        let topology = `PSE (${result.withExt.standard.name} ${result.withExt.total_power.toFixed(2)}Вт)\n`;
        let currentPosition = 0;
        
        for (let idx = 0; idx < result.withExt.segment_powers.length; idx++) {
            const [pwr, vdrop, _, segmentLen] = result.withExt.segment_powers[idx];
            currentPosition += segmentLen;
            
            const node = idx < result.withExt.num_ext ? `Extender${idx+1} 802.3at` : "PD";
            const positionText = idx < result.withExt.num_ext ? ` @ ${currentPosition.toFixed(0)}м` : "";
            
            topology += `├── ${segmentLen.toFixed(0)}м (${pwr.toFixed(1)}Вт, Δ${vdrop.toFixed(2)}В) ──▶ ${node}${positionText}\n`;
            if (idx < result.withExt.num_ext) {
                topology += "│\n";
            }
        }
        
        // Extender positions info
        let extenderPositionsText = "";
        if (extenderPositions.length > 0) {
            const positionsStr = extenderPositions.map(pos => `${pos.toFixed(0)}м`).join(", ");
            extenderPositionsText = `<p><strong>📍 Позиції розширювачів:</strong> ${positionsStr}</p>`;
        }
        
        // Warning for long segments
        let warningText = "";
        if (result.longSegmentsWarning) {
            warningText = `<p class="warning" style="color: red; font-weight: bold;">⚠️ Увага! Виявлено сегменти довші за 100м. Високий ризик втрати пакетних даних.</p>`;
        }
        
        resultHtml += `
            <p><strong>🔢 Extender'ів:</strong> ${result.withExt.num_ext}</p>
            ${extenderPositionsText}
            <p><strong>📏 Сегменти:</strong> ${result.withExt.segment_lengths.map(sl => `${sl.toFixed(1)}м`).join(", ")}</p>
            <p><strong>⚡ Загальна потужність:</strong> ${result.withExt.total_power.toFixed(2)} Вт</p>
            <p><strong>🔌 Стандарт:</strong> ${result.withExt.standard.name}</p>
            <p><strong>📉 Сумарне падіння напруги:</strong> ${result.withExt.total_vdrop.toFixed(2)} В</p>
            <p><strong>🔋 Напруга на PD:</strong> ${result.withExt.voltage_at_pd.toFixed(2)} В</p>
            <p><strong>🚀 Швидкість:</strong> ${result.withExt.speed}</p>
            ${warningText}
            <p><strong>📡 Топологія:</strong></p>
            <pre>${topology}</pre>
        `;
    } else {
        resultHtml += `<p>${result.extendersInfo || "❌ Недоступно (немає підходящого стандарту) або відстань до 100м"}</p>`;
    }
    
    resultDiv.innerHTML = resultHtml;
    resultDiv.style.display = 'block';
    
    // Send data back to Telegram if needed
    tg.MainButton.setText('Готово');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        tg.sendData(JSON.stringify({
            calculator: 'poewizard',
            power: pdPower,
            distance: totalDistance,
            extenderPositions: extenderPositions,
            hasNoExtSolution: result.noExt !== null,
            hasExtSolution: result.withExt !== null
        }));
    });
}
