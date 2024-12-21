package net.tylerwade.discord.controllers;


import net.tylerwade.discord.lib.ErrorMessage;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.*;
import net.tylerwade.discord.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Controller
public class MessageController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

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

    // Send a new message over websocket
    @MessageMapping("/newMessage")
    public void newMessage(Message messageRequest) {
        String userID = null;
        try {
            userID = messageRequest.getSenderID();

            // Check real user
            User user = userRepository.findById(userID).get();
            if (user == null) {
                messagingTemplate.convertAndSend("/topic/error/" + userID, new ResponseEntity<ErrorMessage>(new ErrorMessage("User not found."), HttpStatus.NOT_FOUND));
                return;
            }

            // Check for message content
            if (messageRequest.getContent().isEmpty()) {
                messagingTemplate.convertAndSend("/topic/error/" + userID, new ResponseEntity<ErrorMessage>(new ErrorMessage("Message content is required."), HttpStatus.BAD_REQUEST));
                return;
            }

            // Check for channelID
            if (messageRequest.getChannelID().isEmpty()) {
                messagingTemplate.convertAndSend("/topic/error/" + userID, new ResponseEntity<ErrorMessage>(new ErrorMessage("Channel ID is required."), HttpStatus.BAD_REQUEST));
                return;
            }

            // Check channel exists
            Channel channel = channelRepository.findById(messageRequest.getChannelID()).get();
            if (channel == null) {
                messagingTemplate.convertAndSend("/topic/error/" + userID, new ResponseEntity<ErrorMessage>(new ErrorMessage("Channel not found."), HttpStatus.NOT_FOUND));
                return;
            }

            // Check server exists
            Server server = serverRepository.findById(channel.getServerID()).get();
            if (server == null) {
                messagingTemplate.convertAndSend("/topic/error/" + userID, new ResponseEntity<ErrorMessage>(new ErrorMessage("Server not found."), HttpStatus.NOT_FOUND));
                return;
            }

            // Check user in server
            ServerJoinPK serverJoinPK = new ServerJoinPK(server.getServerID(), userID);
            if (!serverJoinsRepository.existsById(serverJoinPK)) {
                messagingTemplate.convertAndSend("/topic/error/" + userID, new ResponseEntity<ErrorMessage>(new ErrorMessage("User not in server."), HttpStatus.UNAUTHORIZED));
                return;
            }

            // Get Current Timestamp
            String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());

            // Save message
            Message newMessage = new Message(userID, timestamp, channel.getChannelID(), messageRequest.getContent());
            messageRepository.save(newMessage);

            // Convert to FrontendMessage
            FrontendMessage frontendMessage = new FrontendMessage(userID, timestamp, channel.getChannelID(), messageRequest.getContent(), user.getUsername(), user.getAvatar());

            // Send the message out
            String topic = "/topic/newMessage/" + channel.getChannelID();
            messagingTemplate.convertAndSend(topic, new ResponseEntity<FrontendMessage>(frontendMessage, HttpStatus.OK));

        } catch (Exception e) {
            System.out.println("Exception in newMessage(): " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/error/" + userID, new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    // Get all messages in a channel over websocket
    @MessageMapping("/getMessages")
    public ResponseEntity getMessages(GetMessagesRequest getMessagesRequest) {
        try {
            // Check for channelID
            if (getMessagesRequest.getChannelID().isEmpty()) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Channel ID is required."), HttpStatus.BAD_REQUEST);
            }

            // Check for userID
            if (getMessagesRequest.getUserID().isEmpty()) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("User ID is required."), HttpStatus.BAD_REQUEST);
            }

            // Check user exists
            if (!userRepository.existsById(getMessagesRequest.getUserID())) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("User not found."), HttpStatus.NOT_FOUND);
            }

            // Check that channel exists
            Channel channel = channelRepository.findById(getMessagesRequest.getChannelID()).get();
            if (channel == null) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Channel not found."), HttpStatus.NOT_FOUND);
            }

            // Check that server exists
            Server server = serverRepository.findById(channel.getServerID()).get();
            if (server == null) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Server not found."), HttpStatus.NOT_FOUND);
            }

            // Check that user is in server
            ServerJoinPK serverJoinPK = new ServerJoinPK(server.getServerID(), getMessagesRequest.getUserID());
            if (!serverJoinsRepository.existsById(serverJoinPK)) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("User not in server."), HttpStatus.UNAUTHORIZED);
            }

            // Get all messages in channel
            List<Message> messages = messageRepository.findByChannelID(channel.getChannelID());

            List<FrontendMessage> frontendMessages = new ArrayList<>();

            // Convert each message to FrontendMessage
            for (Message message : messages) {
                User user = userRepository.findById(message.getSenderID()).get();
                FrontendMessage frontendMessage = new FrontendMessage(message.getSenderID(), message.getTimestamp(), message.getChannelID(), message.getContent(), user.getUsername(), user.getAvatar());
                frontendMessages.add(frontendMessage);
            }


            String topic = "/topic/getMessages/" + getMessagesRequest.getChannelID() + "/" + getMessagesRequest.getUserID();
            messagingTemplate.convertAndSend(topic, new ResponseEntity<List<FrontendMessage>>(frontendMessages, HttpStatus.OK));

            return new ResponseEntity(frontendMessages, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in getMessages(): " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}

class GetMessagesRequest {
    private String channelID;
    private String userID;


    public GetMessagesRequest(String channelID, String userID) {
        this.channelID = channelID;
        this.userID = userID;
    }

    public GetMessagesRequest() {
    }

    public String getChannelID() {
        return channelID;
    }

    public void setChannelID(String channelID) {
        this.channelID = channelID;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }
}

