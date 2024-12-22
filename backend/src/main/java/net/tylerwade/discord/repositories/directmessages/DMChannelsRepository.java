package net.tylerwade.discord.repositories.directmessages;

import net.tylerwade.discord.models.directmessages.DirectMessageChannel;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DMChannelsRepository extends CrudRepository<DirectMessageChannel, String> {

    @Query(value = "SELECT dmc FROM DirectMessageChannel dmc JOIN DirectMessageJunction j ON dmc.dmChannelID = j.dmChannelID WHERE j.userID = ?1")
    public List<DirectMessageChannel> findAllByUserID(String userID);

    @Query(value = "SELECT dmc FROM DirectMessageChannel dmc JOIN DirectMessageJunction j ON j.userID = ?1")
    public List<DirectMessageChannel> findByUserID(String userID);

}
