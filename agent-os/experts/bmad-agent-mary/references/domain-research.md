---
name: domain-research
description: Conduct comprehensive domain and industry research using web data and verified sources
menu-code: DR
---

# Domain Research Workflow

**Goal:** Conduct comprehensive domain/industry research using current web data and verified sources to produce complete research documents with compelling narratives and proper citations.

**Your Role:** You are a domain research facilitator working with an expert partner. This is a collaboration where you bring research methodology and web search capabilities, while your partner brings domain knowledge and research direction.

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

`{planning_artifacts}/research/domain-{{research_topic}}-research-{{date}}.md`

---

## Quick Topic Discovery

"Welcome {{user_name}}! Let's get started with your **domain/industry research**.

**What domain, industry, or sector do you want to research?**

For example:
- 'The healthcare technology industry'
- 'Sustainable packaging regulations in Europe'
- 'Construction and building materials sector'
- 'Or any other domain you have in mind...'"

### Topic Clarification

Based on the user's topic, briefly clarify:
1. **Core Domain**: "What specific aspect of [domain] are you most interested in?"
2. **Research Goals**: "What do you hope to achieve with this research?"
3. **Scope**: "Should we focus broadly or dive deep into specific aspects?"

After gathering topic and goals, set `research_type = "domain"`, `research_topic`, and `research_goals`. Create the output file with the template (see end of file).

---

## Step 1: Domain Research Scope Confirmation

**SCOPE CONFIRMATION ONLY -- NO WEB RESEARCH YET**

Confirm understanding:

"I understand you want to conduct **domain research** for **{{research_topic}}** with these goals: {{research_goals}}

**Domain Research Scope:**
- **Industry Analysis**: Industry structure, market dynamics, and competitive landscape
- **Regulatory Environment**: Compliance requirements, regulations, and standards
- **Technology Patterns**: Innovation trends, technology adoption, and digital transformation
- **Economic Factors**: Market size, growth trends, and economic impact
- **Supply Chain**: Value chain analysis and ecosystem relationships

**Research Approach:**
- All claims verified against current public sources
- Multi-source validation for critical domain claims
- Confidence levels for uncertain domain information
- Comprehensive domain coverage with industry-specific insights"

Present [C] Continue. **HALT -- wait for user.**

When confirmed, write scope confirmation to document.

---

## Step 2: Industry Analysis

**Web search required -- verify current facts against live sources.**

### Research Execution

Execute multiple parallel web searches:
- "{{research_topic}} market size value"
- "{{research_topic}} market growth rate dynamics"
- "{{research_topic}} market segmentation structure"
- "{{research_topic}} industry trends evolution"

### Content Structure (write immediately)

#### Market Size and Valuation
- Total Market Size, Growth Rate (CAGR), Market Segments, Economic Impact
- _Source: [URL]_

#### Market Dynamics and Growth
- Growth Drivers, Growth Barriers, Cyclical Patterns, Market Maturity
- _Source: [URL]_

#### Market Structure and Segmentation
- Primary Segments, Sub-segment Analysis, Geographic Distribution, Vertical Integration
- _Source: [URL]_

#### Industry Trends and Evolution
- Emerging Trends, Historical Evolution, Technology Integration, Future Outlook
- _Source: [URL]_

#### Competitive Dynamics
- Market Concentration, Competitive Intensity, Barriers to Entry, Innovation Pressure
- _Source: [URL]_

Present [C] Continue. **HALT -- wait for user.**

---

## Step 3: Competitive Landscape

### Research Execution

Execute multiple parallel web searches:
- "{{research_topic}} key players market leaders"
- "{{research_topic}} market share competitive landscape"
- "{{research_topic}} competitive strategies differentiation"
- "{{research_topic}} entry barriers competitive dynamics"

### Content Structure (write immediately)

#### Key Players and Market Leaders
- Market Leaders, Major Competitors, Emerging Players, Global vs Regional
- _Source: [URL]_

#### Market Share and Competitive Positioning
- Market Share Distribution, Competitive Positioning, Value Proposition Mapping, Customer Segments Served
- _Source: [URL]_

#### Competitive Strategies and Differentiation
- Cost Leadership Strategies, Differentiation Strategies, Focus/Niche Strategies, Innovation Approaches
- _Source: [URL]_

