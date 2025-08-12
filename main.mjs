import { app, BrowserWindow, ipcMain, shell, dialog, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { capture } from './capture.mjs';
<<<<<<< HEAD
import updater from 'electron-updater'; // CommonJS default import for ESM
=======
import updater from 'electron-updater'; // CommonJS default import
>>>>>>> 784a7264a92e4be797329afadfd5d8028025a143
const { autoUpdater } = updater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray;

<<<<<<< HEAD
=======
// Ensure Windows taskbar identity and icon mapping
>>>>>>> 784a7264a92e4be797329afadfd5d8028025a143
app.setAppUserModelId('com.sparkfusion.sparkshot');

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 700,
    resizable: false,
    title: 'SparkShot by SparkFusion Marketing',
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, 'sparkshot.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.removeMenu();
  mainWindow.loadFile('ui.html');
}

function setupTray() {
  const iconPath = path.join(__dirname, 'sparkshot.ico');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);
  tray.setToolTip('SparkShot');
  const menu = Menu.buildFromTemplate([
    { label: 'Open SparkShot', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } });
}

app.whenReady().then(() => {
  createWindow();
  setupTray();
  try { setupAutoUpdates(); } catch {}
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

<<<<<<< HEAD
function getRoot() {
  return app.isPackaged ? path.dirname(process.execPath) : path.resolve(__dirname);
}
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function logLine(lines, msg) { try { lines.push(msg); } catch {} }

=======
// ---- Root resolver ----
function getRoot() {
  // Packaged: next to SparkShot.exe
  // Dev: project folder
  return app.isPackaged ? path.dirname(process.execPath) : path.resolve(__dirname);
}
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// ---- IPC ----
>>>>>>> 784a7264a92e4be797329afadfd5d8028025a143
ipcMain.handle('shoot', async (_evt, urls) => {
  const root = getRoot();
  const screensDir = path.join(root, 'screens');
  const logsDir = path.join(root, 'logs');
  ensureDir(screensDir);
  ensureDir(logsDir);

  const total = urls.length;
  const outLines = [];
  const start = new Date();
<<<<<<< HEAD
  logLine(outLines, `[SparkShot] Run started ${start.toISOString()}`);
  logLine(outLines, `[SparkShot] Output root: ${root}`);
=======
  outLines.push(`[SparkShot] Run started ${start.toISOString()}`);
  outLines.push(`[SparkShot] Output root: ${root}`);
>>>>>>> 784a7264a92e4be797329afadfd5d8028025a143

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      sendProgress({ step: i + 1, total, url, status: 'starting' });
      const { desktopFile, mobileFile } = await capture(url, screensDir);
<<<<<<< HEAD
      logLine(outLines, `Processing ${url}`);
      logLine(outLines, `Saved: ${desktopFile}`);
      logLine(outLines, `Saved: ${mobileFile}`);
      sendProgress({ step: i + 1, total, url, status: 'done', desktopFile, mobileFile });
    } catch (e) {
      logLine(outLines, `Failed: ${url} -> ${e.message}`);
=======
      outLines.push(`Processing ${url}`);
      outLines.push(`Saved: ${desktopFile}`);
      outLines.push(`Saved: ${mobileFile}`);
      sendProgress({ step: i + 1, total, url, status: 'done', desktopFile, mobileFile });
    } catch (e) {
      outLines.push(`Failed: ${url} -> ${e.message}`);
>>>>>>> 784a7264a92e4be797329afadfd5d8028025a143
      sendProgress({ step: i + 1, total, url, status: 'error', error: e.message });
    }
  }

  const end = new Date();
<<<<<<< HEAD
  logLine(outLines, `[SparkShot] Run finished ${end.toISOString()}`);

  const stamp = end.toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(logsDir, `sparkshot-${stamp}.log`);
  try { fs.writeFileSync(logPath, outLines.join('\n'), 'utf8'); } catch {}
=======
  outLines.push(`[SparkShot] Run finished ${end.toISOString()}`);

  const stamp = end.toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(logsDir, `sparkshot-${stamp}.log`);
  fs.writeFileSync(logPath, outLines.join('\n'), 'utf8');
>>>>>>> 784a7264a92e4be797329afadfd5d8028025a143

  await shell.openPath(screensDir);
  sendProgress({ step: total, total, url: null, status: 'all-done', logPath });
  return outLines.join('\n');
});

