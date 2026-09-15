# Put BC Time Clock online — free trial setup

The project is prepared, but it is **not online yet**. No hosting accounts or paid services have been created.

## 1. Create three accounts

Use the free options at:

- [GitHub](https://github.com/signup): holds the app's code.
- [Neon](https://console.neon.tech/signup): stores accounts and attendance.
- [Render](https://dashboard.render.com/register): runs the website and server.

You can use GitHub to sign in to the other services. Keep the database on Neon's **Free** plan and the Render web service on **Free**. A paid domain is unnecessary. Review any billing prompt before continuing; the configuration does not request paid resources.

## 2. Upload the prepared app to GitHub

1. Extract `BC-Time-Clock-Free-Hosting.zip` from this project folder.
2. Create a **private** GitHub repository named `bc-time-clock`.
3. Upload the extracted contents using **uploading an existing file** (or **Add file → Upload files**).
4. The repository's top level must contain `render.yaml`, `scripts`, `backend`, and `frontend`. Upload the extracted contents, not the ZIP or an extra enclosing folder. If GitHub limits files per upload, upload one folder at a time.

The package contains the web app and backend only. It excludes local credentials, employee report files, dependencies, builds, and the mobile/native apps. Future changes can be uploaded to the same repository.

## 3. Create the database

1. In Neon, create a Free project named `bc-time-clock` in an available US East region, preferably near Northern Virginia.
2. Open **Connect**. Choose the project's database and turn **Connection pooling** off for this single-server setup.
3. Copy the full PostgreSQL connection string. Keep `sslmode=require` and any other supplied security parameters. Add `&connect_timeout=30&connection_limit=5` to the existing query string to allow database wake-up time and limit this server's connections.
4. Save this privately for the next step. It contains your database password; enter it directly in Render, never in GitHub or chat.

This starts a new, empty hosted database. Existing accounts and time entries on your computer are not copied. If those records must be kept, arrange a database migration before inviting employees.

## 4. Launch the app on Render

1. Choose **New → Blueprint** in Render.
2. Connect GitHub and grant access to the private `bc-time-clock` repository.
3. Select that repository. Render reads the included `render.yaml` file.
4. Confirm that it lists **one Free web service** and no Render database or paid disk.
5. For `DATABASE_URL`, paste the private Neon connection string.
6. Deploy. The scripts build both parts of the app and apply the database tables automatically. Do not run the development seed: it creates demonstration accounts.
7. Wait for **Live**, then open the HTTPS address shown by Render, such as `https://bc-time-clock-xxxx.onrender.com`. Use the actual assigned address.

The first build can take several minutes. If deployment fails, share the error text with passwords and connection strings removed.

## 5. Create your administrator account

1. In the Render service's **Environment** settings, reveal the automatically generated `ADMIN_REGISTRATION_CODE`.
2. On the live website, select **Create Account**, choose **Admin**, and use your own email and a new password.
3. Enter that private setup code. Keep it private: anyone with it can create an administrator account.
4. Employees can choose **Employee** when creating their own accounts.

The old demonstration credentials are not installed on the hosted database.

## 6. Test, then share the PC app

1. Create a test employee, sign in, clock in, and confirm the success message.
2. Clock out and verify the entry and hours in the administrator view.
3. Refresh the page and sign back in to confirm that records persist.
4. Generate and download a timesheet PDF.
5. In Chrome or Edge on a PC, select **Install on PC · Free**. Install when the browser offers it, or choose **Download Windows shortcut**.
6. Launch it from the PC and confirm that the same account and records appear.
7. Share the live HTTPS link. Download shortcuts from that address, not from localhost.

## Free-plan limitations

- Render sleeps after 15 minutes without traffic. The next visit can take about a minute to load. Open the app early and wait for a successful clock confirmation; a click before the server responds is not a saved attendance entry. Render advises against production use of its Free instances. Treat this as a trial before relying on it for official attendance.
- Free usage is capped. Monitor both dashboards. Render can bill overages if a payment method is attached; without one, services or builds can be suspended when limits are reached. Do not upgrade without reviewing the cost.
- Neon Free has storage and compute limits. Check its current pricing page and dashboard rather than assuming unlimited use.
- Accounts and time records live in Neon. PDFs saved on the Render server are temporary and disappear on restart; downloaded copies stay on employees' PCs, and reports can be regenerated from the database.
- Password-reset emails need separate email configuration. For Render Free, use the existing HTTPS Resend integration with a verified sender (`RESEND_API_KEY`, `MAIL_FROM`, and `PASSWORD_RESET_URL` set to the live website). Standard SMTP ports are blocked on Render Free. Until configured, password reset reports that email is unavailable; clocking and login do not depend on it.

## Technical notes

- `scripts/render-build.sh` installs locked dependencies, generates Prisma, builds the server, and builds the web app with `VITE_API_BASE_URL=/api`.
- `scripts/render-start.sh` applies committed migrations, then starts the server. Free Render services do not have a pre-deploy command.
- `WEB_DIST_PATH` enables the backend to serve the web build. API endpoints keep their existing authorization and JSON errors.
- The server timezone is `America/New_York`, matching the existing office date calculations.
- `/health` checks that the process responds; it does not certify database connectivity. Complete the live clock-in/out checks above.
- Backend build, lint, and 19 tests passed locally; the hosted database, full cloud build, and Windows installation still require verification after launch.

Sources checked September 15, 2026: [Render Free](https://render.com/docs/free), [Render Blueprint configuration](https://render.com/docs/blueprint-spec), [Neon Free pricing](https://neon.com/pricing).
