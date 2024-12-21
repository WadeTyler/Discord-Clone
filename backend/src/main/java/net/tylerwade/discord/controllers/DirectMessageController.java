package net.tylerwade.discord.controllers;

import net.tylerwade.discord.models.DirectMessage;
import net.tylerwade.discord.models.Friend;
import net.tylerwade.discord.repositories.DirectMessageRepository;
import net.tylerwade.discord.repositories.FriendRepository;
import net.tylerwade.discord.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.text.SimpleDateFormat;
import java.util.Date;

@Controller
public class DirectMessageController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DirectMessageRepository directMessageRepository;

    @Autowired
    private FriendRepository friendRepository;

    // Send a direct message to a user
    @MessageMapping("/dm/new")
    public void sendDM(DirectMessage messageRequest) {
        String senderID = null;
        try {
            senderID = messageRequest.getSenderID();
            String receiverID = messageRequest.getReceiverID();
            String content = messageRequest.getContent();

            // Check for senderID, receiverID, and content
            if (senderID.isEmpty() || receiverID.isEmpty() || content.isEmpty()) {
                messagingTemplate.convertAndSend("/topic/error/" + senderID, "A target, message, or both were not provided.");
                return;
            }

            // Check if real users
            if (!userRepository.existsById(senderID) || !userRepository.existsById(receiverID)) {
                messagingTemplate.convertAndSend("/topic/error/" + senderID, "The sender or receiver does not exist.");
                return;
            }

            // Check if self
            if (senderID.equals(receiverID)) {
                messagingTemplate.convertAndSend("/topic/error/" + senderID, "You cannot send a message to yourself.");
                return;
            }

            // Check if friends
            Friend friend = friendRepository.findByFriend1AndFriend2AndAccepted(senderID, receiverID, true);
            if (friend == null) {
                messagingTemplate.convertAndSend("/topic/error/" + senderID, "You are not friends with the receiver.");
                return;
            }

            // Create the message
            // Get Current Timestamp
            String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
            messageRequest.setTimestamp(timestamp);
            messageRequest.setSeen(false);

            // Save the message
            directMessageRepository.save(messageRequest);


            // Send the message to the users
            messagingTemplate.convertAndSend("/topic/dm/new/" + senderID, messageRequest);
            messagingTemplate.convertAndSend("/topic/dm/new/" + receiverID, messageRequest);

        } catch (Exception e) {
            System.out.println("Exception in sendDM(): " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/error/" + senderID, "An error occurred while sending the message.");

        }
    }

}
