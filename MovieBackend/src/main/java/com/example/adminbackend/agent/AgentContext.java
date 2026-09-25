package com.example.adminbackend.agent;

/**
 * Who is asking and from where. {@code userId} comes from the sign-in token,
 * never from the model.
 */
public record AgentContext(Long userId, String page, String movieTitle, AgentSession session) {
    public boolean signedIn() {
        return userId != null;
    }
}
