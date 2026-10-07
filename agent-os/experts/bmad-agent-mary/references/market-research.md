---
name: market-research
description: Conduct comprehensive market research on competition and customers using web data and verified sources
menu-code: MR
---

# Market Research Workflow

**Goal:** Conduct comprehensive market research using current web data and verified sources to produce complete research documents with compelling narratives and proper citations.

**Your Role:** You are a market research facilitator working with an expert partner. This is a collaboration where you bring research methodology and web search capabilities, while your partner brings domain knowledge and research direction.

**Prerequisite:** Web search is required. If unavailable, abort and tell the user.

---

## Configuration

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:
- `user_name` for greeting
- `communication_language` for all communications
- `document_output_language` for output documents
- `planning_artifacts` for output location and artifact scanning
- `project_knowledge` for additional context scanning

### Output Path

`{planning_artifacts}/research/market-{{research_topic}}-research-{{date}}.md`

---

## Quick Topic Discovery

"Welcome {{user_name}}! Let's get started with your **market research**.

**What topic, problem, or area do you want to research?**

For example:
- 'The electric vehicle market in Europe'
- 'Plant-based food alternatives market'
- 'Mobile payment solutions in Southeast Asia'
- 'Or anything else you have in mind...'"

### Topic Clarification

Based on the user's topic, briefly clarify:
1. **Core Topic**: "What exactly about [topic] are you most interested in?"
2. **Research Goals**: "What do you hope to achieve with this research?"
3. **Scope**: "Should we focus broadly or dive deep into specific aspects?"

After gathering topic and goals, set `research_type = "market"`, `research_topic`, and `research_goals`. Create the output file with the template (see end of file).

---

## Step 1: Market Research Initialization

**INITIALIZE -- DO NOT RESEARCH YET**

Confirm understanding of research topic and goals. Present the scope:

**Market Research Areas We'll Cover:**
- Market size, growth dynamics, and trends
- Customer insights and behavior analysis
- Competitive landscape and positioning
- Strategic recommendations and implementation guidance

### Refine Research Scope

Clarify:
- Specific customer segments or aspects to prioritize?
- Specific geographic regions or global market?
- Business purpose: market entry, expansion, product development?
- Specific competitors or market segments to analyze?

### Document Initial Scope

Write research scope immediately to the output document:
- Research topic, goals, type, date
- Market analysis focus areas
- Research methodology (current web data, multiple sources, confidence levels)
- Workflow progression (4 steps remaining)

Present [C] Continue or [Modify] options. **HALT -- wait for user.**

---

## Step 2: Customer Behavior and Segments

**Web search required -- verify current facts against live sources.**

### Research Execution

Execute multiple parallel web searches:
- "{{research_topic}} customer behavior patterns"
- "{{research_topic}} customer demographics"
- "{{research_topic}} psychographic profiles"
- "{{research_topic}} customer behavior drivers"

### Content Structure (write immediately)

#### Customer Behavior Patterns
- Behavior Drivers, Interaction Preferences, Decision Habits
- _Source: [URL]_

#### Demographic Segmentation
- Age Demographics, Income Levels, Geographic Distribution, Education Levels
- _Source: [URL]_

#### Psychographic Profiles
- Values and Beliefs, Lifestyle Preferences, Attitudes and Opinions, Personality Traits
- _Source: [URL]_

#### Customer Segment Profiles
- Segment 1-3: Detailed profiles including demographics, psychographics, behavior
- _Source: [URL]_

#### Behavior Drivers and Influences
- Emotional Drivers, Rational Drivers, Social Influences, Economic Influences
- _Source: [URL]_

#### Customer Interaction Patterns
- Research and Discovery, Purchase Decision Process, Post-Purchase Behavior, Loyalty and Retention
- _Source: [URL]_

Present [C] Continue. **HALT -- wait for user.**

---

## Step 3: Customer Pain Points and Needs

### Research Execution

Execute multiple parallel web searches:
- "{{research_topic}} customer pain points challenges"
- "{{research_topic}} customer frustrations"
- "{{research_topic}} unmet customer needs"
- "{{research_topic}} customer barriers to adoption"

### Content Structure (write immediately)

#### Customer Challenges and Frustrations
- Primary Frustrations, Usage Barriers, Service Pain Points, Frequency Analysis

#### Unmet Customer Needs
- Critical Unmet Needs, Solution Gaps, Market Gaps, Priority Analysis

#### Barriers to Adoption
- Price Barriers, Technical Barriers, Trust Barriers, Convenience Barriers

#### Service and Support Pain Points
- Customer Service Issues, Support Gaps, Communication Issues, Response Time Issues

#### Customer Satisfaction Gaps
- Expectation Gaps, Quality Gaps, Value Perception Gaps, Trust and Credibility Gaps

#### Emotional Impact Assessment
- Frustration Levels, Loyalty Risks, Reputation Impact, Customer Retention Risks

