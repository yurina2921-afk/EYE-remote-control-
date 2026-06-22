let port;
let writer;
const visualEye = document.getElementById('visualEye');
const connectBtn = document.getElementById('connectBtn');
const statusIndicator = document.getElementById('status');

// Eye positions mapping
const eyePositions = {
    'U': 'translateY(-20px)',
    'D': 'translateY(20px)',
    'L': 'translateX(-20px)',
    'R': 'translateX(20px)',
    'C': 'translate(0, 0)',
    'H': 'translate(0, 0)'
};

async function connect() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        const encoder = new TextEncoderStream();
        const outputStream = encoder.writable;
        outputStream.pipeTo(port.writable);
        writer = encoder.writable.getWriter();

        statusIndicator.textContent = 'Connected';
        statusIndicator.classList.add('connected');
        connectBtn.textContent = 'Disconnect';
    } catch (err) {
        console.error('Connection failed:', err);
        statusIndicator.textContent = 'Error';
    }
}

async function sendCommand(cmd) {
    if (writer) {
        await writer.write(cmd);
        console.log('Sent:', cmd);
    }

    // Update visual eye
    if (eyePositions[cmd]) {
        visualEye.style.transform = eyePositions[cmd];
    } else if (cmd === 'B' || cmd === '2' || cmd === 'W') {
        visualEye.style.opacity = '0.1';
        setTimeout(() => visualEye.style.opacity = '1', 150);
    }
}

// Event Listeners
document.querySelectorAll('.control-btn, .action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        sendCommand(cmd);
    });
});

connectBtn.addEventListener('click', () => {
    if (port) {
        // Simple placeholder for disconnect
        port.close();
        port = null;
        writer = null;
        statusIndicator.textContent = 'Disconnected';
        statusIndicator.classList.remove('connected');
        connectBtn.textContent = 'Connect Micro:bit';
    } else {
        connect();
    }
});
