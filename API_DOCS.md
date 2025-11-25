API Documentation

## Authentication
### Register
- **Endpoint:** `POST /api/auth/register`
- **Body:** `{ "name": "User", "email": "user@test.com", "password": "123" }`

### Login
- **Endpoint:** `POST /api/auth/login`
- **Body:** `{ "email": "user@test.com", "password": "123" }`
- **Response:** `{ "token": "jwt_token_here" }`

## Tasks (Headers: `x-auth-token: <token>`)
### Get All Tasks
- **Endpoint:** `GET /api/tasks`

### Create Task
- **Endpoint:** `POST /api/tasks`
- **Body:** `{ "title": "New Task", "dueDate": "2025-11-28" }`

### Update Task
- **Endpoint:** `PUT /api/tasks/:id`
- **Body:** `{ "status": "completed" }`

### Delete Task
- **Endpoint:** `DELETE /api/tasks/:id`