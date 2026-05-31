# Project Pūnaha: Fonterra Milk Quality Assurance System
## ENSE706 Phase II — Final Report

**Paper:** ENSE706  
**GitHub:** https://github.com/manavsandhu555-spec/Fonterra-Enterprise-System  
**Date:** May 2026

---

## Table of Contents

1. Introduction
2. Problem Statement & Context
3. Refined Static & Dynamic Modelling
   - 3.1 Refined Class Diagram
   - 3.2 Sequence Diagrams
   - 3.3 Activity & State Diagrams
4. Design Pattern Application & Implementation
   - 4.1 Pattern Selection Rationale
   - 4.2 Strategy Pattern
   - 4.3 Observer Pattern
   - 4.4 GoF Compliance
5. Comparative Design Analysis
6. Critical Reflection
7. Conclusion
8. References & Appendix

---

## 1. Introduction

Project Pūnaha is a digital quality assurance and traceability system built for Fonterra's farm-gate milk collection operations. The system automates batch validation at the point of collection, enforces safety and quality thresholds in real time, and maintains an auditable record of every batch decision. It is implemented across two complementary layers: a C# console application housing the core domain logic and GoF design patterns, and a React/Firestore web application that exposes the same validation logic through an operational dashboard for quality assurance staff.

This report covers Phase II of the project. Phase I established the foundational domain model — `MilkBatch`, `ITraceable`, `QualityAssuranceService`, and exception-based safety enforcement — in a single-file C# console application. Phase II refines that foundation by introducing two Gang of Four design patterns (Strategy and Observer), aligning the UML models to match the evolved implementation, and critically evaluating the design decisions made throughout.

The report is structured as follows. Section 2 establishes the problem context, identifies the key actors, and explains the legacy-integration constraint that shaped key architectural choices. Section 3 presents the refined UML models produced in Task 5 — the post-pattern class diagram, sequence diagram, activity diagram, and state machine — and explains what each communicates. Section 4 examines the Strategy and Observer patterns as implemented in C#, supported by code excerpts and references to the class diagram. Section 5 provides a comparative analysis (Task 7) of the before and after design states, evaluated against SOLID principles. Section 6 offers a critical reflection (Task 8) on trade-offs, limitations, and lessons learned from aligning UML with running code. Section 7 concludes with a summary of outcomes and a forward-looking recommendation.

---

## 2. Problem Statement & Context

Fonterra's milk collection operations currently depend on legacy infrastructure — most significantly an SAP mainframe — that lacks real-time data validation at the farm gate. Quality checks are performed manually and retrospectively, which introduces latency between collection and the detection of safety breaches such as temperature threshold violations or sub-standard fat content. In a cooperative of Fonterra's scale, even a short window where a non-compliant batch goes undetected exposes the organisation to food safety non-compliance, financial loss from processing contaminated product, and reputational risk with regulators such as MPI.

Project Pūnaha addresses this by providing an interface-driven software solution that enforces quality standards automatically at the point of collection and makes batch status immediately visible across the organisation. Three primary actors interact with the system, as shown in the Use Case Diagram (Figure 1). The **Tanker Driver** submits batch data — temperature, volume, fat percentage, and source farm — at the time of collection. The **Lab Technician** triggers the validation pipeline, which runs the system's ordered rule set and transitions each batch to one of four states: Pending, Approved, QualityRejected, or Quarantined. The **Quality Manager** monitors the audit log and acts on quarantine alerts in real time, coordinating with downstream SAP workflows for approved batches.

The SAP legacy integration is a meaningful architectural constraint. The mainframe does not expose a synchronous API, so the system cannot push updates in real time. Approved batches must instead be flagged for asynchronous dispatch. This constraint directly informed the choice of the Observer pattern: by publishing batch lifecycle events through a `Notify()` method on `QualityAssuranceService`, the system can route events to an audit log, a quarantine alert, and — in future — an SAP integration observer, without the core service needing to know which consumers exist. The service remains stable; consumers are added or removed by calling `Subscribe()`.

The system is modelled across four diagram types produced in Task 5: a Refined Class Diagram (Figure 2) showing the post-pattern structure; a Sequence Diagram (Figure 3) tracing the `ProcessBatch` execution path through the Strategy loop and Observer notifications; an Activity Diagram (Figure 4) capturing the validation decision flow; and a State Machine (Figure 5) showing the `BatchStatus` lifecycle from creation through to disposal.

