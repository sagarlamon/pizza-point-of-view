# 🤝 Contributing to Flash Pizza

Thank you for your interest in contributing to Flash Pizza! This document provides guidelines and instructions for contributing.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Making Changes](#making-changes)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Reporting Issues](#reporting-issues)

---

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher
- Git
- A code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/flash-pizza.git
cd flash-pizza
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/flash-pizza.git
```

---

## Development Setup

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Project Structure

```
flash-pizza/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Customer app
│   ├── index.css             # Global styles
│   │
│   ├── admin/
│   │   └── AdminApp.tsx      # Admin panel
│   │
│   ├── components/           # UI components
│   │   ├── CartContext.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── Checkout.tsx
│   │   ├── FloatingCart.tsx
│   │   ├── Header.tsx
│   │   ├── Icons.tsx
│   │   ├── LocationPicker.tsx
│   │   ├── MenuItem.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── OrderProgress.tsx
│   │   ├── OrderTracking.tsx
│   │   ├── ProfilePage.tsx
│   │   └── UPIPayment.tsx
│   │
│   ├── context/              # React Context providers
│   │   ├── DataContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── data/
│   │   └── mockData.ts       # Initial/sample data
│   │
│   ├── services/
│   │   └── firebase.ts       # Firebase integration
│   │
│   └── types/
│       └── index.ts          # TypeScript types
│
├── public/                   # Static assets
├── index.html                # HTML template
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types for all props and state
- Avoid `any` type unless absolutely necessary

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
  // ...
};

// ❌ Bad
const Button = (props: any) => {
  // ...
};
```

### React

- Use functional components with hooks
- Use React.FC for component typing
- Keep components small and focused
- Extract reusable logic into custom hooks

```typescript
// ✅ Good - Small, focused component
const PriceDisplay: React.FC<{ amount: number }> = ({ amount }) => (
  <span className="font-semibold">₹{amount}</span>
);

// ✅ Good - Custom hook
const useLocalStorage = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
};
```

### Tailwind CSS

- Use Tailwind utility classes for styling
- Follow mobile-first approach
- Use dark mode variants consistently
- Group related classes logically

```typescript
// ✅ Good - Organized classes
className={`
  flex items-center justify-between
  p-4 rounded-xl
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  hover:shadow-md
  transition-all duration-200
`}

// ❌ Bad - Random order
className="border p-4 hover:shadow-md flex dark:bg-gray-800 bg-white items-center"
```

### File Naming

- Use PascalCase for components: `MenuItem.tsx`
- Use camelCase for utilities: `firebase.ts`
- Use kebab-case for CSS files (if any): `animations.css`

### Imports

- Group imports logically:
  1. React and libraries
  2. Components
  3. Contexts and hooks
  4. Types
  5. Utilities and data

```typescript
// React and libraries
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

// Components
import { Header } from './components/Header';
import { MenuItem } from './components/MenuItem';

// Contexts
import { useData } from './context/DataContext';
import { useCart } from './components/CartContext';

// Types
import type { Order, MenuItem as MenuItemType } from './types';

// Utilities
import { calculateDistance } from './utils/geo';
```

---

## Making Changes

### Branch Naming

Use descriptive branch names:

```
feature/add-search-functionality
fix/cart-quantity-bug
refactor/optimize-polling
docs/update-readme
```

### Commit Messages

Follow conventional commits:

```
feat: add search functionality to menu
fix: resolve cart quantity update bug
refactor: optimize data polling interval
docs: update installation instructions
style: format code with prettier
test: add unit tests for CartContext
chore: update dependencies
```

### Code Changes

1. Create a feature branch:

```bash
git checkout -b feature/my-feature
```

2. Make your changes

3. Test your changes:

```bash
npm run build
```

4. Commit your changes:

```bash
git add .
git commit -m "feat: add my awesome feature"
```

5. Push to your fork:

```bash
git push origin feature/my-feature
```

---

## Pull Request Process

### Before Submitting

- [ ] Code compiles without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] Tested on mobile viewport
- [ ] Tested in dark mode
- [ ] Updated documentation if needed
- [ ] Added types for new props/state

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Screenshots (if applicable)
Add screenshots here.

## Testing
Describe how you tested the changes.

## Checklist
- [ ] Code compiles without errors
- [ ] Tested on mobile
- [ ] Tested in dark mode
- [ ] Updated docs if needed
```

### Review Process

1. Submit PR against `main` branch
2. Wait for code review
3. Address any feedback
4. PR will be merged after approval

---

## Testing

### Manual Testing Checklist

#### Customer Flow
- [ ] Browse menu
- [ ] Filter by category
- [ ] Search items
- [ ] Add/remove from cart
- [ ] Apply coupon
- [ ] Select location on map
- [ ] Complete checkout (UPI)
- [ ] Complete checkout (COD)
- [ ] Track order status
- [ ] View order history
- [ ] Toggle dark mode

#### Admin Flow
- [ ] Login with password
- [ ] View incoming orders
- [ ] Update order status
- [ ] Add new menu item
- [ ] Edit menu item
- [ ] Delete menu item
- [ ] Add coupon
- [ ] Edit coupon
- [ ] Delete coupon
- [ ] Add banner
- [ ] Update settings
- [ ] Close/open store

#### Cross-Tab Sync
- [ ] Open customer and admin in separate tabs
- [ ] Place order in customer tab
- [ ] Verify order appears in admin tab
- [ ] Update status in admin tab
- [ ] Verify status updates in customer tab

### Responsive Testing

Test on these viewport widths:
- 320px (small phone)
- 375px (iPhone)
- 414px (large phone)
- 768px (tablet)
- 1024px (desktop)

---

## Reporting Issues

### Bug Reports

Use this template:

```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Screenshots
Add screenshots if helpful.

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop / Mobile
- Screen size: 375px
```

### Feature Requests

Use this template:

```markdown
## Feature Description
Clear description of the feature.

## Use Case
Why is this feature needed?

## Proposed Solution
How could it be implemented?

## Alternatives Considered
Other solutions you've thought about.

## Additional Context
Any other relevant information.
```

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the issue, not the person
- Accept criticism gracefully

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

---

## Getting Help

- Open an issue for bugs or questions
- Join discussions for feature ideas
- Check existing issues before creating new ones

---

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to Flash Pizza! 🍕
