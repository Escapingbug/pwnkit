import net from "net";
import util from "util";
import {context} from "../context";
import {Logger, LoggerInterface} from "../logger";
import {hexdump} from "../utils";
import {Pipeline} from "./pipeline";
import {IoBuffer} from "./io_buf";
import retry = require("async-retry");

export class Remote extends Logger implements Pipeline, LoggerInterface {
    private host_: string;
    private port_: number;
    private buffer_: IoBuffer;

    private socket_: net.Socket;

    constructor(host: string, port: number) {
        super();
        this.host_ = host;
        this.port_ = port;

        let connectInfoLogger = () => {
            this.info(`Connected to ${host}:${port}`);
        }

        this.socket_ = net.connect(port, host, connectInfoLogger);
        let closeListener = () => {
            this.info("remote connection ended.");
        };
        this.buffer_ = new IoBuffer(this.socket_, this.socket_, this, closeListener);
        // 1000 ms timeout by default
        this.socket_.setTimeout(1000);
    }

    /**
     * set socket timeout
     */
    public setTimeout(timeout: number) {
        this.socket_.setTimeout(timeout);
    }

    /**
     * send data to socket
     * @param content data to send
     */
    public send(content: string) {
        let logHandler = () => {
            this.debug("sent bytes: \n");
            this.debug(hexdump(content));
        }
        this.socket_.write(content, "utf8", logHandler);
    }

    public sendline(content: string) {
        this.send(content + "\n");
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
        this.buffer_.interactive();
    }
}

/**
 * remote connection
 */
export function remote(options: {[index: string]: any}): Remote{
    if (!options.host || !options.port) {
        throw Error("host and port are required");
    }
    let r = new Remote(options.host, options.port);
    return r;
}
