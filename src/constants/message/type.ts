export interface MessageContent {
  message: {
    message: string;
    attachment?: Buffer | string;
    filename?: string;
  };
}
