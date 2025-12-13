# Rail Fence Cipher - Text & Image Encryption

A full-stack web application that encrypts and decrypts text and images using the classic Rail Fence Cipher with zigzag pattern.

## Architecture

- **Backend (Python)**: Flask API that handles all encryption/decryption logic
- **Frontend (HTML/CSS/JS)**: Modern, responsive UI for user interaction

## Project Structure

```
project/
├── project.py          # Flask backend API with Rail Fence Cipher logic
├── index.html          # Main HTML interface
├── script.js           # Frontend JavaScript (calls Python API)
├── styles.css          # Styling for the UI
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Features

### Text Cipher
- Encrypt text using rail fence cipher
- Decrypt cipher text back to original
- Visualize the zigzag pattern
- Adjustable number of rails (2-10)
- Performance metrics display

### Image Cipher
- Encrypt images (JPG, PNG, BMP, GIF)
- Decrypt encrypted images
- Adjustable number of rails (2-20)
- Download processed images
- Image statistics display

## Installation & Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Flask Server

```bash
python project.py
```

The server will start at `http://localhost:5000`

### 3. Open in Browser

Navigate to `http://localhost:5000` in your web browser.

## How It Works

### Rail Fence Cipher Algorithm

The Rail Fence Cipher is a transposition cipher that writes the plaintext in a zigzag pattern across multiple "rails" (rows), then reads off each rail sequentially to create the ciphertext.

**Example with 3 rails:**
```
Plain text: "HELLO WORLD"

Zigzag pattern:
H . . . O . . . R . .
. E . L . W . L .
. . L . . . O . . D

Cipher text: "HOREL WLLOD"
```

### API Endpoints

- `POST /api/text/encrypt` - Encrypt text
- `POST /api/text/decrypt` - Decrypt text  
- `POST /api/image/encrypt` - Encrypt image
- `POST /api/image/decrypt` - Decrypt image

## Usage Instructions

### Text Encryption/Decryption

1. Enter your text in the text area
2. Set the number of rails (default: 3)
3. Click "🔒 Encrypt Text" or "🔓 Decrypt Text"
4. View the result and zigzag visualization
5. Copy the result to clipboard if needed

### Image Encryption/Decryption

1. Click "📁 Load Image" and select an image file
2. Set the number of rails (default: 3)
3. Click "🔒 Encrypt Image" or "🔓 Decrypt Image"
4. View the processed image
5. Click "💾 Save Result" to download

**Important:** Use the SAME number of rails for both encryption and decryption!

## Technical Details

### Backend (project.py)
- **Framework:** Flask with CORS support
- **Logic:** RailFenceCipher class with static methods
- **Image Processing:** PIL (Pillow) and NumPy
- **Data Format:** Base64 encoding for image transfer

### Frontend (HTML/CSS/JS)
- **Communication:** Fetch API for HTTP requests
- **Image Handling:** Canvas API for image processing
- **UI:** Responsive design with tab-based navigation
- **Visualization:** Dynamic rail pattern display for text

## Security Note

The Rail Fence Cipher is a **classical cipher** and is **NOT secure** for modern cryptographic use. This project is for **educational purposes** only to demonstrate:
- Full-stack web development
- API design and integration
- Image processing with Python
- Cipher algorithm implementation

## Dependencies

- Python 3.7+
- Flask 3.0.0
- Flask-CORS 4.0.0
- Pillow 10.1.0
- NumPy 1.26.2

## Troubleshooting

### CORS Errors
If you encounter CORS errors, ensure Flask-CORS is installed:
```bash
pip install flask-cors
```

### Server Not Starting
- Check if port 5000 is available
- Ensure all dependencies are installed
- Verify Python version (3.7+)

### Image Processing Issues
- Ensure Pillow and NumPy are correctly installed
- Check image file format (supported: JPG, PNG, BMP, GIF)
- Try smaller images if processing is slow

## License

This project is open source and available for educational use.
