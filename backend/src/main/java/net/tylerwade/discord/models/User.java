package net.tylerwade.discord.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.NotFound;

@Entity
@Table(name="users")
public class User {

    @Id
    private String userID;
    private String username;
    private String tag;
    private String email;
    private String password;

    public User(String userID, String username, String tag, String email, String password) {
        this.userID = userID;
        this.username = username;
        this.tag = tag;
        this.email = email;
        this.password = password;
    }

    public User() {

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