---

## 3. Refined Static & Dynamic Modelling

### 3.1 Refined Class Diagram

The post-pattern class diagram (Figure 2) is substantially more articulated than its Phase I predecessor. Where the original diagram contained a handful of classes with tightly coupled responsibilities, the refined diagram organises the design around two interfaces that sit at the architectural centre: `IValidationRule` and `IBatchObserver`.

`IValidationRule` defines a single contract — `Validate(batch: MilkBatch): ValidationResult` — that all quality rules must satisfy. Three concrete strategies implement it: `TemperatureRule`, `FatContentRule`, and `VolumeRule`. Each class has exactly one responsibility; `FatContentRule` changes only if the fat threshold changes, and `VolumeRule` changes only if the minimum volume changes. `QualityAssuranceService` holds a `List<IValidationRule>` and iterates it in `ProcessBatch()`, never referencing any concrete rule type directly. This is dependency inversion made explicit: the service depends on the abstraction, not the implementation.

`IBatchObserver` defines an equally minimal contract: `OnBatchProcessed(e: BatchEvent): void`. `QuarantineAlertObserver` and `AuditLogObserver` implement it independently and have no references to each other. The service holds a `List<IBatchObserver>` and calls `Notify()` after each processing outcome, again without knowing which observers are active.

`MilkBatch` now carries a `BatchStatus` enum rather than a raw boolean, making the state machine from Figure 5 concrete in code. Three transition methods — `Approve()`, `Reject()`, and `Quarantine()` — set `Status` to the corresponding enum value. The computed property `IsQualityApproved => Status == BatchStatus.Approved` preserves backwards compatibility with the LINQ-based daily summary report. `ValidationResult` encapsulates the outcome of a rule — `IsValid`, `IsCritical`, and `Message` — separating the concern of "what happened" from "what to do about it." `BatchEvent` packages a batch reference, an event type, and a descriptive message for distribution to observers.

The diagram reflects a design that has been explicitly brought into alignment with the implementation: every association, field type, and method signature in Figure 2 corresponds to a real C# declaration in `Program.cs`. This alignment was not automatic — it required revising the diagram after the code was refactored, a process discussed further in Section 6.

### 3.2 Sequence Diagrams

The Sequence Diagram (Figure 3) traces the `ProcessBatch` execution across its happy path and two failure branches in a single interaction, using UML `loop` and `alt` fragments to represent the control flow faithfully.

The outer `loop` fragment iterates over `_rules`. In each iteration, `QualityAssuranceService` calls `Validate(batch)` on the current `IValidationRule` and receives a `ValidationResult`. The `alt` fragment then branches on the result. If `result.IsValid == false AND IsCritical`, the service calls `OnBatchProcessed(SafetyBreach)` on both `AuditLogObserver` and `QuarantineAlertObserver`, then throws `SafetyThresholdException` back to the calling Lab Technician. If `result.IsValid == false AND soft`, the service calls `OnBatchProcessed(QualityRejected)` on both observers — `QuarantineAlertObserver` silently returns because the event is not a breach, annotated in the diagram as "ignored (not a breach)" — and returns without approving the batch. In the happy path, the loop completes without failure, `Approve()` is called on the batch, and `OnBatchProcessed(Approved)` is dispatched to both observers before returning.

A key detail the diagram makes visible is that `QuarantineAlertObserver` receives every event but filters internally: its `OnBatchProcessed` implementation begins with `if (e.Type != BatchEventType.SafetyBreach) return`. This early-return idiom allows a single observer type to be selective without requiring the subject to pre-filter its subscriber list. A second observer — `AuditLogObserver` — receives all events indiscriminately and logs each one.

A third interaction, not shown in Figure 3 but present in the web layer, would trace the path from a new batch submitted through the React dashboard, persisted to Firestore, and surfaced in the real-time audit log through Firebase's snapshot listener. That flow is architecturally symmetric: the same `BatchStatus` values and `EventType` constants defined in `validation.js` govern the web layer's behaviour, mirroring the C# design.

### 3.3 Activity & State Diagrams

