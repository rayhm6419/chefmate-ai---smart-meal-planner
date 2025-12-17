package com.chefmate.backend.shopping;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shopping-items")
@Validated
@CrossOrigin(origins = "*")
public class ShoppingController {

    private final ShoppingService shoppingService;

    public ShoppingController(ShoppingService shoppingService) {
        this.shoppingService = shoppingService;
    }

    @GetMapping
    public ResponseEntity<List<ShoppingItemDto>> list() {
        return ResponseEntity.ok(shoppingService.listItems());
    }

    @PostMapping
    public ResponseEntity<ShoppingItemDto> create(@Valid @RequestBody CreateShoppingItemRequest request) {
        ShoppingItemDto created = shoppingService.createItem(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShoppingItemDto> update(
        @PathVariable("id") String id,
        @Valid @RequestBody UpdateShoppingItemRequest request
    ) {
        ShoppingItemDto updated = shoppingService.updateItem(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        shoppingService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Minimal PATCH-style endpoint to set the checked flag.
     */
    @PatchMapping("/{id}/checked")
    public ResponseEntity<ShoppingItemDto> setChecked(
        @PathVariable("id") String id,
        @RequestParam("value") boolean checked
    ) {
        ShoppingItemDto updated = shoppingService.setChecked(id, checked);
        return ResponseEntity.ok(updated);
    }
}

