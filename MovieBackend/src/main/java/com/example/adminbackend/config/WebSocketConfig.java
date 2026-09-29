package com.example.adminbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure a simple in‐memory broker, mapping destinations prefixed with /topic
     * (for broadcasts) and application‐level destinations prefixed with /app.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Register the STOMP endpoint that clients will use to connect.
     * Clients should use ws://<host>:<port>/ws (and SockJS as a fallback).
     */
    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins) // app.cors.allowed-origins
                .withSockJS();
    }

    /**
     * Browsers only listen: they may subscribe to a show's seat updates, but anything
     * they SEND is refused, so nobody can broadcast fake "seat sold/free" messages to
     * other customers. The server's own broadcasts don't pass through here.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor stomp = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (stomp == null || stomp.getCommand() == null) return message;
                StompCommand command = stomp.getCommand();
                if (command == StompCommand.SEND) {
                    throw new IllegalArgumentException("Sending messages isn't allowed");
                }
                if (command == StompCommand.SUBSCRIBE) {
                    String destination = stomp.getDestination();
                    if (destination == null || !destination.matches("/topic/seat-updates/\\d+")) {
                        throw new IllegalArgumentException("Unknown channel");
                    }
                }
                return message;
            }
        });
    }
}
