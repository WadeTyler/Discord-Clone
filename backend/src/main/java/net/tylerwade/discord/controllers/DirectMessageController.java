package net.tylerwade.discord.controllers;

import net.tylerwade.discord.lib.util.DateTimeUtil;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.FrontendMessage;
import net.tylerwade.discord.models.User;
import net.tylerwade.discord.models.directmessages.DirectMessage;
import net.tylerwade.discord.models.directmessages.DirectMessageChannel;
import net.tylerwade.discord.models.directmessages.DirectMessageJunction;
import net.tylerwade.discord.models.directmessages.FrontendDirectMessage;
import net.tylerwade.discord.repositories.UserRepository;
import net.tylerwade.discord.repositories.directmessages.DMChannelsRepository;
import net.tylerwade.discord.repositories.directmessages.DMJunctionsRepository;
import net.tylerwade.discord.repositories.directmessages.DMRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
public class DirectMessageController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DMChannelsRepository dmChannelsRepository;

    @Autowired
    private DMJunctionsRepository dmJunctionsRepository;

    @Autowired
    private DMRepository dmRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /// -------------------- Direct Message Channels -------------------- ///

    // Create a new DM Channel
    @MessageMapping("/dm/channels/create")
    public void getDMChannels(CreateDMChannelRequest request) {
        try {

            // Check for userIDs
            if (request.getUser1().isEmpty() || request.getUser2().isEmpty())
                throw new Exception("Invalid request");


            // Make sure user1 Exists
            if (!userRepository.existsById(request.getUser1())) {
                throw new Exception("User does not exist.");
            }

            // Make sure user2 Exists
            if (!userRepository.existsById(request.getUser2())) {
                throw new Exception("User does not exist.");
            }

            // Create the DM channel
            String dmChannelID = UUID.randomUUID().toString();
            String timestamp = DateTimeUtil.getCurrentTimeStampString();
            String avatar = null;
            String channelName = null;

            DirectMessageChannel dmChannel = new DirectMessageChannel(dmChannelID, avatar, timestamp, channelName, timestamp);
            dmChannelsRepository.save(dmChannel);

            // Create the DM Junctions
            DirectMessageJunction junction1 = new DirectMessageJunction(dmChannelID, request.getUser1());
            DirectMessageJunction junction2 = new DirectMessageJunction(dmChannelID, request.getUser2());
            dmJunctionsRepository.save(junction1);
            dmJunctionsRepository.save(junction2);

            // Send the channel to the user
            messagingTemplate.convertAndSend("/topic/dm/channels/new/" + request.getUser1(), dmChannel);
            messagingTemplate.convertAndSend("/topic/dm/channels/new/" + request.getUser2(), dmChannel);

        } catch (Exception e) {
            System.out.println("Exception while creating DM channel: " + e.getMessage());
            String output = e.getMessage() != null ? e.getMessage() : "Error while creating DM channel";
            messagingTemplate.convertAndSend("/topic/errors/" + request.getUser1(), output);
        }
    }

    // Get all joined dm channels
    @MessageMapping("/dm/channels")
    public void getDMChannels(String userID) {
        try {
            // Make sure user Exists
            if (!userRepository.existsById(userID)) {
                throw new Exception("User does not exist.");
            }

            // Get all DM channels
            List<DirectMessageChannel> channels = dmChannelsRepository.findAllByUserID(userID);

            // Dynamically determine the channel name based on the other users in the channel
            for (DirectMessageChannel channel : channels) {
                // Get all junctions in the channel
                List<DirectMessageJunction> junctions = dmJunctionsRepository.findByDMChannelID(channel.getDmChannelID());
                String channelName = "";
                // For each junction, add the other user's username to the channel name
                for (DirectMessageJunction junction : junctions) {
                    if (!junction.getUserID().equals(userID)) {
                        User user = userRepository.findById(junction.getUserID()).get();
                        channelName += user.getUsername();
                        // Add comma if more than 1 other user and not the last user
                        if (junctions.size() > 2 && junction != junctions.get(junctions.size() - 1)) {
                            channelName += ", ";
                        }
                    }
                }
                channel.setChannelName(channelName);
            }

            // Dynamically get the channel avatar if there is only 2 users in the channel
            for (DirectMessageChannel channel : channels) {
                // Get all junctions in the channel
                List<DirectMessageJunction> junctions = dmJunctionsRepository.findByDMChannelID(channel.getDmChannelID());

                // For each junction, if there is only 2 users add the OTHER user's avatar as the channel avatar
                if (junctions.size() == 2) {
                    for (DirectMessageJunction junction : junctions) {
                        if (!junction.getUserID().equals(userID)) {
                            User user = userRepository.findById(junction.getUserID()).get();
                            channel.setAvatar(user.getAvatar());
                        }
                    }
                }
            }


            // Send the channels to the user
            messagingTemplate.convertAndSend("/topic/dm/channels/" + userID, channels);
        } catch (Exception e) {
            System.out.println("Exception while getting DM channels: " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/errors/" + userID, e.getMessage() != null ? e.getMessage() : "Error while getting DM channels");
        }
    }

    // Leave a DM Channel
    @MessageMapping("/dm/channels/leave")
    public void leaveDMChannel(String dmChannelID, String userID) {
        try {
            // Make sure user exists

        } catch (Exception e) {
            System.out.println("Exception while leaving DM channel: " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/errors/" + userID, e.getMessage() != null ? e.getMessage() : "Error while leaving DM channel");
        }
    }


    /// -------------------- Direct Messages -------------------- ///

    // Get all messages in a specified DM Channel
    @MessageMapping("/dm/messages")
    public void getMessages(GetDMSRequest request) {
        String userID = request.getUserID();
        String dmChannelID = request.getDmChannelID();

        try {
            // Make sure user exists
            if (!userRepository.existsById(userID))
                throw new Exception("User does not exist.");

            // Make sure DM Channel exists
            if (!dmChannelsRepository.existsById(dmChannelID))
                throw new Exception("DM Channel does not exist.");

            // Make sure user is in the DM Channel
            if (dmJunctionsRepository.findByDMChannelIDAndUserID(dmChannelID, userID).isEmpty())
                throw new Exception("User is not in the DM Channel.");

            // Get all messages in the DM Channel
            List<FrontendDirectMessage> messages = dmRepository.findByDMChannelID(dmChannelID);

            // Send the messages to the user
            messagingTemplate.convertAndSend("/topic/dm/messages/" + dmChannelID + "/" + userID, messages);

        } catch (Exception e) {
            System.out.println("Exception while getting DM messages: " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/errors/" + userID, e.getMessage() != null ? e.getMessage() : "Error while getting DM messages");
        }
    }

    @MessageMapping("/dm/messages/send")
    public void sendDM(DirectMessage dmRequest) {
        try {
            // Check user exists
            if (!userRepository.existsById(dmRequest.getSenderID()))
                throw new Exception("User does not exist.");

            // Check DM Channel exists
            if (!dmChannelsRepository.existsById(dmRequest.getDmChannelID()))
                throw new Exception("DM Channel does not exist.");

            // Check user is in the DM Channel
            if (dmJunctionsRepository.findByDMChannelIDAndUserID(dmRequest.getDmChannelID(), dmRequest.getSenderID()).isEmpty())
                throw new Exception("User is not in the DM Channel.");

            // Add timestamp
            String timestamp = DateTimeUtil.getCurrentTimeStampString();
            dmRequest.setTimestamp(timestamp);

            // Save the message
            dmRepository.save(dmRequest);

            // Update the DM Channel's last message timestamp
            DirectMessageChannel dmChannel = dmChannelsRepository.findById(dmRequest.getDmChannelID()).get();
            dmChannel.setLastModified(timestamp);

            // Save the DM Channel
            dmChannelsRepository.save(dmChannel);

            // Convert the message to a FrontendDirectMessage
            User sender = userRepository.findById(dmRequest.getSenderID()).get();
            FrontendDirectMessage frontendDirectMessage = new FrontendDirectMessage(dmRequest.getDmID(), dmRequest.getDmChannelID(), dmRequest.getSenderID(), sender.getUsername(), sender.getAvatar(), dmRequest.getTimestamp(), dmRequest.getContent());


            // Send the message to the users in the channel
            messagingTemplate.convertAndSend("/topic/dm/messages/new/" + dmRequest.getDmChannelID(), frontendDirectMessage);
            messagingTemplate.convertAndSend("/topic/dm/messages/new/inside/" + dmRequest.getDmChannelID(), frontendDirectMessage);

        } catch (Exception e) {
            System.out.println("Exception while sending DM: " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/errors/" + dmRequest.getSenderID(), e.getMessage() != null ? e.getMessage() : "Error while sending DM");
        }
    }

}



/// -------------------- UTIL Classes -------------------- ///

class CreateDMChannelRequest {
    // user1 is the user who is creating the channel
    private String user1;
    private String user2;

    public CreateDMChannelRequest(String user1, String user2) {
        this.user1 = user1;
        this.user2 = user2;
    }

    public CreateDMChannelRequest() {}

    public String getUser1() {
        return user1;
    }

    public void setUser1(String user1) {
        this.user1 = user1;
    }

    public String getUser2() {
        return user2;
    }

    public void setUser2(String user2) {
        this.user2 = user2;
    }
}

class GetDMSRequest {
    private String dmChannelID;
    private String userID;

    public GetDMSRequest() {}

    public GetDMSRequest(String dmChannelID, String userID) {
        this.dmChannelID = dmChannelID;
        this.userID = userID;
    }

    public String getDmChannelID() {
        return dmChannelID;
    }

    public void setDmChannelID(String dmChannelID) {
        this.dmChannelID = dmChannelID;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }
}