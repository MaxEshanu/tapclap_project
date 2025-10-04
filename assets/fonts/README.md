# 🎨 Шрифты для Blast Game

## Установка шрифта Marvin

Для корректного отображения игры необходимо установить шрифт **Marvin**, который используется в макете.

### 📁 Необходимые файлы:

Поместите следующие файлы в папку `assets/fonts/`:

```
assets/fonts/
├── Marvin-Regular.woff2    (рекомендуемый формат)
├── Marvin-Regular.woff     (fallback)
├── Marvin-Regular.ttf      (fallback)
├── Marvin-Bold.woff2       (для жирного текста)
├── Marvin-Bold.woff        (fallback)
└── Marvin-Bold.ttf         (fallback)
```

### 🔍 Где найти шрифт Marvin:

1. **В материалах задания** - проверьте архив с макетом
2. **Google Fonts** - поиск "Marvin"
3. **Adobe Fonts** - если у вас есть подписка
4. **MyFonts** - коммерческий сервис
5. **Font Squirrel** - бесплатные шрифты

### ⚡ Быстрая установка:

Если у вас нет файлов шрифта, игра будет использовать fallback:
- **Arial** (основной fallback)
- **Arial Black** (для жирного текста)
- **sans-serif** (системный fallback)

### 🛠 Альтернативный способ - Google Fonts:

Если Marvin доступен в Google Fonts, замените в `index.html`:

```html
<!-- Заменить -->
<link rel="stylesheet" href="assets/fonts/marvin.css">

<!-- На -->
<link href="https://fonts.googleapis.com/css2?family=Marvin:wght@400;700&display=swap" rel="stylesheet">
```

### 📱 Проверка загрузки:

В браузере откройте DevTools → Network → Fonts, чтобы убедиться что шрифты загружаются корректно.

### 🎯 Используемые места:

Шрифт Marvin используется во всех текстовых элементах игры:
- ✅ Счетчик ходов
- ✅ Панель очков  
- ✅ Сообщения о победе/поражении
- ✅ Заголовок "БУСТЕРЫ"
- ✅ Счетчики бустеров
