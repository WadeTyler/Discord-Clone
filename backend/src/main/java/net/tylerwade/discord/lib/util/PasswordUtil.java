package net.tylerwade.discord.lib.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordUtil {

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Hash a password
    public static String hashPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }

    // Verify password matches
    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }
}
