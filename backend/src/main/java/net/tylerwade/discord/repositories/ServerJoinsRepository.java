package net.tylerwade.discord.repositories;

import jakarta.transaction.Transactional;
import net.tylerwade.discord.models.Server;
import net.tylerwade.discord.models.ServerJoin;
import net.tylerwade.discord.models.ServerJoinPK;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServerJoinsRepository extends CrudRepository<ServerJoin, ServerJoinPK> {

    @Query(value = "SELECT * FROM server_joins WHERE serverID = ?1 AND userID = ?2", nativeQuery = true)
    List<ServerJoin> findByServerIDAndUserID(String serverID, String userID);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM server_joins WHERE serverID = ?1 AND userID = ?2", nativeQuery = true)
    void deleteByServerIDAndUserID(String serverID, String userID);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM server_joins WHERE serverID = ?1", nativeQuery = true)
    void deleteByServerID(String serverID);
}
