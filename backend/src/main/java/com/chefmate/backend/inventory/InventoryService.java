package com.chefmate.backend.inventory;

import com.chefmate.backend.DemoUsers;
import com.chefmate.backend.entity.InventoryItem;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    public InventoryService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryItemDto> listItems(@Nullable InventoryCategory category) {
        Long userId = DemoUsers.CURRENT_USER_ID;
        List<InventoryItem> items = category != null
            ? inventoryItemRepository.findByUserIdAndCategoryOrderByExpiryDateAsc(userId, category)
            : inventoryItemRepository.findByUserId(userId);
        return items.stream().map(this::toDto).toList();
    }

    public InventoryItemDto createItem(CreateInventoryItemRequest request) {
        Long userId = DemoUsers.CURRENT_USER_ID;
        InventoryItem item = new InventoryItem();
        item.setUserId(userId);
        item.setName(request.name());
        item.setCategory(request.category());
        item.setQuantity(request.quantity());
        item.setUnit(request.unit());
        item.setExpiryDate(request.expiryDate());
        InventoryItem saved = inventoryItemRepository.save(item);
        return toDto(saved);
    }

    public InventoryItemDto updateItem(Long id, UpdateInventoryItemRequest request) {
        Long userId = DemoUsers.CURRENT_USER_ID;
        InventoryItem existing = inventoryItemRepository.findById(id)
            .filter(item -> item.getUserId().equals(userId))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));

        existing.setName(request.name());
        existing.setCategory(request.category());
        existing.setQuantity(request.quantity());
        existing.setUnit(request.unit());
        existing.setExpiryDate(request.expiryDate());

        InventoryItem saved = inventoryItemRepository.save(existing);
        return toDto(saved);
    }

    public void deleteItem(Long id) {
        Long userId = DemoUsers.CURRENT_USER_ID;
        InventoryItem existing = inventoryItemRepository.findById(id)
            .filter(item -> item.getUserId().equals(userId))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));
        inventoryItemRepository.delete(existing);
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
