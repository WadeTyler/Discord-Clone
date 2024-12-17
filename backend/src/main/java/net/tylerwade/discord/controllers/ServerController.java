package net.tylerwade.discord.controllers;

import net.tylerwade.discord.lib.ErrorMessage;
import net.tylerwade.discord.lib.SuccessMessage;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.Server;
import net.tylerwade.discord.models.ServerJoin;
import net.tylerwade.discord.models.ServerJoinPK;
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
}
