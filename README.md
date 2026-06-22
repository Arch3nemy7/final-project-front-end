# GramSynth — Front End

The **GramSynth Augmentation Studio**: a web app that drives the StyleGAN2-ADA
pipeline for Gram-positive / Gram-negative bacteria — format datasets, train two
generators, generate synthetic crops, then run the fidelity (FID) and
feasibility (5-CNN) tests, all from the browser.

Built with **React + Vite**. It works on its own using a built-in simulation, or
connects to the backend API (see [`../server`](../server)) to show **real-time**
training data.

---

## 1. Prerequisites (install once)

- **Node.js 18 or newer** (Vite 5 needs it). Check with:
  ```bash
  node --version
  ```
  If you don't have it, install the LTS version from <https://nodejs.org>.

That's it — you do **not** need a database for the front end (it stores runs in
your browser's localStorage). See [`../server/README.md`](../server/README.md)
for the backend's database (SQLite by default — no PostgreSQL required).

---

## 2. Install the project (first time, and after pulling changes)

From this `webapp/` folder:

```bash
npm install
```

---

## 3. Turn the front end ON

You have two ways. For day-to-day work, use **dev mode**.

### Dev mode (recommended while developing)

```bash
npm run dev
```

Then open the URL it prints — by default:

> ➜  Local:   http://localhost:5173/

Leave this terminal open; it watches your files and hot-reloads on save.

### Production mode (a built, optimized copy)

```bash
npm run build      # creates the dist/ folder
npm run preview    # serves dist/ at http://localhost:4173/
```

Use this to check the final build, or copy the `dist/` folder to any static
host (Netlify, GitHub Pages, nginx, …).

---

## 4. Turn the front end OFF

The server keeps running until you stop it:

- **In the terminal where it's running:** press **`Ctrl + C`** (once; press again
  if it doesn't stop immediately). This is the normal way to turn it off.
- **Closing the terminal window** also stops it.
- **If you lost the terminal** and the port is stuck, free it on Windows:
  ```powershell
  # find what is using port 5173 (or 4173)
  netstat -ano | findstr :5173
  # stop it by the PID shown in the last column
  taskkill /PID <PID> /F
  ```

You don't lose any work: your runs are saved in the browser, and the code is on
disk.

---

## 5. Connect it to the backend (optional — for real-time data)

By default the app runs **offline** on a realistic simulation, so you can click
through the whole pipeline with no backend. To stream **real** training
telemetry from the GPU instead:

1. Start the backend (see [`../server/README.md`](../server/README.md)).
2. In this folder, create a file named **`.env.local`** (copy `.env.example`):
   ```bash
   VITE_API_BASE=http://localhost:8000
   ```
3. Restart `npm run dev` (Vite only reads env files at startup).

Now each stage you start posts to the backend and the progress bars, FID chart,
tick counter and ETA update from live Server-Sent Events. Remove the variable
(or leave it empty) to go back to the offline simulation.

> Running the GPU remotely (e.g. vast.ai)? Open an SSH tunnel so
> `localhost:8000` points at the remote server, then use the same
> `VITE_API_BASE=http://localhost:8000`. Details in the server README.

---

## 6. Useful commands

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm install`     | Install dependencies                                |
| `npm run dev`     | Start the dev server (hot reload) on :5173          |
| `npm run build`   | Build the production bundle into `dist/`            |
| `npm run preview` | Serve the built `dist/` on :4173                    |

---

## 7. Project structure

```
webapp/
├─ index.html            # page shell + Google Fonts
├─ src/
│  ├─ main.jsx           # entry; HashRouter + StoreProvider
│  ├─ App.jsx            # layout shell + routes
│  ├─ store/             # localStorage DB + state/actions + job engine
│  ├─ api/               # REST client + SSE subscription (live mode)
│  ├─ pages/             # Dashboard, Runs, Datasets, Models, Settings, RunWorkspace
│  ├─ components/        # Sidebar, charts, gallery, run-stage panels
│  └─ lib/               # formatters / math helpers
└─ public/figs/tiles/    # generated-image thumbnails
```

---

## 8. Troubleshooting

- **Port already in use** — another dev server is running; stop it (section 4)
  or run on another port: `npm run dev -- --port 5174`.
- **Blank page** — make sure you opened the URL Vite printed (with `#/` routing),
  and check the browser console (F12) for errors.
- **Want to reset the demo data** — open the app → **Settings → Reset data**.
  This restores the two sample runs and clears anything you created.
- **Changed `.env.local` but nothing happened** — stop and restart `npm run dev`;
  Vite reads env files only at startup.