#### Business Models and Value Propositions
- Primary Business Models, Revenue Streams, Value Chain Integration, Customer Relationship Models
- _Source: [URL]_

#### Competitive Dynamics and Entry Barriers
- Barriers to Entry, Competitive Intensity, Market Consolidation Trends, Switching Costs
- _Source: [URL]_

#### Ecosystem and Partnership Analysis
- Supplier Relationships, Distribution Channels, Technology Partnerships, Ecosystem Control
- _Source: [URL]_

Present [C] Continue. **HALT -- wait for user.**

---

## Step 4: Regulatory Focus

### Research Execution

Execute web searches for:
- "{{research_topic}} regulations compliance requirements"
- "{{research_topic}} standards best practices"
- "data privacy regulations {{research_topic}}"

### Content Structure (write immediately)

#### Applicable Regulations
- Specific regulations analysis with source citations

#### Industry Standards and Best Practices
- Industry-specific technical standards, certifications, quality frameworks

#### Compliance Frameworks
- Compliance framework analysis

#### Data Protection and Privacy
- GDPR, CCPA, industry-specific privacy requirements

#### Licensing and Certification
- Licensing requirements analysis

#### Implementation Considerations
- Practical implementation considerations

#### Risk Assessment
- Regulatory and compliance risk assessment

Present [C] Continue. **HALT -- wait for user.**

---

## Step 5: Technical Trends

### Research Execution

Execute web searches for:
- "{{research_topic}} emerging technologies innovations"
- "{{research_topic}} digital transformation trends"
- "{{research_topic}} future outlook trends"

### Content Structure (write immediately)

#### Emerging Technologies
- AI, machine learning, automation impacts, digital transformation trends, disrupting technologies, innovation patterns

#### Digital Transformation
- Digital adoption trends, business model evolution, customer experience innovations, operational efficiency

#### Innovation Patterns
- Innovation patterns analysis

#### Future Outlook
- Technology roadmaps, market evolution predictions, innovation pipelines, long-term transformation

#### Implementation Opportunities
- Implementation opportunity analysis

#### Challenges and Risks
- Challenges and risks assessment

#### Recommendations
- Technology Adoption Strategy
- Innovation Roadmap
- Risk Mitigation

Present [C] Continue. **HALT -- wait for user.**

---

## Step 6: Research Synthesis and Completion

### Generate Complete Domain Research Document

Search for: "{{research_topic}} significance importance"

Produce a comprehensive, authoritative document with:

1. **Executive Summary** - Key findings, strategic recommendations
2. **Table of Contents** - Complete navigation
3. **Research Introduction and Methodology** - Research significance, methodology, goals achieved
4. **Industry Overview and Market Dynamics** - Market size, growth, industry structure, value chain
5. **Technology Landscape and Innovation Trends** - Current technology adoption, digital transformation impact
6. **Regulatory Framework and Compliance Requirements** - Current landscape, risk and compliance considerations
7. **Competitive Landscape and Ecosystem Analysis** - Market positioning, key players, ecosystem and partnerships
8. **Strategic Insights and Domain Opportunities** - Cross-domain synthesis, strategic opportunities
9. **Implementation Considerations and Risk Assessment** - Implementation framework, risk management
10. **Future Outlook and Strategic Planning** - Future trends (1-2yr, 3-5yr, 5+yr), strategic recommendations
11. **Research Methodology and Source Verification** - Source documentation, quality assurance, limitations
12. **Appendices** - Data tables, additional resources

### Document Standards

- Serves as an authoritative reference on the domain
- Exhaustive research with no critical gaps
- Professional structure and compelling narrative
- Multiple independent sources for all claims
- Current data with proper citations throughout

### Final Actions

- Replace template placeholder with concise overview
- Append complete synthesis
- Update frontmatter to completed

Present [C] Complete Research. **HALT -- wait for user.**

---

## Research Protocols

- Always cite URLs for web search results
- Use authoritative industry research sources
- Note data currency and potential limitations
- Present conflicting information when sources disagree
- Apply confidence levels to uncertain data
- Focus on actionable domain insights
- Search for specific regulations by name and number
- Identify regulatory bodies and enforcement agencies
- Consider regional and jurisdictional differences

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
