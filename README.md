# Rent Management — Landlord Frontend

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Setup Guide](#setup-guide)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Build & Preview](#build--preview)
- [API Endpoints](#api-endpoints)
  - [Properties](#properties)
  - [Approvals & Payments (Chapa)](#approvals--payments-chapa)
  - [Reserve / Unreserve](#reserve--unreserve)
  - [Auth Callback](#auth-callback)
- [Micro-Frontend](#micro-frontend)
- [Logging & Error Handling](#logging--error-handling)
- [Security & CORS](#security--cors)
- [Planned: Gebeta Map](#planned-gebeta-map)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [License](#license)

## Introduction
The Landlord Frontend is a modern, production-ready single-page application for managing property listings, approvals, and payments within the Rent Management System. It integrates with the backend Property Listing Service and the Chapa Payment Gateway. The UI is built with React, TypeScript, Tailwind, and shadcn/ui with strong internationalization support.

## Features
- Create and manage property listings (with photos, amenities, details)
- Edit property (title, description, price, amenities)
- Approve & Pay: initiate approval and redirect to Chapa checkout (500 BIRR)
- Reserve / Unreserve property status
- View property details
- View metrics and landlord-only listings
- Multilingual UI (Amharic, English, Afan Oromo)
- Error boundary to prevent white screens in production

## Architecture
```mermaid
flowchart TD
  subgraph UI[UI Layer]
    Landlord[Landlord Page]
    Cards[Property Cards]
    Dialogs[Dialogs: Edit / Approve\nReserve/Unreserve]
    Details[Property Details]
  end

  subgraph Services[Service Layer]
    API[propertyService.ts]
  end

  subgraph Backend[Backend API]
    Submit[/POST /properties/submit/]
    List[/GET /properties/]
    ById[/GET /properties/{id}/]
    MyProps[/GET /properties/my-properties/]
    Metrics[/GET /properties/metrics/]
    ApprovePay[/PATCH /properties/{id}/approve-and-pay]
    Reserve[/PATCH /properties/{id}/reserve]
    Unreserve[/PATCH /properties/{id}/unreserve]
    Update[/PUT /properties/{id}]
    Delete[/DELETE /properties/{id}]
  end

  Landlord --> Cards
  Landlord --> Dialogs
  Landlord --> Details

  Cards -->|actions| API
  Dialogs -->|actions| API
  Details -->|load| API

  API --> Submit & List & ById & MyProps & Metrics & ApprovePay & Reserve & Unreserve & Update & Delete
```

## Technologies Used
- React 18, TypeScript, Vite
- TailwindCSS, shadcn/ui (Radix primitives)
- i18next + http-backend + language detector
- Sonner + shadcn toaster
- TanStack Query (QueryClientProvider is set up)

## Setup Guide

### Prerequisites
- Node.js 18+ and npm

### Environment Variables
Create a `.env` file in the project root (never commit it). See `.env.example`.

```
VITE_API_BASE_URL="https://property-listing-service.onrender.com/api/v1/properties"
```

### Installation
```
npm install
```

### Running the Application
```
npm run dev
```
- Dev server starts (e.g., http://localhost:5173 or assigned port).

### Build & Preview
```
npm run build
npm run preview
```

## API Endpoints
This frontend calls the Property Listing Service and related endpoints.

### Properties
- POST `/api/v1/properties/submit` — submit listing (FormData; photos supported)
- GET `/api/v1/properties/` — public list (filters supported)
- GET `/api/v1/properties/{id}` — details
- GET `/api/v1/properties/my-properties` — landlord’s listings
- GET `/api/v1/properties/metrics` — basic metrics
- PUT `/api/v1/properties/{id}` — update listing (title, description, price, amenities)
- DELETE `/api/v1/properties/{id}` — delete listing (returns 204)

### Approvals & Payments (Chapa)
- PATCH `/api/v1/properties/{id}/approve-and-pay` — returns `checkout_url`; UI redirects to Chapa

### Reserve / Unreserve
- PATCH `/api/v1/properties/{id}/reserve` — mark reserved (body: `{ reserved: true }`)
- PATCH `/api/v1/properties/{id}/unreserve` — remove reserved status

### Auth Callback
- GET `/auth/callback?token=...` — stored to `localStorage` as `authToken` client-side, used for Authorization headers

## Micro-Frontend
This repository is designed to be embedded as a micro-frontend (route-level mount or MF/iframe integration) providing the landlord feature set.

## Logging & Error Handling
- ErrorBoundary wraps the application to avoid blank screens and show a friendly fallback.
- Non-blocking toast notifications for most errors; CORS/network errors are suppressed to avoid noise.

## Security & CORS
- Authorization: Bearer token read from `localStorage` as `authToken` (or `access_token` fallback).
- GET requests avoid setting `Content-Type` to minimize preflight CORS.
- 401 responses clear tokens and can redirect to login.

## Planned: Gebeta Map
The UI is map-ready. Gebeta Map integration will display property geolocation (using `lat/lon` fields) on details and list views.

## Contributing
We welcome issues and PRs! Please:
- Open a descriptive issue
- Keep PRs focused and small
- Include screenshots/screencasts for UI changes

Standard workflow:
```
fork → feature branch → commit → open PR → review → merge
```

## Maintainers
- NEHAMIYA — UI Developer
- DAGMAI TEFERI — UI updates and integrations
  - Email: dagiteferi2011@gmail.com
  - WhatsApp: +251920362324
- ABENEZER — Developer

## License
Open source. See repository for license or open an issue if missing.