#### Pain Point Prioritization
- High/Medium/Low Priority Pain Points, Opportunity Mapping

All sections with source citations.

Present [C] Continue. **HALT -- wait for user.**

---

## Step 4: Customer Decisions and Journey

### Research Execution

Execute multiple parallel web searches:
- "{{research_topic}} customer decision process"
- "{{research_topic}} buying criteria factors"
- "{{research_topic}} customer journey mapping"
- "{{research_topic}} decision influencing factors"

### Content Structure (write immediately)

#### Customer Decision-Making Processes
- Decision Stages, Decision Timelines, Complexity Levels, Evaluation Methods

#### Decision Factors and Criteria
- Primary Decision Factors, Secondary Decision Factors, Weighing Analysis, Evolution Patterns

#### Customer Journey Mapping
- Awareness Stage, Consideration Stage, Decision Stage, Purchase Stage, Post-Purchase Stage

#### Touchpoint Analysis
- Digital Touchpoints, Offline Touchpoints, Information Sources, Influence Channels

#### Information Gathering Patterns
- Research Methods, Information Sources Trusted, Research Duration, Evaluation Criteria

#### Decision Influencers
- Peer Influence, Expert Influence, Media Influence, Social Proof Influence

#### Purchase Decision Factors
- Immediate Purchase Drivers, Delayed Purchase Drivers, Brand Loyalty Factors, Price Sensitivity

#### Customer Decision Optimizations
- Friction Reduction, Trust Building, Conversion Optimization, Loyalty Building

All sections with source citations.

Present [C] Continue. **HALT -- wait for user.**

---

## Step 5: Competitive Analysis

### Research Execution

Search for current competitive information focused on:
- Key players and market share
- Competitive positioning strategies
- Strengths and weaknesses analysis
- Market differentiation opportunities
- Competitive threats and challenges

### Content Structure (write immediately)

#### Key Market Players
- Market leaders and their positions

#### Market Share Analysis
- Market share distribution with source citations

#### Competitive Positioning
- How players position themselves in the market

#### Strengths and Weaknesses
- SWOT analysis with source citations

#### Market Differentiation
- Differentiation opportunities identified

#### Competitive Threats
- Threats analysis with source citations

#### Opportunities
- Competitive opportunities analysis

All sections with source citations.

Present [C] Complete Research. **HALT -- wait for user.**

---

## Step 6: Research Completion and Synthesis

### Strategic Synthesis

Search for:
- "market entry strategies best practices"
- "market research risk assessment frameworks"

### Complete Market Research Document Structure

Generate the final comprehensive document with:

1. **Executive Summary** - Key findings and strategic implications
2. **Table of Contents** - Full navigation structure
3. **Market Research Introduction and Methodology** - Research significance, methodology, goals achieved
4. **Market Analysis and Dynamics** - Market size, growth projections, trends, pricing/business models
5. **Customer Insights and Behavior Analysis** - Behavior patterns, journey, decision factors, pain points, segmentation
6. **Competitive Landscape and Positioning** - Competitive analysis, market positioning strategies
7. **Strategic Market Recommendations** - Market opportunity assessment, strategic recommendations
8. **Market Entry and Growth Strategies** - Go-to-market strategy, growth and scaling
9. **Risk Assessment and Mitigation** - Market risks, mitigation strategies
10. **Implementation Roadmap and Success Metrics** - Implementation framework, KPIs
11. **Future Market Outlook and Opportunities** - Future trends, strategic opportunities
12. **Research Methodology and Source Verification** - Source documentation, quality assurance
13. **Appendices** - Data tables, resources and references

### Document Standards

- Exhaustive research with no critical gaps
- Professional structure and compelling narrative
- As long as needed for comprehensive coverage
- Multiple independent sources for all claims
- Current data throughout with proper citations

### Final Actions

- Replace the template placeholder with a concise overview
- Append the complete synthesis
- Update frontmatter to completed

Present [C] Complete Research. **HALT -- wait for user.**

---

## Research Protocols

- Always cite URLs for web search results
- Use authoritative market research sources
- Note data currency and potential limitations
- Present conflicting information when sources disagree
- Apply confidence levels to uncertain data
- Focus on actionable market insights
- Multiple independent sources for critical claims
- Comprehensive coverage with no critical gaps

---

## Output Template

```yaml
---
stepsCompleted: []
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: '{{research_type}}'
research_topic: '{{research_topic}}'
research_goals: '{{research_goals}}'
user_name: '{{user_name}}'
date: '{{date}}'
web_research_enabled: true
source_verification: true
---
```

# Research Report: {{research_type}}

**Date:** {{date}}
**Author:** {{user_name}}
**Research Type:** {{research_type}}

---

## Research Overview

[Research overview and methodology will be appended here]

---

<!-- Content will be appended sequentially through research workflow steps -->
