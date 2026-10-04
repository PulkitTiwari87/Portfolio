export interface Design {
  id: string;
  label: string;
  note?: string;
  hash: string;
}

export const DESIGNS: Design[] = [
  { id: "apple", label: "Apple", note: "Home", hash: "" },
  { id: "v1", label: "Version 1", note: "Original", hash: "#/designs/v1" },
  { id: "frame", label: "Frame", hash: "#/designs/frame" },
  { id: "nerd", label: "NERD", hash: "#/designs/nerd" },
  { id: "blahhh", label: "Blahhh", hash: "#/designs/blahhh" },
];

// Only these exact hashes switch pages; any other hash (e.g. "#contact", an
// in-page anchor on Version 1) leaves the current design unchanged.
const ROUTES: Record<string, string> = {
  "": "apple",
  "#": "apple",
  "#/": "apple",
  "#/designs/apple": "apple",
  "#/designs/v1": "v1",
  "#/designs/frame": "frame",
  "#/designs/nerd": "nerd",
  "#/designs/blahhh": "blahhh",
};

let lastDesignId = "apple";

/** Design id for a location hash; non-route hashes keep the last design. */
export function currentDesignId(hash: string): string {
  lastDesignId = ROUTES[hash] ?? lastDesignId;
  return lastDesignId;
}

/** Navigate to a design hash ("" = main Apple page, without a trailing '#'). */
export function goToDesign(hash: string): void {
  if (hash) {
    window.location.hash = hash;
    return;
  }
  history.pushState(null, "", window.location.pathname + window.location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
