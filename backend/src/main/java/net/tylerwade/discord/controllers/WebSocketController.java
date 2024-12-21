package net.tylerwade.discord.controllers;

import net.tylerwade.discord.DiscordApplication;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.Server;
import net.tylerwade.discord.models.User;
import net.tylerwade.discord.repositories.ServerJoinsRepository;
import net.tylerwade.discord.repositories.ServerRepository;
import net.tylerwade.discord.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;

import java.util.List;

@Controller
public class WebSocketController {


    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServerRepository serverRepository;

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

            // Output to all servers the user is in that the user is online
            List<Server> joinedServers = serverRepository.findAllJoinedServers(userID);
            for (Server server : joinedServers) {
                messagingTemplate.convertAndSend("/topic/servers/" + server.getServerID() + "/users/online", user);
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

            List<Server> joinedServers = serverRepository.findAllJoinedServers(userID);
            for (Server server : joinedServers) {
                messagingTemplate.convertAndSend("/topic/servers/" + server.getServerID() + "/users/offline", user);
            }
        } catch (Exception e) {
            System.out.println("Exception in onDisconnect(): " + e.getMessage());
        }
    }

}
