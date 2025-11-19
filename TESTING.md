# Testing and Usage Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Test API Endpoints

#### List all available lenses
```bash
curl http://localhost:3000/lenses
```

Response:
```json
{
  "lenses": ["drug-interaction-lens", "pregnancy-lens"]
}
```

#### Get a specific lens
```bash
curl http://localhost:3000/lenses/pregnancy-lens
```

Response:
```json
{
  "resourceType": "Library",
  "id": "pregnancy-lens-001",
  "name": "pregnancy-lens",
  "title": "Pregnancy Lens",
  ...
  "content": [
    {
      "type": "text/cql",
      "data": "base64-encoded-content..."
    }
  ]
}
```

#### Health check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-11-19T10:30:45.123Z",
  "lensesLoaded": 2
}
```

## Testing with Different Lens Folders

### Set custom lenses folder
```bash
# Linux/Mac
export LENSES_FOLDER=/path/to/your/lenses
npm run dev

# Windows PowerShell
$env:LENSES_FOLDER="C:\path\to\your\lenses"
npm run dev
```

Or edit `.env`:
```
LENSES_FOLDER=C:\Users\amedrano\Documents\Gravitate-Health\lens-selector-file\lenses
PORT=3000
```

## Creating Custom Lens Files

Create a new JSON file in your lenses folder following this template:

```json
{
  "resourceType": "Library",
  "id": "your-lens-id",
  "name": "your-lens-name",
  "title": "Your Lens Title",
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/library-type",
        "code": "logic-library"
      }
    ]
  },
  "date": "2024-11-19T00:00:00Z",
  "publisher": "Your Organization",
  "description": "Description of your lens",
  "purpose": "Purpose of your lens",
  "usage": "How to use this lens",
  "copyright": "© 2024 Your Organization",
  "content": [
    {
      "type": "text/cql",
      "language": "text/cql",
      "title": "Your Logic",
      "data": "base64-encoded-content-here"
    }
  ],
  "meta": {
    "profile": [
      "https://build.fhir.org/ig/hl7-eu/gravitate-health/StructureDefinition/Lens"
    ]
  }
}
```

### Required Fields
- `resourceType`: Must be "Library"
- `id`: Unique identifier
- `name`: Used as the lens ID in API responses
- `status`: draft, active, retired, or unknown
- `type`: Should reference Library type coding
- `content`: Array containing base64-encoded data

### Base64 Encoding

To encode content as base64:

**JavaScript/Node.js:**
```javascript
const content = "Your CQL or logic content";
const encoded = Buffer.from(content).toString('base64');
console.log(encoded);
```

**Command line (Linux/Mac):**
```bash
echo "Your content" | base64
```

**Windows PowerShell:**
```powershell
$text = "Your content"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
$encoded = [Convert]::ToBase64String($bytes)
$encoded
```

## Docker Testing

### Build Image
```bash
docker build -t lens-selector:test .
```

### Run Container
```bash
# On Windows (PowerShell)
docker run -p 3000:3000 `
  -v ${PWD}/lenses:/app/lenses `
  lens-selector:test

# On Linux/Mac
docker run -p 3000:3000 \
  -v $(pwd)/lenses:/app/lenses \
  lens-selector:test
```

### Test from another terminal
```bash
curl http://localhost:3000/lenses
```

## Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f lens-selector

# Stop
docker-compose down
```

## Validation and Error Handling

### Lens Validation

The service validates each lens file for:
1. Valid JSON format
2. Correct resourceType (Library)
3. Required fields (name, id, content)
4. Valid status values
5. Base64-encoded content data

### Invalid Lens Example

If a lens file is invalid, it will be logged but won't block the service:

```bash
npm run dev
# Output:
# Lens file validation failed: invalid-lens.json
#   - Invalid resourceType: expected 'Library', got 'undefined'
#   - Missing or invalid name field (required)
```

### Error Responses

**Lens not found:**
```bash
curl http://localhost:3000/lenses/nonexistent
```

Response (404):
```json
{
  "error": "Lens 'nonexistent' not found",
  "statusCode": 404,
  "path": "/lenses/nonexistent",
  "timestamp": "2024-11-19T10:30:45.123Z"
}
```

**Invalid endpoint:**
```bash
curl http://localhost:3000/invalid
```

Response (404):
```json
{
  "error": "Not Found",
  "statusCode": 404,
  "path": "/invalid",
  "message": "The requested resource '/invalid' was not found"
}
```

## Performance Tips

1. **Large lens files**: The service supports base64-encoded content up to 50MB
2. **Many lenses**: Files are loaded once at startup. Add caching logic if needed
3. **Memory usage**: Base64 content increases memory. Monitor in production
4. **Concurrent requests**: Express handles multiple concurrent requests efficiently

## Debugging

### Enable debug logging
```bash
# Linux/Mac
DEBUG=* npm run dev

# Windows PowerShell
$env:DEBUG="*"
npm run dev
```

### Check loaded lenses
```bash
curl http://localhost:3000/health
```

This shows `lensesLoaded` count.

### View detailed error logs
The application logs:
- All HTTP requests (Morgan middleware)
- Lens discovery process
- Validation errors
- Server errors with stack traces

Check console output for detailed information.

## Integration Testing

### Using curl
```bash
# Test endpoint availability
curl -i http://localhost:3000/lenses

# Get specific lens with pretty JSON
curl http://localhost:3000/lenses/pregnancy-lens | jq

# Test with custom header
curl -H "Content-Type: application/json" http://localhost:3000/lenses
```

### Using Postman

1. Import the OpenAPI spec: `openapi.yaml`
2. Create environment variables:
   - `base_url`: http://localhost:3000
3. Test endpoints through Postman GUI

### Using Thunder Client (VS Code)

Create a test file `requests.rest`:
```http
### List all lenses
GET http://localhost:3000/lenses

### Get pregnancy lens
GET http://localhost:3000/lenses/pregnancy-lens

### Health check
GET http://localhost:3000/health
```

## Production Checklist

- [ ] All lens files are valid and follow FHIR Lens profile
- [ ] Content data is properly base64-encoded
- [ ] Environment variables are set correctly
- [ ] Docker image builds without errors
- [ ] Volume mounts are configured for lens folder
- [ ] Health check endpoint responds correctly
- [ ] Logs are monitored for errors
- [ ] Resource limits are set (memory, CPU)
- [ ] HTTPS/TLS is configured at reverse proxy
- [ ] API responses include appropriate caching headers
