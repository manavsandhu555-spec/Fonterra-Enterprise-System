# Fonterra Project Pūnaha

## Problem Statement
Fonterra’s current milk collection operations are hindered by reliance on legacy systems that lack real-time data validation and integration. This manual data handling introduces significant latency in identifying quality breaches (such as temperature threshold violations or fat content discrepancies) during the on-farm collection process.

The absence of a centralized, automated validation framework increases the risk of food safety non-compliance and logistical inefficiency. **Project Pūnaha** addresses this by providing a robust, interface-driven software solution that enforces quality standards at the point of collection, ensuring end-to-end traceability and enabling immediate decision-making for quality assurance teams.

## Overview
A digital quality assurance and traceability system designed to improve safety compliance at the farm gate.

## System Modeling
- **Use Case:** Identifies actors like Tanker Drivers and Quality Managers.
- **Class Diagram:** Defines the domain entities (MilkBatch, ITraceable).
- **Sequence Diagram:** Outlines the exception-driven validation flow.

## How to Run
1. Navigate to the `/src` folder.
2. Run `dotnet run`.
