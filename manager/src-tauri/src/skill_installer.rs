use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillStatus {
    pub installed: bool,
    pub version: Option<String>,
    pub path: Option<String>,
    pub error: Option<String>,
}

/// Check if the skill is installed
pub fn check_skill_installed() -> SkillStatus {
    let home = match dirs::home_dir() {
        Some(h) => h,
        None => return SkillStatus {
            installed: false,
            version: None,
            path: None,
            error: Some("Cannot find home directory".to_string()),
        },
    };

    let skill_dir = home.join(".claude/skills/claude-to-im");
    let daemon_file = skill_dir.join("dist/daemon.mjs");

    if !skill_dir.exists() {
        return SkillStatus {
            installed: false,
            version: None,
            path: None,
            error: None,
        };
    }

    if !daemon_file.exists() {
        return SkillStatus {
            installed: false,
            version: None,
            path: Some(skill_dir.to_string_lossy().to_string()),
            error: Some("Skill directory exists but not built (missing dist/daemon.mjs)".to_string()),
        };
    }

    // Read version from package.json
    let version = std::fs::read_to_string(skill_dir.join("package.json"))
        .ok()
        .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok())
        .and_then(|v| v.get("version")?.as_str().map(|s| s.to_string()));

    SkillStatus {
        installed: true,
        version,
        path: Some(skill_dir.to_string_lossy().to_string()),
        error: None,
    }
}

/// Install the skill by cloning from GitHub
#[tauri::command]
pub async fn install_skill() -> Result<SkillStatus, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let skills_dir = home.join(".claude/skills");
    let skill_dir = skills_dir.join("claude-to-im");

    // Create skills directory
    std::fs::create_dir_all(&skills_dir).map_err(|e| format!("Failed to create skills dir: {}", e))?;

    // Remove existing directory if exists
    if skill_dir.exists() {
        std::fs::remove_dir_all(&skill_dir).map_err(|e| format!("Failed to remove old skill: {}", e))?;
    }

    // Clone the repository
    #[cfg(target_os = "windows")]
    let output = std::process::Command::new("powershell")
        .args([
            "-Command",
            &format!("git clone https://github.com/xixi-box/Claude-to-IM-skill.git \"{}\"", skill_dir.to_string_lossy()),
        ])
        .output()
        .map_err(|e| format!("Failed to run git clone: {}", e))?;

    #[cfg(not(target_os = "windows"))]
    let output = std::process::Command::new("git")
        .args([
            "clone",
            "https://github.com/xixi-box/Claude-to-IM-skill.git",
            &skill_dir.to_string_lossy(),
        ])
        .output()
        .map_err(|e| format!("Failed to run git clone: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git clone failed: {}", stderr));
    }

    // Install dependencies
    #[cfg(target_os = "windows")]
    let npm_output = std::process::Command::new("powershell")
        .args([
            "-Command",
            &format!("cd \"{}\"; npm install", skill_dir.to_string_lossy()),
        ])
        .output()
        .map_err(|e| format!("Failed to run npm install: {}", e))?;

    #[cfg(not(target_os = "windows"))]
    let npm_output = std::process::Command::new("npm")
        .args(["install"])
        .current_dir(&skill_dir)
        .output()
        .map_err(|e| format!("Failed to run npm install: {}", e))?;

    if !npm_output.status.success() {
        let stderr = String::from_utf8_lossy(&npm_output.stderr);
        return Err(format!("npm install failed: {}", stderr));
    }

    // Build the project
    #[cfg(target_os = "windows")]
    let build_output = std::process::Command::new("powershell")
        .args([
            "-Command",
            &format!("cd \"{}\"; npm run build", skill_dir.to_string_lossy()),
        ])
        .output()
        .map_err(|e| format!("Failed to run npm build: {}", e))?;

    #[cfg(not(target_os = "windows"))]
    let build_output = std::process::Command::new("npm")
        .args(["run", "build"])
        .current_dir(&skill_dir)
        .output()
        .map_err(|e| format!("Failed to run npm build: {}", e))?;

    if !build_output.status.success() {
        let stderr = String::from_utf8_lossy(&build_output.stderr);
        return Err(format!("npm build failed: {}", stderr));
    }

    Ok(check_skill_installed())
}

#[tauri::command]
pub async fn get_skill_status() -> Result<SkillStatus, String> {
    Ok(check_skill_installed())
}