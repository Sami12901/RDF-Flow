/// RDF Flow - Configuration Manager

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub provider: String,
    pub mode: String,
    pub hotkey: String,
    pub auto_inject: bool,
    pub groq_api_key: String,
    pub google_api_key: String,
    pub openai_api_key: String,
    pub deepgram_api_key: String,
    pub local_model_path: String,
    pub silence_threshold_ms: u64,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            provider: "groq".to_string(),
            mode: "casual".to_string(),
            hotkey: "Ctrl+Space".to_string(),
            auto_inject: true,
            groq_api_key: std::env::var("GROQ_API_KEY").unwrap_or_default(),
            google_api_key: std::env::var("GOOGLE_API_KEY").unwrap_or_default(),
            openai_api_key: std::env::var("OPENAI_API_KEY").unwrap_or_default(),
            deepgram_api_key: std::env::var("DEEPGRAM_API_KEY").unwrap_or_default(),
            local_model_path: "models/ggml-base.bin".to_string(),
            silence_threshold_ms: 1500,
        }
    }
}

pub struct ConfigManager;

impl ConfigManager {
    pub fn config_path() -> PathBuf {
        let mut path = dirs_next::config_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("rdf-flow");
        path.push("config.json");
        path
    }

    pub fn load() -> Config {
        // First try .env in current working dir
        let _ = dotenv::dotenv();

        let path = Self::config_path();
        if path.exists() {
            if let Ok(data) = fs::read_to_string(&path) {
                if let Ok(cfg) = serde_json::from_str::<Config>(&data) {
                    return cfg;
                }
            }
        }
        Config::default()
    }

    pub fn save(cfg: &Config) -> Result<(), String> {
        let path = Self::config_path();
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        let data = serde_json::to_string_pretty(cfg).map_err(|e| e.to_string())?;
        fs::write(&path, data).map_err(|e| e.to_string())
    }
}

mod dirs_next {
    use std::path::PathBuf;
    pub fn config_dir() -> Option<PathBuf> {
        #[cfg(target_os = "windows")]
        {
            std::env::var_os("APPDATA").map(PathBuf::from)
        }
        #[cfg(not(target_os = "windows"))]
        {
            std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".config"))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let cfg = Config::default();
        assert_eq!(cfg.provider, "groq");
        assert_eq!(cfg.mode, "casual");
        assert!(cfg.auto_inject);
    }
}
