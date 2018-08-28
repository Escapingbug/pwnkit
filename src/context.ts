/**
 * Operating system kinds
 *
 * Field values are used to be consistent with pwntools
 */
export enum Os {
    linux = 'linux',
    macos = 'macos',
    windows = 'windows',
}

/**
 * Architecture kinds
 *
 * Fields value are used to be consistent with pwntools
 */
export enum Arch {
    x86 = 'i386',
    x86_64 = 'amd64',
}

export enum LogLevel {
    Debug = "debug",
    Info = "info",
    Warn = "warn",
    Error = "error",
}

export enum Endian {
    LittleEndian = 'le',
    BigEndian = 'be',
}

const ARCH_INFO_TABLE: {[index: string]: any} = {
    'i386': {
        endianness: Endian.LittleEndian,
        bits: 32,
    },
    'amd64': {
        endianness: Endian.LittleEndian,
        bits: 64,
    }
};

/**
 * Context class, to save all settings
 */
export class Context {

    /** Architecture information */
    private arch_: Arch;
    /** operating system context */
    private os_: Os;
    private log_level_: LogLevel; 

    /** used to set options from raw object but with type checks */
    private dispatch_table: {[index: string]: Function};

    constructor() {
        // default settings
        this.arch_ = Arch.x86;
        this.os_ = Os.linux;
        this.log_level_ = LogLevel.Info;

        this.dispatch_table = {
            "arch": this.arch,
            "os": this.os,
        };
    }

    /**
     * public accessor of architecture.
     * @param set_arch? If it is provided, set the arch, else, return current one.
     * @returns current architecture
     */
    public arch(set_arch?: Arch): Arch {
        if (set_arch) {
            this.arch_ = set_arch;
        }

        return this.arch_;
    }

    /**
     * public accessor for os
     * @param set_os? If it is provided, set the os, else return current one
     * @returns current operating system
     */
    public os(set_os?: Os): Os {
        if (set_os) {
            this.os_ = set_os;
        }

        return this.os_;
    }

    public logLevel(set_log_level?: LogLevel): LogLevel {
        if (set_log_level) {
            this.log_level_ = set_log_level;
        }

        return this.log_level_;
    }

    /**
     * set options from options object
     * @param an object with settings in it.
     * @returns context with settings
     */
    public fromObject(options: {[index: string] : string}): Context {
        for (let key in options) {
            this.dispatch_table[key].call(this, options[key]);
        }

        return this;
    }

    public archInfo(): {[index: string]: any} {
        return ARCH_INFO_TABLE[this.arch_];
    }
}

/**
 * global context object
 */
let ctx: Context = new Context();

/**
 * pwntools style context setter
 * @param options The options to set, a key-value object.
 * @returns current global context object
 */
export function context(options?: {[index: string]: string}) {
    if (options) {
        ctx.fromObject(options);
    }

    return ctx;
}
