package net.tylerwade.discord.models;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "server_joins")
public class ServerJoin {

    @EmbeddedId
    private ServerJoinPK id;

    public ServerJoin() {}

    public ServerJoin(String serverID, String userID) {
        this.id = new ServerJoinPK(serverID, userID);
    }

    public ServerJoinPK getId() {
        return id;
    }

    public void setId(ServerJoinPK id) {
        this.id = id;
    }

    public void setServerID(String serverID) {
        this.id.setServerID(serverID);
    }

    public String getServerID(String serverID) {
        return this.id.getServerID();
    }

    public void setUserID(String userID) {
        this.id.setUserID(userID);
    }

    public String getUserID(String userID) {
        return this.id.getUserID();
    }


}
