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
    if (isRecordingRef.current) {
      console.warn("[useWebcamRecording] Already recording, ignoring call");
      return;
    }

    const video = videoRef.current;
    if (!video) {
      console.error("[useWebcamRecording] videoRef is null");
      return;
    }

    // Prefer the stream already attached to the video element, fall back to
    // capturing a new stream from the element itself.
    const stream: MediaStream | null =
      (video.srcObject instanceof MediaStream ? video.srcObject : null) ??
      ((video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.() ?? null);

    if (!stream) {
      console.error("[useWebcamRecording] No recordable stream found on video element");
      return;
    }

    // Pick the best supported MIME type.
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"]
      .find((t) => MediaRecorder.isTypeSupported(t)) ?? "";

    console.log(`[useWebcamRecording] Starting recording (mimeType="${mimeType}", durationMs=${durationMs})`);

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch (e) {
      console.error("[useWebcamRecording] MediaRecorder constructor failed:", e);
      return;
    }

    recorder.onerror = (e) => {
      console.error("[useWebcamRecording] MediaRecorder error:", e);
    };

    isRecordingRef.current = true;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      console.log(`[useWebcamRecording] Data chunk: ${e.data.size} bytes`);
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      console.log(`[useWebcamRecording] Recorder stopped, ${chunks.length} chunk(s)`);
      isRecordingRef.current = false;
      const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
      console.log(`[useWebcamRecording] Blob size: ${blob.size} bytes`);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        console.log(`[useWebcamRecording] dataUrl length: ${dataUrl.length}, saving to localStorage key "${storageKey}"`);
        try {
          localStorage.setItem(storageKey, dataUrl);
          console.log("[useWebcamRecording] Saved to localStorage ✓");
        } catch (e) {
          console.error("[useWebcamRecording] localStorage.setItem failed:", e);
        }
        onRecorded?.(dataUrl);
      };
      reader.readAsDataURL(blob);
    };

    recorder.start();
    console.log("[useWebcamRecording] recorder.start() called");
    setTimeout(() => {
      console.log(`[useWebcamRecording] Timeout fired, recorder.state="${recorder.state}"`);
      if (recorder.state !== "inactive") recorder.stop();
    }, durationMs);
  }, [videoRef, storageKey, durationMs, onRecorded]);

  return startRecording;
}
