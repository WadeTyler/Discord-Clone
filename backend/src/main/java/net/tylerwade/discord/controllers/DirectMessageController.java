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

import javax.swing.text.html.Option;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    public void createDmChannel(CreateDMChannelRequest request) {
        try {

            // Check for userIDs
            if (request.getUser1().isEmpty() || request.getUser2().isEmpty())
                throw new Exception("Invalid request. user1 and user2 required.");

            // Make sure user1 Exists
            if (!userRepository.existsById(request.getUser1())) {
                throw new Exception("User1 does not exist.");
            }

            // Make sure user2 Exists
            if (!userRepository.existsById(request.getUser2())) {
                throw new Exception("User2 does not exist.");
            }

            // Check if a DM channel already exists between the two users
            DirectMessageChannel existingDMChannel = findOneToOneDMChannel(request.getUser1(), request.getUser2());
            if (existingDMChannel != null) {

                // Set the channel name
                existingDMChannel.setChannelName(getDMChannelName(existingDMChannel, request.getUser1()));
                // Set the channel avatar
                existingDMChannel.setAvatar(getChannelAvatar(existingDMChannel, request.getUser1()));


                // Update the user's junction to 'show'
                DirectMessageJunction junction = dmJunctionsRepository.findByDMChannelIDAndUserID(existingDMChannel.getDmChannelID(), request.getUser1()).get();

                junction.setShow(true);
                dmJunctionsRepository.save(junction);

                FrontendDMChannel existingFrontendDMChannel = new FrontendDMChannel(existingDMChannel, true);

                messagingTemplate.convertAndSend("/topic/dm/channels/unhide/" + request.getUser1(), existingDMChannel.getDmChannelID());

                // Send the channel to the user
                messagingTemplate.convertAndSend("/topic/dm/channels/set/" + request.getUser1(), existingFrontendDMChannel);
                return;
            }

            // Create the DM channel
            String dmChannelID = UUID.randomUUID().toString();
            String timestamp = DateTimeUtil.getCurrentTimeStampString();
            String avatar = null;
            String channelName = null;

            DirectMessageChannel dmChannel = new DirectMessageChannel(dmChannelID, avatar, timestamp, channelName, timestamp);
            dmChannelsRepository.save(dmChannel);

            // Create the DM Junctions
            DirectMessageJunction junction1 = new DirectMessageJunction(dmChannelID, request.getUser1(), true);
            DirectMessageJunction junction2 = new DirectMessageJunction(dmChannelID, request.getUser2(), true);
            dmJunctionsRepository.save(junction1);
            dmJunctionsRepository.save(junction2);

            // Set the channel name
            dmChannel.setChannelName(getDMChannelName(dmChannel, request.getUser1()));
            // Set the channel avatar
            dmChannel.setAvatar(getChannelAvatar(dmChannel, request.getUser1()));

            // Send the channel to the user
            messagingTemplate.convertAndSend("/topic/dm/channels/new/" + request.getUser1(), dmChannel);
            messagingTemplate.convertAndSend("/topic/dm/channels/set/" + request.getUser1(), dmChannel);
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
            // Dynamically get the channel avatar if there is only 2 users in the channel
            for (DirectMessageChannel channel : channels) {
                // Get all junctions in the channel
                channel.setChannelName(getDMChannelName(channel, userID));
                channel.setAvatar(getChannelAvatar(channel, userID));
            }

            ArrayList<FrontendDMChannel> frontendDMChannels = new ArrayList<>();

            for (DirectMessageChannel channel : channels) {

                Optional<DirectMessageJunction> junctionOptional = dmJunctionsRepository.findByDMChannelIDAndUserID(channel.getDmChannelID(), userID);

                if (junctionOptional.isPresent()) {
                    DirectMessageJunction junction = junctionOptional.get();

                    FrontendDMChannel frontendDMChannel = new FrontendDMChannel(channel.getDmChannelID(), channel.getAvatar(), channel.getCreatedAt(), channel.getChannelName(), channel.getLastModified(), junction.isShow());
                    frontendDMChannels.add(frontendDMChannel);
                }



            }

            // Send the channels to the user
            messagingTemplate.convertAndSend("/topic/dm/channels/" + userID, frontendDMChannels);
        } catch (Exception e) {
            System.out.println("Exception while getting DM channels: " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/errors/" + userID, e.getMessage() != null ? e.getMessage() : "Error while getting DM channels");
        }
    }

    // Hide a DM channel
    @MessageMapping("/dm/channels/hide")
    public void hideDMChannel(HideDMChannelRequest request) {
        try {
            // Check for userID
            if (request.getUserID().isEmpty()) {
                messagingTemplate.convertAndSend("/topic/errors/" + request.getUserID(), "No userID provided.");
                return;
            }

            // Check for dmChannelID
            if (request.getDmChannelID().isEmpty()) {
                messagingTemplate.convertAndSend("/topic/errors/" + request.getUserID(), "No dmChannelID provided.");
                return;
            }

            // Check for junction with userID and dmChannelID
            Optional<DirectMessageJunction> junctionOptional = dmJunctionsRepository.findByDMChannelIDAndUserID(request.getDmChannelID(), request.getUserID());

            // Check for junction with userID and dmChannelID
            if (junctionOptional.isEmpty()) {
                messagingTemplate.convertAndSend("/topic/errors/" + request.getUserID(), "Invalid Request.");
                return;
            }

            DirectMessageJunction junction = junctionOptional.get();

            // Update show to false
            junction.setShow(false);

            // Save to db
            dmJunctionsRepository.save(junction);

            // Send back to user the dmChannelID to update it in the frontend.
            messagingTemplate.convertAndSend("/topic/dm/channels/hide/" + request.getUserID(), request.getDmChannelID());

        } catch (Exception e) {
            System.out.println("Exception in hideDMChannel(): " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/errors/" + request.getUserID(), "Internal Server Error");
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

            // Update all junctions in the channel to set show to true
            List<DirectMessageJunction> junctions = dmJunctionsRepository.findByDMChannelID(dmChannel.getDmChannelID());
            for (DirectMessageJunction junction : junctions) {
                // If the junction is set to hide, update to true and output to that user's websocket route to update
                if (!junction.isShow()) {
                    // Set True
                    junction.setShow(true);
                    // Save to DB
                    dmJunctionsRepository.save(junction);

                    // Tell client to unhide
                    messagingTemplate.convertAndSend("/topic/dm/channels/unhide/" + junction.getUserID(), dmChannel.getDmChannelID());
                }
            }

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



    /// -------------------- UTIL -------------------- ///

    // Pass through user1 and user2, check if a private DM channel already exists between the two users
    private DirectMessageChannel findOneToOneDMChannel(String user1, String user2) {

        // User1 junctions
        List<DirectMessageJunction> user1_junctions = dmJunctionsRepository.findByUserID(user1);

        // User2 junctions
        List<DirectMessageJunction> user2_junctions = dmJunctionsRepository.findByUserID(user2);

        // Check if a channel exists between the two users
        for (DirectMessageJunction user1_junction : user1_junctions) {
            for (DirectMessageJunction user2_junction : user2_junctions) {
                if (user1_junction.getDmChannelID().equals(user2_junction.getDmChannelID())) {
                    // Check if the channel only has those 2 users
                    // All junctions in the channel
                    List<DirectMessageJunction> channel_junctions = dmJunctionsRepository.findByDMChannelID(user1_junction.getDmChannelID());

                    // If only those 2, return the channel, otherwise continue
                    if (channel_junctions.size() == 2) {
                        return dmChannelsRepository.findById(user1_junction.getDmChannelID()).get();
                    }
                }
            }
        }
        // No channel exists between the two users
        return null;
    }

    // Determine the channel name based on the other users in the channel
    private String getDMChannelName(DirectMessageChannel channel, String userID) {

        if (channel.getChannelName() != null)
            return channel.getChannelName();

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

        return channelName;
    }

    // Determine the channel avatar based on the other users in the channel
    private String getChannelAvatar(DirectMessageChannel channel, String userID) {

        if (channel.getChannelName() != null) {
            return channel.getAvatar();
        }

        // Get all junctions in the channel
        List<DirectMessageJunction> junctions = dmJunctionsRepository.findByDMChannelID(channel.getDmChannelID());

        // For each junction, if there is only 2 users add the OTHER user's avatar as the channel avatar
        if (junctions.size() == 2) {
            for (DirectMessageJunction junction : junctions) {
                if (!junction.getUserID().equals(userID)) {
                    User user = userRepository.findById(junction.getUserID()).get();
                    return user.getAvatar();
                }
            }
        }

        // Otherwise return empty avatar
        return null;

    }
}

/// -------------------- UTIL Classes -------------------- ///

class CreateDMChannelRequest {
    // user1 is the user who is creating the channel
    private String user1;
    // user2 is the user who the channel is being created with
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

class FrontendDMChannel extends DirectMessageChannel {
    private boolean show;

    public FrontendDMChannel(String dmChannelID, String avatar, String createdAt, String channelName, String lastModified, boolean show) {
        super(dmChannelID, avatar, createdAt, channelName, lastModified);
        this.show = show;
    }

    public FrontendDMChannel(DirectMessageChannel dmChannel, boolean show) {
        super(dmChannel.getDmChannelID(), dmChannel.getAvatar(), dmChannel.getCreatedAt(), dmChannel.getChannelName(), dmChannel.getLastModified());
        this.show = show;
    }

    public FrontendDMChannel(boolean show) {
        this.show = show;
    }

    public boolean isShow() {
        return show;
    }

    public void setShow(boolean show) {
        this.show = show;
    }
}

class HideDMChannelRequest {
    private String dmChannelID;
    private String userID;

    public HideDMChannelRequest(String dmChannelID, String userID) {
        this.dmChannelID = dmChannelID;
        this.userID = userID;
    }

    public HideDMChannelRequest() {
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