# Testing Documentation

## 📊 Resumen de Pruebas

### Cobertura General

```
Test Suites: 2 passed, 2 total
Tests:       42 passed, 42 total
Time:        ~4s
```

### Cobertura por Módulo

| Módulo | Statements | Branch | Functions | Lines | Tests |
|--------|-----------|--------|-----------|-------|-------|
| **Games Module** | 79.38% | 83.33% | 85.71% | 80.15% | 42 |
| ├─ GamesService | 88.88% | 83.33% | 85.71% | 88.59% | 25 |
| └─ BingoCardGenerator | 100% | 100% | 100% | 100% | 17 |

## 🧪 Tests Implementados

### 1. BingoCardGenerator Tests (17 tests)

#### `generateCard()` - 5 tests
- ✅ Genera cartón 5x5
- ✅ Centro FREE en posición correcta (columna N, fila 2)
- ✅ Números en rangos correctos por columna:
  - B: 1-15
  - I: 16-30
  - N: 31-45
  - G: 46-60
  - O: 61-75
- ✅ Sin duplicados en la misma columna
- ✅ Genera cartones diferentes cada vez

#### `checkBingo()` - 7 tests
- ✅ Detecta línea horizontal (fila)
- ✅ Detecta línea vertical (columna)
- ✅ Detecta diagonal principal (\)
- ✅ Detecta diagonal secundaria (/)
- ✅ No detecta bingo con línea incompleta
- ✅ No detecta bingo sin números marcados
- ✅ FREE space siempre marcado automáticamente

#### `transposeCard()` - 1 test
- ✅ Transpone correctamente de columnas a filas

#### `formatCard()` - 2 tests
- ✅ Formatea con encabezado B-I-N-G-O
- ✅ Muestra exactamente un FREE en el centro

#### Integration Tests - 2 tests
- ✅ Genera cartón válido y verificable
- ✅ Genera 100 cartones válidos sin errores

### 2. GamesService Tests (25 tests)

#### General - 1 test
- ✅ Servicio está definido correctamente

#### `createGame()` - 4 tests
- ✅ Crea juego single player exitosamente
- ✅ Rechaza si créditos insuficientes
- ✅ Rechaza si apuesta < mínimo
- ✅ Rechaza si apuesta > máximo

#### `joinGame()` - 5 tests
- ✅ Permite unirse a juego en espera
- ✅ Rechaza si juego ya inició
- ✅ Rechaza si juego está lleno
- ✅ Rechaza si usuario ya está en el juego
- ✅ Rechaza si créditos insuficientes

#### `startGame()` - 2 tests
- ✅ Inicia juego en espera
- ✅ Rechaza si juego ya inició

#### `callNextNumber()` - 3 tests
- ✅ Llama número aleatorio (1-75)
- ✅ Rechaza si juego no está en PLAYING
- ✅ Rechaza si ya se llamaron 75 números

#### `markNumber()` - 4 tests
- ✅ Marca número válido en cartón
- ✅ Rechaza si cartón no encontrado
- ✅ Rechaza si número no fue llamado
- ✅ Rechaza si número no está en el cartón

#### `findOne()` - 2 tests
- ✅ Encuentra juego por ID
- ✅ Lanza NotFoundException si no existe

#### `getAvailableGames()` - 1 test
- ✅ Lista juegos en WAITING multiplayer

#### `cancelGame()` - 3 tests
- ✅ Cancela juego y devuelve créditos
- ✅ Rechaza si usuario no es host
- ✅ Rechaza si juego no está en WAITING

## 🎯 Casos de Prueba Destacados

### Lógica de Bingo

```typescript
// Verifica detección de línea horizontal
const card = [[1,2,3,4,5], [16,17,18,19,20], ...];
const markedNumbers = [1, 16, 31, 46, 61]; // Primera fila
const hasBingo = BingoCardGenerator.checkBingo(card, markedNumbers);
// hasBingo === true ✓
```

### Gestión de Créditos

```typescript
// Usuario con créditos insuficientes
mockUsersService.hasCredits.mockResolvedValue(false);
await expect(service.createGame(userId, dto))
  .rejects.toThrow(BadRequestException); // ✓
```

### Validación de Estados

```typescript
// Juego ya iniciado no puede recibir jugadores
const playingGame = { status: GameStatus.PLAYING };
await expect(service.joinGame(userId, gameId))
  .rejects.toThrow(BadRequestException); // ✓
```

