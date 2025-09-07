
    const video = document.getElementById('video');
    const overlay = document.getElementById('overlay');
    const drawing = document.getElementById('drawing');
    const hud = document.getElementById('hud');

    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const saveBtn = document.getElementById('saveBtn');
    const colorPicker = document.getElementById('colorPicker');
    const sizePicker = document.getElementById('sizePicker');

    const overlayCtx = overlay.getContext('2d');
    const drawCtx = drawing.getContext('2d');

    // Sizing
    function fitCanvases() {
      const r = document.getElementById('stage').getBoundingClientRect();
      for (const c of [overlay, drawing]) {
        c.width = Math.floor(r.width);
        c.height = Math.floor(r.height);
      }
    }
    addEventListener('resize', fitCanvases);
    fitCanvases();

    let camera = null;
    let hands = null;
    let running = false;
    let lastPt = null; // last drawing point
    let isDrawing = false; // gesture state
    let isErasing = false; // eraser mode state
    let smoothX = null, smoothY = null; // low-pass filter
    let lastRawPt = null; // for velocity calculation

    function setStatus(text) {
      hud.innerHTML = `Status: <b>${text}</b>`;
    }

    function resetDrawingState() {
      isDrawing = false;
      lastPt = null;
      lastRawPt = null; // Also reset for smoothing calculation
    }

    function distance(a, b) {
      const dx = a.x - b.x; const dy = a.y - b.y; const dz = (a.z||0) - (b.z||0);
      return Math.hypot(dx, dy, dz);
    }

    function toPixel(p) {
      // Mirror x because the video is mirrored with CSS (scaleX(-1))
      const x = overlay.width - p.x * overlay.width;
      const y = p.y * overlay.height;
      return { x, y };
    }

    function lowpass(prev, current, factor = 0.4) {
      if (prev == null) return current;
      return prev + factor * (current - prev);
    }

    function drawDot(x, y, r, color) {
      overlayCtx.beginPath();
      overlayCtx.arc(x, y, r, 0, Math.PI * 2);
      overlayCtx.fillStyle = color;
      overlayCtx.fill();
    }

    function drawLine(x1, y1, x2, y2) {
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';
      drawCtx.strokeStyle = colorPicker.value;
      drawCtx.lineWidth = Number(sizePicker.value);
      drawCtx.beginPath();
      drawCtx.moveTo(x1, y1);
      drawCtx.lineTo(x2, y2);
      drawCtx.stroke();
    }

    function eraseCircle(x, y) {
      // By setting the composite operation to 'destination-out',
      // new shapes will erase the existing canvas content.
      drawCtx.globalCompositeOperation = 'destination-out';
      drawCtx.beginPath();
      drawCtx.arc(x, y, Number(sizePicker.value) * 2, 0, Math.PI * 2); // Eraser is bigger than the brush
      drawCtx.fill();
      // Reset composite operation to default to allow drawing again
      drawCtx.globalCompositeOperation = 'source-over';
    }

    function clearOverlay() { overlayCtx.clearRect(0,0,overlay.width, overlay.height); }

    function onResults(results) {
      clearOverlay();
      if (!running) return;

      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        setStatus('Show your hand to the camera');
        resetDrawingState();
        return;
      }

      const landmarks = results.multiHandLandmarks[0];
      const wrist = landmarks[0];
      // We will use the index finger tip for the cursor position
      const indexTip = landmarks[8];

      // --- High-Accuracy "Hold-to-Draw" Pinch Gesture ---
      // Hysteresis: Use different thresholds for turning drawing on and off
      // to prevent flickering when the pinch distance is unstable.
      const thumbTip = landmarks[4];
      const pinchDist = distance(indexTip, thumbTip);
      const PINCH_ON_THRESHOLD = 0.06;
      const PINCH_OFF_THRESHOLD = 0.09;

      if (pinchDist < PINCH_ON_THRESHOLD) {
        isDrawing = true;
      } else if (pinchDist > PINCH_OFF_THRESHOLD) {
        isDrawing = false;
        lastPt = null; // Reset last point when we stop drawing
      }

      // Pixel coords (mirrored)
      let {x, y} = toPixel(indexTip);

      let smoothingFactor;
      if (isDrawing) {
        smoothingFactor = 0.25; // A stable factor for smooth, predictable lines.
      } else {
        const velocity = lastRawPt ? distance({x,y,z:0}, {x:lastRawPt.x, y:lastRawPt.y, z:0}) : 0;
        const minFactor = 0.20, maxFactor = 0.70;
        smoothingFactor = Math.max(minFactor, Math.min(maxFactor, velocity * 0.1));
      }
      lastRawPt = {x, y}; // Update for next frame's velocity calculation
      smoothX = lowpass(smoothX, x, smoothingFactor);
      smoothY = lowpass(smoothY, y, smoothingFactor);
      x = smoothX; y = smoothY;

      // HUD + cursor
      if (isErasing) {
        setStatus(isDrawing ? 'Erasing...' : 'Eraser Mode');
        drawDot(x, y, 6, '#ffffff'); // White cursor for eraser
      } else {
        setStatus(isDrawing ? 'Drawing (pinch held)' : 'Moving (open hand)');
        drawDot(x, y, 6, isDrawing ? '#8ef9a5' : '#7aa2ff'); // Green when drawing, blue when moving
      }

      // Draw path while pinched
      if (isDrawing) {
        if (isErasing) {
          eraseCircle(x, y);
        } else {
          if (lastPt) drawLine(lastPt.x, lastPt.y, x, y);
        }
        lastPt = {x, y};
      }

      // The skeleton drawing was removed as it is computationally expensive and not essential
      // for the core user experience, providing a significant performance boost on mobile devices.
    }

    async function init() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      } catch (e) {
        alert('Camera permission is required. Please allow access and reload.\n\n' + e);
        throw e;
      }

      hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
      hands.setOptions({ // Performance-tuned settings for mobile
        maxNumHands: 1,
        modelComplexity: 0, // 0 = lite, 1 = full. Lite is much faster for mobile.
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6
      });
      hands.onResults(onResults);

      camera = new Camera(video, {
        onFrame: async () => { await hands.send({ image: video }); },
        // Use a lower resolution for much better performance on mobile devices.
        // 640x360 is a good balance of performance and accuracy.
        width: 640,
        height: 360
      });

      running = true;
      await camera.start();

      startBtn.disabled = true;
      pauseBtn.disabled = false;
      clearBtn.disabled = false;
      eraserBtn.disabled = false;
      saveBtn.disabled = false;
      setStatus('Camera running — show your hand');
    }

    startBtn.addEventListener('click', init);
    pauseBtn.addEventListener('click', async () => {
      if (!camera) return;
      running = false;
      camera.stop(); // No need to await this
      resetDrawingState(); // Reset drawing state when pausing
      pauseBtn.disabled = true; resumeBtn.disabled = false;
      setStatus('Paused');
    });
    resumeBtn.addEventListener('click', async () => {
      if (!camera) return;
      running = true;
      resetDrawingState(); // Ensure a clean state on resume
      await camera.start();
      resumeBtn.disabled = true; pauseBtn.disabled = false;
      setStatus('Camera running — show your hand');
    });

    clearBtn.addEventListener('click', () => {
      drawCtx.clearRect(0,0,drawing.width, drawing.height);
      resetDrawingState(); // Reset drawing state when clearing
      if (running) setStatus('Moving (open hand)');
    });

    eraserBtn.addEventListener('click', () => {
      isErasing = !isErasing;
      eraserBtn.classList.toggle('active', isErasing);
    });

    saveBtn.addEventListener('click', () => {
      // Merge drawing over a transparent background for export
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = drawing.width; exportCanvas.height = drawing.height;
      const ex = exportCanvas.getContext('2d');
      ex.drawImage(drawing, 0, 0);
      const url = exportCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = 'airdraw.png'; a.click();
    });

    // Ensure canvases match stage size after video starts (for mobile/orientation changes)
    const resizeObserver = new ResizeObserver(() => fitCanvases());
    resizeObserver.observe(document.getElementById('stage'));
