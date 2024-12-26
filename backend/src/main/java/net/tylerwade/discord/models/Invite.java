package net.tylerwade.discord.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "invites")
public class Invite {

    @Id
    private String id;
    private String expires_at;
    private String serverID;
    private String creatorID;

    public Invite() {
    }

    public Invite(String id, String expires_at, String serverID, String creatorID) {
        this.id = id;
        this.expires_at = expires_at;
        this.serverID = serverID;
        this.creatorID = creatorID;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getExpires_at() {
        return expires_at;
    }

    public void setExpires_at(String expires_at) {
        this.expires_at = expires_at;
    }

    public String getServerID() {
        return serverID;
    }

    public void setServerID(String serverID) {
        this.serverID = serverID;
    }

    public String getCreatorID() {
        return creatorID;
    }

    public void setCreatorID(String creatorID) {
        this.creatorID = creatorID;
    }
}
