package net.tylerwade.discord.models;

public class FrontendMessage extends Message{

    private String senderUsername;
    private String senderAvatar;

    public FrontendMessage(String senderID, String timestamp, String channelID, String content, String senderUsername, String senderAvatar) {
        super(senderID, timestamp, channelID, content);
        this.senderUsername = senderUsername;
        this.senderAvatar = senderAvatar;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public String getSenderAvatar() {
        return senderAvatar;
    }

    public void setSenderAvatar(String senderAvatar) {
        this.senderAvatar = senderAvatar;
    }
}
