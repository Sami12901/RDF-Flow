# Contributing to RDF Flow

Thank you for your interest in contributing to **RDF Flow**! We welcome bug reports, feature requests, documentation improvements, and code contributions.

## Development Setup

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Rust**: stable toolchain (`rustup update`)
- **Python**: 3.9+ with Pillow (`pip install pillow`)
- **Git**

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rdf-flow.git
   cd rdf-flow
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Generate icons and branding assets:
   ```bash
   python scripts/generate_icons.py
   ```
5. Run the synthetic audio test harness:
   ```bash
   python scripts/synthetic_audio_test.py
   ```
6. Start the local development server:
   ```bash
   npm run dev
   ```

## Pull Request Guidelines
- Ensure `cargo test` in `src-tauri` passes.
- Ensure `python scripts/synthetic_audio_test.py` passes.
- Follow consistent TypeScript and Rust code formatting.
