# Ganesh | AirDraw ✍️ — Draw in the Air with Your Hand

 <!-- Replace with a GIF or screenshot of your project! -->

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://imgshields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/MediaPipe-007F73?style=for-the-badge" alt="MediaPipe">
</p>

Experience the future of digital art with **AirDraw**, a web application that transforms your hand into a virtual paintbrush. Using just your webcam, you can draw in the air with intuitive gestures, bringing your ideas to life in a magical, touchless interface.

**[➡️ View Live Demo](https://your-github-username.github.io/AirDraw/)** 

---

## ✨ Key Features

-   **Real-Time Gesture Control:** Draw, move, and erase using a precise "hold-to-draw" pinch gesture.
-   **Dynamic Drawing Tools:** Instantly change brush color and size with an interactive toolbar.
-   **Selective Eraser:** Correct mistakes with a dedicated eraser mode, featuring a larger radius for efficient clearing.
-   **Advanced Cursor Smoothing:** A sophisticated dual-mode algorithm provides snappy cursor movement for positioning and incredibly stable, clean lines for drawing.
-   **Live Camera Preview:** See yourself as you create, with a mirrored video feed for natural, intuitive interaction.
-   **Save Your Work:** Export your masterpiece as a high-quality PNG file with a single click.
-   **Fully Responsive Design:** A seamless experience on desktop, tablet, and mobile devices, powered by Bootstrap 5.
-   **Modern & Professional UI:** A sleek, dark-themed interface with a "frosted glass" effect and clear visual feedback for all actions.

## 🛠️ Technology Stack

-   **Frontend:** HTML5, CSS3, modern JavaScript (ES6)
-   **UI Framework:** [Bootstrap 5](https://getbootstrap.com/) for a responsive layout and professional components.
-   **Core AI Technology:** [Google's MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands) for robust, real-time hand and finger tracking.
-   **Rendering:** HTML5 `<canvas>` for displaying the video feed, drawing overlay, and final artwork.

## ⚙️ How It Works

AirDraw leverages the power of machine learning directly in the browser. Here's a breakdown of the process:

1.  The application accesses the user's webcam via the browser's `MediaDevices` API.
2.  The live video stream is sent frame-by-frame to the **MediaPipe Hands** library.
3.  MediaPipe analyzes each frame to detect the presence of a hand and identifies the 3D coordinates of 21 key landmarks (finger joints, wrist, etc.).
4.  Custom JavaScript logic then interprets the positions of these landmarks to:
    -   Calculate the distance between the thumb and index finger to detect a "pinch".
    -   Implement hysteresis (separate on/off thresholds) to prevent line breaks and ensure smooth drawing.
    -   Track the index finger's position to move the cursor.
    -   Apply the dual-mode smoothing algorithm for perfect lines and responsive control.
5.  The final drawing actions are rendered onto an HTML5 Canvas, which is layered on top of the video feed.

## 🚀 How to Use

1.  Click **"Start Camera"** and grant the browser permission to use your webcam.
2.  Hold your hand up to the camera (for best results, be in a well-lit area).
3.  **Pinch your thumb and index finger together** to start drawing.
4.  **Release the pinch** to stop drawing and move the cursor freely.
5.  Use the toolbar to change color, adjust brush size, or activate the **Eraser**.
6.  Click **"Clear"** to start over or **"Save PNG"** to download your creation.

## 💻 Local Development Setup

This project is self-contained and requires no complex build steps.

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-github-username/AirDraw.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd AirDraw
    ```
3.  Open the `index.html` file in a modern web browser (like Chrome, Firefox, or Edge).

**That's it! You're ready to start drawing.**

---

**Copyright © 2025 Ganesh. All Rights Reserved.**
