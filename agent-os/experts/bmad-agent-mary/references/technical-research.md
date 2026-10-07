---
name: technical-research
description: Conduct comprehensive technical research on technologies and architecture using web data and verified sources
menu-code: TR
---

# Technical Research Workflow

**Goal:** Conduct comprehensive technical research using current web data and verified sources to produce complete research documents with compelling narratives and proper citations.

**Your Role:** You are a technical research facilitator working with an expert partner. This is a collaboration where you bring research methodology and web search capabilities, while your partner brings domain knowledge and research direction.

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

`{planning_artifacts}/research/technical-{{research_topic}}-research-{{date}}.md`

---

## Quick Topic Discovery

"Welcome {{user_name}}! Let's get started with your **technical research**.

**What technology, tool, or technical area do you want to research?**

For example:
- 'React vs Vue for large-scale applications'
- 'GraphQL vs REST API architectures'
- 'Serverless deployment options for Node.js'
- 'Or any other technical topic you have in mind...'"

### Topic Clarification

Based on the user's topic, briefly clarify:
1. **Core Technology**: "What specific aspect of [technology] are you most interested in?"
2. **Research Goals**: "What do you hope to achieve with this research?"
3. **Scope**: "Should we focus broadly or dive deep into specific aspects?"

After gathering topic and goals, set `research_type = "technical"`, `research_topic`, and `research_goals`. Create the output file with the template (see end of file).

---

## Step 1: Technical Research Scope Confirmation

**SCOPE CONFIRMATION ONLY -- NO WEB RESEARCH YET**

Confirm understanding:

"I understand you want to conduct **technical research** for **{{research_topic}}** with these goals: {{research_goals}}

**Technical Research Scope:**
- **Architecture Analysis**: System design patterns, frameworks, and architectural decisions
- **Implementation Approaches**: Development methodologies, coding patterns, and best practices
- **Technology Stack**: Languages, frameworks, tools, and platforms relevant to {{research_topic}}
- **Integration Patterns**: APIs, communication protocols, and system interoperability
- **Performance Considerations**: Scalability, optimization, and performance patterns

**Research Approach:**
- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence levels for uncertain technical information
- Comprehensive technical coverage with architecture-specific insights"

Present [C] Continue. **HALT -- wait for user.**

When confirmed, write scope confirmation to document.

---

## Step 2: Technology Stack Analysis

**Web search required -- verify current facts against live sources.**

### Research Execution

Execute multiple parallel web searches:
- "{{research_topic}} programming languages frameworks"
- "{{research_topic}} development tools platforms"
- "{{research_topic}} database storage technologies"
- "{{research_topic}} cloud infrastructure platforms"

### Content Structure (write immediately)

#### Programming Languages
- Popular Languages, Emerging Languages, Language Evolution, Performance Characteristics
- _Source: [URL]_

#### Development Frameworks and Libraries
- Major Frameworks, Micro-frameworks, Evolution Trends, Ecosystem Maturity
- _Source: [URL]_

#### Database and Storage Technologies
- Relational Databases, NoSQL Databases, In-Memory Databases, Data Warehousing
- _Source: [URL]_

#### Development Tools and Platforms
- IDE and Editors, Version Control, Build Systems, Testing Frameworks
- _Source: [URL]_

#### Cloud Infrastructure and Deployment
- Major Cloud Providers, Container Technologies, Serverless Platforms, CDN and Edge Computing
- _Source: [URL]_

#### Technology Adoption Trends
- Migration Patterns, Emerging Technologies, Legacy Technology, Community Trends
- _Source: [URL]_

Present [C] Continue. **HALT -- wait for user.**

---

## Step 3: Integration Patterns

### Research Execution

Execute multiple parallel web searches:
- "{{research_topic}} API design patterns protocols"
- "{{research_topic}} communication protocols data formats"
- "{{research_topic}} system interoperability integration"
- "{{research_topic}} microservices integration patterns"

### Content Structure (write immediately)

#### API Design Patterns
- RESTful APIs, GraphQL APIs, RPC and gRPC, Webhook Patterns
- _Source: [URL]_

#### Communication Protocols
- HTTP/HTTPS Protocols, WebSocket Protocols, Message Queue Protocols (AMQP, MQTT), gRPC and Protocol Buffers
- _Source: [URL]_

#### Data Formats and Standards
- JSON and XML, Protobuf and MessagePack, CSV and Flat Files, Custom Data Formats
- _Source: [URL]_

#### System Interoperability Approaches
- Point-to-Point Integration, API Gateway Patterns, Service Mesh, Enterprise Service Bus
- _Source: [URL]_

#### Microservices Integration Patterns
- API Gateway Pattern, Service Discovery, Circuit Breaker Pattern, Saga Pattern
- _Source: [URL]_

