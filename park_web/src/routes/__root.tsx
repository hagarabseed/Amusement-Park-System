import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { usePark } from "@/lib/store";
import appCss from "../styles.css?url";

const APP_NAME = "ParkPulse";

const themeBoot = `(function(){try{var t=localStorage.getItem("parkpulse-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "Pulse for Sunset Park, New Cairo — passes, live queues, food pre-orders and wristbands." },
      { name: "theme-color", content: "#070B12" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <LiveBoot />
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function LiveBoot() {
  const hydrated = usePark((state) => state.hydrated);
  const theme = usePark((state) => state.theme);
  useEffect(() => {
    void Promise.resolve(usePark.persist.rehydrate()).finally(() => {
      usePark.getState().setHydrated(true);
    });
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("parkpulse-theme", theme);
    } catch {
      /* private mode */
    }
  }, [hydrated, theme]);
  useEffect(() => {
    if (!hydrated) return;
    const id = window.setInterval(() => usePark.getState().tickLive(), 12000);
    return () => window.clearInterval(id);
  }, [hydrated]);
  return <Toaster theme={theme === "light" ? "light" : "dark"} position="top-center" />;
}
