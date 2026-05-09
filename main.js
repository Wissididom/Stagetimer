import 'dotenv/config';
import { app, BrowserWindow, screen, ipcMain } from 'electron';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import * as path from 'node:path';

var ready = false;
var win = null;

const createWindow = (id/*: number | null*/) => {
  const displays = screen.getAllDisplays();
  const chosenDisplay = id ? displays.find((display) => {
  	return display.id === id;
  }) : displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });
  const win = new BrowserWindow({
    x: chosenDisplay.bounds.x,
    y: chosenDisplay.bounds.y,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
  win.maximize();
  win.show();
  return win;
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong');
  ready = true;
});

app.on('window-all-closed', () => {
  // Do nothing to prevent closing when t he window is closed from the API
})

const hono = new Hono();

hono.post('/countdown/start-time', async (c) => {
  if (win) {
    const { min, sec } = await c.req.json();
    win.webContents.send('set-countdown-start-time', min * 60 + sec);
    return c.json({
      success: true
    });
  }
  return c.json({
    success: false,
    message: 'Window does not exist'
  });
});

hono.post('/countdown/remaining-time', async (c) => {
  if (win) {
    const { min, sec } = await c.req.json();
    win.webContents.send('set-countdown-remaining-time', min * 60 + sec);
    return c.json({
      success: true
    });
  }
  return c.json({
    success: false,
    message: 'Window does not exist'
  });
});

hono.post('/countdown/start', (c) => {
  if (win) {
    win.webContents.send('start-countdown');
    return c.json({
      success: true
    });
  }
  return c.json({
    success: false,
    message: 'Window does not exist'
  });
});

hono.post('/countdown/stop', (c) => {
  if (win) {
    win.webContents.send('stop-countdown');
    return c.json({
      success: true
    });
  }
  return c.json({
    success: false,
    message: 'Window does not exist'
  });
});

hono.post('/screen/show', (c) => {
  if (win) {
    return c.json({
      success: false,
      message: 'Already shown. Please first close the already existing screen'
    });
  }
  win = createWindow(/*id*/); // TODO: Get id from request
  return c.json({
  	success: true
  });
});

hono.post('/screen/close', (c) => {
  if (win) {
    win.close();
    win = null;
    return c.json({
      success: true
    });
  }
  return c.json({
    success: false,
    message: 'Already closed. Please first show a screen'
  });
});

hono.get('/screens', (c) => {
  return c.json(screen.getAllDisplays());
});

const httpServer = serve({
  fetch: hono.fetch,
  port: parseInt(process.env.PORT)
});
process.on('SIGINT', () => {
  httpServer.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(0);
    }
    process.exit(0);
  });
});
