package com.chefmate.backend.inventory;

import com.chefmate.backend.entity.InventoryItem;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByUserIdAndCategoryOrderByExpiryDateAsc(Long userId, InventoryCategory category);

    List<InventoryItem> findByUserId(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
