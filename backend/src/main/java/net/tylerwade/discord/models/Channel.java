package net.tylerwade.discord.models;

import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="channels")
public class Channel {

    @Id
    private String channelID;
    private String channelName;
    private String serverID;
    private String channelDescription;
    private String channelOrder;

    public Channel() {
    }

    public Channel(String channelID, String channelName, String serverID, String channelDescription, String channelOrder) {
        this.channelID = channelID;
        this.channelName = channelName;
        this.serverID = serverID;
        this.channelDescription = channelDescription;
        this.channelOrder = channelOrder;
    }


    public String getChannelID() {
        return channelID;
    }

    public void setChannelID(String channelID) {
        this.channelID = channelID;
    }

    public String getChannelName() {
        return channelName;
    }

    public void setChannelName(String channelName) {
        this.channelName = channelName;
    }

    public String getServerID() {
        return serverID;
    }

    public void setServerID(String serverID) {
        this.serverID = serverID;
    }

    public String getChannelDescription() {
        return channelDescription;
    }

    public void setChannelDescription(String channelDescription) {
        this.channelDescription = channelDescription;
    }

    public String getChannelOrder() {
        return channelOrder;
    }

    public void setChannelOrder(String channelOrder) {
        this.channelOrder = channelOrder;
    }
}
