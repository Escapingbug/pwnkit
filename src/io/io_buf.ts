import net from 'net';
import util from 'util';
import stream from 'stream';
import readline from 'readline';
import {hexdump} from '../utils';
import {LoggerInterface} from '../logger';
import retry = require("async-retry");

export class IoBuffer {
    private buffer_: string;
    private write_stream_: stream.Writable;
    private read_stream_: stream.Readable;
    private logger_: LoggerInterface;
    private closeListener?: Function;

    constructor(
        write_to: stream.Writable,
        read_from: stream.Readable,
        logger: LoggerInterface,
        closeListener?: Function,
    ) {
        this.buffer_ = "";
        this.write_stream_ = write_to;
        this.read_stream_ = read_from;
        this.logger_ = logger;
        this.closeListener = closeListener;

        this.read_stream_.on('data', (data: string) => {
            this.logger_.debug("received:\n" + hexdump(data));
            this.append(data);
        });
    }

    public send(content: string) {
        this.logger_.debug("send:\n" + hexdump(content));
        this.write_stream_.write(content);
    }

    public sendline(content: string) {
        this.send(content + "\n");
    }

    public append(content: string) {
        this.buffer_ += content;
    }

    public async recv(numb: number): Promise<string> {
        return await retry(async (bail: any) => {
            if (this.buffer_.length < numb) {
                throw Error(util.format("recv %d timeout", numb));
            }

            let ret = this.buffer_.slice(0, numb);
            this.buffer_ = this.buffer_.slice(numb);
            return ret;
        }, { retries: 10, minTimeout: 500, maxTimeout: 2000});
    }

    public async recvuntil(content: string): Promise<string> {
        return await retry(async (bail: any) => {
            let idx = this.buffer_.indexOf(content);
            if (idx == -1) {
                throw Error(util.format("recvuntil %s timeout", content));
            }

            let ret = this.buffer_.slice(0, idx + content.length);
            this.buffer_ = this.buffer_.slice(idx + content.length);
            return ret;
        }, { retries: 10, minTimeout: 500, maxTimeout: 2000});
    }

    public interactive() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
        rl.setPrompt("$ ");
        rl.prompt();
        let lineListener = (line: string) => {
            this.sendline(line);
        };
        rl.on('line', lineListener);
        let closeListener = () => {
            this.sendline(Buffer.from([4]).toString());
            if (this.closeListener) {
                this.closeListener();
            }
        };
        rl.on('close', closeListener);
        
        let interactiveHandler = (data: string) => {
            process.stdout.write(data);
            rl.prompt();
        }
        this.read_stream_.on('data', interactiveHandler);
    }
}
