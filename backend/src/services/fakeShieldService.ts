/**
 * Anti-Screenshot & Screen Capture Detection
 * Checks raw OCR text and visual patterns to detect if the user uploaded
 * an invalid web application screenshot, localhost screen, or fake graphic.
 */
export function checkIsWebOrAppScreenshot(text: string): boolean {
  const SCREENSHOT_PATTERNS =
    /sahayak|localhost|http:\/\/|https:\/\/|screenshot|dossier|application tracker|check eligibility|ocr & docs|emi calculator|find partner|ai assistant|literacy hub|extracted real document fields|authenticity score:|upload another|statutory verification norms/i;
  return SCREENSHOT_PATTERNS.test(text);
}

export function sanitizeExtractedName(
  rawName: string,
  rawOcrText: string,
  profileName?: string
): string {
  const HEADER_WORDS = [
    "government of india",
    "government of",
    "bharat sarkar",
    "aadhaar",
    "e-aadhaar",
    "unique identification authority",
    "uidai",
    "income tax department",
    "election commission",
    "republic of india",
    "tahasildar",
    "certificate",
    "authority",
    "enrolment",
    "mera aadhaar",
  ];

  let cleaned = (rawName || "").trim();
  const lowerCleaned = cleaned.toLowerCase();

  const isHeader = HEADER_WORDS.some((h) => lowerCleaned.includes(h));

  if (
    isHeader ||
    !cleaned ||
    cleaned.length < 3 ||
    lowerCleaned === "beneficiary" ||
    lowerCleaned === "not detected"
  ) {
    if (profileName && profileName.trim().length > 0) {
      const pWords = profileName
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 1);
      const lines = (rawOcrText || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      for (const line of lines) {
        const lineLower = line.toLowerCase();
        const containsProfWord = pWords.some((w) =>
          lineLower.includes(w.toLowerCase())
        );
        const containsHeader = HEADER_WORDS.some((h) => lineLower.includes(h));
        if (containsProfWord && !containsHeader && !/\d/.test(line)) {
          return line;
        }
      }
    }

    const lines = (rawOcrText || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      const hasHeader = HEADER_WORDS.some((h) => lineLower.includes(h));
      const hasDigits = /\d/.test(line);
      const words = line.split(/\s+/);

      if (
        !hasHeader &&
        !hasDigits &&
        words.length >= 2 &&
        words.length <= 5 &&
        line.length >= 4
      ) {
        return line;
      }
    }

    return "Not detected";
  }

  return cleaned;
}
