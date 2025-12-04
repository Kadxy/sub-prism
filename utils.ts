import * as crypto from "crypto";

export function generateSecureFilename(username: string, salt: string): string {
    const hash = crypto
        .createHash("md5")
        .update(`${username}:${salt}`)
        .digest("hex");
    return `${hash}.txt`;
}

export function safeDecode(str: string): string {
    try {
        return decodeURIComponent(str);
    } catch {
        return str;
    }
}

/**
 * Returns formatted timestamp for filenames
 * Format: YYYY-MM-DD_HH-mm-ss
 */
export function getFormattedTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");

    return [
        now.getFullYear(),
        pad(now.getMonth() + 1),
        pad(now.getDate()),
        "_",
        pad(now.getHours()),
        pad(now.getMinutes()),
        pad(now.getSeconds()),
    ].join(""); // No separators inside date parts for cleaner look, customizable
    // Result: 20251204_080808 or 2025-12-04_08-08-08 depending on join
    // Let's match your request: YYYY-MM-DD-HH-MM-SS (Use dashes carefully)
}

export function generateReportFilename(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");

    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    return `${dateStr}_${timeStr}_sub-prism-result.csv`;
}

/**
 * Parses raw node links string into an array of node links.
 * Splits by newline and filters out empty lines.
 */
export function parseNodeLinks(rawLinks: string): string[] {
    return rawLinks
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
}