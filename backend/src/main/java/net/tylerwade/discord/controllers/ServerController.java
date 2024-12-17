package net.tylerwade.discord.controllers;

import net.tylerwade.discord.lib.ErrorMessage;
import net.tylerwade.discord.lib.SuccessMessage;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.Channel;
import net.tylerwade.discord.models.Server;
import net.tylerwade.discord.models.ServerJoin;
import net.tylerwade.discord.models.ServerJoinPK;
import net.tylerwade.discord.repositories.ChannelRepository;
import net.tylerwade.discord.repositories.ServerJoinsRepository;
import net.tylerwade.discord.repositories.ServerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping(path="/api/servers")
public class ServerController {


    @Autowired
    private ServerRepository serverRepository;

    @Autowired
    private ServerJoinsRepository serverJoinsRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Create a server given the user's serverName and authToken
    @PostMapping(path="/create")
    public ResponseEntity createServer(@RequestBody Server serverRequest, @CookieValue("authToken") String authToken) {
        try {

            // Check for Server Name
            if (serverRequest.getServerName().isEmpty()) {
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("A server name is required."), HttpStatus.BAD_REQUEST);
            }

            String serverID = UUID.randomUUID().toString();
            String serverOwner = jwtUtil.getValue(authToken);
            String serverName = serverRequest.getServerName();
            String serverIcon = "";

            // Save Server to DB
            Server newServer = new Server(serverID, serverName, serverOwner, serverIcon);
            serverRepository.save(newServer);

            return new ResponseEntity<Server>(newServer, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in createServer(): " + e.getMessage());
            return new ResponseEntity(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete a server given the serverID
    @DeleteMapping(path="/delete/{serverID}")
    public ResponseEntity deleteServer(@PathVariable String serverID, @CookieValue("authToken") String authToken) {
        try {
            // Check for serverID
            if (serverID.isEmpty())
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("A serverID is required."), HttpStatus.BAD_REQUEST);

            // Check if server exists
            if (!serverRepository.existsById(serverID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Server not found."), HttpStatus.NOT_FOUND);

            // Check if user is serverOwner
            Server server = serverRepository.findById(serverID).get();

            if (!server.getServerOwner().equals(jwtUtil.getValue(authToken)))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("You are not the owner of this server."), HttpStatus.UNAUTHORIZED);

            // Delete Server
            serverRepository.deleteById(serverID);

            return new ResponseEntity<SuccessMessage>(new SuccessMessage("Server Successfully deleted."), HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in deleteServer(): " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // Join a Server
    @PostMapping(path="/{serverID}/join")
    public ResponseEntity joinServer(@PathVariable String serverID, @CookieValue("authToken") String authToken) {
        try {
            String userID = jwtUtil.getValue(authToken);

            // Check server exists
            if (!serverRepository.existsById(serverID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Server not found."), HttpStatus.NOT_FOUND);

            // Check if already in server
            List<ServerJoin> sj = serverJoinsRepository.findByServerIDAndUserID(serverID, userID);
            if (!sj.isEmpty())
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("You're already in that server."), HttpStatus.BAD_REQUEST);

            // Join server
            ServerJoin serverJoin = new ServerJoin(serverID, userID);
            serverJoinsRepository.save(serverJoin);

            return new ResponseEntity<ServerJoinPK>(serverJoin.getId(), HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in joinServer(): " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // Leave a Server
    @DeleteMapping(path="/{serverID}/leave")
    public ResponseEntity leaveServer(@PathVariable String serverID, @CookieValue("authToken") String authToken) {
        try {

            String userID = jwtUtil.getValue(authToken);

            // Check server exists
            if (!serverRepository.existsById(serverID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Server not found."), HttpStatus.BAD_REQUEST);

            // Check in that server
            if (serverJoinsRepository.findByServerIDAndUserID(serverID, userID).isEmpty())
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("You are not in that server."), HttpStatus.BAD_REQUEST);

            // Delete serverJoin
            serverJoinsRepository.deleteByServerIDAndUserID(serverID, userID);

            return new ResponseEntity<SuccessMessage>(new SuccessMessage("Server left."), HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("Exception in leaveServer(): " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get joined Servers
    @GetMapping(path="/joined")
    public ResponseEntity getJoinedServers(@CookieValue("authToken") String authToken) {
        try {
            String userID = jwtUtil.getValue(authToken);

            List<Server> joinedServers = serverRepository.findAllJoinedServers(userID);
            System.out.println(joinedServers);
            return new ResponseEntity<List<Server>>(joinedServers, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in getJoinedServers(): " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create a channel in the specified server
    @PostMapping(path="/{serverID}/channels/create")
    public ResponseEntity createChannel(@PathVariable String serverID, @RequestBody Channel channelRequest, @CookieValue("authToken") String authToken) {
        try {
            String userID = jwtUtil.getValue(authToken);

            // Check if server exists
            if (!serverRepository.existsById(serverID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Server not found."), HttpStatus.NOT_FOUND);

            // Check if user is in server
            if (serverJoinsRepository.findByServerIDAndUserID(serverID, userID).isEmpty())
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("You are not in that server."), HttpStatus.UNAUTHORIZED);

            // Check if user owns the server
            Server server = serverRepository.findById(serverID).get();
            if (!server.getServerOwner().equals(userID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("You do not have permissions to edit this server."), HttpStatus.UNAUTHORIZED);

            // Check for channel name
            if (channelRequest.getChannelName().isEmpty())
                return new ResponseEntity(new ErrorMessage("A channel name is required."), HttpStatus.BAD_REQUEST);

            // Check for channel type
            if (channelRequest.getType().isEmpty())
                return new ResponseEntity(new ErrorMessage("A channel type is required."), HttpStatus.BAD_REQUEST);

            // Check is valid
            if (!channelRequest.getType().equals("voice") && !channelRequest.getType().equals("text"))
                return new ResponseEntity(new ErrorMessage("Invalid channel type. Must be 'text' or 'voice'"), HttpStatus.BAD_REQUEST);

            List<Channel> channels = channelRepository.findByServerID(serverID);

            // Check if name already exists
            for (Channel channel : channels) {
                if (channel.getChannelName().equals(channelRequest.getChannelName()) && channel.getType().equals(channelRequest.getType())) {
                    return new ResponseEntity<ErrorMessage>(new ErrorMessage("Channel name already exists."), HttpStatus.BAD_REQUEST);
                }
            }

            // Get channel order

            int channelOrder = channels.size() + 1;
            String channelID = UUID.randomUUID().toString();
            String channelDescription = channelRequest.getChannelDescription();
            String type = channelRequest.getType();
            String channelName = channelRequest.getChannelName();

            // Save channel
            Channel newChannel = new Channel(channelID, channelName, serverID, channelDescription, channelOrder, type);
            channelRepository.save(newChannel);

            return new ResponseEntity<Channel>(newChannel, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in createChannel(): " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete a channel in the specified server
    @DeleteMapping(path="/{serverID}/channels/{channelID}/delete")
    public ResponseEntity deleteChannel(@PathVariable String serverID, @PathVariable String channelID, @CookieValue("authToken") String authToken) {
        try {

            String userID = jwtUtil.getValue(authToken);

            // Check if server exists
            if (!serverRepository.existsById(serverID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Server not found."), HttpStatus.NOT_FOUND);

            // Check if channel exists
            if (!channelRepository.existsById(channelID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Channel not found."), HttpStatus.NOT_FOUND);

            // Check if channel is inside that server
            Channel channel = channelRepository.findById(channelID).get();

            if (!channel.getServerID().equals(serverID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Channel not found in that server."), HttpStatus.NOT_FOUND);

            // Check if the user is the owner of the server
            Server server = serverRepository.findById(serverID).get();
            if (!server.getServerOwner().equals(userID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("You do not have permissions to edit this server."), HttpStatus.UNAUTHORIZED);

            // Delete Channel
            channelRepository.deleteById(channelID);

            return new ResponseEntity<SuccessMessage>(new SuccessMessage("Channel deleted."), HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in deleteChannel(): " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get channels in a server
    @GetMapping(path="/{serverID}/channels")
    public ResponseEntity getChannelsInServer(@PathVariable String serverID) {
        try {
            // Check if real serverID
            if (!serverRepository.existsById(serverID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Server not found."), HttpStatus.NOT_FOUND);

            // Check for channels
            List<Channel> channels = channelRepository.findByServerID(serverID);

            return new ResponseEntity<List<Channel>>(channels, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in getChannelsInServer(): " + e.getMessage());
            return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
