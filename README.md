# Anika Jewelry - Premium E-commerce & Admin Platform

Welcome to the **Anika Jewelry Platform**, a premium, full-stack e-commerce system designed specifically for a high-end fashion jewelry brand. This monorepo contains a modern customer-facing storefront, a comprehensive administrative management console, infrastructure-as-code configurations, and automated CI/CD deployment pipelines.

---

## 💎 Project Overview

The **Anika** platform is built around a decoupled architecture separating a responsive storefront frontend, a secure Supabase backend database, and automated Terraform infrastructure provisioning. 

- **Customer Storefront**: A clean, elegant, and responsive UI built using React (v19) and custom Vanilla CSS design tokens. Customers can browse jewelry catalogs, customize/add products to their cart or wishlist, manage shipping addresses, and review order histories.
- **Admin Management Console**: A robust dashboard interface for administrators to manage products, categories, orders, customers, storefront banners, and view advanced analytics (sales data, funnel metrics, and customer segmentation).
- **Backend & Database (Supabase)**: Leverages Supabase for PostgreSQL database services, Row-Level Security (RLS) policies, storage buckets for media, and passwordless authentication.

---

## ✨ Features

### 🛍️ Elegant Customer Portal
- **Jewelry Catalog**: Filtered category pages for Rings, Earrings, Bracelets, Bangles, and Necklaces.
- **Interactive Product Details**: Visual image galleries, product specifications (sku, weight, care instructions), and selection of size, color, and quantity.
- **Global Shopping Cart & Wishlist**: Persistent user carts and wishlists that synchronize automatically with the database via Zustand and Supabase integration.
- **Passwordless OTP Authentication**: Seamless email-based One-Time Password (OTP) login and signup flows.
- **Profile & Address Manager**: Manage personal user details and save multiple shipping addresses with default address logic.

### 📊 Powerful Admin Console
- **Analytics Dashboard**: Interactive charts tracking sales data, customer segmentation, funnel conversion rates, and stock alerts.
- **Product & Category CRUD**: Complete forms to create, edit, activate, and delete catalog items and product categories.
- **Promotional Banners**: Live control over homepage promotional banner media and styling.
- **Order & Customer Trackers**: Interactive views of order states (Pending, Shipped, Delivered) and comprehensive customer detail histories.
- **System Settings**: Configurable control centers for notifications, payment options, store information, and a danger zone for critical updates.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, Vite, React Router DOM v7, Zustand (State Management)
- **Styling & Icons**: Custom Vanilla CSS, React Icons
- **Typography**: `@fontsource` integration (Cinzel, Cormorant Garamond, Inter)
- **Database & Auth**: Supabase (PostgreSQL, Auth with email OTP, RLS, Storage Buckets)
- **Infrastructure**: Terraform CLI (Multi-workspace: Dev/Prod)
- **CI/CD & Automation**: GitHub Actions, Local deployment automation scripting (PowerShell)

---

