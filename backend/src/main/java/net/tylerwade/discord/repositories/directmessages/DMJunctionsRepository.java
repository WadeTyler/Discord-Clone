package net.tylerwade.discord.repositories.directmessages;

import net.tylerwade.discord.models.directmessages.DirectMessageJunction;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DMJunctionsRepository extends CrudRepository<DirectMessageJunction, Long> {

    @Query("SELECT j FROM DirectMessageJunction j WHERE j.userID = ?1")
    public List<DirectMessageJunction> findByUserID(String userID);

    @Query("SELECT j FROM DirectMessageJunction j WHERE j.dmChannelID = ?1")
    public List<DirectMessageJunction> findByDMChannelID(String dmChannelID);

    @Query("SELECT j FROM DirectMessageJunction j WHERE j.dmChannelID = ?1 AND j.userID = ?2")
    public Optional<DirectMessageJunction> findByDMChannelIDAndUserID(String dmChannelID, String userID);
}
