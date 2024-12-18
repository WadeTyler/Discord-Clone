package net.tylerwade.discord.models;

public class UserDTO {

    private String userID;
    private String username;
    private String tag;
    private String avatar;
    private String status;

    public UserDTO(String userID, String username, String tag, String avatar, String status) {
        this.userID = userID;
        this.username = username;
        this.tag = tag;
        this.avatar = avatar;
        this.status = status;
    }

    public UserDTO() {
    }


    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
