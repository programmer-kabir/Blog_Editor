/**
 * Utility to format and sanitize pasted content in Jodit editor.
 * Handles:
 * 1. Markdown syntax from clipboard -> Clean HTML
 * 2. Dark-mode copied HTML -> High-contrast readable styles
 * 3. Tables, code blocks, headings, blockquotes, and lists
 */

export function isMarkdown(text) {
  if (!text || typeof text !== "string") return false;
  const lines = text.split("\n");
  let mdSignals = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{1,6}\s+\S+/.test(trimmed)) mdSignals += 2;
    if (/^[-*+]\s+\S+/.test(trimmed)) mdSignals += 1;
    if (/^\d+\.\s+\S+/.test(trimmed)) mdSignals += 1;
    if (/^>\s+\S+/.test(trimmed)) mdSignals += 2;
    if (/^\|(.+)\|$/.test(trimmed)) mdSignals += 2;
    if (/^```/.test(trimmed)) mdSignals += 3;
    if (/\*\*[^*]+\*\*/.test(trimmed)) mdSignals += 1;
    if (/`[^`]+`/.test(trimmed)) mdSignals += 1;
  }
  return mdSignals >= 2;
}

export function formatInline(text) {
  if (!text) return "";
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<del style='text-decoration: line-through; color: #94a3b8;'>$1</del>")
    .replace(
      /`([^`]+)`/g,
      '<code style="background-color: #f1f5f9; color: #e11d48; padding: 2px 6px; border-radius: 6px; font-size: 0.875em; font-family: monospace; font-weight: 600;">$1</code>'
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #ef4444; text-decoration: underline; font-weight: 500;">$1</a>'
    );
}

export function markdownToHtml(md) {
  if (!md) return "";

  // 1. Code blocks (```lang ... ```)
  let html = md.replace(/```([\w-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre style="background-color: #0f172a; color: #f8fafc; padding: 14px 18px; border-radius: 12px; font-family: monospace; font-size: 14px; overflow-x: auto; margin: 16px 0;"><code>${escaped}</code></pre>`;
  });

  const lines = html.split("\n");
  const result = [];
  let inList = false;
  let listType = ""; // 'ul' | 'ol'
  let inTable = false;
  let tableRows = [];

  function flushList() {
    if (inList) {
      result.push(`</${listType}>`);
      inList = false;
      listType = "";
    }
  }

  function flushTable() {
    if (inTable && tableRows.length > 0) {
      let tableHtml = `<table style="border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #cbd5e1; font-size: 14px;">`;
      tableRows.forEach((row, idx) => {
        const isHeader = idx === 0;
        const tag = isHeader ? "th" : "td";
        const bg = isHeader
          ? "background-color: #f1f5f9; font-weight: 700; color: #0f172a;"
          : "background-color: #ffffff; color: #334155;";
        tableHtml += `<tr style="${idx % 2 === 1 && !isHeader ? "background-color: #f8fafc;" : ""}">`;
        row.forEach((cell) => {
          tableHtml += `<${tag} style="border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; ${bg}">${formatInline(
            cell.trim()
          )}</${tag}>`;
        });
        tableHtml += `</tr>`;
      });
      tableHtml += `</table>`;
      result.push(tableHtml);
      inTable = false;
      tableRows = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip table separator line (|---|---|)
    if (/^\|?\s*[-:]+[-| :]*\|?$/.test(trimmed) && inTable) {
      continue;
    }

    // Markdown Table row
    if (/^\|(.+)\|$/.test(trimmed)) {
      flushList();
      const cells = trimmed
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|");
      tableRows.push(cells);
      inTable = true;
      continue;
    } else {
      flushTable();
    }

    // Unordered List (- or *)
    const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (!inList || listType !== "ul") {
        flushList();
        result.push(
          `<ul style="list-style-type: disc; margin-left: 24px; margin-bottom: 12px; color: #334155;">`
        );
        inList = true;
        listType = "ul";
      }
      result.push(
        `<li style="margin-bottom: 6px; line-height: 1.6;">${formatInline(ulMatch[1])}</li>`
      );
      continue;
    }

    // Ordered List (1. )
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        flushList();
        result.push(
          `<ol style="list-style-type: decimal; margin-left: 24px; margin-bottom: 12px; color: #334155;">`
        );
        inList = true;
        listType = "ol";
      }
      result.push(
        `<li style="margin-bottom: 6px; line-height: 1.6;">${formatInline(olMatch[1])}</li>`
      );
      continue;
    }

    flushList();

    // Empty line
    if (!trimmed) {
      continue;
    }

    // Horizontal Rule (---)
    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      result.push(
        `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />`
      );
      continue;
    }

    // Headings
    if (/^#\s+(.*)$/.test(trimmed)) {
      result.push(
        `<h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 24px 0 12px; line-height: 1.25;">${formatInline(
          trimmed.replace(/^#\s+/, "")
        )}</h1>`
      );
      continue;
    }
    if (/^##\s+(.*)$/.test(trimmed)) {
      result.push(
        `<h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 22px 0 10px; line-height: 1.3;">${formatInline(
          trimmed.replace(/^##\s+/, "")
        )}</h2>`
      );
      continue;
    }
    if (/^###\s+(.*)$/.test(trimmed)) {
      result.push(
        `<h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 18px 0 8px; line-height: 1.35;">${formatInline(
          trimmed.replace(/^###\s+/, "")
        )}</h3>`
      );
      continue;
    }
    if (/^####\s+(.*)$/.test(trimmed)) {
      result.push(
        `<h4 style="font-size: 16px; font-weight: 600; color: #0f172a; margin: 14px 0 6px;">${formatInline(
          trimmed.replace(/^####\s+/, "")
        )}</h4>`
      );
      continue;
    }

    // Blockquote
    if (/^>\s*(.*)$/.test(trimmed)) {
      result.push(
        `<blockquote style="border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 12px 18px; border-radius: 0 12px 12px 0; margin: 16px 0; color: #991b1b; font-style: italic; line-height: 1.6;">${formatInline(
          trimmed.replace(/^>\s*/, "")
        )}</blockquote>`
      );
      continue;
    }

    // Paragraph
    result.push(
      `<p style="color: #334155; line-height: 1.75; margin-bottom: 14px; font-size: 16px;">${formatInline(
        trimmed
      )}</p>`
    );
  }

  flushList();
  flushTable();

  return result.join("\n");
}

