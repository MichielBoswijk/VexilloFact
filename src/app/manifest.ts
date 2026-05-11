import type { MetadataRoute } from "next";

const THEME_COLOR = "#4f46e5";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vexillo",
    short_name: "Vexillo",
    description: "A mobile-first country flag quiz",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: THEME_COLOR,
    icons: [
      {
        src: "/icon",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        type: "image/png",
        sizes: "180x180",
        purpose: "any",
      },
    ],
  };
}
