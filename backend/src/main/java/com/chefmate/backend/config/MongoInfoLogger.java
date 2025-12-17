package com.chefmate.backend.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class MongoInfoLogger implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(MongoInfoLogger.class);

    private final MongoClient mongoClient;
    private final Environment environment;

    public MongoInfoLogger(MongoClient mongoClient, Environment environment) {
        this.mongoClient = mongoClient;
        this.environment = environment;
    }

    @Override
    public void afterPropertiesSet() {
        String dbName = environment.getProperty("spring.data.mongodb.database", "unknown");
        try {
            MongoDatabase db = mongoClient.getDatabase(dbName);
            String host = mongoClient.getClusterDescription().getShortDescription();
            log.info("MongoDB connected: database={}, host={}", db.getName(), host);
        } catch (Exception e) {
            log.warn("MongoDB connection check failed for database={}: {}", dbName, e.getMessage());
        }
    }
}
