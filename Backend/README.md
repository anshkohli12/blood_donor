# Blood Donor Backend API

This is the backend API for the Blood Donor application using MongoDB Atlas.

## Setup

1. **Environment Variables**: The `.env` file contains your MongoDB connection string
2. **Dependencies**: MongoDB driver, Express, CORS, and dotenv are installed
3. **Database**: Connected to MongoDB Atlas cluster "donorverse"

## Available Endpoints

### Health Check
- **GET** `/health` - Check API and database health

### Donors
- **GET** `/api/donors` - Get all donors (with pagination)
- **GET** `/api/donors/:id` - Get donor by ID
- **POST** `/api/donors` - Create new donor
- **PUT** `/api/donors/:id` - Update donor
- **DELETE** `/api/donors/:id` - Delete donor
- **GET** `/api/donors/blood-type/:bloodType` - Get donors by blood type

## Running the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## Example API Calls

### Create a Donor
```bash
curl -X POST http://localhost:5000/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "bloodType": "O+",
    "age": 25,
    "address": "123 Main St, City, State",
    "availability": true
  }'
```

### Get All Donors
```bash
curl http://localhost:5000/api/donors
```

### Get Donors by Blood Type
```bash
curl http://localhost:5000/api/donors/blood-type/O+
```

## Database Collections

The MongoDB database will automatically create collections as you add data:
- `donors` - Donor information
- Additional collections can be added for requests, events, blood banks, etc.

## Next Steps

1. **Add Authentication**: Implement JWT-based authentication
2. **Add More Models**: Create models for blood requests, events, blood banks
3. **Add Validation**: Implement input validation and sanitization
4. **Add Testing**: Write unit and integration tests
5. **Add Documentation**: Use tools like Swagger for API documentation