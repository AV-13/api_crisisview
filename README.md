# Crisis View API

Backend for managing emergency incidents, technicians, and their interventions.

## Prerequisites

- **MySQL** (Tested on v8.4.8)
- **Node.js** (Tested on v20+)

## Installation

```bash
npm install
```

## Database Setup

1. Configure your MySQL connection in `db.js`.

1a. (optional) Create an mySQL instance with docker:
```bash
docker run --name mysql-crisiview -e MYSQL_ROOT_PASSWORD=root -p 3307:3306 -d mysql:8.4.8
```

2. run migrations:
```bash
node migration.js
```
3. (Optional) Seed the database with fake data:
```bash
node seed.js
```

4. (Optional) Run tests:
```bash
npm test
```

## Run Server

```bash
node server.js
```
The server runs on `http://localhost:3001` by default.

---

## Data Models

### Techniciens
- `id` (Primary Key)
- `name` (String)
- `firstname` (String)
- `email` (String)
- `phone` (String)

### Incidents
- `id` (Primary Key)
- `name` (String) - e.g., "Main Street Leak"
- `latitude` (Float)
- `longitude` (Float)

### Interventions
- `id` (Primary Key)
- `id_technicien` (Foreign Key -> Techniciens)
- `id_incident` (Foreign Key -> Incidents)

---

## API Documentation

### Techniciens (`/techniciens`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/techniciens` | Get all technicians |
| GET | `/techniciens/:id` | Get single technician |
| POST | `/techniciens` | Create technician |
| PUT | `/techniciens/:id` | Update technician |
| DELETE | `/techniciens/:id` | Delete technician |

**Example POST Payload:**
```json
{
  "name": "Dupont",
  "firstname": "Jean",
  "email": "jean.dupont@example.com",
  "phone": "0601020304"
}
```

### Incidents (`/incidents`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/incidents` | Get all incidents |
| GET | `/incidents/:id` | Get single incident |
| POST | `/incidents` | Create incident |
| PUT | `/incidents/:id` | Update incident |
| DELETE | `/incidents/:id` | Delete incident |

**Example POST Payload:**
```json
{
  "name": "Flooding at Central Park",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

### Interventions (`/interventions`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/interventions` | Get all interventions (includes Technicien and Incident details) |
| GET | `/interventions/:id` | Get single intervention |
| POST | `/interventions` | Assign a technician to an incident |
| PUT | `/interventions/:id` | Update assignment |
| DELETE | `/interventions/:id` | Remove assignment |

**Example POST Payload:**
```json
{
  "id_technicien": 1,
  "id_incident": 5
}
```