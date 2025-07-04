const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path   = require('path');
const Store  = require('electron-store');
const Crypto = require('crypto-js');

app.disableHardwareAcceleration();                // на слабых GPU
app.commandLine.appendSwitch('touch-events','enabled');

const store = new Store({
  name: 'rms-web-config',
  defaults: {
    passwordHash: Crypto.SHA256('admin').toString(),
    links: [
      { title: 'Яндекс', url: 'https://ya.ru/' },
      { title: 'RMS',    url: 'http://10.0.20.113:8088/' }
    ]
  }
});

function createWindow () {
  const win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    backgroundColor: '#e7e9fa',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webviewTag: true
    }
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

// ── IPC для рендера ──────────────────────────────────────────
ipcMain.handle('config:get',  ()         => store.store);
ipcMain.handle('config:save', (_, links) => store.set('links', links));
ipcMain.handle('pass:check',  (_, pass) =>
  Crypto.SHA256(pass).toString() === store.get('passwordHash'));