### Números Aleatorios Únicos

```typescript
// Cada número llamado es único
const { number, game } = await service.callNextNumber(gameId);
expect(game.calledNumbers).toContain(number);
expect(game.calledNumbers.length).toBe(previousLength + 1); // ✓
```

## 🔍 Áreas de Cobertura

### ✅ Completamente Cubierto (100%)
- Generación de cartones
- Verificación de bingo (líneas, columnas, diagonales)
- Formato y transposición de cartones
- FREE space automático

### ✅ Alta Cobertura (85-90%)
- Creación de juegos
- Unirse a juegos
- Marcar números
- Llamar números
- Estados del juego

### ⚠️ No Cubierto (Pendiente)
- Método privado `declareWinner()` (testeado indirectamente)
- Algunos edge cases de concurrencia
- WebSocket Gateway (pendiente de implementar)
- REST Controller (pendiente de implementar)

## 🧮 Matemática del Bingo

Los tests verifican las probabilidades correctas:

### Rangos por Columna
```
B (1-15):   15 números posibles → 5 seleccionados
I (16-30):  15 números posibles → 5 seleccionados
N (31-45):  15 números posibles → 4 seleccionados + FREE
G (46-60):  15 números posibles → 5 seleccionados
O (61-75):  15 números posibles → 5 seleccionados
```

### Posibilidades de Bingo
Los tests verifican:
- 5 líneas horizontales
- 5 líneas verticales
- 2 diagonales
- **Total: 12 formas de ganar**

## 📋 Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests específicos
npm test -- bingo-card-generator
npm test -- games.service

# Ejecutar con coverage
npm run test:cov

# Ejecutar en modo watch
npm run test:watch

# Debug tests
npm run test:debug
```

## 🔧 Configuración de Jest

```javascript
// jest.config.js
{
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
}
```

## 📝 Escribiendo Nuevos Tests

### Patrón para Tests de Servicio

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let repository: Repository<Entity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        { provide: getRepositoryToken(Entity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
    repository = module.get(getRepositoryToken(Entity));
  });

  it('should do something', async () => {
    // Arrange
    mockRepo.findOne.mockResolvedValue(mockData);

    // Act
    const result = await service.method();

    // Assert
    expect(result).toBeDefined();
    expect(mockRepo.findOne).toHaveBeenCalledWith(...);
  });
});
```

### Patrón para Tests de Helper

```typescript
describe('HelperName', () => {
  describe('method', () => {
    it('should perform expected operation', () => {
      // Arrange
      const input = {...};

      // Act
      const result = Helper.method(input);

      // Assert
      expect(result).toBe(expectedOutput);
    });
  });
});
```

## 🎓 Buenas Prácticas Aplicadas

1. ✅ **AAA Pattern**: Arrange, Act, Assert
2. ✅ **Mocking**: Todos los servicios externos mockeados
3. ✅ **Isolation**: Cada test es independiente
4. ✅ **Descriptive**: Nombres claros que describen qué se testea
5. ✅ **Edge Cases**: Casos límite y errores cubiertos
6. ✅ **Integration**: Tests de integración para flujos completos
7. ✅ **Fast**: Tests ejecutan en ~4 segundos

## 🚀 Próximos Tests a Implementar

### Auth Module
- [ ] Login con credenciales válidas
- [ ] Login con credenciales inválidas
- [ ] Registro de usuario
- [ ] Validación de JWT token
- [ ] Refresh token

### Users Module
- [ ] Crear usuario
- [ ] Actualizar usuario
- [ ] Agregar/deducir créditos
- [ ] Verificación de créditos

### WebSocket Gateway (cuando se implemente)
- [ ] Conexión de cliente
- [ ] Join game room
- [ ] Broadcast de números
- [ ] Manejo de desconexiones

## 📊 Coverage Goals

- **Target**: 80% overall coverage
- **Current**:
  - Games Module: 79.38% ✅
  - BingoCardGenerator: 100% ✅
  - GamesService: 88.88% ✅

## 🐛 Debugging Tests

```bash
# Run single test
npm test -- -t "should generate a 5x5 card"

# Run with verbose output
npm test -- --verbose

# Run in debug mode
npm run test:debug
```

---

**Última actualización**: 2024-01-22
**Tests totales**: 42 pasados
**Cobertura promedio**: 79%
**Estado**: ✅ Core lógica completamente testeada
