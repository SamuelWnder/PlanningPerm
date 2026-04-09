import ratesData from "./lpa-approval-rates.json";

interface LpaRate {
  name: string;
  rate: number;  // householder approval rate 0–100
  n: number;     // number of decisions (2023–2024)
}

const RATES = ratesData as Record<string, LpaRate>;

/**
 * Look up the real householder planning approval rate for an LPA.
 * Returns the rate (0–100) and a label describing the source.
 * Falls back to null if the LPA code is not in the dataset.
 *
 * Source: MHCLG District Planning Application Statistics (PS2), 2023–2024
 */
export function getLpaApprovalRate(lpaCode: string | null | undefined): {
  rate: number;
  label: string;
  source: "official" | "unknown";
} | null {
  if (!lpaCode) return null;
  const entry = RATES[lpaCode];
  if (!entry) return null;
  return {
    rate:   entry.rate,
    label:  `Based on ${entry.n.toLocaleString()} householder decisions in ${entry.name}, 2023–24 · MHCLG PS2`,
    source: "official",
  };
}
