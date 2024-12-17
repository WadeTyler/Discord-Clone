package net.tylerwade.discord.config;

import net.tylerwade.discord.middleware.ProtectedRoute;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private ProtectedRoute protectedRoute;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(protectedRoute)
                .addPathPatterns("/**") // Apply to specific endpoints
                .excludePathPatterns(
                        "/api/auth/login",
                        "/api/auth/signup"
                ); // Exclude specific endpoints
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}