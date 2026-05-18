import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1024,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Data storage setup
const dataPath = path.join(app.getPath('userData'), 'problems.json');

// Ensure problems.json exists
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

// IPC Handlers
ipcMain.handle('get-problems', async () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading problems.json:', err);
    return [];
  }
});

ipcMain.handle('save-problems', async (event, problems) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(problems, null, 2));
    return { success: true };
  } catch (err) {
    console.error('Error saving problems.json:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    if (url) {
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false, error: 'No URL provided' };
  } catch (err) {
    console.error('Error opening external link:', err);
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
