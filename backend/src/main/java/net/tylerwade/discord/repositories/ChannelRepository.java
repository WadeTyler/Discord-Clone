package net.tylerwade.discord.repositories;

import jakarta.transaction.Transactional;
import net.tylerwade.discord.models.Channel;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelRepository extends CrudRepository<Channel, String> {

    @Query(value = "SELECT * FROM channels WHERE serverID = ?1 ORDER BY channelOrder ASC", nativeQuery = true)
    List<Channel> findByServerID(String serverID);

    @Query(value = "SELECT * FROM channels WHERE serverID = ?1 AND channelID = ?2", nativeQuery = true)
    Channel findByServerIDAndChannelID(String serverID, String channelID);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM channels WHERE serverID = ?1", nativeQuery = true)
    void deleteByServerID(String serverID);
}
