package com.chefmate.backend.shopping;

import com.chefmate.backend.DemoUsers;
import com.chefmate.backend.entity.ShoppingItem;
import com.chefmate.backend.repository.ShoppingItemRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class ShoppingService {

    private final ShoppingItemRepository shoppingItemRepository;

    public ShoppingService(ShoppingItemRepository shoppingItemRepository) {
        this.shoppingItemRepository = shoppingItemRepository;
    }

    @Transactional(readOnly = true)
    public List<ShoppingItemDto> listItems() {
        Long userId = DemoUsers.CURRENT_USER_ID;
        List<ShoppingItem> items = shoppingItemRepository.findByUserIdOrderByCheckedAscCreatedAtAsc(userId);
        return items.stream().map(this::toDto).toList();
    }

    public ShoppingItemDto createItem(CreateShoppingItemRequest request) {
        Long userId = DemoUsers.CURRENT_USER_ID;
        ShoppingItem item = new ShoppingItem();
        item.setUserId(userId);
        item.setName(request.name());
        item.setQuantity(request.quantity());
        item.setUnit(request.unit());
        item.setCategory(request.category());
        item.setChecked(false);
        ShoppingItem saved = shoppingItemRepository.save(item);
        return toDto(saved);
    }

    public ShoppingItemDto updateItem(Long id, UpdateShoppingItemRequest request) {
        Long userId = DemoUsers.CURRENT_USER_ID;
        ShoppingItem existing = shoppingItemRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shopping item not found"));

        existing.setName(request.name());
        existing.setQuantity(request.quantity());
        existing.setUnit(request.unit());
        existing.setCategory(request.category());
        if (request.checked() != null) {
            existing.setChecked(request.checked());
        }

        ShoppingItem saved = shoppingItemRepository.save(existing);
        return toDto(saved);
    }

    public void deleteItem(Long id) {
        Long userId = DemoUsers.CURRENT_USER_ID;
        ShoppingItem existing = shoppingItemRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shopping item not found"));
        shoppingItemRepository.delete(existing);
    }

    public ShoppingItemDto setChecked(Long id, boolean checked) {
        Long userId = DemoUsers.CURRENT_USER_ID;
        ShoppingItem existing = shoppingItemRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shopping item not found"));
        existing.setChecked(checked);
        ShoppingItem saved = shoppingItemRepository.save(existing);
        return toDto(saved);
    }

    private ShoppingItemDto toDto(ShoppingItem item) {
        return new ShoppingItemDto(
            item.getId(),
            item.getName(),
            item.getQuantity(),
            item.getUnit(),
            item.getCategory(),
            item.isChecked(),
            item.getCreatedAt(),
            item.getUpdatedAt()
        );
    }
}


