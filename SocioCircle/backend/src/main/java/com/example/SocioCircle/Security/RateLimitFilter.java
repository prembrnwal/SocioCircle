package com.example.SocioCircle.Security;

import com.example.SocioCircle.Service.RateLimitService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class RateLimitFilter extends OncePerRequestFilter {

    @Autowired
    private RateLimitService rateLimitService;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
                String path = request.getRequestURI();
        String clientIp = request.getRemoteAddr();

        if (pathMatcher.match("/api/auth/login", path)) {
            Bucket bucket = rateLimitService.getBucket("login_" + clientIp, 5, 1);
            if (!bucket.tryConsume(1)) { response.setStatus(429); return; }
        } else if (pathMatcher.match("/api/auth/register", path)) {
            Bucket bucket = rateLimitService.getBucket("register_" + clientIp, 5, 60);
            if (!bucket.tryConsume(1)) { response.setStatus(429); return; }
        } else if (pathMatcher.match("/api/auth/forgot-password", path)) {
            Bucket bucket = rateLimitService.getBucket("forgot_" + clientIp, 3, 60);
            if (!bucket.tryConsume(1)) { response.setStatus(429); return; }
        }
        else if (pathMatcher.match("/api/users/upload-photo", path) || pathMatcher.match("/api/files/upload", path)) {
            Bucket bucket = rateLimitService.getBucket("upload_" + clientIp, 10, 1);
            if (!bucket.tryConsume(1)) { response.setStatus(429); return; }
        } else if (pathMatcher.match("/api/search/**", path)) {
            Bucket bucket = rateLimitService.getBucket("search_" + clientIp, 30, 1);
            if (!bucket.tryConsume(1)) { response.setStatus(429); return; }
        }
        filterChain.doFilter(request, response);
    }
}
