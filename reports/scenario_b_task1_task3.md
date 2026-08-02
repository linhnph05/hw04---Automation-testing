# HW03 Report: Scenario B

**Test date:** 02 August 2026  
**System:** `https://prod-dev.ems-fitus.cloud`  
**Account:** `nphlinh23@clc.fitus.edu.vn`  
**Screens:** B1 Events listing, B2 Event detail, B3 Registration roles. These are the normal path from finding an event to registering.

## Task 1: GUI Checklist

The supplied shared checklist has 66 items: 14 general UI, 21 form, 16 navigation, and 15 feedback/state items. It was used on all three screens. Items about admin-only event editing, uploads, rich text, drafts, and admin tables are **not applicable** to this public participant flow; they were not counted as failures.

| Screen | Applicable checks passed | Failed | Not applicable |
|---|---:|---:|---:|
| B1 Events listing | 22 | 1 | 43 |
| B2 Event detail | 20 | 0 | 46 |
| B3 Registration roles | 18 | 1 | 47 |

The tested behaviours included event search with `test`, category/status controls, navigation from B1 to B2, the Back button, role selection, disabled submit without a role, registration, and the resulting `Pending review` state. The registration was made on event 68 and is now pending review.

### Confirmed Defects

| ID | Screen | Steps | Expected / actual | Severity | Evidence |
|---|---|---|---|---:|---|
| GUI-01 | B1 | Open Events listing. Inspect the search field. | A visible label should remain after text is entered. The field only has placeholder text. | 2 | [B1 Windows Chrome](../evidence/task3/b1_win_chrome.png) |
| GUI-02 | B3 | Open event 68 in English. Scroll to Registration roles. | User-interface labels should match English. The role remains `Giảng Viên`. | 2 | [B3 Windows Chrome](../evidence/task3/b3_win_chrome.png) |

Severity 2 means a clear usability problem that has a simple workaround.

### Checklist Sources and AI Record

The checklist file was supplied as `01_shared_gui_checklist.csv`. It covers the four required interface aspects. Its source record was not supplied, so this report does not invent a group prompt history or human-added-item history.

Sources used to interpret and execute the checklist:

- Nielsen, *10 Usability Heuristics for User Interface Design*.
- Norman, *The Design of Everyday Things*.
- Shneiderman, *Eight Golden Rules of Interface Design*.
- ISTQB Foundation Level Syllabus.
- HW03 brief, sections 4-6 and 17.

AI used in this execution: Codex on 02 August 2026. Prompt summary: execute Task 1 and Task 3, Scenario B, against EMS; use BrowserStack; create concise reports and Git commits; use only `test...` test text. Output: test plan, browser automation runner, live observations, evidence, and this report.

## Task 3: Cross-Browser and Cross-Platform

BrowserStack Automate produced the following real screenshots. Every listed screenshot contains the EMS URL, the signed-in student email, and the tested browser/OS/device label.

| Screen | OS | Browser | Device class | Result | Evidence |
|---|---|---|---|---|---|
| B1 | Windows 11 | Chrome | Desktop | Pass | [PNG](../evidence/task3/b1_win_chrome.png) |
| B1 | Windows 11 | Edge | Desktop | Pass | [PNG](../evidence/task3/b1_win_edge.png) |
| B1 | macOS Sonoma | Firefox | Desktop | Pass | [PNG](../evidence/task3/b1_mac_firefox.png) |
| B1 | iOS 15 | Safari | iPad tablet | Pass | [PNG](../evidence/task3/b1_ipad_safari.png) |
| B2 | Windows 11 | Chrome | Desktop | Pass | [PNG](../evidence/task3/b2_win_chrome.png) |
| B3 | Windows 11 | Chrome | Desktop | Pass | [PNG](../evidence/task3/b3_win_chrome.png) |

No layout overlap, horizontal page overflow, unreadable control, or non-responsive control was found in the completed cells.

### Coverage Limitation

This BrowserStack trial rejected Opera as `Browser not permitted` and did not return usable Android/Samsung Internet or iPhone WebDriver sessions. Therefore this run **does not yet meet** the mandatory Task 3 coverage for every screen: B2 and B3 need macOS and iOS runs; all screens need phone coverage and a fifth distinct browser. This limitation is stated to avoid reporting unexecuted cells as passes.

## Recommended Fixes

1. Add a visible `Search events` label; keep the placeholder as an example only.
2. Add `lecturer` to the English translation file and apply it to registration-role data.
3. Re-run the missing BrowserStack cells using an account that permits Opera or Samsung Internet and a real phone session.

## AI Critique

AI helped organise the checklist and automate repeated BrowserStack work, but it could not decide whether an item applied to a public screen from the checklist text alone. The supplied checklist contains many admin-only items, such as image upload, draft saving, rich-text editing, and event-table actions. Marking these as failed on a participant page would be wrong. The useful rule is to first identify the user role and screen purpose, then apply only relevant checks. AI also could not make BrowserStack support a browser that the account did not permit. It initially suggested an Opera cell, but BrowserStack rejected it. The correct response was to record the failed setup, not change the result to Pass. Finally, UI testing needs visual review. The automation could show that a page loaded, but the untranslated `Giảng Viên` label was found by looking at the page in its English state. This shows that AI is useful for repeatable actions and structured notes, while a tester must still check scope, real evidence, and whether the result is meaningful.
