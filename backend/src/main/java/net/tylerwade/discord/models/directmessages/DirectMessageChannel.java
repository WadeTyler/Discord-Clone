package net.tylerwade.discord.models.directmessages;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "dm_channels")
public class DirectMessageChannel {

    @Id
    private String dmChannelID;
    private String avatar;
    private String createdAt;
    private String channelName;
    private String lastModified;

    public DirectMessageChannel(String dmChannelID, String avatar, String createdAt, String channelName, String lastModified) {
        this.dmChannelID = dmChannelID;
        this.avatar = avatar;
        this.createdAt = createdAt;
        this.channelName = channelName;
        this.lastModified = lastModified;
    }

    public DirectMessageChannel() {
    }


    public String getDmChannelID() {
        return dmChannelID;
    }

    public void setDmChannelID(String dmChannelID) {
        this.dmChannelID = dmChannelID;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getChannelName() {
        return channelName;
    }

    public void setChannelName(String channelName) {
        this.channelName = channelName;
    }


    public String getLastModified() {
        return lastModified;
    }

    public void setLastModified(String lastModified) {
        this.lastModified = lastModified;
    }
}