/**
 * Cleans unwanted dark-mode colors and messy inline styles from HTML.
 */
export function cleanHtmlStyles(html) {
  if (!html || typeof html !== "string") return html;
  if (typeof window === "undefined" || !window.DOMParser) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const allElements = doc.body.querySelectorAll("*");
  allElements.forEach((el) => {
    // Code blocks and inline code
    if (el.tagName === "CODE" && el.parentElement?.tagName !== "PRE") {
      el.style.backgroundColor = "#f1f5f9";
      el.style.color = "#e11d48";
      el.style.padding = "2px 6px";
      el.style.borderRadius = "6px";
      el.style.fontSize = "0.875em";
      el.style.fontFamily = "monospace";
      el.style.fontWeight = "600";
      return;
    }
    if (el.tagName === "PRE") {
      el.style.backgroundColor = "#0f172a";
      el.style.color = "#f8fafc";
      el.style.padding = "14px 18px";
      el.style.borderRadius = "12px";
      el.style.overflowX = "auto";
      return;
    }
    if (el.tagName === "TABLE") {
      el.style.borderCollapse = "collapse";
      el.style.width = "100%";
      el.style.margin = "16px 0";
      el.style.border = "1px solid #cbd5e1";
      return;
    }
    if (el.tagName === "TH" || el.tagName === "TD") {
      el.style.border = "1px solid #cbd5e1";
      el.style.padding = "10px 14px";
      if (el.tagName === "TH") {
        el.style.backgroundColor = "#f1f5f9";
        el.style.fontWeight = "700";
        el.style.color = "#0f172a";
      } else {
        el.style.color = "#334155";
      }
      return;
    }

    // Headings
    if (/^H[1-6]$/.test(el.tagName)) {
      el.style.color = "#0f172a";
      el.style.fontWeight = "700";
      el.style.backgroundColor = "";
      el.style.opacity = "";
      el.style.fontFamily = "";
      return;
    }

    // Paragraphs, spans, divs, lists
    if (["P", "SPAN", "DIV", "LI", "UL", "OL", "STRONG", "EM", "B", "I"].includes(el.tagName)) {
      // If color was washed-out / light gray / dark mode color, reset it
      const c = (el.style.color || "").toLowerCase().replace(/\s/g, "");
      const isFaint =
        c.includes("rgb(204") ||
        c.includes("rgb(1") ||
        c.includes("rgb(2") ||
        c.includes("rgba(") ||
        c.includes("#abb") ||
        c.includes("#ccc") ||
        c.includes("#d1d5db") ||
        c.includes("#9ca") ||
        c.includes("#999") ||
        c.includes("#aaa") ||
        c.includes("#888") ||
        c === "white" ||
        c === "#fff" ||
        c === "#ffffff";

      if (isFaint) {
        el.style.color = "#334155";
      }

      // Remove dark backgrounds copied from dark mode
      const bg = (el.style.backgroundColor || "").toLowerCase().replace(/\s/g, "");
      if (
        bg.includes("rgb(3") ||
        bg.includes("rgb(2") ||
        bg.includes("rgb(4") ||
        bg.includes("#1e") ||
        bg.includes("#28") ||
        bg.includes("#000") ||
        bg.includes("black")
      ) {
        el.style.backgroundColor = "";
      }

      el.style.opacity = "";
      el.style.fontFamily = "";
    }
  });

  return doc.body.innerHTML;
}

/**
 * Unified paste event handler for Jodit
 */
export function handleSmartPaste(event, joditInstance) {
  if (!event || !event.clipboardData) return;

  const html = event.clipboardData.getData("text/html");
  const text = event.clipboardData.getData("text/plain");

  let cleanResult = "";

  // 1. If plain text has clear markdown signals, parse markdown
  if (text && isMarkdown(text)) {
    cleanResult = markdownToHtml(text);
  }
  // 2. If HTML is available (e.g. copied from VS Code preview or browser)
  else if (html && html.trim()) {
    cleanResult = cleanHtmlStyles(html);
  }
  // 3. Fallback: plain text
  else if (text) {
    cleanResult = text
      .split(/\n{2,}/)
      .map((p) => `<p style="color: #334155; line-height: 1.7; margin-bottom: 14px;">${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  if (cleanResult) {
    event.preventDefault();
    if (joditInstance && joditInstance.s) {
      joditInstance.s.insertHTML(cleanResult);
    }
    return false;
  }
}
