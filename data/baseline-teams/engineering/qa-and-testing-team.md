---
team_id: qa-and-testing-team
name: QA & Testing Team
team_type: support-team
position:
  x: 175.0
  y: 410.0
metadata:
  size: 5
  department: Engineering
  line_manager: Lisa Anderson
  established: 2018-11
  cognitive_load: high
---

# QA & Testing Team

Verifies system integration and quality across all development teams in LogiCore's logistics platform.

## Responsibilities

**Cross-Team Testing**:
- End-to-end integration testing (dispatcher → driver → customer workflows)
- System integration verification across backend, web, mobile
- Regression testing after each team's deployments
- Performance and load testing for route optimization algorithms
- Mobile device testing (50+ device models, iOS and Android)

**Test Infrastructure**:
- Automated test suite development and maintenance
- Test environment management (staging, QA, pre-prod)
- Test data management and fixture creation
- Defect tracking and reporting

## Technologies
- **Functional**: Selenium, Cypress, Postman, Playwright
- **Performance**: K6, JMeter
- **Mobile**: Appium, physical device lab
- **Test Management**: TestRail, Jira
- **Automation**: Python, TypeScript
- **CI/CD**: Jenkins, GitHub Actions

## Team Structure
- 1 QA Lead
- 2 QA Engineers (web and backend testing)
- 1 Mobile QA Engineer (iOS and Android devices)
- 1 Test Automation Engineer (framework maintenance)

## Current Challenges

**Handoff Bottleneck Anti-Pattern**:
- Development teams "throw code over the wall" to QA
- Testing happens AFTER development is "done" (delays releases by 1-2 weeks)
- Developers don't write tests - QA responsible for all quality
- Defects discovered late, requiring rework and re-testing cycles

**Shared Service Bottleneck**:
- Single QA team for 4 development teams (Backend, Web, Mobile, Route Optimization)
- Cannot keep up with testing demand - always backlog of 10-15 pending test requests
- Mobile releases delayed waiting for device testing (only 1 mobile QA engineer)
- Performance testing requires scheduling 2 weeks in advance (shared test environment)

**Cognitive Overload**:
- Must understand business logic of ALL product areas (B2B dispatch tools, B2C customer apps, routing algorithms)
- Context switching between backend APIs, web UIs, mobile apps daily
- Responsible for too many domains: fleet management, route optimization, driver workflows, customer tracking
- Cannot be experts in everything - testing becomes superficial

**Coordination Overhead**:
- Weekly "Test Planning" meeting with all 4 dev teams (2 hours, 15+ people)
- Daily "Defect Triage" meeting (45 minutes) to prioritize bug fixes
- Constant Slack interruptions: "When will my feature be tested?"
- Deployment delays: QA must approve EVERY release (3-5 day turnaround)

**Unclear Boundaries**:
- Confusion over who writes automated tests (QA vs dev teams)
- Mobile App Team has 1 QA engineer - duplicate role with QA & Testing Team
- Backend Services Team has some unit tests but no E2E tests
- No clear test ownership or quality standards

## Dependencies
- Backend Services Team
- Web Frontend Team
- Mobile App Team
- Route Optimization Team
- DevOps and Infrastructure Team

## Test Coverage Issues
- Unit test coverage: ~35% (low, inconsistent across teams)
- Integration tests: Manual, time-consuming
- E2E tests: Brittle, break frequently, slow (45 minutes to run)
- Mobile tests: Mostly manual due to device fragmentation

## Transformation Opportunities

**In TT-Design, eliminate separate QA team**:
- Embed QA engineers into stream-aligned teams (quality is team responsibility)
- Developers write automated tests as part of definition of done
- Team-owned quality: each team responsible for their own testing
- QA engineers become quality coaches (enabling team role)
- Shift-left testing: catch defects during development, not after
- Eliminate handoff delays and bottlenecks