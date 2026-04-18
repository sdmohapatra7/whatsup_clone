# WhatsApp Clone

This project contains a full-stack WhatsApp clone with a React frontend and a Java Spring Boot backend.

## How to Run Locally

### 1. Frontend Setup
To run the React frontend:
1. Open a terminal and navigate to the `frontend` directory.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Backend Setup
To run the Spring Boot background server:
1. Open another terminal and navigate to the `server` directory.
2. Run the Spring Boot application using Maven:
   ```bash
   # On Windows:
   ./mvnw.cmd spring-boot:run
   
   # On Mac/Linux:
   ./mvnw spring-boot:run
   ```

*(Your backend is already securely connected to an external MongoDB Atlas cluster out-of-the-box, so that part will begin working right away!)*
