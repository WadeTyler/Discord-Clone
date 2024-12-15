package net.tylerwade.discord.models;

/*
* +-----------+--------------+------+-----+-------------------+-------------------+
| Field     | Type         | Null | Key | Default           | Extra             |
+-----------+--------------+------+-----+-------------------+-------------------+
| messageID | bigint       | NO   | PRI | NULL              | auto_increment    |
| senderID  | varchar(512) | NO   | MUL | NULL              |                   |
| timestamp | timestamp    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| channelID | varchar(512) | NO   | MUL | NULL              |                   |
| content   | text         | YES  |     | NULL              |                   |
+-----------+--------------+------+-----+-------------------+-------------------+
*
* */

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="messages")
public class Message {

    @Id
    private String messageID;
    private String senderID;
    private String timestamp;
    private String channelID;
    private String content;

    public Message() {
    }

    public Message(String messageID, String senderID, String timestamp, String channelID, String content) {
        this.messageID = messageID;
        this.senderID = senderID;
        this.timestamp = timestamp;
        this.channelID = channelID;
        this.content = content;
    }

    public String getMessageID() {
        return messageID;
    }

    public void setMessageID(String messageID) {
        this.messageID = messageID;
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

    public String getChannelID() {
        return channelID;
    }

    public void setChannelID(String channelID) {
        this.channelID = channelID;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
