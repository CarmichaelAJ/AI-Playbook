"use client";

import { useEffect } from "react";
import { APP_MODE } from "@/lib/features";

export default function OfflineSupport() {
  useEffect(() => {
    if (APP_MODE !== "static" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js");
  }, []);

  return null;
}
