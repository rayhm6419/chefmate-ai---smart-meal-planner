package com.chefmate.backend.repository;

import com.chefmate.backend.entity.ShoppingItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {

    List<ShoppingItem> findByUserIdOrderByCheckedAscCreatedAtAsc(Long userId);

    Optional<ShoppingItem> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}


