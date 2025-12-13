// Global variables
let originalImageData = null;
let processedImageData = null;
const API_BASE_URL = 'http://localhost:5000/api';

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// ========== TEXT CIPHER FUNCTIONS (calling Python API) ==========

async function encryptText() {
    const plaintext = document.getElementById('plaintext').value;
    const rails = parseInt(document.getElementById('text-rails').value);

    if (!plaintext) {
        alert(' Please enter some text to encrypt!');
        return;
    }

    if (rails < 2) {
        alert('Number of rails must be at least 2!');
        return;
    }

    const startTime = performance.now();

    try {
        const response = await fetch(`${API_BASE_URL}/text/encrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: plaintext, rails: rails })
        });

        const data = await response.json();
        const endTime = performance.now();

        if (data.success) {
            document.getElementById('text-output').textContent = data.result;
            document.getElementById('text-result').style.display = 'block';
            document.getElementById('text-stats').style.display = 'flex';
            document.getElementById('char-count').textContent = data.length;
            document.getElementById('rails-used').textContent = data.rails;
            document.getElementById('process-time').textContent = (endTime - startTime).toFixed(2) + 'ms';

            // Show visualization
            document.getElementById('visualization').style.display = 'block';
            document.getElementById('rail-display').innerHTML = visualizeRailFence(plaintext, rails);
        } else {
            alert('❌ Encryption failed: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error connecting to server: ' + error.message);
    }
}

async function decryptText() {
    const ciphertext = document.getElementById('plaintext').value;
    const rails = parseInt(document.getElementById('text-rails').value);

    if (!ciphertext) {
        alert(' Please enter cipher text to decrypt!');
        return;
    }

    if (rails < 2) {
        alert(' Number of rails must be at least 2!');
        return;
    }

    const startTime = performance.now();

    try {
        const response = await fetch(`${API_BASE_URL}/text/decrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: ciphertext, rails: rails })
        });

        const data = await response.json();
        const endTime = performance.now();

        if (data.success) {
            document.getElementById('text-output').textContent = data.result;
            document.getElementById('text-result').style.display = 'block';
            document.getElementById('text-stats').style.display = 'flex';
            document.getElementById('char-count').textContent = data.length;
            document.getElementById('rails-used').textContent = data.rails;
            document.getElementById('process-time').textContent = (endTime - startTime).toFixed(2) + 'ms';

            // Show visualization
            document.getElementById('visualization').style.display = 'block';
            document.getElementById('rail-display').innerHTML = visualizeRailFence(data.result, rails);
        } else {
            alert('❌ Decryption failed: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error connecting to server: ' + error.message);
    }
}

function visualizeRailFence(text, rails) {
    if (rails <= 1 || text.length === 0) return '';

    const fence = Array.from({ length: rails }, () => Array(text.length).fill('·'));
    let rail = 0;
    let direction = 1;

    for (let i = 0; i < text.length; i++) {
        fence[rail][i] = text[i];

        if (rail === 0) {
            direction = 1;
        } else if (rail === rails - 1) {
            direction = -1;
        }

        rail += direction;
    }

    let html = '';
    for (let i = 0; i < rails; i++) {
        html += '<div class="rail-row">Rail ' + (i + 1) + ': ';
        for (let j = 0; j < text.length; j++) {
            if (fence[i][j] === '·') {
                html += '<span class="rail-space">·</span>';
            } else {
                html += '<span class="rail-char">' + fence[i][j] + '</span>';
            }
        }
        html += '</div>';
    }

    return html;
}

function clearText() {
    document.getElementById('plaintext').value = '';
    document.getElementById('text-output').textContent = '';
    document.getElementById('text-result').style.display = 'none';
    document.getElementById('text-stats').style.display = 'none';
    document.getElementById('visualization').style.display = 'none';
}

function copyToClipboard() {
    const text = document.getElementById('text-output').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Copied to clipboard!');
    });
}

// ========== IMAGE CIPHER FUNCTIONS (calling Python API) ==========

function loadImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            originalImageData = canvas.toDataURL('image/png');

            document.getElementById('original-preview').innerHTML = 
                `<img src="${originalImageData}" alt="Original Image">`;

            document.getElementById('image-stats').style.display = 'flex';
            document.getElementById('image-size').textContent = `${img.width}x${img.height}`;
            document.getElementById('pixel-count').textContent = (img.width * img.height).toLocaleString();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function encryptImage() {
    if (!originalImageData) {
        alert(' Please load an image first!');
        return;
    }

    const rails = parseInt(document.getElementById('image-rails').value);

    if (rails < 2) {
        alert(' Number of rails must be at least 2!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/image/encrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageData: originalImageData, rails: rails })
        });

        const data = await response.json();

        if (data.success) {
            processedImageData = data.imageData;

            document.getElementById('processed-preview').innerHTML = 
                `<img src="${data.imageData}" alt="Encrypted Image">`;

            document.getElementById('image-rails-used').textContent = rails;

            alert(' Image encrypted successfully!\n\n⚠️ Remember the rail depth for decryption!');
        } else {
            alert(' Encryption failed: ' + data.error);
        }
    } catch (error) {
        alert(' Error connecting to server: ' + error.message);
    }
}

async function decryptImage() {
    if (!originalImageData) {
        alert(' Please load an image first!');
        return;
    }

    const rails = parseInt(document.getElementById('image-rails').value);

    if (rails < 2) {
        alert(' Number of rails must be at least 2!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/image/decrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageData: originalImageData, rails: rails })
        });

        const data = await response.json();

        if (data.success) {
            processedImageData = data.imageData;

            document.getElementById('processed-preview').innerHTML = 
                `<img src="${data.imageData}" alt="Decrypted Image">`;

            document.getElementById('image-rails-used').textContent = rails;

            alert('✅ Image decrypted successfully!');
        } else {
            alert(' Decryption failed: ' + data.error);
        }
    } catch (error) {
        alert(' Error connecting to server: ' + error.message);
    }
}

function saveImage() {
    if (!processedImageData) {
        alert(' No processed image to save!');
        return;
    }

    const a = document.createElement('a');
    a.href = processedImageData;
    a.download = 'rail-fence-cipher-result.png';
    a.click();
    alert(' Image saved successfully!');
}
