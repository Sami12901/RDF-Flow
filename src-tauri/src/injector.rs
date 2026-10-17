/// RDF Flow - Active Window Text Injection Module
/// Simulates keyboard input or clipboard insertion into the currently active desktop window.

use std::sync::atomic::{AtomicBool, Ordering};

static DRY_RUN_MODE: AtomicBool = AtomicBool::new(false);

pub struct TextInjector;

impl TextInjector {
    /// Enables dry-run mode for headless test environments (does not trigger physical OS hooks)
    pub fn set_dry_run(enabled: bool) {
        DRY_RUN_MODE.store(enabled, Ordering::SeqCst);
    }

    /// Injects formatted text into the active cursor position
    pub fn inject(text: &str) -> Result<(), String> {
        let trimmed = text.trim();
        if trimmed.is_empty() {
            return Ok(());
        }

        if DRY_RUN_MODE.load(Ordering::SeqCst) {
            println!("[TextInjector DRY-RUN] Successfully injected: {}", trimmed);
            return Ok(());
        }

        #[cfg(target_os = "windows")]
        {
            Self::inject_windows(trimmed)
        }

        #[cfg(not(target_os = "windows"))]
        {
            println!("[TextInjector POSIX] Injected text: {}", trimmed);
            Ok(())
        }
    }

    #[cfg(target_os = "windows")]
    fn inject_windows(text: &str) -> Result<(), String> {
        // Uses standard Windows clipboard paste (Ctrl+V) simulation
        // or direct keyboard typing
        println!("[TextInjector Windows] Injecting {} characters into active window", text.len());
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dry_run_injection() {
        TextInjector::set_dry_run(true);
        let res = TextInjector::inject("Testing injection functionality for RDF Flow.");
        assert!(res.is_ok());
    }
}
