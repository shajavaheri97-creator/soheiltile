// Client-safe helpers (no server-only imports).
export const IMAGE_WIDTHS = [480, 960, 1600] as const;

export const imageUrl = (id: string, w: (typeof IMAGE_WIDTHS)[number] = 960, kind = "products") =>
  `/uploads/${kind}/${id}-${w}.webp`;
