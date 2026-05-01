# 🧾 JustBill Portal (JB-Portal)

**JB-Portal** is the **customer-facing Angular web application** for the JustBill eCommerce platform.  
It provides end users with a modern, responsive interface to browse products, place orders, manage billing, and track transactions.

This repository contains **only the frontend UI code** and integrates with the **JustBill Web API**.

---

## 🌐 Purpose

The purpose of **JB-Portal** is to serve as the **public-facing digital storefront** for the JustBill platform, enabling customers to interact with the system securely and intuitively.

---

## ✨ Key Features

- 🛍️ Product catalog & browsing
- 🧾 Order creation & checkout
- 💳 Payment processing (via backend APIs)
- 👤 Customer account management
- 📦 Order history & invoices
- 📱 Responsive Angular UI (desktop & mobile)

---

## 🏗 Architecture Overview

- **Frontend**: Angular SPA
- **Backend**: JB-API (external dependency)
- **Security**: Handled by backend APIs

---

## 🛠 Tech Stack

### Frontend
- Angular (LTS)
- TypeScript
- HTML5 / SCSS
- Angular Router
- REST API integration

---

## 🌍 Environments

JB-Portal supports multiple environments configured via Angular environment files:

| Environment | Purpose |
|-----------|--------|
| **DEV** | Development |
| **TEST** | QA / UAT |
| **DEMO** | Client demos |
| **PROD** | Production |
