import { LandingPage } from "@/pages/LandingPage";
import { LegalPage, type LegalPageKind } from "@/pages/LegalPage";

function resolvePage(): "home" | LegalPageKind {
  const fromAttr = document.documentElement.dataset.page;
  if (fromAttr === "privacy" || fromAttr === "terms" || fromAttr === "support") {
    return fromAttr;
  }

  const path = window.location.pathname.replace(/\/+$/, "");
  if (path === "/privacy") return "privacy";
  if (path === "/terms") return "terms";
  if (path === "/support") return "support";
  return "home";
}

export function App() {
  const page = resolvePage();
  if (page === "home") {
    return <LandingPage />;
  }
  return <LegalPage kind={page} />;
}
