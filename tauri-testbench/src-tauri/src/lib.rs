// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn ping(message: &str) -> String {
    format!("pong: {}", message)
}

#[tauri::command]
fn read_text_file(path: &str) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| format!("read_text_file failed: {e}"))
}

#[tauri::command]
fn write_text_file(path: &str, contents: &str) -> Result<(), String> {
    std::fs::write(path, contents).map_err(|e| format!("write_text_file failed: {e}"))
}

#[tauri::command]
fn list_dir(path: &str) -> Result<Vec<String>, String> {
    let mut out = Vec::new();
    let entries =
        std::fs::read_dir(path).map_err(|e| format!("list_dir read_dir failed: {e}"))?;
    for entry in entries {
        let entry = entry.map_err(|e| format!("list_dir entry failed: {e}"))?;
        out.push(entry.path().display().to_string());
    }
    out.sort();
    Ok(out)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            ping,
            read_text_file,
            write_text_file,
            list_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
