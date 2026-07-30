package com.foody.tracking;

import com.foody.tracking.security.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class FoodyTrackingApplication {

    public static void main(String[] args) {
        ensureSqliteDirectory();
        SpringApplication.run(FoodyTrackingApplication.class, args);
    }

    private static void ensureSqliteDirectory() {
        Path dataDir = Paths.get("data");
        try {
            Files.createDirectories(dataDir);
        } catch (Exception ignored) {
            // fallback handled by application startup errors
        }
    }
}
