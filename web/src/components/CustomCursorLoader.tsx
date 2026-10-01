"use client";

import dynamic from "next/dynamic";

// Custom cursor reads matchMedia synchronously on mount to decide whether
// it renders at all — loading it client-only avoids any SSR/hydration
// mismatch from that environment-dependent initial state. The dynamic
// import with ssr:false must live in a Client Component in the App Router.
const CustomCursor = dynamic(() => import("./CustomCursor"), {
  ssr: false,
});

export default function CustomCursorLoader() {
  return <CustomCursor />;
}