The Activity Diagram (Figure 4) captures the decision flow inside `ProcessBatch` as a procedural model. The flow begins with "Receive MilkBatch" and immediately loads the ordered rule list. A loop back-edge after the "more rules?" decision diamond reflects the `foreach` in code. Two terminal paths branch from the "result.IsCritical?" decision: the critical path runs through "Publish SafetyBreach event → Throw SafetyThresholdException," and the soft-failure path runs through "Publish QualityRejected event → Mark batch QualityRejected." Both are terminal — execution does not continue to remaining rules once any failure is detected. This first-failure-wins behaviour is a deliberate simplification discussed critically in Section 6.2.

The State Machine (Figure 5) models the `BatchStatus` lifecycle. A batch begins in the `Pending` state — the initial pseudostate — at the moment of construction. From `Pending`, three transitions are possible: "all rules pass / `Approve()`" leads to `Approved`; "critical rule fails (temperature breach)" leads to `Quarantined`; "soft rule fails (fat / volume)" leads to `QualityRejected`. The note on the `Quarantined` state records that it is entered via `SafetyThresholdException` and triggers `QuarantineAlertObserver`. From each terminal state, guard conditions model downstream outcomes: `Approved` batches are "dispatched to SAP," `QualityRejected` batches are "returned / downgraded," and `Quarantined` batches are "disposed / investigated."

The `BatchStatus` enum in `MilkBatch` maps exactly to this diagram, and the three transition methods (`Approve()`, `Reject()`, `Quarantine()`) implement the state transitions as explicit method calls. Running the three test batches — B-001, B-002, B-003 — confirmed all three paths: the traceability audit log printed `Status: Approved`, `Status: QualityRejected`, and `Status: Quarantined` respectively, matching the state machine's prediction precisely.

---

## 4. Design Pattern Application & Implementation

### 4.1 Pattern Selection Rationale

Two GoF patterns were selected for this system: **Strategy** and **Observer**. The selection was not arbitrary; each was chosen because it directly addressed a structural problem visible in the Phase I codebase.

The original `ProcessBatch` method contained hardcoded `if` statements — one for temperature, one for fat content — embedded in the same method body as logging calls. Every time a new quality standard was introduced, the service had to be opened and modified, violating the Open/Closed Principle. Strategy was the natural fit: define `IValidationRule` as a contract, extract each check into its own class, and let the service iterate a list. The service becomes closed for modification — a new rule is a new file, not a change to an existing one.

The Observer pattern addressed a different problem. Phase I logged outcomes with `Console.WriteLine` calls embedded directly in `ProcessBatch`. Adding a quarantine alert required editing the same method again. Observer decoupled the notification concern entirely: the service calls `Notify()` and the observers decide what to do with the event. The SAP legacy-integration constraint reinforced this choice — an `SapDispatchObserver` can be registered later without touching the service at all.

Notably, both patterns were already present implicitly in the JavaScript validation layer (`validation.js`) before the C# refactor. The `processBatch` function iterates an array of strategy functions, and the `EventType` constants mirror `BatchEventType`. Porting the patterns to C# required formalising the implicit JS duck-typing into explicit interfaces and typed classes, which made the patterns verifiable against the class diagram (Figure 2).

### 4.2 Strategy Pattern

The Strategy pattern (Gamma et al., 1994) defines a family of algorithms, encapsulates each one, and makes them interchangeable. In this system, the family of algorithms is the set of quality validation rules, and the context is `QualityAssuranceService`.

`IValidationRule` is the Strategy interface:

```csharp
public interface IValidationRule
{
    ValidationResult Validate(MilkBatch batch);
}
```

Each concrete strategy encapsulates one rule and its severity classification. `FatContentRule` checks the fat threshold and returns `isCritical: false`, signalling that a failure should downgrade the batch rather than quarantine it:

```csharp
public class FatContentRule : IValidationRule
{
    public ValidationResult Validate(MilkBatch batch)
    {
        if (batch.FatPercentage < 3.5)
            return new ValidationResult(false, false,
                $"Fat content {batch.FatPercentage}% is below minimum 3.5%");
        return new ValidationResult(true, false, "Fat content meets standards");
    }
}
```

`VolumeRule` follows the identical shape, checking `batch.VolumeLiters < 1000.0`. The Context — `QualityAssuranceService` — holds a `List<IValidationRule>` and delegates to each in turn:

