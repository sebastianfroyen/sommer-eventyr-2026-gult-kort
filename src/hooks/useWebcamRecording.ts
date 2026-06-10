import { useCallback, useRef } from "react";

interface UseWebcamRecordingOptions {
  /**
   * How many milliseconds to record. Defaults to 3000 (3 seconds).
   */
  durationMs?: number;
  /**
   * Called with the base64-encoded data URL of the recorded video after it is
   * stored in localStorage.
   */
  onRecorded?: (dataUrl: string) => void;
}

/**
 * Returns a `startRecording` function that records the given video element's
 * stream for `durationMs` milliseconds, then stores the result in localStorage
 * as a base64 video data URL under `storageKey`.
 *
 * The hook guards against concurrent recordings — calling `startRecording`
 * while a recording is already in progress is a no-op.
 *
 * @param videoRef   - ref to the HTMLVideoElement whose stream to record
 * @param storageKey - localStorage key to store the recording under
 * @param options    - optional config
 */
export function useWebcamRecording(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  storageKey: string,
  options?: UseWebcamRecordingOptions
) {
  const { durationMs = 3000, onRecorded } = options ?? {};
  const isRecordingRef = useRef(false);

  const startRecording = useCallback(() => {
    if (isRecordingRef.current) return;

    const video = videoRef.current;
    if (!video) return;

    // Prefer the stream already attached to the video element, fall back to
    // capturing a new stream from the element itself.
    const stream: MediaStream | null =
      (video.srcObject instanceof MediaStream ? video.srcObject : null) ??
      ((video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.() ?? null);

    if (!stream) return;

    // Pick the best supported MIME type.
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"]
      .find((t) => MediaRecorder.isTypeSupported(t)) ?? "";

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      return;
    }

    isRecordingRef.current = true;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      isRecordingRef.current = false;
      const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        try {
          localStorage.setItem(storageKey, dataUrl);
        } catch {
          // Storage quota exceeded or unavailable — silently ignore
        }
        onRecorded?.(dataUrl);
      };
      reader.readAsDataURL(blob);
    };

    recorder.start();
    setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, durationMs);
  }, [videoRef, storageKey, durationMs, onRecorded]);

  return startRecording;
}
