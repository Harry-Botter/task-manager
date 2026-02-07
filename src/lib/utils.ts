/*ウォレットアドレス関連のユーティリティ関数*/

// アドレスを正規化(小文字 + trim)
export const normalizeAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    return address.toLowerCase().trim();
};

// ウォレットアドレスを短縮形で表示
export const truncateAddress = (address: string): string => {
    if (!address || address.length < 10) return address;
    const normalized = normalizeAddress(address);
    return `${normalized.slice(0,6)}...${normalized.slice(-4)}`;
};

// 2つのアドレスが同じかどうかを比較（文字の大小は無視）
export const addressesEqual = (
    addr1: string | null | undefined,
    add2r: string | null | undefined
): boolean => {
    //両方nullまたはundefinedの場合はtrue
    if (!addr1 && !add2r) return true;
    //片方nullまたはundefinedの場合はfalse
    if (!addr1 || !add2r) return false;
    //正規化して比較
    return normalizeAddress(addr1) === normalizeAddress(add2r)
};

// Suiアドレスの形式を確認。0x + 40文字の16進数
export const isValidSuiAddress = (address: string): boolean => {
    if (!address) return false;
    const trimmed = address.trim();
    return /^0x[0-9a-fA-F]{40,64}$/.test(trimmed);
};