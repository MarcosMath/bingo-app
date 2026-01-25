/**
 * Genera un cartón de bingo tradicional de 5x5
 * - Columna B: 1-15
 * - Columna I: 16-30
 * - Columna N: 31-45 (centro es FREE)
 * - Columna G: 46-60
 * - Columna O: 61-75
 */
export class BingoCardGenerator {
  private static readonly COLUMNS = 5;
  private static readonly ROWS = 5;
  private static readonly RANGES = [
    { min: 1, max: 15 },   // B
    { min: 16, max: 30 },  // I
    { min: 31, max: 45 },  // N
    { min: 46, max: 60 },  // G
    { min: 61, max: 75 },  // O
  ];

  /**
   * Genera un cartón de bingo aleatorio
   */
  static generateCard(): number[][] {
    const card: number[][] = [];

    for (let col = 0; col < this.COLUMNS; col++) {
      const column: number[] = [];
      const range = this.RANGES[col];
      const availableNumbers = this.getNumbersInRange(range.min, range.max);

      // Seleccionar 5 números aleatorios de la columna
      for (let row = 0; row < this.ROWS; row++) {
        // El centro (columna N, fila 2) es FREE (marcado con 0)
        if (col === 2 && row === 2) {
          column.push(0);
        } else {
          const randomIndex = Math.floor(Math.random() * availableNumbers.length);
          column.push(availableNumbers[randomIndex]);
          availableNumbers.splice(randomIndex, 1);
        }
      }

      card.push(column);
    }

    return card;
  }

  /**
   * Obtiene un array de números en un rango
   */
  private static getNumbersInRange(min: number, max: number): number[] {
    const numbers: number[] = [];
    for (let i = min; i <= max; i++) {
      numbers.push(i);
    }
    return numbers;
  }

  /**
   * Verifica si un cartón tiene Bingo (línea completa)
   */
  static checkBingo(card: number[][], markedNumbers: number[]): boolean {
    const markedSet = new Set(markedNumbers);
    markedSet.add(0); // El centro siempre está marcado

    // Verificar filas
    for (let row = 0; row < this.ROWS; row++) {
      let hasLine = true;
      for (let col = 0; col < this.COLUMNS; col++) {
        if (!markedSet.has(card[col][row])) {
          hasLine = false;
          break;
        }
      }
      if (hasLine) return true;
    }

    // Verificar columnas
    for (let col = 0; col < this.COLUMNS; col++) {
      let hasLine = true;
      for (let row = 0; row < this.ROWS; row++) {
        if (!markedSet.has(card[col][row])) {
          hasLine = false;
          break;
        }
      }
      if (hasLine) return true;
    }

    // Verificar diagonal principal (\)
    let hasDiagonal1 = true;
    for (let i = 0; i < this.COLUMNS; i++) {
      if (!markedSet.has(card[i][i])) {
        hasDiagonal1 = false;
        break;
      }
    }
    if (hasDiagonal1) return true;

    // Verificar diagonal secundaria (/)
    let hasDiagonal2 = true;
    for (let i = 0; i < this.COLUMNS; i++) {
      if (!markedSet.has(card[i][this.ROWS - 1 - i])) {
        hasDiagonal2 = false;
        break;
      }
    }
    if (hasDiagonal2) return true;

    return false;
  }

  /**
   * Convierte el formato de columnas a filas para mejor visualización
   */
  static transposeCard(card: number[][]): number[][] {
    const transposed: number[][] = [];
    for (let row = 0; row < this.ROWS; row++) {
      const newRow: number[] = [];
      for (let col = 0; col < this.COLUMNS; col++) {
        newRow.push(card[col][row]);
      }
      transposed.push(newRow);
    }
    return transposed;
  }

  /**
   * Formatea un cartón para display (como string)
   */
  static formatCard(card: number[][]): string {
    const transposed = this.transposeCard(card);
    let output = ' B   I   N   G   O\n';
    output += '─────────────────────\n';

    for (const row of transposed) {
      output += row.map(num => num === 0 ? 'FREE' : num.toString().padStart(2, ' ')).join('  ') + '\n';
    }

    return output;
  }
}
