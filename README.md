# ManufactERP - Modern ERP Dashboard

A modern, clean, and professional ERP dashboard interface for manufacturing and stock management companies. Built with React, Vite, and Tailwind CSS.

## Features

- 🎨 **Modern SAAS-Style Interface** - Clean, professional design inspired by Notion, Linear, and Stripe
- 📊 **Comprehensive Dashboard** - Real-time overview of stock levels, purchase orders, production status, and sales statistics
- 🔔 **Stock Alert System** - Intelligent notifications for low stock with detailed modal views
- 📱 **Responsive Design** - Seamless experience across all devices
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development and build times

## Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icon set

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Left navigation sidebar
│   ├── Navbar.jsx           # Top navigation bar with search and notifications
│   ├── Dashboard.jsx        # Main dashboard with widgets
│   └── StockAlertModal.jsx  # Detailed stock alert modal
├── App.jsx                  # Main application component
├── index.css               # Global styles with Tailwind
└── main.jsx                # Application entry point
```

## Getting Started

### Installation

The project dependencies are already installed. To start the development server:

```bash
npm run dev
```

Then open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Features Overview

### Dashboard Components

- **Left Sidebar**: Navigation menu with Dashboard, Stock, Production, CRM, Purchases, Sales, Accounting, and Settings
- **Top Navbar**: Search bar, notification bell, and user avatar
- **Notification Banner**: Amber alert bar for critical stock notifications
- **Dashboard Widgets**:
  - Key statistics cards (Total Products, Pending Orders, Production Lines, Monthly Sales)
  - Stock alerts panel with clickable items
  - Pending purchase orders list
  - Production planning status with progress bars
  - Quick action buttons

### Stock Alert Modal

When a stock alert is clicked, a detailed modal displays:
- Alert severity indicator
- Affected product information
- Current vs. minimum stock levels
- Visual stock level bar
- Last movement date
- Category information
- Recommended action
- "Create Purchase Request" button

## Design Philosophy

The dashboard follows modern SAAS design principles:
- **Light Theme**: Whites, grays, and primary blue/teal colors
- **Subtle Shadows**: Soft depth without overwhelming the interface
- **Rounded Corners**: Smooth, friendly appearance
- **Minimalist Layout**: Clean, uncluttered design
- **Elegant Warnings**: Amber/yellow alerts that inform without alarming

## Customization

### Colors

The primary color palette can be customized in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Customize these values
    500: '#0ea5e9',
    600: '#0284c7',
    // ...
  },
}
```

### Components

All components are modular and can be easily customized or extended. Each component is self-contained in the `src/components/` directory.
