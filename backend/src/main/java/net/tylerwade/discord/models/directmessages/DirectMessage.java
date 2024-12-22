package net.tylerwade.discord.models.directmessages;

import jakarta.persistence.*;

@Entity
@Table(name = "direct_messages")
public class DirectMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dmID;
    private String dmChannelID;
    private String senderID;
    private String timestamp;
    private String content;

    public DirectMessage(String dmChannelID, String senderID, String timestamp, String content) {
        this.dmChannelID = dmChannelID;
        this.senderID = senderID;
        this.timestamp = timestamp;
        this.content = content;
    }

    public DirectMessage() {
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
