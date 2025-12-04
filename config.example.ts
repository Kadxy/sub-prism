// Copy config.example.ts to config.ts

import { UserMap, ServerMap } from "./types.js";

export const SERVER_MAP: ServerMap = {
    // host : clear tag
    "1.1.1.1": "🇺🇸 New York",
    "2.2.2.2": "🇨🇦 Toronto",
};

export const USER_MAP: UserMap = {
    "James": /_u1$/,
    "Amy": /_u2$/,
    "John": /_u3$/,
};

// Paste your node links here, one per line
export const RAW_NODE_LINKS = `
vless://xxx@1.1.1.1:443?...#node1
vless://xxx@2.2.2.2:443?...#node2
`;