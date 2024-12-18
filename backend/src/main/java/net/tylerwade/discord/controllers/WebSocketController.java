package net.tylerwade.discord.controllers;

import net.tylerwade.discord.DiscordApplication;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.User;
import net.tylerwade.discord.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;

@Controller
public class WebSocketController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Set the user to online
    @MessageMapping("/onConnect")
    public void onConnect(String userID) {
        try {
            User user = userRepository.findById(userID).get();
            if (user == null) throw new Exception("Invalid userID");

            // Change status
            user.setStatus("Online");

            // Save user to the repository
            userRepository.save(user);

            // Add user to the connectUsers list
            DiscordApplication.connectedUsers.put(userID, user);

            // Print out the connected users
            System.out.println("Connected Users After Connect:");
            for (User u : DiscordApplication.connectedUsers.values()) {
                System.out.println(u.getUsername());
            }
        } catch (Exception e) {
            System.out.println("Exception in onConnect(): " + e.getMessage());
        }
    }

    @MessageMapping("/onDisconnect")
    public void onDisconnect(String userID) {
        try {
            User user = userRepository.findById(userID).get();
            if (user == null) throw new Exception("Invalid userID");

            // Change status
            user.setStatus("Offline");

            // Save user to the repository
            userRepository.save(user);

            // Add user to the connectUsers list
            DiscordApplication.connectedUsers.remove(userID);

            // Print out the connected users
            System.out.println("Connected Users After Disconnect:");
            for (User u : DiscordApplication.connectedUsers.values()) {
                System.out.println(u.getUsername());
            }
        } catch (Exception e) {
            System.out.println("Exception in onDisconnect(): " + e.getMessage());
        }
    }

}
