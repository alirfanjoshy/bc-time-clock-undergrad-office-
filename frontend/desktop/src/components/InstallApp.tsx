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

  function download() {
    // Never include password reset tokens, query parameters, or account data.
    const url = new URL(import.meta.env.BASE_URL, window.location.origin).href;
    const blob = new Blob([`[InternetShortcut]\r\nURL=${url}\r\n`], { type: 'application/octet-stream' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = 'BC-Time-Clock.url';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    setMessage('Move BC-Time-Clock.url to your Windows desktop, then double-click it to open the time clock in your browser.');
  }

  if (native || installed) return null;
  return (
    <aside className="install-app" aria-label="Install BC Time Clock">
      <button type="button" className="install-app-toggle" aria-expanded={expanded} aria-controls="install-app-options" onClick={() => setExpanded(!expanded)}>
        <Download size={16} aria-hidden="true" /> {expanded ? 'Close install options' : 'Install on PC · Free'}
      </button>
      {expanded && <div id="install-app-options" className="install-app-options">
        <strong>BC Time Clock for your PC</strong>
        <p>Open your time clock from your desktop. Sign in with your usual account. Internet is required to clock in and out.</p>
        {prompt ? <button type="button" disabled={busy} onClick={install}>{busy ? 'Opening installer…' : 'Install free app'}</button> : <p>In Chrome or Edge, look for the install icon in the address bar or the browser menu. If it is unavailable, use the shortcut below.</p>}
        <button type="button" onClick={download}>Download Windows shortcut</button>
        <small>The shortcut opens this website in your default browser.</small>
        {['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) && <small>This is a local preview. Download from the live website before sharing with other PCs.</small>}
        <p role="status">{message}</p>
      </div>}
    </aside>
  );
}