#### Event-Driven Integration
- Publish-Subscribe Patterns, Event Sourcing, Message Broker Patterns (RabbitMQ, Kafka), CQRS Patterns
- _Source: [URL]_

#### Integration Security Patterns
- OAuth 2.0 and JWT, API Key Management, Mutual TLS, Data Encryption
- _Source: [URL]_

Present [C] Continue. **HALT -- wait for user.**

---

## Step 4: Architectural Patterns

### Research Execution

Execute web searches for:
- "system architecture patterns best practices"
- "software design principles patterns"
- "scalability architecture patterns"

### Content Structure (write immediately)

#### System Architecture Patterns
- Microservices, monolithic, serverless, event-driven, reactive, domain-driven design, cloud-native, edge
- _Source: [URL]_

#### Design Principles and Best Practices
- SOLID principles, clean architecture, hexagonal architecture, API design, database design
- _Source: [URL]_

#### Scalability and Performance Patterns
- Horizontal vs vertical scaling, load balancing, caching, distributed systems, consensus, performance optimization
- _Source: [URL]_

#### Integration and Communication Patterns
- Integration architecture patterns
- _Source: [URL]_

#### Security Architecture Patterns
- Security architecture analysis
- _Source: [URL]_

#### Data Architecture Patterns
- Data architecture analysis
- _Source: [URL]_

#### Deployment and Operations Architecture
- Deployment architecture analysis
- _Source: [URL]_

Present [C] Continue. **HALT -- wait for user.**

---

## Step 5: Implementation Research

### Research Execution

Execute web searches for:
- "technology adoption strategies migration"
- "software development workflows tooling"
- "DevOps operations best practices"

### Content Structure (write immediately)

#### Technology Adoption Strategies
- Migration patterns, gradual vs big bang, legacy modernization, vendor evaluation
- _Source: [URL]_

#### Development Workflows and Tooling
- CI/CD pipelines, code quality, testing strategies, collaboration tools
- _Source: [URL]_

#### Testing and Quality Assurance
- Testing approaches analysis
- _Source: [URL]_

#### Deployment and Operations Practices
- Monitoring, observability, incident response, disaster recovery, infrastructure as code, security operations
- _Source: [URL]_

#### Team Organization and Skills
- Team organization analysis
- _Source: [URL]_

#### Cost Optimization and Resource Management
- Cost optimization analysis
- _Source: [URL]_

#### Risk Assessment and Mitigation
- Risk mitigation analysis
- _Source: [URL]_

#### Technical Recommendations
- Implementation Roadmap
- Technology Stack Recommendations
- Skill Development Requirements
- Success Metrics and KPIs

Present [C] Continue. **HALT -- wait for user.**

---

## Step 6: Technical Synthesis and Completion

### Generate Complete Technical Research Document

Search for: "{{research_topic}} technical significance importance"

Produce a comprehensive, authoritative document with:

1. **Executive Summary** - Key technical findings, strategic recommendations
2. **Table of Contents** - Complete navigation
3. **Technical Research Introduction and Methodology** - Research significance, methodology, goals achieved
4. **Technical Landscape and Architecture Analysis** - Current architectural patterns, system design principles
5. **Implementation Approaches and Best Practices** - Current methodologies, framework and tooling
6. **Technology Stack Evolution and Current Trends** - Current stack landscape, adoption patterns
7. **Integration and Interoperability Patterns** - Current integration approaches, standards and protocols
8. **Performance and Scalability Analysis** - Performance characteristics, scalability patterns
9. **Security and Compliance Considerations** - Security best practices, regulatory considerations
10. **Strategic Technical Recommendations** - Technical strategy, competitive advantage
11. **Implementation Roadmap and Risk Assessment** - Implementation framework, technical risk management
12. **Future Technical Outlook and Innovation Opportunities** - Emerging trends (1-2yr, 3-5yr, 5+yr), innovation opportunities
13. **Technical Research Methodology and Source Verification** - Source documentation, quality assurance
14. **Technical Appendices** - Data tables, reference materials

### Document Standards

- Serves as an authoritative technical reference
- Exhaustive technical research with no critical gaps
- Professional structure and compelling narrative
- Multiple independent technical sources for all claims
- Current technical data with proper citations throughout

### Final Actions

- Replace template placeholder with concise overview
- Append complete synthesis
- Update frontmatter to completed

Present [C] Complete Research. **HALT -- wait for user.**

---

## Research Protocols

- Always cite URLs for web search results
- Use authoritative technical research sources
- Note data currency and potential limitations
- Present conflicting information when sources disagree
- Apply confidence levels to uncertain data
- Focus on actionable technical insights
- Search for architecture documentation and pattern catalogs
- Use architectural conference proceedings and case studies
- Research successful system architectures and their evolution

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
