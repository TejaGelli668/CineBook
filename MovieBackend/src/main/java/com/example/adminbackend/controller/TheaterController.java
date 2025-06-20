package com.example.adminbackend.controller;

import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/theaters")
public class TheaterController {
    @Autowired
    TheaterRepository theaterRepository;
    @PostMapping
    public Theater create(@RequestBody Theater t){
        return theaterRepository.save(t);
    }
}
