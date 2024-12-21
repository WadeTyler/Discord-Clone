package net.tylerwade.discord.repositories;

import net.tylerwade.discord.models.Friend;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendRepository extends CrudRepository<Friend, Integer> {

    @Query(value = "SELECT * FROM friends WHERE (friend1 = ?1 OR friend2 = ?1) AND accepted = ?2", nativeQuery = true)
    Iterable<Friend> findByFriend1OrFriend2AndAccepted(String userID, boolean b);

    @Query(value = "SELECT * FROM friends WHERE (friend1 = ?1 AND friend2 = ?2) OR (friend1 = ?2 AND friend2 = ?1)", nativeQuery = true)
    Friend findByFriend1AndFriend2(String friend1, String friend2);

    @Query(value = "SELECT * FROM friends WHERE friend2 = ?1 AND accepted = ?2", nativeQuery = true)
    Iterable<Friend> findByFriend2AndAccepted(String userID, boolean b);
}
