import "dotenv/config";
import { app, BrowserWindow, ipcMain, Menu, screen, Tray } from "electron";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import * as path from "node:path";

let win = null;

const createWindow = (id /*: number | null*/) => {
  const displays = screen.getAllDisplays();
  const chosenDisplay = id
    ? displays.find((display) => {
      return display.id === id;
    })
    : displays.find((display) => {
      return display.bounds.x !== 0 || display.bounds.y !== 0;
    }) || displays[0];
  const win = new BrowserWindow({
    x: chosenDisplay.bounds.x + 5, // add 5 to make sure we are on the correct screen
    y: chosenDisplay.bounds.y + 5, // add 5 to make sure we are on the correct screen
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(import.meta.dirname, "preload.js"),
    },
  });
  win.loadFile("index.html");
  win.maximize();
  win.show();
  return win;
};

app.whenReady().then(() => {
  ipcMain.handle("ping", () => "pong");
  let iconpath = path.join(
    import.meta.dirname,
    "icons",
    "linux",
    "icons",
    "512x512.png",
  );
  if (process.platform === "win32") {
    iconpath = path.join(import.meta.dirname, "icons", "windows", "icon.ico");
  }
  if (process.platform === "darwin") {
    iconpath = path.join(import.meta.dirname, "icons", "macos", "icon.icns");
  }
  const tray = new Tray(iconpath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit Stagetimer",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Stagetimer");
  tray.setContextMenu(contextMenu);
  ready = true;
});

app.on("window-all-closed", () => {
  // Do nothing to prevent closing when t he window is closed from the API
});

const hono = new Hono();

hono.get("/app/health", (c) => {
  return c.json({
    running: true,
  });
});

hono.post("/countdown/start-time", async (c) => {
  if (win) {
    const { min, sec } = await c.req.json();
    win.webContents.send("set-countdown-start-time", min * 60 + sec);
    return c.json({
      success: true,
    });
  }
  return c.json({
    success: false,
    message: "Window does not exist",
  });
});

hono.post("/countdown/remaining-time", async (c) => {
  if (win) {
    const { min, sec } = await c.req.json();
    win.webContents.send("set-countdown-remaining-time", min * 60 + sec);
    return c.json({
      success: true,
    });
  }
  return c.json({
    success: false,
    message: "Window does not exist",
  });
});

hono.post("/countdown/start", (c) => {
  if (win) {
    win.webContents.send("start-countdown");
    return c.json({
      success: true,
    });
  }
  return c.json({
    success: false,
    message: "Window does not exist",
  });
});

hono.post("/countdown/stop", (c) => {
  if (win) {
    win.webContents.send("stop-countdown");
    return c.json({
      success: true,
    });
  }
  return c.json({
    success: false,
    message: "Window does not exist",
  });
});

hono.post("/screen/show", async (c) => {
  if (win) {
    return c.json({
      success: false,
      message: "Already shown. Please first close the already existing screen",
    });
  }
  const { id } = await c.req.json();
  win = createWindow(id);
  return c.json({
    success: true,
  });
});

hono.post("/screen/close", (c) => {
  if (win) {
    win.close();
    win = null;
    return c.json({
      success: true,
    });
  }
  return c.json({
    success: false,
    message: "Already closed. Please first show a screen",
  });
});

hono.get("/screens", (c) => {
  const displays = screen.getAllDisplays();
  for (let i = 0; i < displays.length; i++) {
    delete displays[i].accelerometerSupport;
    delete displays[i].colorDepth;
    delete displays[i].colorSpace;
    delete displays[i].depthPerComponent;
    delete displays[i].detected;
    delete displays[i].displayFrequency;
    delete displays[i].internal;
    delete displays[i].maximumCursorSize;
    delete displays[i].monochrome;
    delete displays[i].nativeOrigin;
    delete displays[i].touchSupport;
  }
  return c.json(displays);
});

hono.get("/*", serveStatic({ root: "./frontend/" }));

const httpServer = serve({
  fetch: hono.fetch,
  port: parseInt(process.env.PORT),
});
process.on("SIGINT", () => {
  httpServer.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  httpServer.close((err) => {
    if (err) {
      console.error(err);
      process.exit(0);
    }
    process.exit(0);
  });
});
