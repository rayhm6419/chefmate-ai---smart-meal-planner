FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

# Download dependencies first to leverage Docker layer caching
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ENV PORT=8080

COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
