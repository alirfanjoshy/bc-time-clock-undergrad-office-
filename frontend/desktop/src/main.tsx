import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { EmployeePortalPage } from "./pages/EmployeePortalPage";
import { PasswordResetPage } from "./pages/PasswordResetPage";
import "./styles/app.css";
import "./styles/desktop.css";
import { InstallApp } from "./components/InstallApp";

import { CampusLoader, RequestLoader } from "./components/CampusLoader";

function App() {
  if (window.location.hash === "#loading-preview") return <CampusLoader />;
  return (
    <AuthProvider>
      <Root />
      <RequestLoader />
      <InstallApp />
    </AuthProvider>
  );
}

function Root() {
  const { user } = useAuth();
  const [resetToken, setResetToken] = React.useState(
    () =>
      new URLSearchParams(window.location.hash.slice(1)).get("resetToken") ??
      undefined,
  );
  React.useEffect(() => {
    if (resetToken)
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
  }, [resetToken]);
  if (resetToken)
    return (
      <PasswordResetPage
        token={resetToken}
        onBack={() => setResetToken(undefined)}
      />
    );
  if (!user) return <LoginPage />;
  return <EmployeePortalPage key={user.id} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
