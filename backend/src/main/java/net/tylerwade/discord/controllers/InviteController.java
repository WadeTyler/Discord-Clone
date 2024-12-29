package net.tylerwade.discord.controllers;

import net.tylerwade.discord.lib.ErrorMessage;
import net.tylerwade.discord.lib.Responses;
import net.tylerwade.discord.lib.util.DateTimeUtil;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.Invite;
import net.tylerwade.discord.models.Server;
import net.tylerwade.discord.repositories.InviteRepository;
import net.tylerwade.discord.repositories.ServerJoinsRepository;
import net.tylerwade.discord.repositories.ServerRepository;
import net.tylerwade.discord.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Optional;

@Controller
@RequestMapping(path = "/api/invites")
public class InviteController {

    @Autowired
    private InviteRepository inviteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServerRepository serverRepository;

    @Autowired
    private ServerJoinsRepository serverJoinsRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping(path = "/create")
    public ResponseEntity<?> createInvite(@RequestBody Invite request, @CookieValue("authToken") String authToken) {
        try {

            String userID = jwtUtil.getValue(authToken);

            // Check for serverID
            if (request.getServerID().isEmpty())
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("serverID is required."), HttpStatus.BAD_REQUEST);

            // Check for creatorID
            if (userID.isEmpty())
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("authToken is required."), HttpStatus.BAD_REQUEST);

            // Check if server exists
            if (!serverRepository.existsById(request.getServerID()))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("Server does not exist."), HttpStatus.BAD_REQUEST);

            // Check if user exists
            if (!userRepository.existsById(userID))
                return new ResponseEntity<ErrorMessage>(new ErrorMessage("User does not exist."), HttpStatus.BAD_REQUEST);

            // Create and save new invite
            String inviteID = generateInviteID();
            String expires_at = DateTimeUtil.getTimestampIn7Days();
            Invite invite = new Invite(inviteID, expires_at, request.getServerID(), userID);

            inviteRepository.save(invite);

            // Return response
            return new ResponseEntity<Invite>(invite, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in InviteController.createInvite(): " + e.getMessage());
            return new ResponseEntity<>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(path = "/{inviteID}/info")
    public ResponseEntity<?> getInviteInfo(@PathVariable String inviteID) {
        try {

            String invalidOrExpired = "InviteID is invalid or has expired.";

            // Check for invite ID
            if (inviteID.isEmpty())
                return Responses.badRequest("InviteID is required.");

            Optional<Invite> inviteOptional = inviteRepository.findById(inviteID);

            // Check if exists
            if (inviteOptional.isEmpty())
                return Responses.badRequest(invalidOrExpired);

            Invite invite = inviteOptional.get();

            Date currentDate = new Date();
            Date expiresAt = DateTimeUtil.convertStringToDate(invite.getExpires_at());

            // Check if expired
            boolean expired = expiresAt.before(currentDate);

            Optional<Server> serverOptional = serverRepository.findById(invite.getServerID());

            // Check if server exists
            if (serverOptional.isEmpty())
                return Responses.notFound("Server not found.");

            // Create Server Info
            Server server = serverOptional.get();

            int serverSize = serverJoinsRepository.findByServerID(server.getServerID()).size();

            InviteInfo inviteInfo = new InviteInfo(server.getServerID(), server.getServerName(), server.getServerIcon(), serverSize, expired);

            // Return Invite Info
            return new ResponseEntity<InviteInfo>(inviteInfo, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Exception in getInviteInfo(): " + e.getMessage());
            return Responses.internalServerError();
        }
    }

    /// --------------- UTIL --------------- ///

    private String generateInviteID() {
        int randomSize = (int) (Math.random() * 25) + 5;

        String inviteID = "";
        for (int i = 0; i < randomSize; i++) {
            inviteID += (char) ((int) (Math.random() * 26) + 97);
        }

        if (inviteRepository.existsById(inviteID)) {
            return generateInviteID();
        }

        return inviteID;

    }
}

/// --------------- UTIL CLASSES --------------- ///
class InviteInfo {
    private String serverID;
    private String serverName;
    private String serverIcon;
    private int serverSize;
    private boolean expired;

    public InviteInfo() {
    }

    public InviteInfo(String serverID, String serverName, String serverIcon, int serverSize, boolean expired) {
        this.serverID = serverID;
        this.serverName = serverName;
        this.serverIcon = serverIcon;
        this.serverSize = serverSize;
        this.expired = expired;
    }

    public String getServerID() {
        return serverID;
    }

    public void setServerID(String serverID) {
        this.serverID = serverID;
    }

    public String getServerName() {
        return serverName;
    }

    public void setServerName(String serverName) {
        this.serverName = serverName;
    }

    public String getServerIcon() {
        return serverIcon;
    }

    public void setServerIcon(String serverIcon) {
        this.serverIcon = serverIcon;
    }

    public int getServerSize() {
        return serverSize;
    }

    public void setServerSize(int serverSize) {
        this.serverSize = serverSize;
    }

    public boolean isExpired() {
        return expired;
    }

    public void setExpired(boolean expired) {
        this.expired = expired;
    }
}