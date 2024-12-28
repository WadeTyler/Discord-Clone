package net.tylerwade.discord.repositories;

import net.tylerwade.discord.models.Server;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServerRepository extends CrudRepository<Server, String> {

    @Query(value = "SELECT servers.* FROM servers JOIN server_joins ON servers.serverID = server_joins.serverID WHERE server_joins.userID = ?1", nativeQuery = true)
    List<Server> findAllJoinedServers(String userID);

}
