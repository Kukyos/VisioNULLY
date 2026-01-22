<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/116cvsbcHDgKFjoL_KusT8OOa3eLbDRWa

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Backend (Webcam + Fall Detection)

This project includes a minimal Flask backend that streams your webcam with on-frame pose overlay and emits fall events using a simple mediapipe heuristic.

Prerequisites: Python 3.9+ on Windows

1) Create a virtual environment and install dependencies:

```
cd opencv_reference
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2) Start the backend server (port 8000 by default):

```
python server.py
```

3) In a separate terminal, run the frontend if not already:

```
npm install
npm run dev
```

4) Open the app and look for the first camera tile (cam-0). It displays the live processed stream. When a fall is detected, the UI will trigger an alert and log the event automatically.

Optional: if the backend runs elsewhere, set `VITE_BACKEND_URL` before `npm run dev`.

```
$env:VITE_BACKEND_URL = "http://YOUR_HOST:8000"
npm run dev
```