## 📁 Repository Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # Unified CI/CD workflow (Terraform + DB Migrations)
├── openspec/                   # Design specifications and capability models
├── scripts/
│   └── deploy_local.ps1        # Helper script for local Terraform execution and DB push
├── supabase/
│   ├── config.toml             # Supabase CLI local configuration
│   ├── seed.sql                # Initial catalog, admin, and customer seed data
│   └── migrations/             # Version-controlled DB schemas & RLS policies
├── terraform/
│   ├── environments/           # Environment variables (dev.tfvars, prod.tfvars)
│   ├── modules/                # Custom reusable Terraform modules
│   ├── main.tf                 # Main Supabase project configuration
│   ├── variables.tf            # Input variables declarations
│   └── outputs.tf              # Provisioned resource outputs
└── web/
    ├── src/
    │   ├── account/            # Login, Signup, and OTP verification components
    │   ├── admin/              # Admin console routing and page views (Dashboard, Products, etc.)
    │   ├── components/         # Shared storefront UI (Header, Footer, Cart, Product, Shipping)
    │   ├── hooks/              # Zustand global store hooks
    │   ├── lib/                # Supabase client instantiation
    │   ├── services/           # Decoupled service layer APIs (auth, cart, order, product)
    │   └── App.jsx             # Main Router and layout entrypoint
    ├── package.json            # Web application configuration and dependencies
    └── vite.config.js          # Vite configuration
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Docker](https://www.docker.com/) (required to run Supabase locally)
- [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) (optional, for remote infrastructure management)

---

### 💾 1. Database & Backend Setup

You can run the backend either locally via Docker or connect to a remote Supabase instance.

#### Option A: Running a Local Supabase Instance (Recommended for Dev)
1. In the root directory, start the local Supabase environment (this runs the Supabase stack in Docker containers):
   ```bash
   npm run supabase:start
   ```
   *Note: This automatically initializes the local database, runs all migrations, and applies the seed catalog data.*

2. Inspect the local Supabase URLs and Keys using:
   ```bash
   npm run supabase:status
   ```
   Take note of the `API URL` and the `anon key` to configure the frontend.

3. If you make modifications to migrations, you can push them manually:
   ```bash
   npm run supabase:db:push
   ```

#### Option B: Deploying to a Remote Supabase Instance (using Terraform)
To provision/configure a remote Supabase project:
1. Initialize Terraform:
   ```bash
   cd terraform
   terraform init
   ```
2. Select your environment workspace (e.g., development):
   ```bash
   terraform workspace select anika-fashion-ecom-dev
   ```
3. Run the deployment script to provision resources and deploy migrations:
   ```bash
   ../scripts/deploy_local.ps1
   ```

---

### 💻 2. Web Frontend Setup

1. Navigate to the `web/` directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Duplicate the `.env.example` file and rename it to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase variables based on your database choice:
   ```env
   VITE_SUPABASE_URL="YOUR_SUPABASE_API_URL"
   VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
   VITE_ADMIN_CONSOLE_URL="http://localhost:5173"
   ```

4. Run the local development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` to see the storefront.

---

## 🔑 Test Credentials (Database Seeds)

The database seed script (`supabase/seed.sql`) automatically provisions test accounts with preset roles. Because the application utilizes **Passwordless Email OTP Authentication**, these accounts do not require passwords to log in. Instead, follow these steps to test:

1. Navigate to the login page: `http://localhost:5173/account/login`.
2. Input one of the email addresses below and click **Send OTP**.
3. Open the local email test catcher console (Inbucket) at `http://localhost:54324` in your browser.
4. Copy the 6-digit OTP code from the caught email and enter it on the verification page to log in.

### 👤 Customer Test Account
- **Email**: `customer@example.com`
- *Features to test*: Persistent cart, wishlist adding, shipping addresses configuration, profile editing.

### 🛡️ Admin Test Account
- **Email**: `admin@anika.com`
- *Features to test*: Accessing the `/admin` dashboard, adding products/categories, updating home page banners, and editing order statuses.


---

## 🛡️ Database & Security (RLS)

All database tables implement strict **Row Level Security (RLS)** to protect customer profiles, addresses, carts, and order details. 
- Customers can only read and write their own records (`auth.uid() = user_id`).
- Public reads are allowed for active `products` and `categories`.
- Administrative mutations (Insert/Update/Delete) for products, categories, and banners require verified administrative permissions (checked via the `public.admin_users` table).

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow under `.github/workflows/deploy.yml` triggers on push to the `dev` or `main` branches. It handles:
1. **Infrastructure Provisioning**: Selects the appropriate Terraform workspace (`anika-fashion-ecom-dev` or `anika-fashion-ecom-prod`) and applies modifications.
2. **Database Migrations Deployment**: Installs Supabase CLI and pushes the latest SQL migrations (`supabase/migrations/`) directly to the remote environment DB.

---

## 📈 Recent Updates (Version 2)
- **User Login/SignUp**: Fully integrated passwordless OTP flow.
- **Supabase Authentication**: Secure token-based session verification.
- **User Profile Updates**: Dynamic frontend updates for user info.
- **Address Management**: Full CRUD interface for multiple user shipping addresses.
- **Admin Page Integration**: Implemented complete Admin console suite under protected routes.
- **Admin Login with Supabase**: Role-based access validation for admin dashboard pages.