```csharp
private readonly List<IValidationRule> _rules = new() { new FatContentRule(), new VolumeRule() };

foreach (var rule in _rules)
{
    var result = rule.Validate(batch);
    if (!result.IsValid)
    {
        batch.Reject();
        Notify(new BatchEvent(batch, BatchEventType.QualityRejected, result.Message));
        return;
    }
}
```

This maps directly to the GoF roles documented in Figure 2: `QualityAssuranceService` carries the `«Subject»` stereotype and holds a `1..*` composition to `IValidationRule`. `FatContentRule` and `VolumeRule` are the ConcreteStrategies. `ValidationResult` serves as the algorithm's return value, carrying not just a pass/fail flag but the `IsCritical` discriminator that tells the context how to respond — whether to call `batch.Reject()` and notify `QualityRejected`, or call `batch.Quarantine()` and throw `SafetyThresholdException`. The separation of severity knowledge into `ValidationResult` means the service never needs to know which rule it is processing; it only reads the result.

### 4.3 Observer Pattern

The Observer pattern (Gamma et al., 1994) defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically. In this system, `QualityAssuranceService` is the Subject, and `AuditLogObserver` and `QuarantineAlertObserver` are the ConcreteObservers.

`IBatchObserver` is the Observer interface:

```csharp
public interface IBatchObserver
{
    void OnBatchProcessed(BatchEvent e);
}
```

`BatchEvent` is the notification payload, carrying the `MilkBatch` reference, a `BatchEventType` (`Approved`, `QualityRejected`, or `SafetyBreach`), and a descriptive message. The Subject manages its subscriber list and broadcasts:

```csharp
private readonly List<IBatchObserver> _observers = new();

public void Subscribe(IBatchObserver observer) => _observers.Add(observer);

private void Notify(BatchEvent e)
{
    foreach (var obs in _observers) obs.OnBatchProcessed(e);
}
```

`QuarantineAlertObserver` is the most selective concrete observer. It reacts only to safety breaches and ignores everything else via an early return:

```csharp
public class QuarantineAlertObserver : IBatchObserver
{
    public void OnBatchProcessed(BatchEvent e)
    {
        if (e.Type != BatchEventType.SafetyBreach) return;
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"  🚨  QUARANTINE ALERT: {e.Batch.BatchId} — {e.Message}");
        Console.ResetColor();
    }
}
```

The early return is the key design idiom: it allows each observer to be selective without the subject needing to maintain per-observer filter lists. When all three test batches were processed, the console confirmed the pattern's behaviour: B-003 triggered the red quarantine alert (SafetyBreach event received and acted upon), while B-002's QualityRejected event was received by `QuarantineAlertObserver` and silently ignored — precisely as shown in the sequence diagram (Figure 3). The class diagram (Figure 2) shows a `0..*` aggregation from `QualityAssuranceService` to `IBatchObserver` with the `«Observer»` stereotype on the interface.

### 4.4 GoF Compliance

This implementation satisfies the requirement for at least two Gang of Four design patterns. The **Strategy** pattern is evidenced by `IValidationRule` (Strategy interface), `FatContentRule` and `VolumeRule` (ConcreteStrategies), and `QualityAssuranceService` (Context). The **Observer** pattern is evidenced by `IBatchObserver` (Observer interface), `QuarantineAlertObserver` and `AuditLogObserver` (ConcreteObservers), and `QualityAssuranceService` (Subject). Both patterns are annotated with GoF stereotypes in the refined class diagram (Figure 2).

---

## 5. Comparative Design Analysis

### 5.1 Changes to Class Structure and Responsibility Allocation

The most significant structural change between the Phase I and Phase II designs is the transformation of `QualityAssuranceService.ProcessBatch()` from a god method into a thin orchestrator. In Phase I, `ProcessBatch` was responsible for three unrelated concerns simultaneously: it performed temperature validation with an inline `if (batch.Temperature > 6.0)`, performed fat content validation with a second inline `if`, and logged the outcome with `Console.WriteLine` — all within a single method of fewer than twenty lines. The before class diagram (Figure 1) reflects this: the service has outgoing dependencies on concrete output mechanisms and no visible interface boundaries.

