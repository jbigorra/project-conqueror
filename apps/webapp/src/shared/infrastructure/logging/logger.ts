import { createLogger, type Logger } from "logixlysia";

const logixlysiaLogger = createLogger({
  config: {
    showStartupMessage: false,
    timestamp: {
      translateTime: "yyyy-mm-dd HH:MM:ss",
    },
    ip: true,
    logFilePath: "./logs/app.log",
    logFilter: {
      level: ["INFO", "WARN", "ERROR", "DEBUG"],
    },
  },
});

interface ICustomLogger {
  info(message: string, data?: any): void;
  error(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}

class CustomLogger implements ICustomLogger {
  request = {
    headers: {
      get: (_) => "",
    },
    method: `LOG`,
    url: "",
  } as Request;
  readonly #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  #consoleLog(message: string, data: any): void {
    console.log("Default to console log for info, missing Request");
    console.log(message, data);
  }

  error(message: string, data?: any): void {
    if (!this.request) {
      this.#consoleLog(message, data);
      return;
    }
    const { headers, method, url } = this.request;
    this.#logger.error({ headers, method, url }, message, data);
  }
  warn(message: string, data?: any): void {
    if (!this.request) {
      this.#consoleLog(message, data);
      return;
    }
    const { headers, method, url } = this.request;
    this.#logger.warn({ headers, method, url }, message, data);
  }
  debug(message: string, data: any): void {
    if (!this.request) {
      this.#consoleLog(message, data);
      return;
    }
    const { headers, method, url } = this.request;
    this.#logger.debug({ headers, method, url }, message, data);
  }

  info(message: string, data?: any): void {
    if (!this.request) {
      this.#consoleLog(message, data);
      return;
    }
    const { headers, method, url } = this.request;
    this.#logger.info({ headers, method, url }, message, data);
  }
}

class LoggerInstance {
  private static logger: CustomLogger | null = null;

  static get(): CustomLogger {
    this.logger ??= new CustomLogger(logixlysiaLogger);
    return this.logger;
  }
}

export { LoggerInstance };
export type { ICustomLogger };
