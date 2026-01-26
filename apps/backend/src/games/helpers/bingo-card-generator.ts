/**
 * Genera cartones de bingo en diferentes tamaños
 * - 3x3 (Rápido): Números del 1-27
 * - 5x5 (Clásico): Sistema tradicional B-I-N-G-O
 */
export class BingoCardGenerator {
  // Configuración para 5x5 (Clásico)
  private static readonly COLUMNS_5X5 = 5;
  private static readonly ROWS_5X5 = 5;
  private static readonly RANGES_5X5 = [
    { min: 1, max: 15 },   // B
    { min: 16, max: 30 },  // I
    { min: 31, max: 45 },  // N
    { min: 46, max: 60 },  // G
    { min: 61, max: 75 },  // O
  ];

  // Configuración para 3x3 (Rápido)
  private static readonly COLUMNS_3X3 = 3;
  private static readonly ROWS_3X3 = 3;
  private static readonly RANGES_3X3 = [
    { min: 1, max: 9 },    // Primera columna
    { min: 10, max: 18 },  // Segunda columna
    { min: 19, max: 27 },  // Tercera columna
  ];

  /**
   * Genera un cartón de bingo 3x3 (Rápido)
   */
  static generateCard3x3(): number[][] {
    const card: number[][] = [];

    for (let col = 0; col < this.COLUMNS_3X3; col++) {
      const column: number[] = [];
      const range = this.RANGES_3X3[col];
      const availableNumbers = this.getNumbersInRange(range.min, range.max);

      // Seleccionar 3 números aleatorios de la columna
      for (let row = 0; row < this.ROWS_3X3; row++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        column.push(availableNumbers[randomIndex]);
        availableNumbers.splice(randomIndex, 1);
      }

      card.push(column);
    }

    return card;
  }

  /**
   * Genera un cartón de bingo 5x5 (Clásico)
   */
  static generateCard5x5(): number[][] {
    const card: number[][] = [];

    for (let col = 0; col < this.COLUMNS_5X5; col++) {
      const column: number[] = [];
      const range = this.RANGES_5X5[col];
      const availableNumbers = this.getNumbersInRange(range.min, range.max);

      // Seleccionar 5 números aleatorios de la columna
      for (let row = 0; row < this.ROWS_5X5; row++) {
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
   * Genera un cartón según el tamaño especificado
   */
  static generateCard(size: '3x3' | '5x5' = '5x5'): number[][] {
    return size === '3x3' ? this.generateCard3x3() : this.generateCard5x5();
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
    markedSet.add(0); // El centro FREE siempre está marcado (solo en 5x5)

    const cols = card.length;
    const rows = card[0]?.length || 0;

    // Verificar filas
    for (let row = 0; row < rows; row++) {
      let hasLine = true;
      for (let col = 0; col < cols; col++) {
        if (!markedSet.has(card[col][row])) {
          hasLine = false;
          break;
        }
      }
      if (hasLine) return true;
    }

    // Verificar columnas
    for (let col = 0; col < cols; col++) {
      let hasLine = true;
      for (let row = 0; row < rows; row++) {
        if (!markedSet.has(card[col][row])) {
          hasLine = false;
          break;
        }
      }
      if (hasLine) return true;
    }

    // Verificar diagonal principal (\)
    let hasDiagonal1 = true;
    for (let i = 0; i < cols; i++) {
      if (!markedSet.has(card[i][i])) {
        hasDiagonal1 = false;
        break;
      }
    }
    if (hasDiagonal1) return true;

    // Verificar diagonal secundaria (/)
    let hasDiagonal2 = true;
    for (let i = 0; i < cols; i++) {
      if (!markedSet.has(card[i][rows - 1 - i])) {
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
    const cols = card.length;
    const rows = card[0]?.length || 0;
    const transposed: number[][] = [];

    for (let row = 0; row < rows; row++) {
      const newRow: number[] = [];
      for (let col = 0; col < cols; col++) {
        newRow.push(card[col][row]);
      }
      transposed.push(newRow);
    }
    return transposed;
  }

  /**
   * Formatea un cartón para display (como string)
   */
  static formatCard(card: number[][], size: '3x3' | '5x5' = '5x5'): string {
    const transposed = this.transposeCard(card);
    let output = '';

    if (size === '5x5') {
      output = ' B   I   N   G   O\n';
      output += '─────────────────────\n';
    } else {
      output = ' 1   2   3\n';
      output += '───────────\n';
    }

    for (const row of transposed) {
      output += row.map(num => num === 0 ? 'FREE' : num.toString().padStart(2, ' ')).join('  ') + '\n';
    }

    return output;
  }

  /**
   * Obtiene el rango máximo de números según el tamaño del cartón
   */
  static getMaxNumber(size: '3x3' | '5x5'): number {
    return size === '3x3' ? 27 : 75;
  }
}
