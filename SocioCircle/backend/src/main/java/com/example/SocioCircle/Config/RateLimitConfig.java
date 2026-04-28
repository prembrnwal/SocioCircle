package com.example.SocioCircle.Config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Configuration;
import java.time.Duration;

@Configuration
public class RateLimitConfig {
    
    public Bucket createNewBucket(int capacity, int minutes) {
        Refill refill = Refill.greedy(capacity, Duration.ofMinutes(minutes));
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder().addLimit(limit).build();
    }
}
