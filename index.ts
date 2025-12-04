import * as fs from "fs";
import * as path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { SERVER_MAP, USER_MAP } from "./config.js";
import { generateSecureFilename, safeDecode, generateReportFilename, parseNodeLinks } from "./utils.js";
import { ENV } from "./env.js";
import { s3Client } from "./s3.js";

async function main() {
    // Parse raw node links
    let nodeLinks: string[] = [];

    try {
        nodeLinks = parseNodeLinks(ENV.RAW_NODE_LINKS);
    } catch (e) {
        console.error(`❌ Parse Error: ${e}`);
        return;
    }

    console.log(`💎 Sub-Prism 💎`)

    console.log(`\n📥 Input: ${nodeLinks.length} links`);

    // ----------------------------------------------------
    // Phase 1: ETL (Extract, Transform, Load to Memory)
    // ----------------------------------------------------
    let skippedNum = 0;

    // Initialize buckets
    const userBuckets: Record<string, string[]> = {};
    Object.keys(USER_MAP).forEach((u) => (userBuckets[u] = []));

    for (const rawLink of nodeLinks) {
        if (!rawLink.trim()) continue;

        try {
            const url = new URL(rawLink);

            // 1. Identify User
            const label = safeDecode(url.hash.replace("#", ""));
            const matchEntry = Object.entries(USER_MAP).find(([_, regex]) => regex.test(label));

            if (!matchEntry) {
                skippedNum++;
                console.warn(`   [Skip] Unmatched label: ${label}`);
                continue;
            }
            const username = matchEntry[0];

            // 2. Identify & Transform Host
            const targetTag = SERVER_MAP[url.hostname];

            if (!targetTag) {
                skippedNum++;
                console.warn(`   [Skip] Unknown hostname: ${url.hostname}`);
                continue;
            }

            // 3. Apply Tag
            url.hash = `#${encodeURIComponent(targetTag)}`;
            userBuckets[username]?.push(url.toString());

        } catch (e) {
            skippedNum++;
            console.error(`   ❌  Parse Error: ${rawLink.substring(0, 30)}...`);
        }
    }

    console.log(`${skippedNum ? `⚠️  Skipped: ${skippedNum}/${nodeLinks.length} links` : "✅  All links processed successfully"}`);

    // Check if there are any links to process
    const totalLinks = Object.values(userBuckets).reduce((sum, links) => sum + links.length, 0);
    if (totalLinks === 0) {
        console.log("\n❌  No valid links to upload. Exiting.");
        console.timeEnd("⏱️ Total Time");
        return;
    }

    // ----------------------------------------------------
    // Phase 2: Distribution & Reporting
    // ----------------------------------------------------
    console.log("\n🚀  Uploading to R2...");

    const reportData: string[] = ["User,Regex,Subscription Link,Node Count"]; // CSV Header

    const uploadPromises = Object.entries(userBuckets).map(async ([username, links]) => {
        if (links.length === 0) return;

        const base64Content = Buffer.from(links.join("\n")).toString("base64");
        const secureFilename = generateSecureFilename(username, ENV.FILENAME_SALT);

        try {
            await s3Client.send(
                new PutObjectCommand({
                    Bucket: ENV.R2_BUCKET_NAME,
                    Key: secureFilename,
                    Body: base64Content,
                    ContentType: "text/plain",
                    CacheControl: "no-cache, no-store, must-revalidate",
                })
            );

            const finalUrl = `${ENV.R2_PUBLIC_DOMAIN}/${secureFilename}`;
            const userRegex = USER_MAP[username]?.toString() || "";
            console.log(`   ✅  ${username.padEnd(12)} ${links.length} nodes`);

            // Collect data for report
            reportData.push(`${username},"${userRegex}",${finalUrl},${links.length}`);

        } catch (e: any) {
            console.error(`❌ [${username}] Upload Failed: ${e.message}`);
        }
    });

    await Promise.all(uploadPromises);

    // ----------------------------------------------------
    // Phase 3: Generate Report File
    // ----------------------------------------------------
    if (reportData.length > 1) {
        const resultsDir = path.join(process.cwd(), "results");
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const filename = generateReportFilename();
        const filePath = path.join(resultsDir, filename);
        fs.writeFileSync(filePath, reportData.join("\n"));
        console.log(`\n📄   Report: ${filename}`);
    }
}

main();