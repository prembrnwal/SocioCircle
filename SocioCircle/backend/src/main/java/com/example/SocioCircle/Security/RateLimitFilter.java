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

@lombok.extern.slf4j.Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    @Autowired
    private RateLimitService rateLimitService;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        Bucket globalBucket = rateLimitService.getBucket("global_" + extractClientIp(request), 200, 1);
        if (!globalBucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
                String clientIp = extractClientIp(request);

        if (pathMatcher.match("/api/auth/login", path)) {
            Bucket bucket = rateLimitService.getBucket("login_" + clientIp, 5, 1);
            if (!bucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
        } else if (pathMatcher.match("/api/auth/register", path)) {
            Bucket bucket = rateLimitService.getBucket("register_" + clientIp, 5, 60);
            if (!bucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
        } else if (pathMatcher.match("/api/auth/forgot-password", path)) {
            Bucket bucket = rateLimitService.getBucket("forgot_" + clientIp, 3, 60);
            if (!bucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
        } else if (pathMatcher.match("/api/users/upload-photo", path) || pathMatcher.match("/api/files/upload", path)) {
            Bucket bucket = rateLimitService.getBucket("upload_" + clientIp, 10, 1);
            if (!bucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
        } else if (pathMatcher.match("/api/search/**", path)) {
            Bucket bucket = rateLimitService.getBucket("search_" + clientIp, 30, 1);
            if (!bucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
        } else if (pathMatcher.match("/api/chat/send", path)) {
            String userId = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : clientIp;
            Bucket bucket = rateLimitService.getBucket("chat_" + userId, 60, 1);
            if (!bucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
        } else if (pathMatcher.match("/api/communities/create", path)) {
            String userId = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : clientIp;
            Bucket bucket = rateLimitService.getBucket("comm_" + userId, 5, 60);
            if (!bucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
        } else if (pathMatcher.match("/api/posts/*/comment", path)) {
            String userId = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : clientIp;
            Bucket bucket = rateLimitService.getBucket("comment_" + userId, 30, 1);
            if (!bucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
        } else if (pathMatcher.match("/api/posts/*/like", path)) {
            String userId = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : clientIp;
            Bucket bucket = rateLimitService.getBucket("like_" + userId, 30, 1);
            if (!bucket.tryConsume(1)) { log.warn("Rate limit exceeded for IP: {} on path: {}", extractClientIp(request), path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{"error": "Too many requests", "status": 429, "message": "Rate limit exceeded"}");
                return; }
        }
        filterChain.doFilter(request, response);
    }
}
    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
