import { RegExp } from './index';

export const isLocalhost = Boolean(
    globalThis?.location.hostname === 'localhost' ||
    globalThis?.location.hostname === '[::1]' || // [::1] is the IPv6 localhost address
    globalThis?.location.hostname.match(RegExp.LocalIP) // 127.0.0.1/8 is considered localhost for IPv4.
);
