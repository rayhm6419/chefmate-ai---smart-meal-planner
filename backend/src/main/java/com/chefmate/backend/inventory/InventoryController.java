package com.chefmate.backend.inventory;

import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
@Validated
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<InventoryItemDto>> list(
        @RequestParam(value = "category", required = false) InventoryCategory category
    ) {
        return ResponseEntity.ok(inventoryService.listItems(category));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<InventoryCategoryDto>> categories() {
        List<InventoryCategoryDto> categories = Arrays.stream(InventoryCategory.values())
            .map(cat -> new InventoryCategoryDto(cat.name(), toDisplayName(cat)))
            .toList();
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<InventoryItemDto> create(@Valid @RequestBody CreateInventoryItemRequest request) {
        InventoryItemDto created = inventoryService.createItem(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemDto> update(
        @PathVariable("id") Long id,
        @Valid @RequestBody UpdateInventoryItemRequest request
    ) {
        InventoryItemDto updated = inventoryService.updateItem(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    private String toDisplayName(InventoryCategory category) {
        return switch (category) {
            case MEAT -> "Meat";
            case SEAFOOD -> "Seafood";
            case VEGETABLE -> "Vegetable";
            case FRUIT -> "Fruit";
            case DAIRY -> "Dairy";
            case FROZEN -> "Frozen";
            case OTHER -> "Other";
        };
    }
}
