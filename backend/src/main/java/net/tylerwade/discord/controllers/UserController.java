package net.tylerwade.discord.controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import net.tylerwade.discord.lib.SuccessMessage;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.lib.ErrorMessage;
import net.tylerwade.discord.lib.util.PasswordUtil;
import net.tylerwade.discord.models.SignUpRequest;
import net.tylerwade.discord.models.User;
import net.tylerwade.discord.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping(path="/api/auth")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Sign up and add to database
    @PostMapping(path="/signup")
    public @ResponseBody ResponseEntity signUp(@RequestBody SignUpRequest signupRequest, HttpServletResponse response) {

        // Check password length
        if (signupRequest.getPassword().length() < 6) {
            return new ResponseEntity(new ErrorMessage("Password must be at least 6 characters long."), HttpStatus.BAD_REQUEST);
        }

        // Check passwords match
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            return new ResponseEntity(new ErrorMessage("Passwords do not Match."), HttpStatus.BAD_REQUEST);
        }

        // Check email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return new ResponseEntity(new ErrorMessage("Email already taken."), HttpStatus.BAD_REQUEST);
        }

        // Generate userID
        String userID = UUID.randomUUID().toString();

        // Generate tag
        String tag = generateTag();

        // Encrypt Password
        String encryptedPassword = PasswordUtil.hashPassword(signupRequest.getPassword());

        // Create new user object
        User newUser = new User(userID, signupRequest.getUsername(), tag, signupRequest.getEmail(), encryptedPassword);

        // Add authToken cookie
        response.addCookie(getAuthCookie(userID));

        // Save to DB
        userRepository.save(newUser);

        // Remove password
        newUser.setPassword(null);

        return new ResponseEntity<>(newUser, HttpStatus.OK);
    }

    // Sign the user in
    @PostMapping(path="/login")
    public @ResponseBody ResponseEntity login(@RequestBody User loginAttempt, HttpServletResponse response) {
        try {
            // Check for email and password
            if (loginAttempt.getEmail().isEmpty() || loginAttempt.getPassword().isEmpty())
                return new ResponseEntity(new ErrorMessage("Email and Password are both required."), HttpStatus.BAD_REQUEST);

            // Check email exists
            if (!userRepository.existsByEmail(loginAttempt.getEmail()))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Email or Password Incorrect."), HttpStatus.BAD_REQUEST);

            // Check password matches
            String hashedPassword = userRepository.findByEmail(loginAttempt.getEmail()).get().getPassword();
            if (!PasswordUtil.verifyPassword(loginAttempt.getPassword(), hashedPassword))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Email or Password Incorrect."), HttpStatus.BAD_REQUEST);


            User user = userRepository.findByEmail(loginAttempt.getEmail()).get();

            // Add authToken
            response.addCookie(getAuthCookie(user.getUserID()));

            // Remove Password
            user.setPassword(null);

            return new ResponseEntity<User>(user, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("Exception in login: " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get user data from authToken
    @GetMapping(path="/me")
    public @ResponseBody ResponseEntity getMe(@CookieValue("authToken") String authToken) {
        if (authToken.isEmpty() || authToken.isBlank()) {
            return new ResponseEntity(new ErrorMessage("No authToken provided. Please sign in."), HttpStatus.BAD_REQUEST);
        }

        String userID = jwtUtil.getValue(authToken);

        if (userID.isEmpty()) {
            return new ResponseEntity(new ErrorMessage("Invalid userID"), HttpStatus.BAD_REQUEST);
        }

        Optional<User> user = userRepository.findById(userID);

        if (user.isEmpty()) {
            return new ResponseEntity(new ErrorMessage("User not found."), HttpStatus.NOT_FOUND);
        }

        user.get().setPassword(null);

        return new ResponseEntity(user.get(), HttpStatus.OK);
    }

    // Logout
    @PostMapping(path="/logout")
    public @ResponseBody ResponseEntity logout(@CookieValue("authToken") String authToken, HttpServletResponse response) {
        try {
            System.out.println(authToken);

            if (authToken.isEmpty() || authToken.isBlank()) return new ResponseEntity(new ErrorMessage("User not signed in."), HttpStatus.BAD_REQUEST);

            // Remove authToken cookie
            response.addCookie(getLogoutCookie());

            return new ResponseEntity(new SuccessMessage("Logout Successful."), HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in logout: " + e.getMessage());
            return new ResponseEntity(new ErrorMessage("Internal Server Error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all Users (REMOVE ONCE DONE)
    @GetMapping(path="/all")
    public @ResponseBody Iterable<User> getAllUsers() {

        Iterable<User> users = userRepository.findAll();
        for (User user : users) {
            user.setPassword(null);
        }

        return users;
    }


    // ---------------- UTIL

    // Generate a unique 4 digit tag
    private String generateTag() {
        String tag = "";

        while (userRepository.existsByTag(tag) || tag.length() != 4) {
            for (int i = 0; i < 4; i++) {
                tag += (int)(Math.random() * 10);
            }
        }
        return tag;
    }

    // Get authToken Cookie
    private Cookie getAuthCookie(String userID) {
        String authToken = jwtUtil.generateToken(userID);
        Cookie cookie = new Cookie("authToken", authToken);
        cookie.setMaxAge(604800);   // 7 days
        cookie.setHttpOnly(true);
        cookie.setSecure(false);       // set to true for production
        cookie.setPath("/");

        return cookie;
    }

    private Cookie getLogoutCookie() {
        Cookie cookie = new Cookie("authToken", "");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);    // set to true for production
        cookie.setPath("/");

        return cookie;
    }
}
