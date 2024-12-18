package net.tylerwade.discord.controllers;


import net.tylerwade.discord.lib.ErrorMessage;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.*;
import net.tylerwade.discord.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;

import java.util.Date;
import java.util.UUID;

@Controller
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private ServerRepository serverRepository;

    @Autowired
    private ServerJoinsRepository serverJoinsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @MessageMapping("/newMessage")
    @SendTo("/topic/newMessage")
    public ResponseEntity newMessage(Message messageRequest, @CookieValue("authToken") String authToken) {
        try {
            String userID = jwtUtil.getValue(authToken);

            // Check for message content
            if (messageRequest.getContent().isEmpty()) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Message content is required."), HttpStatus.BAD_REQUEST);
            }

            // Check for channelID
            if (messageRequest.getChannelID().isEmpty()) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Channel ID is required."), HttpStatus.BAD_REQUEST);
            }

            // Check channel exists
            Channel channel = channelRepository.findById(messageRequest.getChannelID()).get();
            if (channel == null) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Channel not found"), HttpStatus.NOT_FOUND);
            }

            // Check server exists
            Server server = serverRepository.findById(channel.getServerID()).get();
            if (server == null) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Server not found."), HttpStatus.NOT_FOUND);
            }

            // Check user in server
            ServerJoinPK serverJoinPK = new ServerJoinPK(server.getServerID(), userID);
            if (!serverJoinsRepository.existsById(serverJoinPK)) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("User not in server."), HttpStatus.UNAUTHORIZED);
            }

            String timestamp = new Date().toString();

            // Save message
            Message newMessage = new Message(userID, timestamp, messageRequest.getChannelID(), messageRequest.getContent());
            messageRepository.save(newMessage);

            // Send the message out
            return new ResponseEntity<Message>(newMessage, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in newMessage(): " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Interal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
