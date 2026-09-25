package com.example.adminbackend.controller;

import com.example.adminbackend.dto.SeatUpdateMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SeatWebSocketController {

    @MessageMapping("/seat-update")
    @SendTo("/topic/seat-updates")
    public SeatUpdateMessage handleSeatUpdate(SeatUpdateMessage message) {
        return message;
    }
}