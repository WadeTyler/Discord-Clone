package net.tylerwade.discord.models;

import jakarta.persistence.*;

@Entity
@Table(name = "direct_messages")
public class DirectMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String directMessageID;
    private String senderID;
    private String receiverID;
    private String timestamp;
    private String content;
    private boolean seen;

    public DirectMessage() {
    }

    public DirectMessage(String senderID, String receiverID, String timestamp, String content) {
        this.senderID = senderID;
        this.receiverID = receiverID;
        this.timestamp = timestamp;
        this.content = content;
    }

    public String getDirectMessageID() {
        return directMessageID;
    }

    public void setDirectMessageID(String directMessageID) {
        this.directMessageID = directMessageID;
    }

    public String getSenderID() {
        return senderID;
    }

    public void setSenderID(String senderID) {
        this.senderID = senderID;
    }

    public String getReceiverID() {
        return receiverID;
    }

    public void setReceiverID(String receiverID) {
        this.receiverID = receiverID;
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

    public boolean isSeen() {
        return seen;
    }

    public void setSeen(boolean seen) {
        this.seen = seen;
    }
}
