export class Ficha {
  private readonly numero: number;
  private readonly fecha: Date;

  constructor(numero: number, fecha: Date = new Date()) {
    if (numero < 1) {
      throw new Error('Número de ficha debe ser >= 1');
    }
    this.numero = numero;
    this.fecha = fecha;
  }

  getNumero(): number {
    return this.numero;
  }

  getFecha(): Date {
    return this.fecha;
  }

  toString(): string {
    const dia = String(this.fecha.getDate()).padStart(2, '0');
    const mes = String(this.fecha.getMonth() + 1).padStart(2, '0');
    const año = this.fecha.getFullYear();
    return `${this.numero}-${dia}/${mes}/${año}`;
  }
}
