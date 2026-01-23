
import { useState, useEffect, useRef } from 'react';

declare const poseDetection: any;
declare const tf: any;

export const usePoseDetector = () => {
  const [detector, setDetector] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await tf.ready();
        await tf.setBackend('webgl');
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        };
        const instance = await poseDetection.createDetector(model, detectorConfig);
        setDetector(instance);
        setLoaded(true);
      } catch (e) {
        console.error("Detector init failed:", e);
      }
    };
    init();
  }, []);

  return { detector, loaded };
};
