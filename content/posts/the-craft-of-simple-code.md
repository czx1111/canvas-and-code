---
slug: the-craft-of-simple-code
title: "The Craft of Simple Code"
titleZh: "简洁代码的工艺"
excerpt: "Why the best code is not clever code, and how to resist the temptation to over-engineer everything you build."
excerptZh: "为什么最好的代码不是聪明的代码，以及如何抵制过度工程化你所构建的一切的诱惑。"
category: Thoughts
date: 2026-07-23
readTime: 5 min
coverImage: ""
featured: false
---

## The Seduction of Cleverness

Every developer goes through a phase where they think good code is *clever* code. Abstract factories, deep inheritance hierarchies, metaprogramming, configuration layers on top of configuration layers.

This phase usually lasts about three years. Then something breaks, and you spend a week debugging it, and you realize that *cleverness is a liability*.

## Simple > Clever

The best code I have ever read was boring. It was a sequence of straightforward steps, each one obvious, each one readable in isolation. No surprises. No "aha" moments. Just... clear.

Here is a test: if a junior developer cannot understand your code without asking you a question, it is too clever.

## Three Principles

### 1. Flat is Better Than Nested

```python
# Bad: five levels of nesting
def process(data):
    if data:
        for item in data:
            if item.active:
                if item.type == "A":
                    # ... do something

# Better: flat, early returns
def process(data):
    if not data:
        return
    for item in data:
        if not item.active:
            continue
        if item.type == "A":
            # ... do something
```

### 2. Explicit is Better Than Implicit

Magic is great in novels. In code, it is terrifying. When you read a line of code, you should know exactly what it does without consulting three other files.

### 3. Deletion is the Best Refactoring

The best optimization is deleting code you do not need. Every line of code is a line that must be maintained, understood, and eventually replaced. The fewer lines, the better.

## The Real Complexity

The point is not that code should be simplistic. Real problems have real complexity. The point is that we should *put our complexity budget where it matters* — in the problem domain, not in the plumbing.

A blog does not need a plugin system. A todo app does not need a microservices architecture. A landing page does not need a state management library.

> Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.

## Conclusion

Simple code is harder to write than clever code. It requires you to understand the problem deeply, to resist the urge to generalize prematurely, and to trust that straightforward solutions are sufficient.

But it is worth it. Because six months from now, when you come back to that code, you will thank yourself.

---

*Simplicity is the ultimate sophistication.*
