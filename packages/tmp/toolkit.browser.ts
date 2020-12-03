import { RegExp } from './index';

export const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' || // [::1] is the IPv6 localhost address
    window.location.hostname.match(RegExp.LocalIP) // 127.0.0.1/8 is considered localhost for IPv4.
);
