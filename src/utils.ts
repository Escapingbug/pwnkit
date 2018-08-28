import util from "util";
import {context, Endian} from './context';
import bignum = require("bignum");

declare global {
    interface String {
        ljust(numb: number, content: string): String;
        rjust(numb: number, content: string): String;
    }
}

String.prototype.ljust = function(numb: number, content: string) {
    let out = this;
    if (this.length < numb) {
        while (out.length + content.length < numb) {
            out += content;
        }
        out += content.slice(0, numb - out.length);
    }

    return out;
};

String.prototype.rjust = function(numb: number, content: string) {
    let out = this;
    if (this.length < numb) {
        while (out.length + content.length < numb) {
            out = content + out;
        }
        out = content.slice(0, numb - out.length) + out;
    }

    return out;
}

function isPrintable(ch: number) {
    return ch > 0x20 && ch < 0x7f;
}

export function hexdump(content: string | Buffer | Uint8Array | Array<number>): string {
    if (typeof content == "string") {
        content = Buffer.from(content);
    }
    let representation = "";
    for (let i = 0; i < content.length; ++i) {

        if (i % 8 == 0) {
            representation += util.format("%s\t|", i.toString(16));
        }

        representation += util.format("%s ", content[i].toString(16).rjust(2, '0'));

        if ((i + 1) % 8 == 0) {
            representation += " |\t";
            for (let j = i - 7; j <= i; ++j) {
                if (isPrintable(content[j])) {
                    representation += String.fromCharCode(content[j]);
                } else {
                    representation += '.';
                }
            }
            representation += "\n";
        }

    }

    if (!(content.length % 8)) {
        return representation;
    }
    representation += " |\t"
    for (let i = content.length - (content.length % 8); i < content.length; ++i) {
        if (isPrintable(content[i])) {
            representation += String.fromCharCode(content[i]);
        } else {
            representation += '.';
        }
    }
    representation += "\n";
    return representation;
}

export function p16(numb: number): string {
    let info = context().archInfo();
    let buf = Buffer.alloc(2);
    if (info.endianness == Endian.LittleEndian) {
        buf.writeUInt16LE(numb, 0);
    } else {
        buf.writeUInt16BE(numb, 0);
    }

    return buf.toString();
}

export function p32(numb: number): string {
    let info = context().archInfo();
    let buf = Buffer.alloc(4);
    if (info.endianness == Endian.LittleEndian) {
        buf.writeUInt32LE(numb, 0);
    } else {
        buf.writeUInt32BE(numb, 0);
    }

    return buf.toString();
}

export function p64(numb: number): string {
    let info = context().archInfo();
    let num = new bignum(numb);
    let buf;
    if (info.endianness == Endian.LittleEndian) {
        buf = num.toBuffer({endian: 'little', size: 8});
    } else {
        buf = num.toBuffer({endian: 'big', size: 8});
    }

    return buf.toString();
}

export function u16(buf: string): number {
    let info = context().archInfo();
    let buffer = Buffer.from(buf);
    if (info.endianness == Endian.LittleEndian) {
        return buffer.readUInt16LE(0);
    } else {
        return buffer.readUInt16BE(0);
    }
}

export function u32(buf: string): number {
    let info = context().archInfo();
    let buffer = Buffer.from(buf);
    if (info.endianness == Endian.LittleEndian) {
        return buffer.readUInt32LE(0);
    } else {
        return buffer.readUInt32BE(0);
    }
}

export function u64(buf: string): number {
    let info = context().archInfo();
    let buffer = Buffer.from(buf);
    if (info.endianness == Endian.LittleEndian) {
        return bignum.fromBuffer(buffer, {endian: 'little', size: 8}).toNumber();
    } else {
        return bignum.fromBuffer(buffer, {endian: 'big', size: 8}).toNumber();
    }
}
