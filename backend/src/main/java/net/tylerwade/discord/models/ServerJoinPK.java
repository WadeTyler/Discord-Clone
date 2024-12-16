package net.tylerwade.discord.models;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ServerJoinPK implements Serializable {

    private String serverID;
    private String userID;

    public ServerJoinPK(String serverID, String userID) {
        this.serverID = serverID;
        this.userID = userID;
    }

    public ServerJoinPK() {
    }

    public String getServerID() {
        return serverID;
    }

    public void setServerID(String serverID) {
        this.serverID = serverID;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ServerJoinPK that = (ServerJoinPK) o;
        return Objects.equals(serverID, that.serverID) && Objects.equals(userID, that.userID);
    }

    @Override
    public int hashCode() {
        return Objects.hash(serverID, userID);
    }
}
