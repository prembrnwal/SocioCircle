package com.example.SocioCircle.Service;

import com.example.SocioCircle.Config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Autowired
    private RateLimitConfig rateLimitConfig;

    public Bucket getBucket(String key, int capacity, int minutes) {
        return buckets.computeIfAbsent(key, k -> rateLimitConfig.createNewBucket(capacity, minutes));
    }
}
