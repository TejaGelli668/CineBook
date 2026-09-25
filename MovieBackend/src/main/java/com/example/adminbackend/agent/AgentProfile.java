package com.example.adminbackend.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.util.List;

/** One assistant: its instructions, tools, and the actions it can carry out once confirmed. */
public interface AgentProfile {

    String systemPrompt(AgentContext ctx);

    ArrayNode declarations();

    ToolResult run(String tool, JsonNode args, AgentContext ctx);

    /** Carries out a confirmed proposal. The card is shown; the note is told to the model. */
    record Outcome(String text, JsonNode card, String note) {}

    Outcome execute(Proposal proposal, AgentContext ctx);

    String progressLabel(String tool);

    List<String> suggestions(List<String> usedTools, AgentContext ctx);
}
