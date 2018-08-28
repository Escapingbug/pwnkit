import {Pipeline} from "./pipeline";
import child_process from "child_process";
import {Logger, LoggerInterface} from '../logger';
import {hexdump} from '../utils';
import {IoBuffer} from './io_buf';
import util from 'util';
import retry = require("async-retry");

export class Process extends Logger implements Pipeline, LoggerInterface {
    private proc_: child_process.ChildProcess;
    private buffer_: IoBuffer;

    constructor(path: string, args: Array<string>, options: {[index: string]: any}) {
        super();
        this.proc_ = child_process.spawn(path, args, options);
        this.info(util.format('Launched new process %d (%s)', this.proc_.pid, path));
        this.proc_.on('exit', (code?: number, signal?: string) => {
            if (code) {
                this.info(`Process ended with code ${code}`);
            } else {
                this.info(`Child process end with signal ${signal}`);
            }
        });
        let closeListener = () => {
            this.proc_.kill();
        };
        this.buffer_ = new IoBuffer(this.proc_.stdin, this.proc_.stdout, this, closeListener);
    }

    public send(content: string) {
        this.proc_.stdin.write(content);
    }

    public sendline(content: string) {
        this.proc_.stdin.write(content + "\n");
    }

    public async recv(numb: number): Promise<string> {
        return this.buffer_.recv(numb);
    }

    public async recvuntil(content: string): Promise<string> {
        return this.buffer_.recvuntil(content);
    }

    public async recvline(): Promise<string> {
        return this.recvuntil("\n");
    }

    public interactive() {
        return this.buffer_.interactive();
    }
}

export function process(
    path: string,
    args: Array<string> = [],
    options: {[index: string]: any} = {}): Process {
    return new Process(path, args, options);
}
