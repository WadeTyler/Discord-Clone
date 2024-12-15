package net.tylerwade.discord.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="servers")
public class Server {

    @Id
    private String serverID;
    private String serverName;
    private String serverOwner;
    private String serverIcon;

    public Server(String serverID, String serverName, String serverOwner, String serverIcon) {
        this.serverID = serverID;
        this.serverName = serverName;
        this.serverOwner = serverOwner;
        this.serverIcon = serverIcon;
    }

    public Server() {
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

    public String getServerOwner() {
        return serverOwner;
    }

    public void setServerOwner(String serverOwner) {
        this.serverOwner = serverOwner;
    }

    public String getServerIcon() {
        return serverIcon;
    }

    public void setServerIcon(String serverIcon) {
        this.serverIcon = serverIcon;
    }
}