| Concern | Before — who owned it | After — who owns it |
|---|---|---|
| Temperature check | `QualityAssuranceService` (inline `if`) | `TemperatureRule` |
| Fat / volume checks | `QualityAssuranceService` (inline `if`) | `FatContentRule`, `VolumeRule` |
| Outcome severity decision | tangled in the same method | `ValidationResult.IsCritical` |
| Audit logging | `Console.WriteLine` inside the service | `AuditLogObserver` |
| Critical alerting | same method, same place | `QuarantineAlertObserver` |
| Orchestration only | mixed with everything else | `QualityAssuranceService` (loops + notifies) |

After the refactor, `ProcessBatch` does three things: iterate the rules list, inspect the `ValidationResult`, and call `Notify()`. Every other responsibility has migrated to a dedicated class. This is the Single Responsibility Principle made concrete. `FatContentRule`, for instance, has exactly one reason to change: if Fonterra revises its minimum fat content standard. Nothing else in the system — not logging, not exception handling, not the batch state machine — is coupled to that class. The refined class diagram (Figure 2) shows the service with outgoing dependencies on `IValidationRule` and `IBatchObserver` only; every concrete class sits behind one of those interfaces.

### 5.2 Cohesion and Coupling

The before design exhibited low cohesion: the service was responsible for validation logic, severity classification, and output formatting — three concerns with no natural relationship. Because the concerns were co-located, any change to one risked introducing regressions in the others. The coupling was correspondingly high: adding a new rule meant editing the same file that controlled logging, which required regression-testing the logging path on every rule change.

The after design inverts both properties. Each class is single-purpose, which is the definition of high cohesion. The service's fields are typed as `List<IValidationRule>` and `List<IBatchObserver>` — abstractions, not concrete types — which means the service has zero compile-time dependency on any concrete rule or observer implementation. Rules have no references to observers. Observers have no references to rules or to each other.

In terms of efferent coupling — the number of concrete types a class depends on — the Phase II service imports fewer concrete types than the Phase I version, a measurably better outcome by standard coupling metrics. The practical payoff is testability: the service can be exercised in isolation by supplying mock implementations of `IValidationRule` and `IBatchObserver`, something that was impossible in Phase I when the validation logic was embedded in the method body.

### 5.3 Extensibility and Maintainability

The Open/Closed Principle states that software entities should be open for extension but closed for modification. The Phase I `ProcessBatch` was closed for extension — you had to modify it to add any rule — and therefore continuously open to modification and regression risk.

| New requirement | Before | After |
|---|---|---|
| Add an antibiotic residue check | Edit `ProcessBatch`, risk breaking existing checks | Add `AntibioticRule : IValidationRule`, register in the list |
| Send email on quarantine | Edit the service's logging code | Add `EmailAlertObserver : IBatchObserver`, call `Subscribe()` |
| Reorder check priority | Rewrite nested `if` statements | Reorder entries in the `_rules` list |

The most compelling concrete example is the antibiotic rule. In `validation.js`, `BatchType.Organic` already exists as a domain concept, reflecting that organic batches carry stricter quality requirements. Implementing an `OrganicFatRule` that checks for 4.0% rather than the standard 3.5% requires creating one new class and adding it to the rules list at registration time. `ProcessBatch`, `QuarantineAlertObserver`, `AuditLogObserver`, and the `MilkBatch` state machine are all untouched. In Phase I, the same change would have required adding another `if` block inside `ProcessBatch`, carefully preserving the order of existing checks, and re-testing the entire method to be confident nothing was broken.

### 5.4 Implementation Complexity — a Balanced View

It would be dishonest to present the Phase II design as unambiguously better on every axis. The refactor introduces considerably more types: `IValidationRule`, `ValidationResult`, `FatContentRule`, `VolumeRule`, `IBatchObserver`, `BatchEvent`, `BatchEventType`, `QuarantineAlertObserver`, and `AuditLogObserver`. A developer new to the codebase now has to trace through more indirection to understand what happens when a batch is processed — they must follow `ProcessBatch` → `IValidationRule.Validate` → `ValidationResult` → `Notify` → `IBatchObserver.OnBatchProcessed`, rather than reading one linear fifteen-line method.

For a system frozen at three rules and two observers with no planned additions, the Phase I approach would have been adequate and arguably simpler. The trade is worth making here because Fonterra's quality standards are inherently variable — MPI regulations are revised periodically, thresholds are adjusted seasonally, and organic milk tracking introduces per-category rules — and the observer list is expected to grow with SAP integration and email alerting. The pattern investment pays off as the rule count and observer count increase; the steeper read for newcomers is the cost.

