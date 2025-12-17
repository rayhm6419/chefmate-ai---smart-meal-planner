package com.chefmate.backend.inventory;

import com.chefmate.backend.DemoUsers;
import com.chefmate.backend.entity.InventoryItem;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    public InventoryService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<InventoryItemDto> listItems(@Nullable InventoryCategory category) {
        String userId = DemoUsers.CURRENT_USER_ID_STR;
        List<InventoryItem> items = category != null
            ? inventoryItemRepository.findByUserIdAndCategoryOrderByExpiryDateAsc(userId, category)
            : inventoryItemRepository.findByUserId(userId);
        return items.stream().map(this::toDto).toList();
    }

    public InventoryItemDto createItem(CreateInventoryItemRequest request) {
        String userId = DemoUsers.CURRENT_USER_ID_STR;
        InventoryItem item = new InventoryItem();
        item.setUserId(userId);
        item.setName(request.name());
        item.setCategory(request.category());
        item.setQuantity(request.quantity());
        item.setUnit(request.unit());
        item.setExpiryDate(request.expiryDate());
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(item.getCreatedAt());
        InventoryItem saved = inventoryItemRepository.save(item);
        return toDto(saved);
    }

    public InventoryItemDto updateItem(String id, UpdateInventoryItemRequest request) {
        String userId = DemoUsers.CURRENT_USER_ID_STR;
        InventoryItem existing = inventoryItemRepository.findById(id)
            .filter(item -> item.getUserId().equals(userId))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));

        existing.setName(request.name());
        existing.setCategory(request.category());
        existing.setQuantity(request.quantity());
        existing.setUnit(request.unit());
        existing.setExpiryDate(request.expiryDate());
        existing.setUpdatedAt(LocalDateTime.now());

        InventoryItem saved = inventoryItemRepository.save(existing);
        return toDto(saved);
    }

    public void deleteItem(String id) {
        String userId = DemoUsers.CURRENT_USER_ID_STR;
        inventoryItemRepository.findById(id)
            .filter(item -> item.getUserId().equals(userId))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));
        inventoryItemRepository.deleteById(id);
    }

    private InventoryItemDto toDto(InventoryItem item) {
        return new InventoryItemDto(
            item.getId(),
            item.getName(),
            item.getCategory(),
            item.getQuantity(),
            item.getUnit(),
            item.getExpiryDate()
        );
    }
}
