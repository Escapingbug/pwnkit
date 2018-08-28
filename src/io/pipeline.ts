import {LoggerInterface} from '../logger';

export interface Pipeline extends LoggerInterface {
    send(content: string): void;
    sendline(content: string): void;
    recv(numb: number): Promise<string>;
    recvuntil(content: string): Promise<string>;
    recvline(): Promise<string>;
    interactive(): void;
}
