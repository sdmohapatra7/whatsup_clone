# Use Maven to build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application, skipping tests for speed
RUN mvn clean package -DskipTests

# Use a lean JRE image for the final run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Render will override this with the PORT env var)
EXPOSE 8082

# Start the application
ENTRYPOINT ["java", "-Dserver.port=${PORT:8082}", "-jar", "app.jar"]
