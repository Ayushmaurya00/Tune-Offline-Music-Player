import { TuneAPI } from './music';

declare global {
  interface Window {
    tuneAPI: TuneAPI;
  }
}

export {};
