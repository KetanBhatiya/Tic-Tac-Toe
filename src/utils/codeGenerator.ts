import * as crypto from "crypto";

export class CodeGenerator {
  private static readonly CODE_LENGTH: number = 6;
  private static readonly MAX_RETRIES: number = 3;
  private static readonly ALLOWED_CHARACTERS: string =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static usedCodes: Set<string> = new Set();

  public static generateJoinCode(): string {
    let attempts = 0;
    while (attempts < this.MAX_RETRIES) {
      const code = this.generateCode();
      if (!this.usedCodes.has(code)) {
        this.usedCodes.add(code);

        if (this.usedCodes.size > 10000) {
          this.cleanup();
        }
        return code;
      }
      attempts++;
    }

    return this.generateTimestampCode();
  }

  private static generateCode(): string {
    const buffer = crypto.randomBytes(this.CODE_LENGTH);
    let code = "";

    for (let i = 0; i < this.CODE_LENGTH; i++) {
      const randomIndex = buffer[i] % this.ALLOWED_CHARACTERS.length;
      code += this.ALLOWED_CHARACTERS[randomIndex];
    }

    return code;
  }

  private static generateTimestampCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `${timestamp}${random}`.substring(0, this.CODE_LENGTH);
  }

  public static releaseCode(code: string): void {
    this.usedCodes.delete(code);
  }

  public static isValidCode(code: string): boolean {
    if (!code || code.length !== this.CODE_LENGTH) {
      return false;
    }

    return code
      .split("")
      .every((char) => this.ALLOWED_CHARACTERS.includes(char));
  }

  private static cleanup(): void {
    const maxCodestoKeep = 5000;
    if (this.usedCodes.size > maxCodestoKeep) {
      const codesArray = Array.from(this.usedCodes);
      const codesToKeep = codesArray.slice(-maxCodestoKeep);
      this.usedCodes = new Set(codesToKeep);
    }
  }

  public static generateTemporaryCode(expirationMinutes: number = 30): {
    code: string;
    expiresAt: Date;
  } {
    const code = this.generateJoinCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    return {
      code,
      expiresAt,
    };
  }
}

export const generateJoinCode =
  CodeGenerator.generateJoinCode.bind(CodeGenerator);
export const releaseCode = CodeGenerator.releaseCode.bind(CodeGenerator);
export const isValidCode = CodeGenerator.isValidCode.bind(CodeGenerator);
export const generateTemporaryCode =
  CodeGenerator.generateTemporaryCode.bind(CodeGenerator);
