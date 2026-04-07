# VisioNULL | Privacy-First Vision

A privacy-focused fall detection and monitoring system that prioritizes user data protection through innovative rolling RAM buffers and automatic data destruction. VisioNULL demonstrates how effective surveillance and monitoring can be achieved without compromising user privacy.

## 🔐 Key Features

- **Privacy-First Architecture**: All video processing happens locally in browser RAM
- **Rolling Buffer System**: Automatic data destruction ensures minimal data retention
- **Fall Detection**: Real-time pose detection to identify potential falls
- **Alert Timeline**: Visual timeline of detected events without storing actual footage
- **Camera Grid**: Multi-camera monitoring dashboard
- **Archive System**: Temporary event logging with automatic expiration

## 🛠️ Technology Stack

- **Frontend**: React 19+ with TypeScript
- **Build Tool**: Vite 6+
- **Pose Detection**: Browser-based ML for privacy-preserving analysis
- **Styling**: Modern CSS with component-based architecture

---

## 📦 First-Time Setup

Follow these steps to set up the project for the first time:

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kukyos/VisioNULLY.git
   cd VisioNULLY
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173` (or the URL shown in your terminal)
   - Grant camera permissions when prompted for full functionality

5. **Build for production** (optional)
   ```bash
   npm run build
   ```
   The built files will be in the `dist` directory.

---

## 🔄 Running the Project After Initial Setup

Once you've completed the first-time setup, running the project is simple:

1. **Navigate to the project directory**
   ```bash
   cd VisioNULLY
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Open your browser to `http://localhost:5173`
   - The application will hot-reload as you make changes

### Additional Commands

- **Preview production build**
  ```bash
  npm run preview
  ```
  
- **Rebuild dependencies** (if package.json changes)
  ```bash
  npm install
  ```

---

## 🎯 Project Structure

```
VisioNULLY/
├── components/          # React components
│   ├── system/         # System-level components
│   └── ui/             # UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
└── vite.config.ts      # Vite configuration
```

---

## 🤝 Contributing

Contributions are welcome! This project demonstrates privacy-first principles in surveillance technology.

---

## 📄 License

This project is part of the VisioNULL privacy initiative.

---

## 💡 About Privacy-First Design

VisioNULL is built on the principle that effective monitoring doesn't require permanent data storage. By using rolling RAM buffers and automatic data destruction, we ensure that:

- Video feeds are never permanently stored
- Only essential metadata is retained temporarily
- Users maintain complete control over their data
- The system operates transparently with clear data lifecycle policies
