package com.chefmate.backend.auth.dto;

import com.chefmate.backend.auth.User;

public class AuthResponse {
    private String accessToken;
    private UserInfo user;

    public AuthResponse() {
    }

    public AuthResponse(String accessToken, UserInfo user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public UserInfo getUser() {
        return user;
    }

    public void setUser(UserInfo user) {
        this.user = user;
    }

    public static AuthResponse from(String token, User user) {
        return new AuthResponse(token, new UserInfo(user.getId(), user.getEmail()));
    }
}
