FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

# Download dependencies first to leverage Docker layer caching
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src src
RUN mvn -B -DskipTests package \
    && BOOT_JAR=$(ls target/*.jar | grep -v original | head -n 1) \
    && mv "$BOOT_JAR" target/app.jar \
    && rm -f target/original-*.jar

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app


COPY --from=builder /workspace/target/app.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
