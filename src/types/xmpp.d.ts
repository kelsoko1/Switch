// Type declarations for XMPP modules
declare module '@xmpp/client' {
  export function client(options: any): any;
  export const xml: any;
  export const jid: any;
}

declare module 'debug' {
  export default function debug(namespace: string): any;
}
