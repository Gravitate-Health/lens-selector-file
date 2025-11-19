# Gravitate Health Lens Selector

This module implements the Gravitate Health Focusing Service API (Lens selector) for discovering and retrieving FHIR Lens profiles from a filesystem folder.

## Overview

The Lens Selector is a service that:
- Scans a configurable folder for FHIR Lens profile JSON files on each request (live reload)
- Validates lenses against the FHIR Lens profile specification
- Provides REST API endpoints to list and retrieve individual lenses
- Returns lenses in JSON format with base64-encoded content
- Designed to work as part of the Lens SDK with live, changing lens files

## Features

- Automatic lens discovery on each request (live reload)
- FHIR Lens profile validation
- RESTful API endpoints
- Environment-based configuration
- Docker containerization
- Request logging and error handling
- Designed for the Lens SDK with dynamic lens file updates

## Installation

```bash
npm install
```

## Configuration

Set the following environment variables:

- `LENSES_FOLDER`: Path to the folder containing lens JSON files (default: `./lenses`)
- `PORT`: API server port (default: `3000`)
- `NODE_ENV`: Environment mode (default: `development`)

Example `.env` file:
```
LENSES_FOLDER=/app/lenses
PORT=3000
NODE_ENV=production
```

## Running Locally

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### GET /lenses
Returns a list of all available lens IDs.

Response:
```json
{
  "lenses": ["pregnancy-lens", "drug-interaction-lens"]
}
```

### GET /lenses/{name}
Returns the complete lens definition including content.

Response:
```json
{
  "resourceType": "Library",
  "id": "588",
  "name": "pregnancy-lens",
  "title": "pregnancy-lens",
  "status": "draft",
  "content": [...],
  ...
}
```

## Docker

Build the image:
```bash
docker build -t lens-selector-file:latest .
```

Run the container:
```bash
docker run -p 3000:3000 -v /path/to/lenses:/app/lenses lens-selector-file:latest
```

## Lens Profile Requirements

Valid lenses must:
1. Be valid JSON files
2. Conform to the FHIR Lens profile extension of Library resource type
3. Include a `resourceType` of "Library"
4. Include a `name` field (used as the lens ID)
5. Include a `content` array with base64-encoded data

## Project Structure

```
├── src/
│   ├── index.js              # Application entry point
│   ├── config.js             # Configuration management
│   ├── server.js             # Express server setup
│   ├── services/
│   │   └── lensService.js    # Lens discovery and validation
│   ├── routes/
│   │   └── lenses.js         # API endpoint handlers
│   └── middleware/
│       └── errorHandler.js   # Error handling middleware
├── lenses/                   # Sample lens files
├── Dockerfile               # Docker configuration
├── .dockerignore             # Files to exclude from Docker image
├── .env.example              # Example environment configuration
├── package.json             # Node.js dependencies
└── README.md                # This file
```
