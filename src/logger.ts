import {context} from "./context";
import colors = require("ansi-colors");

export interface LoggerInterface {
    info(content: string): void;
    warn(content: string): void;
    error(content: string): void;
    debug(content: string): void;
}

export class Logger {
    public info(content: string) {
        console.log(colors.cyan("[*] " + content));
    }

    public warn(content: string) {
        console.log(colors.yellow("[!] " + content));
    }

    public error(content: string) {
        console.log(colors.red("[XX] " + content));
    }

    public debug(content: string) {
        console.log(colors.green("[DEBUG] " + content));
    }
}
