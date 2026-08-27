export abstract class DomainException extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = this.constructor.name;
    // new.target.prototype (no DomainException.prototype) para que
    // `instanceof` funcione correctamente en las subclases concretas
    // (UnauthorizedException, ValidationException, etc.), no solo en la base.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
