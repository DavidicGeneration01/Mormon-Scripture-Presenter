const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

// Prevent garbage collection
let mainWindow;

function createWindow() {
  // Get primary screen dimensions
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Mormon Scripture Presenter",
    icon: path.join(__dirname, 'public/favicon.ico'), // Assumes you might have one
    backgroundColor: '#0f172a', // Matches bg-gray-900
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For personal apps, this allows easier communication
      webSecurity: false // Allows loading local resources easily
    },
  });

  // Load the app
  // In development, load from localhost. In production, load file.
  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  mainWindow.loadURL(startUrl);

  // --- LIVE WINDOW HANDLER ---
  // This intercepts window.open() calls from App.tsx
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Parse the URL to check if it's the live mode
    if (url.includes('mode=live')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          title: "Scripture Live Display",
          frame: false, // Removes the menu bar/chrome (Perfect for Projectors)
          thickFrame: false, // Removes window border shadow on Windows
          fullscreenable: true,
          autoHideMenuBar: true,
          backgroundColor: '#000000',
          titleBarStyle: 'hidden', // macOS hide title bar
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
          },
        },
      };
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});