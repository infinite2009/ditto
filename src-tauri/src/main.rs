// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_deep_link;
use tauri_plugin_sql;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri_plugin_deep_link::prepare("com.voltron.dev");
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            // If you need macOS support this must be called in .setup() !
            // Otherwise this could be called right after prepare() but then you don't have access to tauri APIs
            let handle = app.handle();
            tauri_plugin_deep_link::register(
                "voltron",
                move |request| {
                    // dbg!(&request);
                    handle.emit_all("scheme-request-received", request).unwrap();
                },
            )
                .unwrap(/* If listening to the scheme is optional for your app, you don't want to unwrap here. */);

            // If you also need the url when the primary instance was started by the custom scheme, you currently have to read it yourself
            /*
            #[cfg(not(target_os = "macos"))] // on macos the plugin handles this (macos doesn't use cli args for the url)
            if let Some(url) = std::env::args().nth(1) {
              app.emit_all("scheme-request-received", url).unwrap();
            }
            */

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                #[cfg(target_os = "macos")]
                event.window().minimize().unwrap();

                #[cfg(not(target_os = "macos"))]
                event.window().close().unwrap();

                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
