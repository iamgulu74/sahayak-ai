export async function runOCRSpace(
  base64Image: string,
  mimeType: string,
  apiKey?: string
): Promise<string> {
  const OCR_SPACE_KEY =
    apiKey ||
    process.env.OCR_SPACE_API_KEY ||
    process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY ||
    "K86224423788957";

  try {
    const formattedDataUri = base64Image.startsWith("data:")
      ? base64Image
      : `data:${mimeType};base64,${base64Image}`;

    const form = new URLSearchParams();
    form.append("apikey", OCR_SPACE_KEY);
    form.append("base64Image", formattedDataUri);
    form.append("language", "eng");
    form.append("isOverlayRequired", "false");
    form.append("detectOrientation", "true");
    form.append("scale", "true");
    form.append("isTable", "true");
    form.append("OCREngine", "2");

    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn("OCR.space HTTP returned non-200:", res.status);
      return "";
    }
    const data = (await res.json()) as any;
    if (data.IsErroredOnProcessing && data.ErrorMessage) {
      console.warn("OCR.space engine message:", data.ErrorMessage);
    }
    if (data.ParsedResults && data.ParsedResults.length > 0) {
      return data.ParsedResults.map((r: any) => r.ParsedText || "")
        .join("\n")
        .trim();
    }
    return "";
  } catch (err) {
    console.warn("OCR.space extraction failed/timed out:", err);
    return "";
  }
}
