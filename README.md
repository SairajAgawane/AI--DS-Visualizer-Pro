<div align="center">

# 🧠 AI-DS Visualizer Pro

**Next-Generation Algorithmic Thinking Platform powered by Interactive Visual State Machines & AI Copilot**

[![Live Application](https://img.shields.io/badge/Production-Live%20Demo-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-ds-visualizer-pro.vercel.app/dashboard)
[![GitHub Repository](https://img.shields.io/badge/Repository-SairajAgawane%2FAI--DS--Visualizer--Pro-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SairajAgawane/AI--DS-Visualizer-Pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-F5A623?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-2EA44F?style=for-the-badge)]()
[![Node Version](https://img.shields.io/badge/Node.js-%E2%89%A518.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)]()

<br />

[Explore Dashboard](https://ai-ds-visualizer-pro.vercel.app/dashboard) • [Report a Bug](#-bug-reporting--issue-lifecycle) • [Architecture](#-system-architecture--state-synchronization) • [Run Locally](#-quick-start--local-development)

</div>

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [Key Architectural Features](#-key-architectural-features)
- [Core Data Structures & Algorithmic Modules](#-core-data-structures--algorithmic-modules)
- [AI Student Copilot (Gemini API Integration)](#-ai-student-copilot-gemini-api-integration)
- [Technology Stack](#-technology-stack)
- [System Architecture & State Synchronization](#-system-architecture--state-synchronization)
- [Project Directory Layout](#-project-directory-layout)
- [Quick Start & Local Development](#-quick-start--local-development)
- [Environment Configuration & Secrets](#-environment-configuration--secrets)
- [Production Build & Deployment](#-production-build--deployment)
- [Bug Reporting & Issue Lifecycle](#-bug-reporting--issue-lifecycle)
- [Troubleshooting & Common Failure Modes](#-troubleshooting--common-failure-modes)
- [Security Posture](#-security-posture)
- [Roadmap & Planned Capabilities](#-roadmap--planned-capabilities)
- [Contribution Guidelines](#-contribution-guidelines)
- [License & Author](#-license--author)

---

## 📌 Executive Summary

**AI-DS Visualizer Pro** is an open-source technical education platform engineered to eliminate the abstraction barrier when mastering Data Structures and Algorithms (DSA).

Computer science students frequently struggle to mentally map pointer shifts, recursion frames, graph traversal orderings, and dynamic array reallocation. Traditional static debuggers display memory addresses rather than conceptual topologies. **AI-DS Visualizer Pro** couples a modular visualization engine with an in-context **AI Student Copilot**, transforming abstract code structures into dynamic, controllable visual state transitions with line-by-line semantic explanations.

---

## ⚡ Key Architectural Features

- **Deterministic Step-Through Engine:** Granular control over execution flows, including play, pause, step forward, step backward, and speed modulation (`0.25x` to `4x`).
- **Context-Aware AI Copilot:** Connected to Google Gemini, evaluating code blocks, explaining state changes, and providing real-time computational complexity breakdowns.
- **Dynamic Structural Rendering:** Custom-rendered SVG and HTML5 Canvas layouts for tree balancing, graph relaxations, and linked pointers.
- **Polyglot Code Reference Engine:** View equivalent implementations and standard library idioms across **C++**, **Java**, **Python**, and **JavaScript**.
- **Resilient Client-Side Execution:** Zero server execution overhead for visualizations; state mutations run locally inside the client runtime.

---

## 📊 Core Data Structures & Algorithmic Modules

### 1. Linear Data Structures
- **Arrays & Dynamic Slices:** Index lookup, linear scanning, in-place rotation, dynamic capacity expansion.
- **Stacks & Queues:** LIFO/FIFO mechanics, array-backed vs. pointer-backed stores, circular queue modulo boundaries.
- **Singly & Doubly Linked Lists:** Head/tail pointer tracking, node insertions, reversals, cycle detection (Floyd's algorithm).

### 2. Hierarchical Trees & Heaps
- **Binary Search Trees (BST):** In-order, pre-order, post-order, and level-order traversals, node deletion with successor substitution.
- **Binary Heaps:** Min-Heap/Max-Heap array representation, percolate-up (heapify-up) and percolate-down (heapify-down) routines.

### 3. Graphs
- **Graph Representations:** Adjacency List and Adjacency Matrix dynamic toggling.
- **Traversal & Shortest Path:** Breadth-First Search (BFS queue), Depth-First Search (DFS recursion stack), Dijkstra’s shortest path edge relaxations.

### 4. Sorting & Searching
- **Comparison Sorts:** Bubble Sort, Selection Sort, Insertion Sort, Quick Sort (pivot partitioning), Merge Sort (auxiliary array merges).
- **Searching Algorithms:** Linear Search ($\mathcal{O}(n)$) vs. Binary Search ($\mathcal{O}(\log n)$) on sorted contiguous blocks.

---

## 🤖 AI Student Copilot (Gemini API Integration)
