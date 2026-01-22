import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import "./App.css";

type LogItem = {
  ts: string;
  message: string;
};

function App() {
  const [name, setName] = useState("World");
  const [greetMsg, setGreetMsg] = useState<string>("");

  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [fileContents, setFileContents] = useState<string>("");

  const [selectedDirPath, setSelectedDirPath] = useState<string>("");
  const [dirEntries, setDirEntries] = useState<string[]>([]);

  const [logs, setLogs] = useState<LogItem[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) =>
      [{ ts: new Date().toLocaleTimeString(), message }, ...prev].slice(0, 50),
    );
  };

  const canSave = useMemo(() => fileContents.length > 0, [fileContents]);

  async function doGreet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    const msg = await invoke<string>("greet", { name });
    setGreetMsg(msg);
    addLog(`invoke greet("${name}")`);
  }

  async function pickAndReadFile() {
    const path = await open({
      title: "Pick a text file to read",
      multiple: false,
      directory: false,
    });

    if (typeof path !== "string") return;

    setSelectedFilePath(path);
    addLog(`dialog open -> ${path}`);

    try {
      const contents = await invoke<string>("read_text_file", { path });
      setFileContents(contents);
      addLog(`read_text_file ok (${contents.length} chars)`);
    } catch (e) {
      addLog(`read_text_file error: ${String(e)}`);
    }
  }

  async function saveFileAs() {
    const path = await save({
      title: "Save file as",
      defaultPath: selectedFilePath || "tauri-testbench.txt",
    });

    if (!path) return;

    addLog(`dialog save -> ${path}`);

    try {
      await invoke("write_text_file", { path, contents: fileContents });
      addLog(`write_text_file ok (${fileContents.length} chars)`);
    } catch (e) {
      addLog(`write_text_file error: ${String(e)}`);
    }
  }

  async function pickAndListDir() {
    const path = await open({
      title: "Pick a folder to list",
      multiple: false,
      directory: true,
    });

    if (typeof path !== "string") return;

    setSelectedDirPath(path);
    addLog(`dialog open (dir) -> ${path}`);

    try {
      const entries = await invoke<string[]>("list_dir", { path });
      setDirEntries(entries);
      addLog(`list_dir ok (${entries.length} entries)`);
    } catch (e) {
      addLog(`list_dir error: ${String(e)}`);
    }
  }

  useEffect(() => {
    invoke<string>("ping", { message: "hello from webview" })
      .then((msg) => addLog(msg))
      .catch((e) => addLog(`ping error: ${String(e)}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container">
      <header className="header">
        <h1>Tauri Test Bench</h1>
        <p className="muted">
          Quick buttons to test <code>invoke</code>, dialogs, and filesystem I/O.
        </p>
      </header>

      <section className="card">
        <h2>Invoke (Rust commands)</h2>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            void doGreet();
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Name…"
          />
          <button type="submit">Greet</button>
        </form>
        {greetMsg ? <div className="output">{greetMsg}</div> : null}
      </section>

      <section className="card">
        <h2>Dialogs + File Read/Write (via Rust)</h2>
        <div className="row wrap">
          <button type="button" onClick={() => void pickAndReadFile()}>
            Pick file &amp; read
          </button>
          <button
            type="button"
            onClick={() => void saveFileAs()}
            disabled={!canSave}
          >
            Save as…
          </button>
        </div>

        {selectedFilePath ? (
          <div className="muted">
            <div>
              <strong>File:</strong> <code>{selectedFilePath}</code>
            </div>
          </div>
        ) : null}

        <textarea
          className="textarea"
          value={fileContents}
          onChange={(e) => setFileContents(e.currentTarget.value)}
          placeholder="File contents will appear here (or type anything and Save as…)."
          rows={10}
        />
      </section>

      <section className="card">
        <h2>Directory listing (via Rust)</h2>
        <div className="row wrap">
          <button type="button" onClick={() => void pickAndListDir()}>
            Pick folder &amp; list entries
          </button>
        </div>

        {selectedDirPath ? (
          <div className="muted">
            <div>
              <strong>Folder:</strong> <code>{selectedDirPath}</code>
            </div>
          </div>
        ) : null}

        {dirEntries.length ? (
          <ul className="list">
            {dirEntries.map((p) => (
              <li key={p}>
                <code>{p}</code>
              </li>
            ))}
          </ul>
        ) : (
          <div className="muted">No entries loaded yet.</div>
        )}
      </section>

      <section className="card">
        <h2>Logs</h2>
        {logs.length ? (
          <ul className="list">
            {logs.map((l, idx) => (
              <li key={`${l.ts}-${idx}`}>
                <span className="muted">{l.ts}</span> {l.message}
              </li>
            ))}
          </ul>
        ) : (
          <div className="muted">No logs yet.</div>
        )}
      </section>
    </main>
  );
}

export default App;
