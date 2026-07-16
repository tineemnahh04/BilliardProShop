# Billiard Pro Shop UI/UX Design

This is a code bundle for Billiard Pro Shop UI/UX Design. The original project is available at https://flower-bottom-41403298.figma.site/.

## Structure

The project has been restructured into two main directories:
- [BE](file:///g:/SU26/SDN302_SU26/Bi_a/billiard_BE/BE): Backend API server (Express)
- [FE](file:///g:/SU26/SDN302_SU26/Bi_a/billiard_BE/FE): Frontend single page application (Vite / React / Tailwind CSS)

## Getting Started

1. **Install Dependencies**:
   Install the root dependencies and subproject dependencies:
   ```bash
   npm run install:all
   ```

2. **Run Development Servers**:
   Start both Backend and Frontend development servers concurrently:
   ```bash
   npm run dev
   ```

   Alternatively, you can run them individually:
   - Start frontend: `npm run dev:fe`
   - Start backend: `npm run dev:be`