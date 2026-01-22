# Tauri Test Bench (React + TypeScript)

A small Tauri v2 app meant for quickly testing common integrations end-to-end.

## What you can test in the UI

- **Invoke (Rust commands)**: calls `greet` and logs the result.
- **Dialogs + File Read/Write**:
  - uses the **dialog plugin** to pick a file / choose a save location
  - uses **Rust commands** to read/write the file contents
- **Directory listing**: pick a folder and list its entries via a Rust command.

## Run it

From this folder:

```bash
npm install
npm run tauri dev
```

## Notes

- Rust commands live in `src-tauri/src/lib.rs`.
- The dialog permission is enabled in `src-tauri/capabilities/default.json`.
