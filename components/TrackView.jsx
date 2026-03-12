"use client";

import { useEffect } from "react";

import { trackView } from "@/lib/analytics";

export default function TrackView({ type, id }) {
  useEffect(() => {
    trackView({ type, id });
  }, [type, id]);

  return null;
}
