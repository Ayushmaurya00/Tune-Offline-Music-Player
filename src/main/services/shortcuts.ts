import { globalShortcut, BrowserWindow } from 'electron';

export type MediaAction = 'play-pause' | 'next' | 'prev';

export function registerGlobalShortcuts(getMainWindow: () => BrowserWindow | null) {
  const sendAction = (action: MediaAction) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('tune:media-key', action);
    }
  };

  try {
    // OS Media Keys
    globalShortcut.register('MediaPlayPause', () => sendAction('play-pause'));
    globalShortcut.register('MediaNextTrack', () => sendAction('next'));
    globalShortcut.register('MediaPreviousTrack', () => sendAction('prev'));

    // Global Fallback Key Combos (Ctrl+Alt+Space, Ctrl+Alt+Right, Ctrl+Alt+Left)
    globalShortcut.register('CommandOrControl+Alt+Space', () => sendAction('play-pause'));
    globalShortcut.register('CommandOrControl+Alt+Right', () => sendAction('next'));
    globalShortcut.register('CommandOrControl+Alt+Left', () => sendAction('prev'));
  } catch (err) {
    console.warn('Could not register some global shortcuts:', err);
  }
}

export function unregisterGlobalShortcuts() {
  globalShortcut.unregisterAll();
}

