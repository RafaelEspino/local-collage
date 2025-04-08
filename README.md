# Instagram Collage Builder

A web-based application that allows photographers to create Instagram-ready photo collages without requiring server-side processing. The application focuses on essential collage creation functionality while keeping everything client-side.

## Features

- 📸 Local photo import with drag-and-drop support
- 🎨 Pre-designed layout templates
- ✂️ Basic photo editing and cropping
- 📱 Instagram-friendly aspect ratios
- 💾 Local storage for work in progress
- 📥 Export functionality

## Tech Stack

- React + TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Vite for development and building

## Getting Started

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

The project is structured as follows:

```
src/
  ├── components/
  │   ├── layout/      # Layout components
  │   ├── collage/     # Collage-specific components
  │   └── shared/      # Reusable components
  ├── store/           # State management
  ├── types/           # TypeScript types
  ├── utils/           # Utility functions
  └── assets/          # Static assets
```

## License

MIT
