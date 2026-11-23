import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';

let tray: Tray | null = null;

function createDefaultTrayIcon(): Electron.NativeImage {
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - 7.5;
      const dy = y - 7.5;
      // Draw a circular green icon
      if (dx * dx + dy * dy <= 42) {
        buffer[idx] = 29;     // R
        buffer[idx + 1] = 185; // G
        buffer[idx + 2] = 84;  // B (#1db954)
        buffer[idx + 3] = 255; // Alpha
      } else {
        buffer[idx + 3] = 0;
      }
    }
  }

  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

export function setupSystemTray(
  getMainWindow: () => BrowserWindow | null,
  onToggleMiniPlayer?: () => void
): Tray {
  if (tray) return tray;

  const icon = createDefaultTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('Tune - Modern Offline Music Player');

  const updateMenu = () => {
    const win = getMainWindow();
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Tune',
        click: () => {
          if (win) {
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Play / Pause',
        click: () => {
          win?.webContents.send('tune:media-key', 'play-pause');
        }
      },
      {
        label: 'Next Track',
        click: () => {
          win?.webContents.send('tune:media-key', 'next');
        }
      },
      {
        label: 'Previous Track',
        click: () => {
          win?.webContents.send('tune:media-key', 'prev');
        }
      },
      { type: 'separator' },
      {
        label: 'Toggle Mini Player',
        click: () => {
          if (onToggleMiniPlayer) onToggleMiniPlayer();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray?.setContextMenu(contextMenu);
  };

  updateMenu();

  tray.on('double-click', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  return tray;
}

export function destroySystemTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

