let port;
let writer;
const eyeL = document.getElementById('visualEyeL');
const eyeR = document.getElementById('visualEyeR');
const containerL = document.querySelector('.left-eye');
const containerR = document.querySelector('.right-eye');
const connectBtn = document.getElementById('connectBtn');
const statusIndicator = document.getElementById('status');

// Eye positions mapping
const eyePositions = {
    'U': 'translateY(-15px)',
    'D': 'translateY(15px)',
    'L': 'translateX(-15px)',
    'R': 'translateX(15px)',
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

async function triggerBlink(eyeContainers, duration = 150) {
    eyeContainers.forEach(container => container.classList.add('closed'));
    setTimeout(() => {
        eyeContainers.forEach(container => container.classList.remove('closed'));
    }, duration);
}

async function sendCommand(cmd) {
    if (writer) {
        await writer.write(cmd);
        console.log('Sent:', cmd);
    }

    // Update visual eye movement
    if (eyePositions[cmd]) {
        [eyeL, eyeR].forEach(eye => {
            eye.style.transform = eyePositions[cmd];
        });
    }

    // Trigger eyelid animations
    if (cmd === 'B') {
        triggerBlink([containerL, containerR]);
    } else if (cmd === '2') {
        await triggerBlink([containerL, containerR]);
        setTimeout(() => triggerBlink([containerL, containerR]), 250);
    } else if (cmd === 'W') {
        triggerBlink([containerL]); // Wink left eye
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
