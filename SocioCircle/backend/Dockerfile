# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace/app

# Copy necessary files for build
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies first to cache them
RUN ./mvnw dependency:go-offline -B

# Copy the rest of the source code and build
COPY src src
RUN ./mvnw clean package -DskipTests

# Production stage
FROM eclipse-temurin:21-jre-alpine

# Set non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create volume for temporary files and uploads
VOLUME /tmp
VOLUME /app/uploads

# Set working directory
WORKDIR /app

# Copy the built jar file
COPY --from=build /workspace/app/target/*.jar app.jar

# Change ownership to non-root user
RUN chown -R spring:spring /app

# Switch to non-root user
USER spring:spring

# Expose backend port
EXPOSE 9090

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:9090/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
