from __future__ import annotations

import os

from fastapi import APIRouter

from app.ai.schemas import ChatRequest

router = APIRouter()

KNOWLEDGE = {
    "stack": "A stack is LIFO: the last item pushed is the first item popped. Push, pop, and peek are O(1).",
    "queue": "A queue is FIFO: the first item enqueued is the first item dequeued. Enqueue and front are O(1); this implementation uses a list, so dequeue is O(n).",
    "linked_list": "A singly linked list stores nodes connected by next pointers. Inserting at the head is O(1); searching and reversing are O(n).",
    "bst": "A binary search tree keeps smaller keys on the left and larger keys on the right. Search is O(log n) on average and O(n) in the worst case.",
    "heap": "A min-heap keeps its smallest item at the root. Peek is O(1), while insert and extract are O(log n).",
    "graph": "A graph models vertices and edges. BFS and DFS visit reachable vertices in O(V + E).",
}


def local_answer(request: ChatRequest) -> str:
    message = request.message.lower()
    topic = request.context_ds.lower()
    if "difference" in message and "bfs" in message and "dfs" in message:
        return "BFS explores level by level using a queue; DFS explores deeply using recursion or a stack. Both run in O(V + E) with an adjacency list."
    if "why" in message and "pop" in message and "stack" in message:
        return "Stack pop removes the last list item, so it does not scan other elements and runs in O(1)."
    if "explain" in message or "what is" in message or "how" in message:
        return KNOWLEDGE.get(topic, "Select a data structure and ask me about its operations, invariants, or complexity.")
    return f"For the current {topic}, the visible state is {request.context_state!r}. Ask about its operations, complexity, or the current visualization."


def _external_answer(request: ChatRequest) -> tuple[str, str] | None:
    provider = os.getenv("AI_PROVIDER", "local").lower()
    api_key = os.getenv("AI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    if provider == "local" or not api_key:
        return None
    if provider not in {"google", "gemini", "google-genai"}:
        return None
    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        model_name = model or "gemini-2.0-flash"
        prompt = (
            "You are an educational DSA tutor. Answer concisely and accurately.\n"
            f"Topic: {request.context_ds}\n"
            f"Complexity: {request.complexity}\n"
            f"Visible state: {request.context_state!r}\n"
            f"Question: {request.message}"
        )
        response = client.models.generate_content(model=model_name, contents=prompt)
        text = getattr(response, "text", None)
        if text:
            return text.strip(), f"google-genai:{model_name}"
    except Exception:
        return None
    return None


@router.post("/")
async def chat(request: ChatRequest):
    external = _external_answer(request)
    if external is not None:
        text, provider = external
        return {"response": text, "provider": provider}
    provider = os.getenv("AI_PROVIDER", "local").lower()
    api_key = os.getenv("AI_API_KEY", "").strip()
    if provider != "local" and not api_key:
        return {
            "response": "External AI is configured as the provider, but AI_API_KEY is missing. Add it to backend/.env or use AI_PROVIDER=local.",
            "provider": "unconfigured",
        }
    return {"response": local_answer(request), "provider": "local"}
