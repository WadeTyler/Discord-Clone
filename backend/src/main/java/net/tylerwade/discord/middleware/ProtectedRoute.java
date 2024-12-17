package net.tylerwade.discord.middleware;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.tylerwade.discord.lib.ErrorMessage;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.User;
import net.tylerwade.discord.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
public class ProtectedRoute implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Cookie[] cookies = request.getCookies();

        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            return true;
        }

        // Check for null or missing cookies
        if (cookies == null) {
            setUnauthorizedResponse(response, "You are not Logged in.");
            return false;
        }

        // Look for authToken cookie
        Cookie authTokenCookie = findCookie(cookies, "authToken");
        if (authTokenCookie == null) {
            setUnauthorizedResponse(response, "You are not Logged in.");
            return false;
        }

        String authToken = authTokenCookie.getValue();

        // Validate the JWT and extract user ID
        String userID = jwtUtil.getValue(authToken);
        if (userID == null || userID.isBlank()) {
            setUnauthorizedResponse(response, "Invalid authToken");
            return false;
        }

        // Fetch user from the database
        Optional<User> user = userRepository.findById(userID);
        if (user.isEmpty()) {
            setUnauthorizedResponse(response, "User not found");
            return false;
        }

        // Authorization successful
        return true;
    }

    /**
     * Helper method to find a specific cookie by name.
     */
    private Cookie findCookie(Cookie[] cookies, String name) {
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie;
            }
        }
        return null;
    }

    /**
     * Helper method to set unauthorized response.
     */
    private void setUnauthorizedResponse(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(new ObjectMapper().writeValueAsString(new ErrorMessage(message)));
    }
}
