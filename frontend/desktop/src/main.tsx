import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { EmployeePortalPage } from "./pages/EmployeePortalPage";
import { PasswordResetPage } from "./pages/PasswordResetPage";
import "./styles/app.css";
import "./styles/desktop.css";

import { CampusLoader, RequestLoader } from "./components/CampusLoader";
import { InstallApp } from "./components/InstallApp";

function App() {
  if (window.location.hash === "#loading-preview") return <CampusLoader />;
  return (
    <AuthProvider>
      <Root />
      <RequestLoader />
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
  if (!user) return <><LoginPage /><InstallApp /></>;
  return <EmployeePortalPage key={user.id} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
