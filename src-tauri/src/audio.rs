/// RDF Flow - Audio Capture & Level Analyzer

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct AudioManager {
    is_recording: Arc<AtomicBool>,
    buffer: Arc<Mutex<Vec<u8>>>,
}

impl AudioManager {
    pub fn new() -> Self {
        Self {
            is_recording: Arc::new(AtomicBool::new(false)),
            buffer: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn start_recording(&self) {
        self.is_recording.store(true, Ordering::SeqCst);
    }

    pub async fn stop_recording(&self) -> Vec<u8> {
        self.is_recording.store(false, Ordering::SeqCst);
        let mut buf = self.buffer.lock().await;
        let data = buf.clone();
        buf.clear();
        data
    }

    pub fn is_recording(&self) -> bool {
        self.is_recording.load(Ordering::SeqCst)
    }

    pub async fn append_audio(&self, pcm_chunk: &[u8]) {
        if self.is_recording() {
            let mut buf = self.buffer.lock().await;
            buf.extend_from_slice(pcm_chunk);
        }
    }

    /// Computes normalized Root Mean Square (RMS) volume from 16-bit PCM samples [0.0, 1.0]
    pub fn compute_rms(pcm_data: &[i16]) -> f32 {
        if pcm_data.is_empty() {
            return 0.0;
        }
        let sum_sq: f64 = pcm_data.iter().map(|&s| (s as f64) * (s as f64)).sum();
        let rms = (sum_sq / pcm_data.len() as f64).sqrt();
        let normalized = (rms / 32768.0).min(1.0) as f32;
        normalized
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_rms_silence() {
        let silence = vec![0i16; 1600];
        assert_eq!(AudioManager::compute_rms(&silence), 0.0);
    }

    #[test]
    fn test_compute_rms_signal() {
        let signal = vec![16384i16; 1600];
        let rms = AudioManager::compute_rms(&signal);
        assert!((rms - 0.5).abs() < 0.01);
    }
}