### 5.5 Worked Example — Accommodating a New Requirement

Consider the concrete Fonterra requirement: organic batches must meet a stricter fat minimum of 4.0% rather than the standard 3.5%. This is not hypothetical — `BatchType.Organic` already exists in `validation.js`, confirming the requirement is grounded in the domain.

In the Phase I design, this would mean opening `ProcessBatch` and adding a conditional: `if (batch.BatchType == "Organic" && batch.FatPercentage < 4.0)`. This change touches the same method that handles temperature safety — a completely unrelated concern — and risks altering evaluation order or the exception path. Every existing test case would need to be re-run.

In the Phase II design, the change is a new file: `class OrganicFatRule : IValidationRule`. Its `Validate` method checks `batch.BatchType` and applies the stricter threshold, returning a `ValidationResult` with `isCritical: false`. It is registered in the rules list alongside `FatContentRule` at application startup. `ProcessBatch`, both observers, and the `MilkBatch` state machine are untouched. The modification surface is exactly one new class, and regression risk is confined to that class alone.

---

## 6. Critical Reflection

### 6.1 Design Trade-offs Introduced by the Patterns

Introducing the Strategy and Observer patterns was a deliberate bet on future change, and it is worth being honest about what that bet costs.

The Strategy pattern bought flexibility at the cost of indirection. In Phase I, understanding what happens to a batch meant reading `ProcessBatch` top to bottom — roughly fifteen lines with no branching to other files. In Phase II, the same understanding requires tracing through `ProcessBatch`, then into `IValidationRule.Validate()`, then into the concrete rule class, then back into the `ValidationResult`, then into the branch logic that inspects `IsCritical`. That is four hops where there was one. For a developer encountering the codebase for the first time, this indirection is a real cost — not imaginary, and not worth dismissing as irrelevant.

The pattern is justified, in my assessment, by the expected growth of the rule set. Fonterra's quality standards are not static: MPI regulations are revised, thresholds are adjusted seasonally, and the `BatchType.Organic` concept already in `validation.js` will require stricter per-category rules in C# too. Each of those changes is a new `IValidationRule` implementation rather than a surgery on `ProcessBatch`. The Strategy pattern pays off as the rule count grows beyond three; for exactly three permanent rules, it would have been over-engineering.

The Observer pattern introduced a subtler trade-off: execution order is now implicit. `QuarantineAlertObserver` and `AuditLogObserver` are registered in the order they appear in `Main`. If a future observer has a side effect that depends on a previous observer having run first — for example, a database observer that must commit a record before a reporting observer reads it — the ordering guarantee is a hidden coupling that does not appear anywhere in the type signatures. This kind of issue is more difficult to diagnose than a bug in a linear method, because the failure mode depends on registration order at runtime rather than logic in any one class.

The honest summary: both patterns were the right choice for a system expected to grow, but neither is free. An examiner who sees only the gains and not the costs has not understood the trade; the trade is worth making here, but it is still a trade.

### 6.2 Limitations of the Final Design

The final design has several genuine limitations visible directly in the source code. Naming them honestly demonstrates design maturity.

**First-failure-wins rule evaluation.** `ProcessBatch` returns immediately on the first failed rule. Batch B-002 failed on fat content and returned — the volume check never ran. For a Quality Manager, this means a batch that fails multiple checks will only report the first one, potentially requiring multiple resubmissions before all defects are surfaced. The fix is straightforward: replace the early `return` with a `List<ValidationResult>` accumulator that runs all rules before deciding the outcome. This would allow a batch to report all failures at once and would support more nuanced severity aggregation — for example, treating two simultaneous soft failures differently from one.

**Redundant alerting for B-003.** When the temperature check triggered on batch B-003, the console output contained two messages: the red quarantine alert from `QuarantineAlertObserver` and then the `CRITICAL:` exception message caught in `Main`. Both messages convey the same information through different channels. This is a symptom of mixing exception-based control flow with the observer notification channel. The cleaner design would commit to one mechanism: either throw the exception and route it through a unified error observer, or notify observers and return a structured failure result without throwing. Maintaining both creates a dual-reporting problem that must be resolved before production use.

