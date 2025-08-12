import { app, BrowserWindow, ipcMain, shell, dialog, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { capture } from './capture.mjs';
import updater from 'electron-updater'; // CommonJS default import for ESM
const { autoUpdater } = updater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray;

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

function getRoot() {
  return app.isPackaged ? path.dirname(process.execPath) : path.resolve(__dirname);
}
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function logLine(lines, msg) { try { lines.push(msg); } catch {} }

ipcMain.handle('shoot', async (_evt, urls) => {
  const root = getRoot();
  const screensDir = path.join(root, 'screens');
  const logsDir = path.join(root, 'logs');
  ensureDir(screensDir);
  ensureDir(logsDir);

  const total = urls.length;
  const outLines = [];
  const start = new Date();
  logLine(outLines, `[SparkShot] Run started ${start.toISOString()}`);
  logLine(outLines, `[SparkShot] Output root: ${root}`);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      sendProgress({ step: i + 1, total, url, status: 'starting' });
      const { desktopFile, mobileFile } = await capture(url, screensDir);
      logLine(outLines, `Processing ${url}`);
      logLine(outLines, `Saved: ${desktopFile}`);
      logLine(outLines, `Saved: ${mobileFile}`);
      sendProgress({ step: i + 1, total, url, status: 'done', desktopFile, mobileFile });
    } catch (e) {
      logLine(outLines, `Failed: ${url} -> ${e.message}`);
      sendProgress({ step: i + 1, total, url, status: 'error', error: e.message });
    }
  }

  const end = new Date();
  logLine(outLines, `[SparkShot] Run finished ${end.toISOString()}`);

  const stamp = end.toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(logsDir, `sparkshot-${stamp}.log`);
  try { fs.writeFileSync(logPath, outLines.join('\n'), 'utf8'); } catch {}

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

  autoUpdater.on('checking-for-update', () => {
    sendProgress({ status: 'update-checking' });
  });
  autoUpdater.on('update-available', (info) => {
    sendProgress({ status: 'update-available', version: info?.version || null, releaseName: info?.releaseName || null });
  });
  autoUpdater.on('update-not-available', (info) => {
    sendProgress({ status: 'update-none', current: app.getVersion(), info });
  });
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
  autoUpdater.on('error', (err) => {
    const msg = err && err.message ? err.message : String(err);
    sendProgress({ status: 'update-error', error: msg });
  });
}
