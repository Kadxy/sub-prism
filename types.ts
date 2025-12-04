type VlessLink = `vless://${string}`;
type VmessLink = `vmess://${string}`;
type ShadowsocksLink = `ss://${string}`;
export type NodeLink = VlessLink | VmessLink | ShadowsocksLink;

export interface ServerMap {
    [hostname: string]: string;
}

export interface UserMap {
    [username: string]: RegExp;
}