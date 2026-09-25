package com.example.adminbackend.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/** A tool's facts for the model, and an optional card for the chat window. */
public record ToolResult(JsonNode forModel, ObjectNode card) {}
