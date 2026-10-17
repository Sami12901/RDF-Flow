# Changelog

All notable changes to **RDF Flow** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-17

### Added
- **Core Architecture**:
  - Tauri v2 (Rust + React/TypeScript) lightweight cross-platform desktop application.
  - Multi-provider Speech-to-Text abstraction supporting:
    - Groq Whisper (ultra-low latency <250ms, free tier)
    - Google Gemini 1.5 Flash speech transcription (free tier)
    - OpenAI Whisper-1
    - Deepgram Nova-2
    - Local offline fallback for 100% privacy and zero-API operation.
- **AI Text Polishing Engine**:
  - Speech disfluency filter (eliminates "um", "uh", "like", "you know", false starts).
  - 5 Tone Modes:
    - `Casual`: Everyday clean diction, automatic capitalization, and punctuation.
    - `Professional`: Executive vocabulary, formal idioms ("gonna" -> "going to"), structured sentences.
    - `Code / Developer`: Preserves identifiers (camelCase, snake_case), markdown code formatting.
    - `Bullets`: Structures stream-of-consciousness ideas into markdown action item lists.
    - `Raw`: Verbatim transcription without AI post-processing.
- **User Interface & Interaction**:
  - Signature Wispr Flow-style Floating Dynamic Waveform Pill with translucent glassmorphic design.
  - 6-bar audio-reactive equalizer visualizer displaying real-time speech amplitude.
  - Status transition animations (`idle` -> `listening` -> `polishing` -> `injected`).
  - System Tray menu with quick mode toggles and audio controls.
  - Global hotkey support (default `Ctrl+Space`).
  - Active window direct text injection (simulated keyboard typing / clipboard paste).
  - Comprehensive Settings Modal for configuring API keys, audio devices, and custom hotkeys.
  - History Drawer storing past dictations with one-click clipboard copying and re-injection.
- **Branding Assets Suite**:
  - "Cyber-Acoustic Gradient" identity: Midnight-slate squircle with electric-cyan (`#00F2FE`) to violet (`#7F00FF`) acoustic flow bars.
  - Vector SVG logo (`assets/logo.svg`) and app icon (`assets/icon.svg`).
  - Multi-resolution Windows `assets/icon.ico` (16, 24, 32, 48, 64, 128, 256 px).
  - PNG icon set (`assets/icon-1024.png` down to `assets/icon-32.png`).
  - GitHub repository header banner (`assets/banner.svg`).
  - Python asset generator script (`scripts/generate_icons.py`).
- **Testing & Verification**:
  - Synthetic audio test harness (`scripts/synthetic_audio_test.py`) with 16kHz speech formant synthesis and end-to-end pipeline verification.
- **CI/CD & Releases**:
  - GitHub Actions automated multi-platform release workflow (`.github/workflows/release.yml`) producing `.msi`/`.exe` (Windows), `.dmg` (macOS), and `.deb`/`.AppImage` (Linux).
  - Continuous integration workflow (`.github/workflows/ci.yml`).
