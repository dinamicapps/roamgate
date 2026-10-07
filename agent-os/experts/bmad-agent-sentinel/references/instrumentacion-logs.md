---
name: instrumentacion-logs
description: Inject and remove temporary security logging in .NET/C# code for audit trails.
menu-code: IL
---

# Instrumentacion de Logs de Seguridad

Inject temporary security-focused logging into .NET/C# code for development and testing phases. Enables Sentinel to trace API behavior, data flow, and security events.

## Outcome

Targeted, temporary logging instrumentation that captures security-relevant events without polluting the codebase permanently. All injected code is clearly marked for easy removal.

## First-Run: Logger Discovery

On first use per project, investigate the existing logging system:

- Identify logging framework (Serilog, NLog, Microsoft.Extensions.Logging, custom)
- Find configuration files and log output targets
- Discover existing log levels, categories, and namespaces
- Check for structured logging patterns
- Persist findings to `{project-root}/_bmad/memory/sentinel-sidecar/logger-profile.md`

**Use the project's existing logger.** Do not introduce a new logging framework.

## Instrumentation Patterns

All injected code MUST:

- Be wrapped in `#region SENTINEL-SECURITY-LOG` / `#endregion` markers
- Include a comment with injection date and purpose
- Use the project's existing logging framework and patterns
- Log at appropriate levels (Warning for suspicious, Error for violations, Information for audit trail)

### What to Log

- Authentication events (login attempts, token validation, failures)
- Authorization decisions (access granted/denied, role checks)
- Sensitive data access (who accessed what patient/health record)
- Input validation failures (rejected payloads, type mismatches)
- API contract violations (unexpected request/response shapes)
- Rate limit triggers
- Error responses with security implications

### What NOT to Log

- Actual sensitive data values (passwords, tokens, health records content)
- PII in plain text — use masking (first 3 chars + asterisks)
- Full request/response bodies for health data endpoints

## Removal

When instrumentation is no longer needed:

- Search for `#region SENTINEL-SECURITY-LOG` markers
- Remove all marked regions
- Verify no orphaned references remain
- Confirm project builds cleanly after removal

## Output

List of files instrumented, log categories added, and instructions for reviewing captured logs. Update sidecar memory with instrumentation state.
