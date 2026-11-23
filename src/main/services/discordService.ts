import DiscordRPC from 'discord-rpc';

const CLIENT_ID = '1205187123998396456'; // Default Music/Player Client ID

let rpc: DiscordRPC.Client | null = null;
let isReady = false;
let isConnecting = false;

export interface DiscordPresenceData {
  title: string;
  artist: string;
  album?: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
}

export function initDiscordRPC() {
  if (rpc || isConnecting) return;
  isConnecting = true;

  try {
    DiscordRPC.register(CLIENT_ID);
    rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
      isReady = true;
      isConnecting = false;
    });

    rpc.login({ clientId: CLIENT_ID }).catch(() => {
      // Discord app is likely not open on user's machine; fail gracefully
      isReady = false;
      isConnecting = false;
      rpc = null;
    });
  } catch {
    isReady = false;
    isConnecting = false;
    rpc = null;
  }
}

export function setDiscordPresence(data: DiscordPresenceData) {
  if (!rpc || !isReady) {
    initDiscordRPC();
    return;
  }

  if (!data.isPlaying) {
    rpc.clearActivity().catch(() => {});
    return;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const startTimestamp = Math.max(0, now - Math.floor(data.currentTime));
    const endTimestamp = data.duration > 0 ? startTimestamp + Math.floor(data.duration) : undefined;

    rpc.setActivity({
      details: data.title,
      state: data.artist ? `by ${data.artist}` : undefined,
      startTimestamp,
      endTimestamp,
      largeImageKey: 'tune_logo',
      largeImageText: data.album || 'Tune — Offline Music Player',
      smallImageKey: 'play_icon',
      smallImageText: 'Playing',
      instance: false
    }).catch(() => {});
  } catch (err) {
    console.warn('Failed to update Discord presence:', err);
  }
}

export function clearDiscordPresence() {
  if (rpc && isReady) {
    rpc.clearActivity().catch(() => {});
  }
}
