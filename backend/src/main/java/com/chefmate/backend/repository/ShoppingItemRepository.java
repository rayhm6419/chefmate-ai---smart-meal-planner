package com.chefmate.backend.repository;

import com.chefmate.backend.entity.ShoppingItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ShoppingItemRepository extends MongoRepository<ShoppingItem, String> {

    List<ShoppingItem> findByUserIdOrderByCheckedAscCreatedAtAsc(String userId);

    Optional<ShoppingItem> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);
}

