/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012, 2013 Bo Zhu http://zhuzhu.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

function new_random_ip() {
    "use strict";
    var ip_addr = '220.181.111.';
    //ip_addr += Math.floor(Math.random() * 255) + '.';
    ip_addr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
    return ip_addr;
};

function string_starts_with(str, substr) {
    "use strict";
    return str.slice(0, substr.length) === substr;
}
function new_sogou_auth_str() {
    "use strict";
    var auth_str = '/30/853edc6d49ba4e27';
    var i, tmp_str;
    for (i = 0; i < 8; i++) {
        tmp_str = ('0000' + Math.floor(Math.random() * 65536).toString(16)).slice(-4);
        auth_str = tmp_str.toUpperCase() + auth_str;
    }
    return auth_str;
}


function new_sogou_proxy_addr() {
    "use strict";
    var other_ip_addrs = [
        '220.181.118.128',
    ];

    var random_num = Math.floor(Math.random() * (16 + 16 + other_ip_addrs.length));  // 0 ~ 15 edu, 0 ~ 15 dxt
    var proxy_addr;

    if (random_num < 16) {
        if (8 === random_num || 12 === random_num) {
            return new_sogou_proxy_addr(); // just retry
        }
        proxy_addr = 'h' + random_num + '.dxt.bj.ie.sogou.com';  // 0 ~ 15
    } else if (random_num < 16 + 16) {
        random_num -= 16;
        proxy_addr = 'h' + random_num + '.edu.bj.ie.sogou.com';  // (16 ~ 31) - 16
    } else {
        random_num -= 16 + 16;
        proxy_addr = other_ip_addrs[random_num];
    }
    proxy_addr = 'http://'+proxy_addr;

    return proxy_addr;
}


// based on http://goo.gl/th215
function compute_sogou_tag(timestamp, target_link) {
    "use strict";
    var hostname;
    if (string_starts_with(target_link, 'http://')) {
        hostname = target_link.match(/^http:\/\/(.[^:\/]+)/)[1];
    } else {
        hostname = target_link;
    }
    var s = timestamp + hostname + 'SogouExplorerProxy';
    var total_len = s.length;
    var numb_iter = Math.floor(total_len / 4);
    var numb_left = total_len % 4;

    var hash = total_len;  // output hash tag

    var i, low, high;
    for (i = 0; i < numb_iter; i++) {
        low  = s.charCodeAt(4 * i + 1) * 256 + s.charCodeAt(4 * i);  // right most 16 bits in little-endian
        high = s.charCodeAt(4 * i + 3) * 256 + s.charCodeAt(4 * i + 2);  // left most

        hash += low;
        hash %= 0x100000000;
        hash ^= hash << 16;

        hash ^= high << 11;
        hash += hash >>> 11;
        hash %= 0x100000000;
    }

    switch (numb_left) {
    case 3:
        hash += (s.charCodeAt(total_len - 2) << 8) + s.charCodeAt(total_len - 3);
        hash %= 0x100000000;
        hash ^= hash << 16;
        hash ^= s.charCodeAt(total_len - 1) << 18;
        hash += hash >>> 11;
        hash %= 0x100000000;
        break;
    case 2:
        hash += (s.charCodeAt(total_len - 1) << 8) + s.charCodeAt(total_len - 2);
        hash %= 0x100000000;
        hash ^= hash << 11;
        hash += hash >>> 17;
        hash %= 0x100000000;
        break;
    case 1:
        hash += s.charCodeAt(total_len - 1);
        hash %= 0x100000000;
        hash ^= hash << 10;
        hash += hash >>> 1;
        hash %= 0x100000000;
        break;
    default:
        break;
    }

    hash ^= hash << 3;
    hash += hash >>> 5;
    hash %= 0x100000000;

    hash ^= hash << 4;
    hash += hash >>> 17;
    hash %= 0x100000000;

    hash ^= hash << 25;
    hash += hash >>> 6;
    hash %= 0x100000000;

    // learnt from http://goo.gl/oRJ0o
    hash = hash >>> 0;

    return ('00000000' + hash.toString(16)).slice(-8);
}


// export as a node.js module
var exports = exports || {};
exports.new_random_ip = new_random_ip;
exports.new_sogou_auth_str = new_sogou_auth_str;
exports.compute_sogou_tag = compute_sogou_tag;
exports.new_sogou_proxy_addr = new_sogou_proxy_addr;