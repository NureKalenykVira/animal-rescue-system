# Animal Rescue System — Frontend

Frontend client application for the Animal Rescue System.
This repository contains only the client-side implementation. The backend API is external and maintained separately.

---

## Tech Stack

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![Angular Router](https://img.shields.io/badge/Angular%20Router-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Google Maps API](https://img.shields.io/badge/Google%20Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## About the Frontend

This frontend application provides the user interface for reporting, tracking, and managing animal rescue cases.

It is responsible for:
- collecting animal rescue reports from users
- displaying rescue case details and status
- providing role-based UI for volunteers and veterinarians
- integrating interactive maps for location selection

All business logic and data persistence are handled by an external backend API.

---

## Functional Overview

Public users:
- reporting a found or injured animal
- providing location and description details
- tracking report status

Authorized users (volunteers / veterinarians):
- viewing and processing rescue reports
- updating animal condition and status
- managing assigned cases

Administrators:
- managing users and roles
- moderating reports
- overseeing system activity

---

## Application Architecture

The frontend is implemented as an Angular single-page application with:
- modular component structure
- service-based API communication
- reactive forms and validation
- centralized routing configuration

API communication is handled via HTTP services and environment-based configuration.

---

## Getting Started (Development)

Prerequisites:
- Node.js and npm
- Angular CLI

Install dependencies:

    npm install

Run development server:

    ng serve

The application will be available at:
http://localhost:4200

---

## Environment Configuration

The frontend uses environment configuration to define the backend API base URL and external service keys.

Typical configuration includes:
- API base URL
- Google Maps API key

Values are loaded from Angular environment files.

---

## Project Status

The frontend application is functionally implemented and integrated with an external backend API.