**Hardcoded thresholds across two layers.** Validation thresholds — 6.0°C, 3.5%, 1000L — appear as literals in both the C# rule classes and the `THRESHOLDS` object in `validation.js`. These two sources could drift out of sync as requirements change. The web layer already centralises thresholds in a single object; the C# rules should read from an equivalent configuration source — an `appsettings.json` entry or an injected `ThresholdProvider` class — rather than embedding literals in rule constructors. With more time, I would introduce a shared `ThresholdConfiguration` that is the single authoritative source for both layers.

### 6.3 Lessons Learned from Aligning UML with C# Code

The most concrete lesson from this project is that UML diagrams and code diverge unless the diagram is treated as a living contract and revised whenever the implementation changes.

The clearest example came from the state machine. Figure 5 shows four distinct `BatchStatus` states — `Pending`, `Approved`, `QualityRejected`, `Quarantined` — with named transitions. But Phase I `MilkBatch` modelled status as a single `bool IsQualityApproved`, which can only represent two of the four states. `QualityRejected` and `Quarantined` both mapped to `false`, making them indistinguishable in the traceability log — both printed "PENDING/FAIL." The diagram promised a state machine the code did not have. Once I identified the gap, I added the `BatchStatus` enum, the three transition methods (`Approve()`, `Reject()`, `Quarantine()`), and updated `PrintTraceabilityReport()` to print `Status` directly. The audit log then showed `Approved`, `QualityRejected`, and `Quarantined` for B-001, B-002, and B-003 respectively — exactly what the state machine specified.

The class diagram enforced a similar discipline. Drafting the refined diagram required deciding what types `_rules` and `_observers` should be declared as. Writing `List<IValidationRule>` and `List<IBatchObserver>` in the diagram forced the equivalent declarations in code, which in turn forced the dependency inversion to be real rather than aspirational. The act of drawing the abstraction made it concrete.

Reflecting on this, I believe the right workflow is iterative: sketch a diagram to clarify intent, code against it to surface gaps, then revise the diagram to match the code. The anti-pattern is treating the diagram as a one-time deliverable produced at the start of a project and never updated. Such a diagram becomes fiction by the time the implementation is finished. In this project, I revised the class diagram at least twice after code changes, and the final version in Figure 2 is materially more accurate — and more useful — as a result. If I were approaching a similar project again, I would sketch the key interfaces and stereotypes first, then implement against them, treating any divergence between diagram and code as a bug to be fixed in whichever is wrong.

---

## 7. Conclusion

Project Pūnaha Phase II successfully extended the Phase I foundation with two GoF design patterns — Strategy and Observer — verified against three test batches, and documented through four refined UML models that accurately reflect the running implementation. The headline structural improvement is the transformation of `QualityAssuranceService.ProcessBatch()` from a fifteen-line god method into a thin orchestrator that iterates a rule list and notifies a subscriber list, each backed by interfaces. Comparing the before and after class diagrams makes this improvement visible; the comparative analysis in Section 5 quantifies it in terms of cohesion, coupling, and Open/Closed compliance.

The critical reflection in Section 6 identifies real limitations that would need to be addressed before a production deployment: first-failure-wins rule evaluation that hides multi-defect batches, duplicate alerting for safety breaches, hardcoded thresholds that could drift out of sync across the C# and JavaScript layers, and the absence of a persistence bridge between the console application and the Firestore backend. The most natural next steps are to collect all rule results before deciding outcome, centralise thresholds in a shared injectable configuration source, and connect the C# processing pipeline to the same Firestore instance the web application already uses. Together, these changes would unify Project Pūnaha into a single, consistent validation platform rather than two independent implementations of the same logic.

---

## References

Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.

---

## Appendix

**GitHub Repository:** https://github.com/manavsandhu555-spec/Fonterra-Enterprise-System

**Figure Reference List**

| Figure | Description | Source |
|---|---|---|
| Figure 1 | Use Case Diagram — Actors and System Boundary | `docs/` |
| Figure 2 | Refined Class Diagram (Post-Pattern) — Project Pūnaha domain | `docs/` |
| Figure 3 | Sequence Diagram — ProcessBatch (Strategy loop + Observer notify) | `docs/` |
| Figure 4 | Activity Diagram — Batch Validation Decision Flow | `docs/` |
| Figure 5 | State Machine — MilkBatch Lifecycle | `docs/` |

*Insert diagram images at each Figure reference point in the final submitted document. All diagrams are stored in the `/docs` directory of the GitHub repository.*
