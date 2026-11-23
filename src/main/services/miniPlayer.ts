import { BrowserWindow, Rectangle } from 'electron';

let isMiniPlayerActive = false;
let previousBounds: Rectangle | null = null;

export function isMiniPlayer(): boolean {
  return isMiniPlayerActive;
}

export function setMiniPlayerMode(win: BrowserWindow, enable?: boolean): boolean {
  if (win.isDestroyed()) return false;

  const targetState = enable !== undefined ? enable : !isMiniPlayerActive;

  if (targetState === isMiniPlayerActive) {
    return isMiniPlayerActive;
  }

  isMiniPlayerActive = targetState;

  if (isMiniPlayerActive) {
    // Save current window bounds before shrinking
    previousBounds = win.getBounds();
    win.setResizable(true);
    win.setMinimumSize(340, 150);
    win.setSize(360, 160);
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setResizable(false);
  } else {
    // Restore normal window
    win.setAlwaysOnTop(false);
    win.setResizable(true);
    win.setMinimumSize(900, 600);
    if (previousBounds) {
      win.setBounds(previousBounds);
    } else {
      win.setSize(1280, 820);
      win.center();
    }
  }

  win.webContents.send('tune:mini-player-changed', isMiniPlayerActive);
  return isMiniPlayerActive;
}

