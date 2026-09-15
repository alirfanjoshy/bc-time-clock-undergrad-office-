import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const native = '__TAURI_INTERNALS__' in window;
  const isMac = /Macintosh|MacIntel/.test(navigator.userAgent + navigator.platform) && navigator.maxTouchPoints <= 1;

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const complete = () => { setInstalled(true); setPrompt(null); };
    const changed = () => setInstalled(media.matches);
    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('appinstalled', complete);
    media.addEventListener('change', changed);
    return () => {
      window.removeEventListener('beforeinstallprompt', capture);
      window.removeEventListener('appinstalled', complete);
      media.removeEventListener('change', changed);
    };
  }, []);

  async function install() {
    if (!prompt) return;
    setBusy(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setMessage(choice.outcome === 'accepted' ? 'Installation requested. Open BC Time Clock from your apps once it finishes.' : 'Installation cancelled. You can keep using the website.');
    } catch {
      setMessage('Use the install option in your browser menu, or download the shortcut below.');
    } finally {
      setPrompt(null);
      setBusy(false);
    }
  }

  if (native || installed) return null;
  return (
    <aside className="install-app" aria-label="Install BC Time Clock">
      <button type="button" className="install-app-toggle" aria-expanded={expanded} aria-controls="install-app-options" onClick={() => setExpanded(!expanded)}>
        <Download size={16} aria-hidden="true" /> {expanded ? 'Close install options' : 'Download for Mac & Windows'}
      </button>
      {expanded && <div id="install-app-options" className="install-app-options">
        <strong>BC Time Clock for Mac & Windows</strong>
        <p>Open your time clock from your desktop. Sign in with your usual account. Internet is required to clock in and out.</p>
        <>
          <a className="install-app-download" href={`${import.meta.env.BASE_URL}downloads/BC-Time-Clock-Mac.zip`} download="BC-Time-Clock-Mac.zip">Download for Mac</a>
          <small>Open the ZIP, then double-click BC Time Clock.webloc. Keep it on your desktop for easy access. This shortcut opens the live website in your default browser.</small>
          <a className="install-app-download" href={`${import.meta.env.BASE_URL}downloads/BC-Time-Clock-Windows.zip`} download="BC-Time-Clock-Windows.zip">Download for Windows</a>
          <small>Open the ZIP, then double-click BC-Time-Clock.url. Keep it on your Windows desktop. This shortcut opens the live website in your default browser.</small>
        </>
        {prompt ? <button type="button" disabled={busy} onClick={install}>{busy ? 'Opening installer…' : `Install ${isMac ? 'Mac ' : ''}app`}</button> : <p>For a separate app window in Chrome, choose ⋮ → Cast, save and share → Install page as app. If already installed, open it from chrome://apps.</p>}
        {isMac && <p>In Safari on macOS Sonoma 14 or later, choose File → Add to Dock. Firefox on Mac can use the download above; app installation is available through Chrome or Safari.</p>}
        {['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) && <small>This is a local preview. Download from the live website before sharing with other computers.</small>}
        <p role="status">{message}</p>
      </div>}
    </aside>
  );
}
