/*
  Example:
  import * as Error from './error'
  new Error.Handler("error", Error.CMD_NOT_FND, details)
*/

export * from "./errorMessages";

export class Handler {
  private static isVerbose: boolean;

  constructor(
    private what      ?: string,
    private msg       ?: string,
    private details   ?: any,
  ) {
    if (msg) {
      this.handle();
    }
  }

  public init(isVerbose: boolean): void {
    Handler.isVerbose = isVerbose;
  }

  private handle(): void {
    if (this.what === "error") {
      this.handleError();
    } else if (this.what === "retry") {
      this.handleRetry();
    } else if (this.what === "success") {
      this.handleSuccess();
 }
  }

  private handleError(): void {
    // tslint:disable-next-line: no-console
    console.error(`Error: ${this.msg}`);

    if (this.details && Handler.isVerbose) {
      // tslint:disable-next-line: no-console
      console.error(`Error: ${this.details}`)
    }

    process.exit();
  }

  private handleRetry(): void {
    // tslint:disable-next-line: no-console
    console.error(`Error: ${this.msg}`);
    this.details();
  }

  private handleSuccess(): void {
    // tslint:disable-next-line: no-console
    console.success(`${this.msg}`);
    if (this.details && Handler.isVerbose) {
      // tslint:disable-next-line: no-console
      console.error(`Success: ${this.details}`)
    }
  }
}
