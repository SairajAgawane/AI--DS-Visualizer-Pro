from __future__ import annotations

import os

from fastapi import APIRouter

from app.ai.schemas import ChatRequest

router = APIRouter()

SYSTEM_PROMPT = (
    "You are AI Student Copilot, an intelligent programming tutor integrated into AI-DS Visualizer Pro.\n"
    "Answer the user's actual question directly and accurately.\n"
    "Understand the context before responding.\n"
    "Support programming, Data Structures, Algorithms, Python, C, C++, Java, SQL, DBMS, AI, Machine Learning, mathematics, and Computer Science.\n"
    "Explain complex concepts in simple language.\n"
    "Provide practical examples and correct code.\n"
    "When debugging, identify the actual error and explain how to fix it.\n"
    "When explaining algorithms, include step-by-step working and time and space complexity.\n"
    "Use the conversation history when relevant.\n"
    "Do not respond with generic greetings to technical questions.\n"
    "Do not repeat the same answer for unrelated questions.\n"
    "Do not invent facts or claim code was executed without an actual execution result.\n"
    "If a question is unclear, ask a relevant clarification.\n"
    "Always prioritize answering the user's actual question."
)

KNOWLEDGE = {
    "array": "An array is a linear data structure that stores elements in contiguous memory locations. Access is O(1) by index; insertion and deletion are O(n) due to shifting.",
    "stack": "A stack is LIFO: the last item pushed is the first item popped. Push, pop, and peek are O(1).",
    "queue": "A queue is FIFO: the first item enqueued is the first item dequeued. Enqueue and front are O(1); this implementation uses a list, so dequeue is O(n).",
    "linked_list": "A singly linked list stores nodes connected by next pointers. Inserting at the head is O(1); searching and reversing are O(n).",
    "bst": "A binary search tree keeps smaller keys on the left and larger keys on the right. Search is O(log n) on average and O(n) in the worst case.",
    "heap": "A min-heap keeps its smallest item at the root. Peek is O(1), while insert and extract are O(log n).",
    "graph": "A graph models vertices and edges. BFS and DFS visit reachable vertices in O(V + E).",
    "hash_table": "A hash table maps keys to values using a hash function. Average lookup, insert, and delete are O(1); worst case O(n).",
    "searching": "Linear search scans elements one by one in O(n). Binary search requires sorted data and runs in O(log n).",
    "sorting": "Common sorts: Bubble/Selection/Insertion O(n^2); Merge/Heap O(n log n); Quick O(n log n) average.",
    "recursion": "Recursion solves a problem by calling itself on smaller subproblems, with a base case to stop. Each call uses stack space.",
}


def local_answer(request: ChatRequest) -> str:
    message = request.message.strip()
    low = message.lower()
    topic = (request.context_ds or "").lower()

    # Greetings
    if low in ("hi", "hello", "hey", "hola", "greetings"):
        return "Hello! I am your AI Student Copilot. I can help you with Data Structures, Algorithms, programming, and general computer science questions. How can I assist you today?"

    # Name introduction
    if "my name is" in low or "i am " in low or "i'm " in low:
        name = message.split()[-1].rstrip(".!,")
        return f"Nice to meet you, {name}! I am your AI Student Copilot. I can help you with Data Structures, Algorithms, programming, and general computer science questions. What would you like to learn?"

    # Thank you
    if "thank" in low:
        return "You're welcome! Happy to help. Feel free to ask more questions anytime."

    # DSA-specific knowledge
    if "difference" in low and "bfs" in low and "dfs" in low:
        return "BFS explores level by level using a queue; DFS explores deeply using recursion or a stack. Both run in O(V + E) with an adjacency list."
    if "why" in low and "pop" in low and "stack" in low:
        return "Stack pop removes the last list item, so it does not scan other elements and runs in O(1)."

    # Topic knowledge lookup (works for any context, including dashboard)
    base = KNOWLEDGE.get(topic, "")
    if ("explain" in low or "what is" in low or "how" in low or "define" in low) and base:
        return base

    # Code requests
    if "code" in low or "program" in low or "implement" in low:
        lang = "Python"
        if "c++" in low or "cpp" in low:
            lang = "C++"
        elif " c " in low or low.endswith(" in c") or " in c" in low:
            lang = "C"
        elif "java" in low:
            lang = "Java"
        return f"I can help you write {lang} code for {topic if topic and topic != 'dashboard' else 'your topic'}. Please specify the exact problem or algorithm, and I will generate a complete, well-commented solution with an explanation."

    # Generic helpful fallback (never the old dashboard fallback)
    if topic and topic != "dashboard" and topic in KNOWLEDGE:
        return KNOWLEDGE[topic]
    return (
        f"You asked: \"{message}\". I am your AI Student Copilot and I can help with Data Structures, Algorithms, "
        "programming in C/C++/Java/Python, complexity analysis, and debugging. "
        "For deeper, ChatGPT-like answers, configure a GEMINI_API_KEY in your backend .env and Vercel environment variables."
    )


def _gemini_answer(request: ChatRequest) -> tuple[str, str] | None:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model = os.getenv("GEMINI_MODEL", "").strip() or "gemini-2.0-flash"
    if not api_key:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        context = f"Current topic context: {request.context_ds}\nVisible state: {request.context_state!r}\nComplexity: {request.complexity}"
        contents = []
        if request.history:
            for h in request.history:
                role = h.get("role", "user")
                text = h.get("text", "")
                if text:
                    contents.append({"role": "user" if role == "user" else "model", "parts": [{"text": text}]})
        contents.append({"role": "user", "parts": [{"text": request.message}]})
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config={"system_instruction": SYSTEM_PROMPT + "\n\n" + context},
        )
        text = getattr(response, "text", None)
        if text:
            return text.strip(), f"gemini:{model}"
    except Exception as exc:
        return None
    return None


@router.post("/")
async def chat(request: ChatRequest):
    gemini = _gemini_answer(request)
    if gemini is not None:
        text, provider = gemini
        return {"response": text, "provider": provider}
    # Fall back to local tutor if no Gemini key or request failed
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    ai_provider = os.getenv("AI_PROVIDER", "").strip().lower()
    if (ai_provider in ("gemini", "google", "google-genai") or os.getenv("GEMINI_MODEL")) and not api_key:
        return {
            "response": "Gemini API is configured as the provider, but GEMINI_API_KEY is missing. Add it to backend/.env and redeploy.",
            "provider": "unconfigured",
        }
    return {"response": local_answer(request), "provider": "local"}
