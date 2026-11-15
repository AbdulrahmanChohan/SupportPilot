"""
SupportPilot: Azure Responses API Parser Unit Tests
Validates parsing across Azure Responses API payload schema variants.
"""

from app.services.azure_ai import extract_text_from_responses_api


def test_parse_direct_output_text():
    payload = {
        "id": "resp-001",
        "output_text": "Standard shipping takes 3 to 5 business days."
    }
    result = extract_text_from_responses_api(payload)
    assert result == "Standard shipping takes 3 to 5 business days."


def test_parse_nested_output_structure():
    payload = {
        "output": [
            {
                "type": "message",
                "content": [
                    {
                        "type": "output_text",
                        "text": "Refunds are processed within 5 to 7 business days."
                    }
                ]
            }
        ]
    }
    result = extract_text_from_responses_api(payload)
    assert result == "Refunds are processed within 5 to 7 business days."


def test_parse_empty_payload():
    assert extract_text_from_responses_api({}) == ""
    assert extract_text_from_responses_api(None) == ""
    assert extract_text_from_responses_api([]) == ""


def test_parse_multi_block_content():
    payload = {
        "output": [
            {
                "type": "message",
                "content": [
                    {"type": "text", "text": "First paragraph."},
                    {"type": "output_text", "text": "Second paragraph."}
                ]
            }
        ]
    }
    result = extract_text_from_responses_api(payload)
    assert "First paragraph." in result
    assert "Second paragraph." in result
