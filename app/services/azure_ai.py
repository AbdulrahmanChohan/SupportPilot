"""
SupportPilot: Azure AI Foundry Client
Connects to gpt-5-mini via Azure OpenAI Responses API (/openai/v1/responses).
Features resilient exponential backoff retry, clean headers, and thread-safe usage tracking.
"""

from typing import Dict, Any, Optional
import time
import json
import threading
import requests

from app.core.config import settings
from app.core.logging import logger


def extract_text_from_responses_api(data: Any) -> str:
    """Extract text from Azure OpenAI Responses API output."""
    if not isinstance(data, dict):
        return ""

    # Direct convenience field
    output_text = data.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    # Responses API output array
    text_parts = []
    for item in data.get("output", []):
        if not isinstance(item, dict):
            continue

        if item.get("type") == "message":
            for block in item.get("content", []):
                if not isinstance(block, dict):
                    continue

                if block.get("type") in ("output_text", "text"):
                    text = block.get("text", "")
                    if isinstance(text, str) and text.strip():
                        text_parts.append(text.strip())

    return "\n".join(text_parts).strip()


class AzureAIClient:
    def __init__(self):
        self._lock = threading.Lock()
        self._usage_stats = {
            "successful_calls": 0,
            "failed_calls": 0,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0
        }

    def get_usage_stats(self) -> Dict[str, int]:
        with self._lock:
            return dict(self._usage_stats)

    def _record_success(self, prompt_tokens: int, completion_tokens: int, total_tokens: int) -> None:
        with self._lock:
            self._usage_stats["successful_calls"] += 1
            self._usage_stats["prompt_tokens"] += prompt_tokens
            self._usage_stats["completion_tokens"] += completion_tokens
            self._usage_stats["total_tokens"] += total_tokens

    def _record_failure(self) -> None:
        with self._lock:
            self._usage_stats["failed_calls"] += 1

    def generate_response(
        self,
        prompt: str,
        max_output_tokens: int = settings.MAX_OUTPUT_TOKENS,
        max_retries: int = 3
    ) -> str:
        """
        Executes inference call to Azure AI Foundry Responses API.
        Retries transient errors (429, 500, 502, 503, 504) with exponential backoff.
        Fails fast on 401/403 authentication issues without looping.
        """
        api_key = settings.AZURE_AI_KEY
        if not api_key:
            self._record_failure()
            raise ValueError(
                "AZURE_AI_KEY is not configured. Please set AZURE_AI_KEY in your .env file."
            )

        # Secure: Transmit only official Azure API key header (remediating dual-header issue)
        headers = {
            "api-key": api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "model": settings.AZURE_MODEL_NAME,
            "input": prompt,
            "max_output_tokens": max_output_tokens,
            "store": False
        }

        for attempt in range(max_retries):
            try:
                response = requests.post(
                    settings.AZURE_AI_ENDPOINT,
                    headers=headers,
                    json=payload,
                    timeout=(5.0, 30.0)
                )

                # Fast-fail on authentication failure
                if response.status_code in [401, 403]:
                    self._record_failure()
                    raise PermissionError(
                        f"Azure Authentication Failed (HTTP {response.status_code}). "
                        "Please verify your AZURE_AI_KEY."
                    )

                # Handle 400/422 parameter incompatibility (e.g. store parameter)
                if response.status_code in [400, 422]:
                    if "store" in payload:
                        del payload["store"]
                        continue
                    self._record_failure()
                    raise ValueError(f"Azure Invalid Request (HTTP {response.status_code}): {response.text}")

                # Retry transient server errors and rate limits
                if response.status_code in [429, 500, 502, 503, 504]:
                    wait_time = 2 ** attempt
                    logger.warning(
                        f"Azure returned HTTP {response.status_code}. "
                        f"Retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})..."
                    )
                    time.sleep(wait_time)
                    continue

                response.raise_for_status()
                data = response.json()

                # Record token metrics
                usage = data.get("usage", {})
                prompt_toks = usage.get("input_tokens") or usage.get("prompt_tokens", 0)
                comp_toks = usage.get("output_tokens") or usage.get("completion_tokens", 0)
                tot_toks = usage.get("total_tokens") or (prompt_toks + comp_toks)

                self._record_success(prompt_toks, comp_toks, tot_toks)

                text = extract_text_from_responses_api(data)
                if not text:
                    raise RuntimeError("Azure returned response, but extracted text was empty.")

                return text

            except (requests.Timeout, requests.ConnectionError) as e:
                wait_time = 2 ** attempt
                logger.warning(f"Network error communicating with Azure: {e}. Retrying in {wait_time}s...")
                time.sleep(wait_time)

        self._record_failure()
        raise RuntimeError("Azure AI Foundry call failed after maximum retries.")

    def stream_response(
        self,
        prompt: str,
        max_output_tokens: int = settings.MAX_OUTPUT_TOKENS,
    ):
        """
        Streams response from Azure OpenAI Responses API.
        Yields text deltas as received from the stream.
        """
        if not settings.is_azure_live:
            raise ValueError("Azure AI Foundry is not actively configured.")

        api_key = settings.AZURE_AI_KEY
        headers = {
            "api-key": api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "model": settings.AZURE_MODEL_NAME,
            "input": prompt,
            "max_output_tokens": max_output_tokens,
            "stream": True,
            "store": False
        }

        response = requests.post(
            settings.AZURE_AI_ENDPOINT,
            headers=headers,
            json=payload,
            stream=True,
            timeout=(5.0, 30.0)
        )

        if response.status_code != 200:
            raise RuntimeError(f"Azure streaming failed with status HTTP {response.status_code}: {response.text}")

        for line in response.iter_lines():
            if not line:
                continue
            decoded = line.decode("utf-8").strip()
            if decoded.startswith("data:"):
                data_str = decoded[5:].strip()
                if data_str == "[DONE]":
                    break
                try:
                    data = json.loads(data_str)
                    delta_text = ""
                    if "delta" in data and isinstance(data["delta"], str):
                        delta_text = data["delta"]
                    elif "output_text_delta" in data:
                        delta_text = data["output_text_delta"]
                    elif "choices" in data and len(data["choices"]) > 0:
                        delta_text = data["choices"][0].get("delta", {}).get("content", "")
                    elif "output_text" in data:
                        delta_text = data["output_text"]
                    if delta_text:
                        yield delta_text
                except Exception:
                    continue


azure_ai_client = AzureAIClient()
