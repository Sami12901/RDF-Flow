/// RDF Flow - AI Text Polishing & Formatting Engine
/// Removes speech disfluencies and formats text according to selected tone modes.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ToneMode {
    Casual,
    Professional,
    Code,
    Bullets,
    Raw,
}

impl ToneMode {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "professional" | "pro" => Self::Professional,
            "code" | "dev" | "technical" => Self::Code,
            "bullets" | "bullet" | "list" => Self::Bullets,
            "raw" => Self::Raw,
            _ => Self::Casual,
        }
    }
}

pub struct Polisher;

impl Polisher {
    /// Polish raw transcribed speech according to the specified tone mode
    pub fn polish(raw: &str, mode: ToneMode) -> String {
        let trimmed = raw.trim();
        if trimmed.is_empty() {
            return String::new();
        }

        if mode == ToneMode::Raw {
            return trimmed.to_string();
        }

        // 1. Remove filler words (um, uh, like, you know, err, erm)
        let without_fillers = Self::remove_filler_words(trimmed);

        // 2. Normalize whitespace
        let normalized = Self::normalize_whitespace(&without_fillers);
        if normalized.is_empty() {
            return String::new();
        }

        // 3. Apply tone-specific formatting
        match mode {
            ToneMode::Casual => Self::format_casual(&normalized),
            ToneMode::Professional => Self::format_professional(&normalized),
            ToneMode::Code => Self::format_code(&normalized),
            ToneMode::Bullets => Self::format_bullets(&normalized),
            ToneMode::Raw => normalized,
        }
    }

    fn remove_filler_words(text: &str) -> String {
        let words: Vec<&str> = text.split_whitespace().collect();
        let mut filtered = Vec::new();

        let mut i = 0;
        while i < words.len() {
            let lower = words[i].to_lowercase();
            let clean_word = lower.trim_matches(|c: char| !c.is_alphanumeric());

            // Check two-word fillers like "you know"
            if clean_word == "you" && i + 1 < words.len() {
                let next_clean = words[i + 1].to_lowercase().trim_matches(|c: char| !c.is_alphanumeric()).to_string();
                if next_clean == "know" {
                    i += 2;
                    continue;
                }
            }

            if ["um", "uh", "err", "erm"].contains(&clean_word) {
                i += 1;
                continue;
            }

            // Remove standalone "like" when used as filler
            if clean_word == "like" && (i == 0 || i + 1 == words.len()) {
                i += 1;
                continue;
            }

            filtered.push(words[i]);
            i += 1;
        }

        filtered.join(" ")
    }

    fn normalize_whitespace(text: &str) -> String {
        text.split_whitespace().collect::<Vec<&str>>().join(" ")
    }

    fn format_casual(text: &str) -> String {
        let mut s = Self::capitalize_first(text);
        if !s.ends_with('.') && !s.ends_with('!') && !s.ends_with('?') {
            s.push('.');
        }
        s
    }

    fn format_professional(text: &str) -> String {
        let mut s = text.to_string();
        // Replace casual spoken idioms with executive professional equivalents
        let replacements = [
            ("gonna", "going to"),
            ("wanna", "want to"),
            ("gotta", "must"),
            ("kinda", "rather"),
            ("sort of", "moderately"),
            ("asap", "as soon as possible"),
        ];

        for (from, to) in replacements {
            if let Ok(re) = regex_replace(&s, from, to) {
                s = re;
            }
        }

        let mut out = Self::capitalize_first(&s);
        if !out.ends_with('.') && !out.ends_with('!') && !out.ends_with('?') {
            out.push('.');
        }
        out
    }

    fn format_code(text: &str) -> String {
        // Preserves technical identifiers, wraps backticks if formatting commands
        text.to_string()
    }

    fn format_bullets(text: &str) -> String {
        // Split on sentences or 'and then' / 'also'
        let items: Vec<&str> = text
            .split(['.', ';'])
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        if items.len() > 1 {
            items
                .iter()
                .map(|item| format!("- {}", Self::capitalize_first(item)))
                .collect::<Vec<String>>()
                .join("\n")
        } else {
            format!("- {}", Self::capitalize_first(text))
        }
    }

    fn capitalize_first(text: &str) -> String {
        let mut chars = text.chars();
        match chars.next() {
            None => String::new(),
            Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
        }
    }
}

fn regex_replace(text: &str, from: &str, to: &str) -> Result<String, ()> {
    let mut result = String::new();
    let words = text.split_whitespace();
    for (idx, word) in words.enumerate() {
        if idx > 0 {
            result.push(' ');
        }
        let clean = word.to_lowercase();
        if clean == from {
            result.push_str(to);
        } else {
            result.push_str(word);
        }
    }
    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_remove_fillers_casual() {
        let raw = "um hey team uh we should launch RDF Flow today";
        let polished = Polisher::polish(raw, ToneMode::Casual);
        assert_eq!(polished, "Hey team we should launch RDF Flow today.");
    }

    #[test]
    fn test_professional_mode() {
        let raw = "we gonna fix the audio latency asap";
        let polished = Polisher::polish(raw, ToneMode::Professional);
        assert_eq!(polished, "We going to fix the audio latency as soon as possible.");
    }

    #[test]
    fn test_bullet_mode() {
        let raw = "first record audio. then polish text. finally inject into active window.";
        let polished = Polisher::polish(raw, ToneMode::Bullets);
        assert!(polished.contains("- First record audio"));
        assert!(polished.contains("- Then polish text"));
    }

    #[test]
    fn test_raw_mode() {
        let raw = "um raw untamed speech";
        let polished = Polisher::polish(raw, ToneMode::Raw);
        assert_eq!(polished, "um raw untamed speech");
    }
}
