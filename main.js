import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'node:path';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
  return win;
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong');
  const win = createWindow();
  win.maximize();
  win.show();
});
