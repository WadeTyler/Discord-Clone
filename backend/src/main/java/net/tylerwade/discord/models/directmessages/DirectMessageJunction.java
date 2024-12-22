package net.tylerwade.discord.models.directmessages;

import jakarta.persistence.*;

@Entity
@Table(name = "dm_junctions")
public class DirectMessageJunction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String dmChannelID;
    private String userID;

    public DirectMessageJunction(String dmChannelID, String userID) {
        this.dmChannelID = dmChannelID;
        this.userID = userID;
    }

    public DirectMessageJunction() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDmChannelID() {
        return dmChannelID;
    }

    public void setDmChannelID(String dmChannelID) {
        this.dmChannelID = dmChannelID;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }
}
