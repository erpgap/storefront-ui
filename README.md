# 🛒 ODOO + Alokai Storefront

This is a demo project that guides the creation of a Nuxt-based E-commerce project using Alokai (formerly Vue Storefront) integrated with the ODOO ERP.

## 📚 Table of Contents

- [🔍 Overview](#overview)
- [📄 Main Pages](#main-pages)
- [🚀 Dynamic Routing System](#dynamic-routing-system)
  - [⚡ Automatic Route Generation](#automatic-route-generation)
  - [🔀 Route Resolver](#route-resolver)
- [✨ Key Features](#key-features)
  - [🔍 Product Search](#1-product-search)
  - [🗄️ Advanced Caching System](#2-advanced-caching-system)
  - [💳 Payment Integration](#3-payment-integration)
  - [📦 Product Features](#4-product-features)
  - [📂 Category System](#5-category-system)
- [🛠️ Tech Stack](#tech-stack)
- [📁 Project Structure](#project-structure)
- [⚙️ Setup and Installation](#setup-and-installation)
- [🔗 ODOO Integration](#odoo-integration)

## 🔍 Overview

The project uses the Alokai SDK to create a modern and high-performance e-commerce experience, directly connected to ODOO as the backend ERP.

## 📄 Main Pages

The core of the Alokai e-commerce used in this project includes the following pages:

- **🏠 Home** (/) - Homepage with featured products
- **📂 Category** (/category-page) - Dynamic category pages listing by category slug
- **📦 Product** (/product-page) - Dynamic product pages listing by product slug
- **🛒 Cart** (/cart) - Shopping cart
- **💳 Checkout** (/checkout) - Checkout process
- **❤️ Wishlist** (/wishlist) - Wishlist page
- **👤 My Account** (/my-account) - Customer area with:
  - ⚙️ Account settings
  - 📍 Addresses
  - 📝 Personal information

## 🚀 Dynamic Routing System

### ⚡ Automatic Route Generation
The project uses an advanced dynamic route generation system that:

- **🔄 Automatic fetch from ODOO**: During build time, the system queries ODOO via GraphQL to fetch all slugs for products, categories, and website pages
- **📄 Static route creation**: Automatically generates static pages for each product and category found
- **⚡ Performance optimization**: Applies automatic SWR (Stale-While-Revalidate) configurations to each generated route
- **🔗 Real-time route resolution**: `/api/route-resolver` API endpoint that identifies the content type based on the URL slug

### 🔀 Route Resolver
An intelligent system that:
- 🎯 Identifies whether a route matches a product, category, or website page
- 🗄️ Uses Redis cache to optimize lookups
- 🗺️ Maps ODOO models to route types:
  - `product.template` → 📦 product
  - `product.public.category` → 📂 category  
  - `alokai.website.page` → 📄 website page

## ✨ Key Features

### 1. 🔍 Product Search

- **🏪 ODOO Default**: Native ODOO search accessible via the header search bar
- **🔍 Algolia**: Integration with Algolia for advanced search and suggestions
- **🔍 Luigi**: Alternative search system using Luigi

### 2. 🗄️ Advanced Caching System

- **🔗 Route Cache**: Optimizes resources by reducing unnecessary API calls
- **📄 Page Cache**: HTML caching to improve user experience and performance
- **💾 Storage Layers**: Multi-driver storage system (Redis) for:
  - 🛒 Cart cache
  - 📦 Stock cache
  - 🔗 Slug/route cache
  - 📊 General data cache

### 3. 💳 Payment Integration

- **💰 Adyen Payment**: Secure and fast payment processing using the Adyen platform

### 4. 📦 Product Features

- **🎨 Dynamic Variants**: Size, color, and material selection with automatic URL update
- **🖼️ Image Gallery**: Gallery system with thumbnails and main image
- **🔗 Related Products**:
  - 🛍️ Frequently bought together
  - 🔄 Alternative products
  - 👀 Recently viewed
- **❤️ Wishlist**: Add/remove products from wishlist
- **📊 Stock Management**: Real-time stock availability check

### 5. 📂 Category System

- **🔍 Filter Navigation**: Sidebar with attribute filters
- **📄 Pagination**: Responsive pagination system
- **🍞 Breadcrumbs**: Hierarchical navigation
- **📱 Responsive View**: Automatic adaptation for mobile and desktop

## 🛠️ Tech Stack

- **🚀 Framework**: Nuxt 3
- **🎨 UI Components**: Alokai Storefront UI
- **🏪 Backend**: ODOO ERP
- **💅 Styling**: Tailwind CSS
- **📦 State Management**: Pinia
- **⚡ Build Tool**: Vite
- **🗄️ Cache**: Redis (configurable via storage drivers)
- **🖼️ Images**: Nuxt Image with custom ODOO provider

## 📁 Project Structure

```
├── components/                    # Reusable Vue components
├── layers/                       # Nuxt layers for modular architecture
│   ├── cart-redis/              # Cart management with Redis caching
│   │   ├── composables/         # Cart-related composables
│   │   └── server/              # Cart server utilities and plugins
│   ├── category/                # Category pages and functionality
│   │   ├── composables/         # Category-related composables
│   │   ├── custom-pages/        # Category page templates
│   │   └── utils/               # Category utilities
│   ├── checkout/                # Checkout process and payment
│   │   ├── composables/         # Checkout-related composables
│   │   └── components/          # Checkout UI components
│   ├── core/                    # Core application components
│   │   ├── components/          # Shared UI components
│   │   │   ├── header/          # Header components (Mobile/Desktop)
│   │   │   └── ui/              # Base UI components
│   │   └── composables/         # Core composables
│   ├── my-account/              # User account management
│   │   ├── components/          # Account-related components
│   │   └── pages/               # Account pages
│   ├── product/                 # Product pages and functionality
│   │   ├── composables/         # Product-related composables
│   │   └── custom-pages/        # Product page templates
│   └── search-default/          # Search functionality
│       ├── components/          # Search components
│       ├── composables/         # Search composables
│       └── pages/               # Search pages
├── layouts/                     # Application layouts
├── pages/                       # Application pages (auto-routing)
├── modules/                     # Custom Nuxt modules
│   └── routes-generator/        # Automatic route generator
├── server/                      # Server API routes and middleware
│   ├── api/                     # API endpoints
│   ├── mutations/               # GraphQL mutations
│   └── queries/                 # GraphQL queries
├── plugins/                     # Nuxt plugins
├── composables/                 # Global Vue composables
├── middleware/                  # Route middleware
├── utils/                       # Utility functions
└── nuxt.config.ts              # Nuxt configuration
```

## ⚙️ Setup and Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run in development mode
npm run dev

# Build for production
npm run build
```

## 🔗 ODOO Integration

The project is configured to integrate with the ODOO ERP using GraphQL APIs for:

- 📦 Managing products and categories with variants
- 🛒 Order processing
- 👥 Customer management
- 📊 Real-time inventory control
- 🗺️ Automatic sitemap generation
- 🔍 SEO optimization for products and categories

For detailed technical documentation, please refer to the full project documentation.