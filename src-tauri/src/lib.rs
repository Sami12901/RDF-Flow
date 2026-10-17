pub mod audio;
pub mod config;
pub mod injector;
pub mod polisher;
pub mod stt;

use audio::AudioManager;
use config::{Config, ConfigManager};
use injector::TextInjector;
use polisher::{Polisher, ToneMode};
use stt::{STTEngine, STTProvider};
use tauri::Manager;

#[tauri::command]
fn start_recording(state: tauri::State<'_, AudioManager>) -> Result<(), String> {
    state.start_recording();
    Ok(())
}

#[tauri::command]
async fn stop_recording_and_process(
    state: tauri::State<'_, AudioManager>,
    provider_str: String,
    mode_str: String,
    api_key: String,
    auto_inject: bool,
) -> Result<String, String> {
    let audio_data = state.stop_recording().await;
    let provider = STTProvider::from_str(&provider_str);
    let mode = ToneMode::from_str(&mode_str);

    // 1. Transcribe audio
    let raw_text = STTEngine::transcribe(&audio_data, provider, &api_key).await?;

    // 2. Polish text with AI
    let polished = Polisher::polish(&raw_text, mode);

    // 3. Inject into active cursor if enabled
    if auto_inject && !polished.is_empty() {
        let _ = TextInjector::inject(&polished);
    }

    Ok(polished)
}

#[tauri::command]
fn polish_text_cmd(raw: String, mode: String) -> String {
    let tone_mode = ToneMode::from_str(&mode);
    Polisher::polish(&raw, tone_mode)
}

#[tauri::command]
fn inject_text_cmd(text: String) -> Result<(), String> {
    TextInjector::inject(&text)
}

#[tauri::command]
fn load_config_cmd() -> Config {
    ConfigManager::load()
}

#[tauri::command]
fn save_config_cmd(cfg: Config) -> Result<(), String> {
    ConfigManager::save(&cfg)
}

#[tauri::command]
async fn test_pipeline_cmd(sample_text: String, mode: String) -> Result<String, String> {
    let tone_mode = ToneMode::from_str(&mode);
    let polished = Polisher::polish(&sample_text, tone_mode);
    TextInjector::set_dry_run(true);
    TextInjector::inject(&polished)?;
    Ok(polished)
}

pub fn run() {
    let audio_manager = AudioManager::new();

    tauri::Builder::default()
        .manage(audio_manager)
        .invoke_handler(tauri::generate_handler![
            start_recording,
            stop_recording_and_process,
            polish_text_cmd,
            inject_text_cmd,
            load_config_cmd,
            save_config_cmd,
            test_pipeline_cmd,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    println!("[RDF Flow] Window initialized: {:?}", window.title());
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running RDF Flow application");
}
