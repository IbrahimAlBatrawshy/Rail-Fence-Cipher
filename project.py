from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np
import io
import base64

app = Flask(__name__, static_folder='.')
CORS(app)

class RailFenceCipher:
    @staticmethod
    def rail_fence_encrypt(data, depth):
        """Encrypt data using rail fence cipher with zigzag pattern"""
        if depth <= 1:
            return data
        
        data_len = len(data)
        # Create rails (rows)
        rails = [[] for _ in range(depth)]
        
        # Zigzag pattern: moving down and up through rails
        rail_index = 0
        direction = 1  # 1 for down, -1 for up
        
        for i in range(data_len):
            rails[rail_index].append(data[i])
            
            # Change direction at top or bottom rail
            if rail_index == 0:
                direction = 1
            elif rail_index == depth - 1:
                direction = -1
            
            rail_index += direction
        
        # Concatenate all rails to create cipher
        encrypted = []
        for rail in rails:
            encrypted.extend(rail)
        
        return np.array(encrypted, dtype=data.dtype)
    
    @staticmethod
    def rail_fence_decrypt(data, depth):
        """Decrypt data using rail fence cipher with zigzag pattern"""
        if depth <= 1:
            return data
        
        data_len = len(data)
        
        # Calculate the length of each rail
        rail_lengths = [0] * depth
        rail_index = 0
        direction = 1
        
        for i in range(data_len):
            rail_lengths[rail_index] += 1
            
            if rail_index == 0:
                direction = 1
            elif rail_index == depth - 1:
                direction = -1
            
            rail_index += direction
        
        # Split the cipher into rails
        rails = []
        start = 0
        for length in rail_lengths:
            rails.append(list(data[start:start + length]))
            start += length
        
        # Reconstruct original data using zigzag pattern
        decrypted = []
        rail_index = 0
        direction = 1
        
        for i in range(data_len):
            decrypted.append(rails[rail_index].pop(0))
            
            if rail_index == 0:
                direction = 1
            elif rail_index == depth - 1:
                direction = -1
            
            rail_index += direction
        
        return np.array(decrypted, dtype=data.dtype)
    
    @staticmethod
    def text_encrypt(text, rails):
        """Encrypt text using rail fence cipher"""
        if rails <= 1 or len(text) == 0:
            return text

        fence = [[] for _ in range(rails)]
        rail = 0
        direction = 1

        for char in text:
            fence[rail].append(char)
            if rail == 0:
                direction = 1
            elif rail == rails - 1:
                direction = -1
            rail += direction

        return ''.join([''.join(rail) for rail in fence])
    
    @staticmethod
    def text_decrypt(cipher, rails):
        """Decrypt text using rail fence cipher"""
        if rails <= 1 or len(cipher) == 0:
            return cipher

        rail_lengths = [0] * rails
        rail = 0
        direction = 1

        for i in range(len(cipher)):
            rail_lengths[rail] += 1
            if rail == 0:
                direction = 1
            elif rail == rails - 1:
                direction = -1
            rail += direction

        fence = []
        index = 0
        for length in rail_lengths:
            fence.append(list(cipher[index:index + length]))
            index += length

        result = []
        rail = 0
        direction = 1

        for i in range(len(cipher)):
            result.append(fence[rail].pop(0))
            if rail == 0:
                direction = 1
            elif rail == rails - 1:
                direction = -1
            rail += direction

        return ''.join(result)

# Flask Routes
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/text/encrypt', methods=['POST'])
def encrypt_text_api():
    try:
        data = request.json
        text = data.get('text', '')
        rails = int(data.get('rails', 3))
        
        if rails < 2:
            return jsonify({'error': 'Number of rails must be at least 2'}), 400
        
        encrypted = RailFenceCipher.text_encrypt(text, rails)
        
        return jsonify({
            'success': True,
            'result': encrypted,
            'length': len(text),
            'rails': rails
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/text/decrypt', methods=['POST'])
def decrypt_text_api():
    try:
        data = request.json
        text = data.get('text', '')
        rails = int(data.get('rails', 3))
        
        if rails < 2:
            return jsonify({'error': 'Number of rails must be at least 2'}), 400
        
        decrypted = RailFenceCipher.text_decrypt(text, rails)
        
        return jsonify({
            'success': True,
            'result': decrypted,
            'length': len(text),
            'rails': rails
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/image/encrypt', methods=['POST'])
def encrypt_image_api():
    try:
        data = request.json
        image_data = data.get('imageData', '')
        rails = int(data.get('rails', 3))
        
        if rails < 2:
            return jsonify({'error': 'Number of rails must be at least 2'}), 400
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to numpy array
        img_array = np.array(image)
        original_shape = img_array.shape
        
        # Flatten and encrypt
        flat_data = img_array.flatten()
        encrypted_data = RailFenceCipher.rail_fence_encrypt(flat_data, rails)
        
        # Reshape and convert back to image
        encrypted_array = encrypted_data.reshape(original_shape)
        encrypted_image = Image.fromarray(encrypted_array.astype('uint8'))
        
        # Convert to base64
        buffer = io.BytesIO()
        encrypted_image.save(buffer, format='PNG')
        encrypted_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'imageData': f'data:image/png;base64,{encrypted_base64}',
            'pixels': len(flat_data),
            'rails': rails
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/image/decrypt', methods=['POST'])
def decrypt_image_api():
    try:
        data = request.json
        image_data = data.get('imageData', '')
        rails = int(data.get('rails', 3))
        
        if rails < 2:
            return jsonify({'error': 'Number of rails must be at least 2'}), 400
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to numpy array
        img_array = np.array(image)
        original_shape = img_array.shape
        
        # Flatten and decrypt
        flat_data = img_array.flatten()
        decrypted_data = RailFenceCipher.rail_fence_decrypt(flat_data, rails)
        
        # Reshape and convert back to image
        decrypted_array = decrypted_data.reshape(original_shape)
        decrypted_image = Image.fromarray(decrypted_array.astype('uint8'))
        
        # Convert to base64
        buffer = io.BytesIO()
        decrypted_image.save(buffer, format='PNG')
        decrypted_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'imageData': f'data:image/png;base64,{decrypted_base64}',
            'pixels': len(flat_data),
            'rails': rails
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(" Starting Rail Fence Cipher Server...")
    print(" Server running at: http://localhost:5000")
    print(" Open your browser and navigate to http://localhost:5000")
    print("\n Press Ctrl+C to stop the server\n")
    app.run(debug=True, port=5000)
