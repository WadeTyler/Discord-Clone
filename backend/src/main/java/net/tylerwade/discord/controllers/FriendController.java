package net.tylerwade.discord.controllers;

import net.tylerwade.discord.lib.util.JwtUtil;
import net.tylerwade.discord.models.Friend;
import net.tylerwade.discord.models.FrontendFriend;
import net.tylerwade.discord.models.User;
import net.tylerwade.discord.repositories.FriendRepository;
import net.tylerwade.discord.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller
public class FriendController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private FriendRepository friendRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /// ---------------- Friend Requests ---------------- ///

    // Get Existing Friend requests
    @MessageMapping("/friends/requests")
    public void getFriendRequests(String userID) {
        try {
            // Check for userID
            User user = userRepository.findById(userID).get();
            if (user == null) {
                messagingTemplate.convertAndSend("/topic/error/" + userID, "User not found.");
                return;
            }

            // Get friend requests
            Iterable<Friend> friendRequests = friendRepository.findByFriend2AndAccepted(userID, false);

            // Convert to frontend format
            List<FrontendFriend> friendRequestList = new ArrayList<>();
            for (Friend friendRequest : friendRequests) {
                User friendRequestUser = userRepository.findById(friendRequest.getFriend1()).get();
                if (friendRequestUser != null) {
                    friendRequestList.add(new FrontendFriend(friendRequestUser.getUserID(), friendRequestUser.getUsername(), friendRequestUser.getTag(), friendRequestUser.getAvatar(), friendRequestUser.getStatus()));
                }
            }

            // Send the friend request list
            messagingTemplate.convertAndSend("/topic/friends/requests/" + userID, friendRequestList);

        } catch (Exception e) {
            System.out.println("Exception in getFriendRequests(): " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/error/" + userID, "An error occurred.");
        }
    }

    // Send a friend request
    @MessageMapping("/friends/requests/send")
    public void sendFriendRequest(Friend friendRequest) {
        try {
            // Check for friend1 and friend2
            if (friendRequest.getFriend1().isEmpty() || friendRequest.getFriend2().isEmpty()) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend1(), "Friend1 and Friend2 are required.");
                return;
            }

            // Get the user
            User user = userRepository.findById(friendRequest.getFriend1()).get();
            if (user == null) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend1(), "You are not authenticated to send a friend request.");
                return;
            }

            // friend2 should be in the format of username#tag, so it must be parsed to get the userID
            String[] friend2Split = friendRequest.getFriend2().split("#");
            if (!friendRequest.getFriend2().contains("#") || friend2Split.length != 2) {
                System.out.println("Sending error");
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend1(), "Invalid username#tag format.");
                return;
            }

            String username = friend2Split[0];
            String tag = friend2Split[1];
            if (tag.length() != 4) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend1(), "Invalid username#tag format.");
                return;
            }

            User friend2 = userRepository.findByUsernameAndTag(username, tag);
            if (friend2 == null) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend1(), "User not found.");
                return;
            }

            System.out.println("Friend1: " + user.getUserID());
            System.out.println("Friend2: " + friend2.getUserID());


            // Check if user is trying to friend themselves
            if (friendRequest.getFriend1().equals(friend2.getUserID())) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend1(), "You cannot friend yourself.");
                return;
            }

            // Check if user is already friends
            Friend existingFriendRequest = friendRepository.findByFriend1AndFriend2(user.getUserID(), friend2.getUserID());

            if (existingFriendRequest != null && existingFriendRequest.isAccepted()) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend1(), "You are already friends with that user.");
                return;
            }

            // Check if request already exists
            if (existingFriendRequest != null && !existingFriendRequest.isAccepted()) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend1(), "Friend request already exists with that user.");
                return;
            }

            // Save the friend request
            friendRequest.setAccepted(false);
            friendRequest.setFriend2(friend2.getUserID());
            friendRepository.save(friendRequest);

            FrontendFriend frontendFriend1 = new FrontendFriend(user.getUserID(), user.getUsername(), user.getTag(), user.getAvatar(), user.getStatus());

            // Send the friend request to the user
            messagingTemplate.convertAndSend("/topic/friends/requests/new/" + friend2.getUserID(), frontendFriend1);

            // Send success message
            messagingTemplate.convertAndSend("/topic/success/" + friendRequest.getFriend1(), "Friend request sent.");
        } catch (Exception e) {
            System.out.println("Exception in sendFriendRequest(): " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend1(), "An error occurred.");
        }
    }

    // Accept a friend request
    @MessageMapping("/friends/requests/accept")
    public void acceptFriendRequest(Friend friendRequest) {
        try {
            // Check for friend1 and friend2
            if (friendRequest.getFriend1().isEmpty() || friendRequest.getFriend2().isEmpty()) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "Friend1 and Friend2 are required.");
                return;
            }

            User friend1 = userRepository.findById(friendRequest.getFriend1()).get();
            if (friend1 == null) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "User not found.");
                return;
            }

            User friend2 = userRepository.findById(friendRequest.getFriend2()).get();
            if (friend2 == null) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "User not found.");
                return;
            }

            // Check if request exists
            Friend existingFriendRequest = friendRepository.findByFriend1AndFriend2(friendRequest.getFriend1(), friendRequest.getFriend2());
            if (existingFriendRequest == null) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "Friend request not found.");
                return;
            }

            // Check if request is already accepted
            if (existingFriendRequest.isAccepted()) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "Friend request already accepted.");
                return;
            }

            // Accept the friend request
            existingFriendRequest.setAccepted(true);
            friendRepository.save(existingFriendRequest);

            // Send success message
            messagingTemplate.convertAndSend("/topic/friends/requests/accept/" + friendRequest.getFriend2(), "Friend request accepted.");
            messagingTemplate.convertAndSend("/topic/friends/requests/accept/" + friendRequest.getFriend1(), friend2.getUsername() + " accepted your friend request.");
        } catch (Exception e) {
            System.out.println("Exception in acceptFriendRequest(): " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "An error occurred.");
        }
    }

    // Deny a friend request
    @MessageMapping("/friends/requests/decline")
    public void declineFriendRequest(Friend friendRequest) {
        try {

            // Check for friend1 and friend2
            if (friendRequest.getFriend1().isEmpty() || friendRequest.getFriend2().isEmpty()) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "Friend1 and Friend2 are required.");
                return;
            }

            // Check if request exists
            Friend existingFriendRequest = friendRepository.findByFriend1AndFriend2(friendRequest.getFriend1(), friendRequest.getFriend2());
            if (existingFriendRequest == null) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "Friend request not found.");
                return;
            }

            // Check if request is already accepted
            if (existingFriendRequest.isAccepted()) {
                messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "Friend request already accepted.");
                return;
            }

            // Delete the friend request
            friendRepository.delete(existingFriendRequest);

            // Send success message
            messagingTemplate.convertAndSend("/topic/friends/requests/decline/" + friendRequest.getFriend2(), "Friend request declined.");

        } catch (Exception e) {
            System.out.println("Exception in declineFriendRequest(): " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/error/" + friendRequest.getFriend2(), "An error occurred.");
        }
    }

    /// ---------------- Friends ---------------- ///

    // Get Existing Friends
    @MessageMapping("/friends")
    public void getFriends(String userID) {
        try {
            User user = userRepository.findById(userID).get();
            if (user == null) {
                messagingTemplate.convertAndSend("/topic/error/" + userID, "User not found.");
                return;
            }

            Iterable<Friend> friends = friendRepository.findByFriend1OrFriend2AndAccepted(userID, true);

            // Convert to frontend format
            List<FrontendFriend> friendList = new ArrayList<>();
            for (Friend friend : friends) {
                User friendUser = userRepository.findById(friend.getFriend1().equals(userID) ? friend.getFriend2() : friend.getFriend1()).get();
                if (friendUser != null) {
                    friendList.add(new FrontendFriend(friendUser.getUserID(), friendUser.getUsername(), friendUser.getTag(), friendUser.getAvatar(), friendUser.getStatus()));
                }
            }

            // Send the friend list
            messagingTemplate.convertAndSend("/topic/friends/" + userID, friendList);
        } catch (Exception e) {
            System.out.println("Exception in getFriends(): " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/error/" + userID, "An error occurred.");
        }
    }

    @MessageMapping("/friends/remove")
    public void removeFriend(Friend removeRequest) {
        try {

            // Get the user IDs
            String user1ID = removeRequest.getFriend1();
            String user2ID = removeRequest.getFriend2();

            // Check for friend1 and friend2
            if (user1ID.isEmpty() || user2ID.isEmpty()) {
                messagingTemplate.convertAndSend("/topic/error/" + user1ID, "Friend1 and Friend2 are required.");
                return;
            }

            Friend friend = friendRepository.findByFriend1AndFriend2(user1ID, user2ID);
            // Check if friend exists
            if (friend == null) {
                messagingTemplate.convertAndSend("/topic/error/" + user1ID, "You are not friends with that user.");
                return;
            }

            // Delete the friend
            friendRepository.delete(friend);

            // Send success message
            messagingTemplate.convertAndSend("/topic/friends/remove/" + user1ID, "Friend removed.");
            messagingTemplate.convertAndSend("/topic/success/" + user1ID, "Friend removed.");
            messagingTemplate.convertAndSend("/topic/friends/remove/" + user2ID, "Someone removed you as a friend.");
        } catch (Exception e) {
            System.out.println("Exception in removeFriend(): " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/error/" + removeRequest.getFriend1(), "An error occurred.");
        }
    }


}