package net.tylerwade.discord.repositories.directmessages;

import net.tylerwade.discord.models.directmessages.DirectMessage;
import net.tylerwade.discord.models.directmessages.FrontendDirectMessage;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DMRepository extends CrudRepository<DirectMessage, Long> {

    @Query("SELECT new net.tylerwade.discord.models.directmessages.FrontendDirectMessage(dm.dmID, dm.dmChannelID, dm.senderID, u.username, u.avatar, dm.timestamp, dm.content) FROM DirectMessage dm JOIN User u ON dm.senderID = u.userID WHERE dm.dmChannelID = ?1")
    List<FrontendDirectMessage> findByDMChannelID(String dmChannelID);
}
