package com.chefmate.backend.inventory;

import com.chefmate.backend.entity.InventoryItem;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InventoryItemRepository extends MongoRepository<InventoryItem, String> {
    List<InventoryItem> findByUserIdAndCategoryOrderByExpiryDateAsc(String userId, InventoryCategory category);

    List<InventoryItem> findByUserId(String userId);

    void deleteByIdAndUserId(String id, String userId);
}
