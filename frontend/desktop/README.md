# BC Time Clock web app installation

The web app includes a free **Download for Mac & Windows** menu on desktop screens:

- **Install free app** opens the browser's installation prompt when available.
- **Download for Mac** saves `BC-Time-Clock-Mac.zip`. Extract it and open `BC Time Clock.webloc` to launch the live Render website in the default browser. The shortcut is packaged as a ZIP for reliable downloads in Chrome, Firefox, and Safari.
- Chrome can install a separate app window using **Cast, save and share → Install page as app**; Safari uses **File → Add to Dock** on macOS Sonoma 14 or later. Firefox on Mac can use the shortcut.
- **Download for Windows** saves `BC-Time-Clock-Windows.zip`. Extract it to get `BC-Time-Clock.url`. Move it to the Windows desktop and double-click to open the website in the default browser. This is a shortcut, not an executable installer.

The installed web app uses the existing accounts, API, and attendance records. Internet access and a running backend are required. No attendance requests are cached or queued offline.

## Make available to employees

1. Host the existing backend on an address accessible to employee PCs.
2. Set `VITE_API_BASE_URL` to its HTTPS API URL before running `npm run build`. Configure backend CORS to allow the web app's origin.
3. Serve the contents of `dist` from an HTTPS website at the domain root. Serve `manifest.webmanifest` as `application/manifest+json`.
4. Employees visit that website in Chrome or Edge, then choose **Download for Mac & Windows**. Browser installation availability varies; the Windows shortcut is also available.

Do not distribute shortcuts downloaded from localhost: they would point to each employee's own computer. Download from the deployed website instead. Download URLs omit query strings and fragments, including password reset tokens.

## Verify

Run `npm run build`. On the HTTPS site, check installation in Chrome/Edge, launch the installed app, sign in with a test employee, clock in and clock out, and verify both entries on the server. Check the Windows shortcut opens the same website. Native Windows installation must be checked on Windows.

The mobile app and Tauri bundle are separate and unchanged.
