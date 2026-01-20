# 🎰 Bingo App

Aplicación móvil de Bingo desarrollada con React Native y Expo, con sistema de créditos y competencia multijugador.

## 📱 Características

### Juego de Bingo
- Cartones de 5x5 con números aleatorios organizados por columnas (B-I-N-G-O)
- Celda central "FREE" automáticamente marcada
- Auto-marcado de números cuando se sortean
- Detección automática de ganador
- Historial visual de números sorteados en formato de tabla

### Sistema Multijugador
- 6 jugadores por partida (tú + 5 oponentes AI)
- Los oponentes juegan automáticamente
- Solo participan jugadores con créditos suficientes
- Competencia en tiempo real

### Sistema de Créditos
- **Créditos iniciales**: 10 créditos por jugador
- **Costo por juego**: 2 créditos
- **Premio**: El ganador se lleva todos los créditos apostados
- **Validaciones**: No se puede jugar sin créditos suficientes
- Display en tiempo real de créditos y premio acumulado

### Interfaz de Usuario
- Diseño colorido y atractivo con colores por columna
- Animaciones suaves
- Números sorteados en formato de cuadrícula
- Modal de victoria con información de premios
- Botones deshabilitados cuando no hay créditos

## 🛠️ Tecnologías

- **React Native** - Framework para aplicaciones móviles
- **Expo** - Plataforma de desarrollo
- **React Hooks** - Gestión de estado (useState, useCallback, useEffect)
- **AsyncStorage** - Persistencia de datos (futuro)

## 📁 Estructura del Proyecto

```
bingo/
├── app/
│   ├── _layout.js          # Layout principal de la app
│   ├── index.js            # Pantalla de inicio
│   └── game.js             # Pantalla principal del juego
├── components/
│   ├── BingoCard.js        # Componente del cartón del jugador
│   ├── BingoCell.js        # Componente de celda individual
│   ├── NumberBall.js       # Componente del número actual
│   ├── WinnerModal.js      # Modal de victoria
│   ├── OpponentCard.js     # Componente de cartón de oponente (no usado en UI)
│   └── CreditsDisplay.js   # Display de créditos y premio
├── hooks/
│   └── useBingoGame.js     # Hook principal con lógica del juego
├── utils/
│   ├── bingoLogic.js       # Lógica de negocio del bingo
│   └── constants.js        # Constantes del juego
└── assets/                 # Imágenes e iconos
```

## 🎮 Cómo Funciona

### Generación de Cartones
Cada cartón tiene números distribuidos según las reglas tradicionales del bingo:
- **B**: números del 1-15
- **I**: números del 16-30
- **N**: números del 31-45 (con celda FREE en el centro)
- **G**: números del 46-60
- **O**: números del 61-75

### Mecánica del Juego

1. **Inicio del juego**:
   - Se descuentan 2 créditos a cada jugador activo
   - Se generan cartones únicos para cada jugador
   - El premio acumulado se calcula (2 créditos × número de jugadores)

2. **Durante el juego**:
   - Se sortean números del 1-75 sin repetición
   - Los números se marcan automáticamente en todos los cartones
   - Se verifica constantemente si hay ganador

3. **Condición de victoria**:
   - Gana el primer jugador en completar las 24 celdas (excluyendo FREE)

4. **Fin del juego**:
   - El ganador recibe todos los créditos del pozo
   - Se puede iniciar un nuevo juego si hay créditos suficientes

### Sistema de Créditos

```javascript
// Constantes
INITIAL_CREDITS = 10  // Créditos iniciales
BET_AMOUNT = 2        // Costo por juego
NUM_OPPONENTS = 5     // Número de oponentes

// Ejemplo de premio
6 jugadores × 2 créditos = 12 créditos al ganador
```

## 🚀 Instalación y Ejecución

### Prerequisitos
- Node.js (v14 o superior)
- npm o yarn
- Expo CLI
- Expo Go app en tu dispositivo móvil

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/MarcosMath/bingo-app.git
cd bingo-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo**
```bash
npx expo start
```

4. **Ejecutar en dispositivo**
   - Escanea el código QR con Expo Go (Android) o la cámara (iOS)
   - O presiona `w` para abrir en navegador web

### Comandos Útiles

```bash
# Iniciar con túnel (para problemas de red)
npx expo start --tunnel

# Iniciar en modo LAN
npx expo start --lan

# Limpiar caché
npx expo start --clear
```

## 🎨 Personalización

### Modificar Constantes del Juego

En `hooks/useBingoGame.js`:
```javascript
const INITIAL_CREDITS = 10;  // Cambiar créditos iniciales
const BET_AMOUNT = 2;        // Cambiar costo por juego
const NUM_OPPONENTS = 5;     // Cambiar número de oponentes
```

### Modificar Colores

En `utils/constants.js`:
```javascript
export const COLUMN_COLORS = {
  B: '#4A90E2', // Azul
  I: '#E94B4B', // Rojo
  N: '#FFFFFF', // Blanco
  G: '#50C878', // Verde
  O: '#FF8C42', // Naranja
};
```

## 🔮 Próximas Características

- [ ] Persistencia de créditos con AsyncStorage
- [ ] Tabla de posiciones (leaderboard)
- [ ] Diferentes modos de juego (línea, diagonal, esquinas)
- [ ] Sonidos y efectos de audio
- [ ] Animaciones de victoria mejoradas
- [ ] Compra de créditos adicionales
- [ ] Multiplayer en línea real

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

**MarcosMath**
- GitHub: [@MarcosMath](https://github.com/MarcosMath)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🙏 Agradecimientos

- Desarrollado con la asistencia de Claude Sonnet 4.5
- Inspirado en el juego tradicional de Bingo

---

**¡Diviértete jugando Bingo!** 🎉
