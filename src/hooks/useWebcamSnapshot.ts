import { useCallback } from "react";

interface UseWebcamSnapshotOptions {
  /**
   * When provided, snapshots are stored as a JSON array capped at this length.
   * The oldest entry is dropped when the limit is exceeded.
   * When omitted (or 1), a single string value is stored.
   */
  maxCount?: number;
  /**
   * Milliseconds to wait after `captureSnapshot()` is called before actually
   * grabbing the frame. Defaults to 0 (immediate).
   */
  delayMs?: number;
  /**
   * Called with the captured data URL after the image is stored.
   */
  onCapture?: (dataUrl: string) => void;
}

/**
 * Returns a `captureSnapshot` function that grabs the current frame from a
 * video element and persists it to localStorage as a JPEG data URL.
 *
 * @param videoRef   - ref to the HTMLVideoElement to capture from
 * @param storageKey - localStorage key to store the snapshot under
 * @param options    - optional config; set `maxCount` to keep a rolling array
 */
export function useWebcamSnapshot(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  storageKey: string,
  options?: UseWebcamSnapshotOptions
) {
  const { maxCount, delayMs = 0, onCapture } = options ?? {};

  const captureSnapshot = useCallback(() => {
    setTimeout(() => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;

      const snap = document.createElement("canvas");
      snap.width = video.videoWidth;
      snap.height = video.videoHeight;
      snap.getContext("2d")?.drawImage(video, 0, 0);
      const dataUrl = snap.toDataURL("image/jpeg", 0.7);

      try {
        if (maxCount && maxCount > 1) {
          const existing: string[] = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
          const updated = [...existing, dataUrl].slice(-maxCount);
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(storageKey, dataUrl);
        }
      } catch {
        // Storage quota exceeded or unavailable — silently ignore
      }

      onCapture?.(dataUrl);
    }, delayMs);
  }, [videoRef, storageKey, maxCount, delayMs, onCapture]);

  return captureSnapshot;
}
