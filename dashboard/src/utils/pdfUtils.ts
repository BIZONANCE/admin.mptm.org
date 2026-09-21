import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Converts modern CSS color functions (lab, oklch, color(srgb...)) into standard rgb/rgba/hex
 * supported by html2canvas.
 */
function fixLabColorsInString(str: string, ctx?: CanvasRenderingContext2D | null): string {
  if (!str || typeof str !== "string") return str;
  if (!str.includes("lab") && !str.includes("oklch") && !str.includes("color(")) return str;

  const dummyCtx = ctx || (typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null);

  return str.replace(/(?:lab|oklch|color)\([^;}]*\)/gi, (match) => {
    if (dummyCtx) {
      try {
        dummyCtx.fillStyle = "#000000";
        dummyCtx.fillStyle = match;
        const converted = dummyCtx.fillStyle;
        if (converted && converted !== "#000000" && !converted.includes("lab") && !converted.includes("oklch")) {
          return converted;
        }
      } catch (e) {
        // ignore
      }
    }
    return "rgba(0, 0, 0, 0)";
  });
}

/**
 * Pre-processes the cloned DOM tree for html2canvas to convert modern CSS lab/oklch colors into hex/rgba.
 */
function sanitizeClonedElementForHtml2Canvas(clonedDoc: Document, elementId: string) {
  const dummyCtx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;

  // 1. Sanitize all <style> tags in the cloned document
  try {
    const styleTags = clonedDoc.querySelectorAll("style");
    styleTags.forEach((styleTag) => {
      if (
        styleTag.textContent &&
        (styleTag.textContent.includes("lab") || styleTag.textContent.includes("oklch") || styleTag.textContent.includes("color("))
      ) {
        styleTag.textContent = fixLabColorsInString(styleTag.textContent, dummyCtx);
      }
    });
  } catch (e) {
    // ignore
  }

  // 2. Wrap getComputedStyle on clonedDoc.defaultView to intercept any remaining lab/oklch queries
  if (clonedDoc.defaultView) {
    const origGetComputedStyle = clonedDoc.defaultView.getComputedStyle.bind(clonedDoc.defaultView);

    clonedDoc.defaultView.getComputedStyle = (elt: Element, pseudoElt?: string | null): CSSStyleDeclaration => {
      const style = origGetComputedStyle(elt, pseudoElt);

      return new Proxy(style, {
        get(target, prop, receiver) {
          if (prop === "getPropertyValue") {
            return (propertyName: string) => {
              const val = target.getPropertyValue(propertyName);
              return fixLabColorsInString(val, dummyCtx);
            };
          }
          const val = Reflect.get(target, prop, receiver);
          if (typeof val === "function") {
            return val.bind(target);
          }
          if (typeof val === "string") {
            return fixLabColorsInString(val, dummyCtx);
          }
          return val;
        },
      });
    };
  }

  // 3. Set layout overrides on cloned root element
  const clonedElement = clonedDoc.getElementById(elementId);
  if (clonedElement) {
    clonedElement.style.margin = "0";
    clonedElement.style.padding = "24px";
    clonedElement.style.width = "800px";
    clonedElement.style.maxWidth = "800px";
    clonedElement.style.boxSizing = "border-box";
    clonedElement.style.borderRadius = "0";
  }
}

/**
 * Generates a crisp, full-page PDF from a specified HTML element ID and triggers browser download.
 * Works seamlessly across Mobile (Android/iOS) and Desktop browsers.
 */
export async function downloadReceiptAsPdf(
  elementId: string,
  filename: string = "Receipt.pdf"
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID "${elementId}" not found for PDF generation.`);
    if (typeof window !== "undefined") {
      window.print();
    }
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // High resolution crisp text rendering
      useCORS: true,
      logging: false,
      backgroundColor: "#FFFDF9",
      windowWidth: 800,
      onclone: (clonedDoc) => {
        sanitizeClonedElementForHtml2Canvas(clonedDoc, elementId);
      },
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight > pdfHeight) {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    } else {
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error("PDF generation failed, falling back to window.print():", err);
    if (typeof window !== "undefined") {
      window.print();
    }
    return false;
  }
}
