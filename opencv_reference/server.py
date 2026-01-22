import threading
import time
from typing import Generator, Optional

import cv2
import numpy as np
from flask import Flask, Response, jsonify
from flask_cors import CORS

try:
    import mediapipe as mp
except ImportError as e:
    raise SystemExit("mediapipe is required. Please install dependencies in requirements.txt") from e


app = Flask(__name__)
CORS(app)


class FallDetector:
    def __init__(self):
        self.pose = mp.solutions.pose.Pose(
            static_image_mode=False,
            min_detection_confidence=0.7,
            model_complexity=2,
        )
        self.previous_avg_shoulder_height = 0.0
        self.last_fall_ts = 0.0

    def detect_pose(self, frame: np.ndarray):
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(img_rgb)
        height, width, _ = frame.shape
        landmarks = None
        if results.pose_landmarks:
            points = []
            for lm in results.pose_landmarks.landmark:
                points.append((int(lm.x * width), int(lm.y * height), lm.z * width))
            landmarks = points
        return landmarks

    def detect_fall(self, landmarks) -> bool:
        if landmarks is None:
            return False

        left_shoulder_y = landmarks[11][1]
        right_shoulder_y = landmarks[12][1]
        avg_shoulder_y = (left_shoulder_y + right_shoulder_y) / 2.0

        if self.previous_avg_shoulder_height == 0:
            self.previous_avg_shoulder_height = avg_shoulder_y
            return False

        fall_threshold = self.previous_avg_shoulder_height * 1.5

        is_fall = avg_shoulder_y > fall_threshold
        self.previous_avg_shoulder_height = avg_shoulder_y

        # simple debounce: only one event per 3 seconds
        now = time.time()
        if is_fall and (now - self.last_fall_ts) > 3.0:
            self.last_fall_ts = now
            return True
        return False


class CameraWorker:
    def __init__(self, index: int = 0):
        self.cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
        if not self.cap.isOpened():
            raise RuntimeError("Unable to open webcam. Ensure a camera is connected and not in use.")

        self.detector = FallDetector()
        self.frame_lock = threading.Lock()
        self.latest_jpeg: Optional[bytes] = None
        self.event_lock = threading.Lock()
        self.event_counter = 0
        self.running = True

        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def _draw_pose(self, frame: np.ndarray, landmarks) -> None:
        if landmarks is None:
            return
        # Draw simple skeleton connections
        connections = mp.solutions.pose.POSE_CONNECTIONS
        for start, end in connections:
            x1, y1 = landmarks[start][0], landmarks[start][1]
            x2, y2 = landmarks[end][0], landmarks[end][1]
            cv2.line(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    def _loop(self):
        while self.running:
            ok, frame = self.cap.read()
            if not ok:
                time.sleep(0.02)
                continue

            landmarks = self.detector.detect_pose(frame)
            fall = self.detector.detect_fall(landmarks)
            self._draw_pose(frame, landmarks)

            if fall:
                with self.event_lock:
                    self.event_counter += 1
                cv2.putText(frame, "FALL DETECTED", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)

            # Overlay minimal HUD
            cv2.putText(frame, "VisioNULL Stream", (30, frame.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

            ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if ret:
                with self.frame_lock:
                    self.latest_jpeg = jpeg.tobytes()

            time.sleep(0.02)

    def get_frame(self) -> Optional[bytes]:
        with self.frame_lock:
            return self.latest_jpeg

    def get_event_count(self) -> int:
        with self.event_lock:
            return self.event_counter

    def stop(self):
        self.running = False
        self.thread.join(timeout=1.0)
        self.cap.release()


camera_worker: Optional[CameraWorker] = None


def mjpeg_generator() -> Generator[bytes, None, None]:
    global camera_worker
    boundary = b'--frame\r\n'
    while True:
        if camera_worker is None:
            time.sleep(0.05)
            continue
        frame = camera_worker.get_frame()
        if frame is None:
            time.sleep(0.01)
            continue
        yield boundary
        yield b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n'


def sse_generator() -> Generator[str, None, None]:
    global camera_worker
    last_count = 0
    while True:
        if camera_worker is None:
            time.sleep(0.2)
            continue
        count = camera_worker.get_event_count()
        if count != last_count:
            last_count = count
            payload = '{"type":"fall","cameraId":"cam-0","timestamp":%d}' % int(time.time())
            yield f"event: fall\n" + f"data: {payload}\n\n"
        time.sleep(0.2)


@app.route('/health')
def health():
    return jsonify({"status": "ok"})


@app.route('/video_feed')
def video_feed():
    return Response(mjpeg_generator(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/events')
def events():
    return Response(sse_generator(), mimetype='text/event-stream')


def main():
    global camera_worker
    camera_worker = CameraWorker(index=0)
    try:
        # Use waitress or built-in dev server
        from waitress import serve
        serve(app, host='0.0.0.0', port=8000)
    except Exception:
        app.run(host='0.0.0.0', port=8000, debug=False, threaded=True)
    finally:
        if camera_worker:
            camera_worker.stop()


if __name__ == '__main__':
    main()
