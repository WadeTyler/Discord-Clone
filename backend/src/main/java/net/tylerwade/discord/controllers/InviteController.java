package net.tylerwade.discord.controllers;

import net.tylerwade.discord.lib.ErrorMessage;
import net.tylerwade.discord.lib.util.DateTimeUtil;
import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.Invite;
import net.tylerwade.discord.models.Server;
import net.tylerwade.discord.repositories.InviteRepository;
import net.tylerwade.discord.repositories.ServerRepository;
import net.tylerwade.discord.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

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
    private JwtUtil jwtUtil;

    @PostMapping(path = "/create")
    private ResponseEntity<?> createInvite(@RequestBody Invite request, @CookieValue("authToken") String authToken) {
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

    private String generateInviteID() {
        int randomSize = (int) (Math.random() * 10) + 1;

        String inviteID = "";
        for (int i = 0; i < randomSize; i++) {
            inviteID += (int) (Math.random() * 10);
        }

        if (inviteRepository.existsById(inviteID)) {
            return generateInviteID();
        }

        return inviteID;

    }
}