ipcMain.handle('openScreens', async () => {
  const root = getRoot();
  const screens = path.join(root, 'screens');
  ensureDir(screens);
  await shell.openPath(screens);
  return true;
});

ipcMain.handle('openLogs', async () => {
  const root = getRoot();
  const logs = path.join(root, 'logs');
  ensureDir(logs);
  await shell.openPath(logs);
  return true;
});

ipcMain.handle('openExternal', async (_evt, url) => {
  try { await shell.openExternal(url); return true; } catch { return false; }
});

<<<<<<< HEAD
ipcMain.handle('checkUpdates', async () => {
  if (!app.isPackaged) {
    sendProgress({ status: 'update-error', error: 'Updates only work in the installed app. Build the installer, install it, then try again.' });
    return { ok: false, reason: 'not-packaged' };
  }
  try {
    sendProgress({ status: 'update-checking' });
    await autoUpdater.checkForUpdates();
    return { ok: true };
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    sendProgress({ status: 'update-error', error: msg });
    return { ok: false, reason: 'error', error: msg };
=======
ipcMain.handle('importUrls', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Import URLs',
    filters: [{ name: 'Text files', extensions: ['txt'] }, { name: 'All files', extensions: ['*'] }],
    properties: ['openFile']
  });
  if (canceled || !filePaths || !filePaths[0]) return { text: '', path: null };
  try {
    const text = fs.readFileSync(filePaths[0], 'utf8');
    return { text, path: filePaths[0] };
  } catch (e) {
    return { text: '', path: null, error: e.message };
  }
});

ipcMain.handle('importFromPath', async (_evt, p) => {
  try {
    const text = fs.readFileSync(p, 'utf8');
    return { text, path: p };
  } catch (e) {
    return { text: '', path: null, error: e.message };
  }
});

ipcMain.handle('exportUrls', async (_evt, text) => {
  const root = getRoot();
  const ts = (() => {
    const d = new Date(); const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  })();
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export URLs',
    defaultPath: path.join(root, `urls-${ts}.txt`),
    filters: [{ name: 'Text files', extensions: ['txt'] }]
  });
  if (canceled || !filePath) return { saved: false, path: null };
  try {
    fs.writeFileSync(filePath, text || '', 'utf8');
    return { saved: true, path: filePath };
  } catch (e) {
    return { saved: false, path: null, error: e.message };
  }
});

ipcMain.handle('checkUpdates', async () => {
  try {
    await autoUpdater.checkForUpdates();
    return true;
  } catch {
    return false;
>>>>>>> 784a7264a92e4be797329afadfd5d8028025a143
  }
});

function sendProgress(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('progress', payload);
  }
}

function setupAutoUpdates() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
<<<<<<< HEAD

  autoUpdater.on('checking-for-update', () => {
    sendProgress({ status: 'update-checking' });
  });
  autoUpdater.on('update-available', (info) => {
    sendProgress({ status: 'update-available', version: info?.version || null, releaseName: info?.releaseName || null });
  });
  autoUpdater.on('update-not-available', (info) => {
    sendProgress({ status: 'update-none', current: app.getVersion(), info });
  });
=======
  autoUpdater.on('update-available', () => { sendProgress({ status: 'update-available' }); });
>>>>>>> 784a7264a92e4be797329afadfd5d8028025a143
  autoUpdater.on('update-downloaded', (_evt, info) => {
    sendProgress({ status: 'update-downloaded', version: info.version });
    dialog.showMessageBox({
      type: 'info',
      buttons: ['Install and Restart', 'Later'],
      title: 'Update Ready',
      message: `SparkShot ${info.version} downloaded.`,
      detail: 'Install now or on next launch.'
    }).then(result => { if (result.response === 0) autoUpdater.quitAndInstall(); });
  });
<<<<<<< HEAD
  autoUpdater.on('error', (err) => {
    const msg = err && err.message ? err.message : String(err);
    sendProgress({ status: 'update-error', error: msg });
  });
=======
>>>>>>> 784a7264a92e4be797329afadfd5d8028025a143
}
