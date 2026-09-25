package com.example.adminbackend.controller;

import com.example.adminbackend.service.TheaterSeatService;
import com.example.adminbackend.service.TheaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private TheaterSeatService theaterSeatService;

    @Autowired
    private TheaterService theaterService;

    @PostMapping("/fix-existing-shows")
    public ResponseEntity<String> fixExistingShows() {
        String result = theaterSeatService.fixExistingShows();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/apply-master-layout")
    public ResponseEntity<String> applyMasterLayoutToExistingTheaters() {
        String result = theaterService.applyMasterLayoutToExistingTheaters();
        return ResponseEntity.ok(result);
    }
}