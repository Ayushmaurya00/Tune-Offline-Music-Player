import { App as CapApp } from '@capacitor/app';
import { useLibraryStore } from '../store/libraryStore';

type BackHandler = () => boolean | void;

class BackButtonService {
  private handlers: BackHandler[] = [];
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Android Native Back Button via Capacitor
    try {
      CapApp.addListener('backButton', () => {
        this.handleBack();
      });
    } catch {
      // Capacitor plugin not available in desktop/browser mode
    }

    // 2. Mobile Browser / PWA popstate gesture navigation
    window.addEventListener('popstate', () => {
      this.handleBack();
    });
  }

  public register(handler: BackHandler): () => void {
    this.handlers.push(handler);

    // Push dummy history state so Android gesture navigates popstate rather than exiting
    try {
      window.history.pushState({ tuneModal: true }, '');
    } catch {
      // Ignore
    }

    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  public handleBack() {
    // 1. If an active modal/drawer handler is on the stack, dismiss it
    if (this.handlers.length > 0) {
      const topHandler = this.handlers[this.handlers.length - 1];
      topHandler();
      return;
    }

    // 2. If viewing a sub-section (playlists, folder mode, liked), return to Library
    const { activeView, setActiveView } = useLibraryStore.getState();
    if (activeView !== 'library') {
      setActiveView('library');
      return;
    }

    // 3. If at root Library with nothing open, minimize app (keeps music playing in background)
    try {
      CapApp.minimizeApp();
    } catch {
      // Not on native device
    }
  }
}

export const backButtonService = new BackButtonService();

