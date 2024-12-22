package net.tylerwade.discord.models.directmessages;

public class FrontendDirectMessage {

    private Long dmID;
    private String dmChannelID;
    private String senderID;
    private String senderUsername;
    private String senderAvatar;
    private String timestamp;
    private String content;


    public FrontendDirectMessage(Long dmID, String dmChannelID, String senderID, String senderUsername, String senderAvatar, String timestamp, String content) {
        this.dmID = dmID;
        this.dmChannelID = dmChannelID;
        this.senderID = senderID;
        this.senderUsername = senderUsername;
        this.senderAvatar = senderAvatar;
        this.timestamp = timestamp;
        this.content = content;
    }

    public FrontendDirectMessage() {
    }

    public Long getDmID() {
        return dmID;
    }

    public void setDmID(Long dmID) {
        this.dmID = dmID;
    }

    public String getDmChannelID() {
        return dmChannelID;
    }

    public void setDmChannelID(String dmChannelID) {
        this.dmChannelID = dmChannelID;
    }

    public String getSenderID() {
        return senderID;
    }

    public void setSenderID(String senderID) {
        this.senderID = senderID;
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

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
