# 📄 PDF Merger

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-success.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)

A blazing-fast, strictly-private, and standalone desktop application for securely combining PDF documents. Built with a modern **Glassmorphism** UI and buttery-smooth GSAP animations.

---

## ✨ Features
* **Zero Installation Required:** Completely standalone `.exe`. No Node.js, Python, or external dependencies required for the end user.
* **100% Offline & Private:** Your sensitive documents are processed entirely locally on your machine. Nothing is ever uploaded to the cloud.
* **Premium UI/UX:** Responsive glassmorphism aesthetic, subtle background animations, and intuitive drag-and-drop mechanics.
* **Robust Error Handling:** Built-in safeguards against corrupt files, permission errors, and invalid file paths.

---

## 🚀 Download & Run (For Users)
You do not need to download this source code to use the app! 

1. Go to the [Releases page](../../releases) of this repository.
2. Download the latest **`PDF-Merger-v1.0.zip`** file.
3. Extract the `.zip` file into a folder on your computer.
4. Double-click `PDF-Merger.exe` to launch the application.

*(Note: Because this is an indie app, Windows Defender might show a blue "Windows protected your PC" screen. Simply click **"More info"** and then **"Run anyway"**).*

---

## 💻 Tech Stack
This application leverages a hybrid architecture for maximum performance and portability:
- **Frontend Core:** HTML5, Vanilla CSS (Custom Glassmorphism), Vanilla JavaScript
- **Frontend Animations:** [GSAP (GreenSock)](https://gsap.com/)
- **Native OS Bridge:** [NeutralinoJS](https://neutralino.js.org/) (Handles native OS file dialogs and window management)
- **Backend Processor:** Python 3 + `pypdf`
- **Compiler:** PyInstaller (Compiles the Python backend into a standalone Windows binary)

---

## 🛠️ Development & Building (For Developers)

If you want to modify the source code and build your own version of the app, follow these steps:

### Prerequisites
- Node.js & npm (For NeutralinoJS)
- Python 3.12+ (For the backend)
- Windows OS (For building the Windows executable)

### 1. Setup the Backend
```bash
# Install the required Python library
pip install pypdf pyinstaller

# Compile the backend into a standalone Windows executable
pyinstaller --onefile main.py

# Move the newly generated executable into the bin folder
move dist\main.exe bin\main.exe
```

### 2. Setup the Frontend
```bash
# Install the NeutralinoJS CLI globally
npm install -g @neutralinojs/neu

# Build the Neutralino frontend assets
neu build
```

### 3. Assemble the Final Package
Create a new folder and move the following files into it to create your distributable app:
1. `dist/myapp/myapp-win_x64.exe` (Rename this to `PDF-Merger.exe`)
2. `dist/myapp/resources.neu`
3. Your `bin` folder (containing `main.exe`)

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
