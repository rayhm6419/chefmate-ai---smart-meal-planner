package com.chefmate.backend.auth.dto;

public class UserInfo {
    private String id;
    private String email;

    public UserInfo() {
    }

    public UserInfo(String id, String email) {
        this.id = id;
        this.email = email;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
