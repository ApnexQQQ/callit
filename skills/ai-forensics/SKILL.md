---
name: ai-forensics
description: Build AI behavior forensics and monitoring systems. Use when creating tools to trace AI agent decisions, detect anomalies, reconstruct decision chains, or build compliance audit trails for autonomous systems.
---

# AI Forensics Development

Build systems to monitor, trace, and investigate AI agent behavior.

## Core Concepts

### Decision Chain Logging
Capture every step of an AI agent's execution:

```python
class DecisionLog:
    session_id: str
    timestamp: datetime
    step_type: Literal["input", "reasoning", "action", "output", "error"]
    content: dict
    metadata: dict
    sequence: int
```

### Session Timeline
Reconstruct chronological event sequences:

```python
async def get_session_timeline(session_id: str) -> List[DecisionLog]:
    logs = await db.query(DecisionLog).filter(
        DecisionLog.session_id == session_id
    ).order_by(DecisionLog.sequence).all()
    return logs
```

## Implementation Patterns

### 1. Agent SDK Integration
```python
# SDK for AI agents to log their actions
class GhostTraceSDK:
    def __init__(self, api_key: str, agent_id: str):
        self.api_key = api_key
        self.agent_id = agent_id
        self.session_id = generate_session_id()
        self.sequence = 0
    
    async def log_input(self, content: dict):
        await self._send_log("input", content)
    
    async def log_reasoning(self, content: dict):
        await self._send_log("reasoning", content)
    
    async def log_action(self, tool: str, params: dict, result: dict):
        await self._send_log("action", {
            "tool": tool,
            "params": params,
            "result": result
        })
    
    async def _send_log(self, step_type: str, content: dict):
        self.sequence += 1
        await api.post("/logs", {
            "session_id": self.session_id,
            "agent_id": self.agent_id,
            "step_type": step_type,
            "content": content,
            "sequence": self.sequence,
            "timestamp": datetime.utcnow().isoformat()
        })
```

### 2. Anomaly Detection
```python
class BehaviorAnalyzer:
    def __init__(self):
        self.baselines = {}
    
    def establish_baseline(self, agent_id: str, logs: List[DecisionLog]):
        """Learn normal behavior patterns."""
        self.baselines[agent_id] = {
            "avg_actions_per_session": mean(len(logs)),
            "common_tools": most_frequent(tools_used),
            "typical_response_time": mean(response_times)
        }
    
    def detect_anomaly(self, agent_id: str, log: DecisionLog) -> bool:
        """Check if behavior deviates from baseline."""
        baseline = self.baselines.get(agent_id)
        if not baseline:
            return False
        
        # Check for unusual patterns
        if log.step_type == "action":
            if log.content["tool"] not in baseline["common_tools"]:
                return True
        
        return False
```

### 3. Evidence Chain
```python
import hashlib

class EvidenceChain:
    def __init__(self):
        self.previous_hash = "0" * 64
    
    def add_evidence(self, log: DecisionLog) -> str:
        """Add tamper-evident evidence."""
        data = f"{log.session_id}:{log.sequence}:{log.timestamp}:{log.content}"
        current_hash = hashlib.sha256(data.encode()).hexdigest()
        
        # Chain to previous
        combined = f"{self.previous_hash}:{current_hash}"
        evidence_hash = hashlib.sha256(combined.encode()).hexdigest()
        
        self.previous_hash = evidence_hash
        return evidence_hash
```

## Forensic Analysis

### Root Cause Analysis
```python
async def analyze_incident(session_id: str) -> IncidentReport:
    timeline = await get_session_timeline(session_id)
    
    report = IncidentReport(
        session_id=session_id,
        timeline=timeline,
        anomalies=[],
        root_cause=None
    )
    
    # Find anomalies
    for log in timeline:
        if await detect_anomaly(log):
            report.anomalies.append(log)
    
    # Determine root cause
    if report.anomalies:
        first_anomaly = report.anomalies[0]
        report.root_cause = classify_root_cause(first_anomaly)
    
    return report
```

## Compliance Features

### Audit Trail Export
```python
async def export_audit_trail(
    session_id: str,
    format: Literal["json", "pdf", "csv"]
) -> bytes:
    """Generate compliance-ready audit documentation."""
    timeline = await get_session_timeline(session_id)
    
    if format == "json":
        return json.dumps({
            "session_id": session_id,
            "exported_at": datetime.utcnow().isoformat(),
            "evidence_hash": compute_merkle_root(timeline),
            "events": [log.to_dict() for log in timeline]
        }).encode()
```

## Best Practices

1. **Log everything** — You can't investigate what you didn't capture
2. **Use cryptographic hashing** — Ensure evidence integrity
3. **Establish baselines** — Know what's normal to detect anomalies
4. **Export in multiple formats** — JSON for tech, PDF for legal
5. **Consider privacy** — Hash PII, respect data retention policies
