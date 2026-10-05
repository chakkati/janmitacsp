import logging
import requests
from app.config import settings

logger = logging.getLogger("llm")

SYSTEM_PROMPT = (
    "You are JanMitra AI, a helpful assistant for Andhra Pradesh government welfare schemes. "
    "Answer clearly in the user's language (English or Telugu). Be concise, accurate, and polite. "
    "Do not invent scheme details. If unsure, say so and suggest checking the official portal."
)


def _groq_complete(user_prompt: str) -> str | None:
    if not settings.GROQ_API_KEY or not settings.GROQ_API_KEY.strip():
        return None

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.4,
                "max_tokens": 1024,
            },
            timeout=15,
        )
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        logger.warning("Groq API returned %s: %s", response.status_code, response.text[:200])
    except Exception as exc:
        logger.warning("Groq request failed: %s", exc)
    return None


def _ollama_complete(user_prompt: str) -> str | None:
    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat",
            json={
                "model": settings.OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "stream": False,
            },
            timeout=20,
        )
        if response.status_code == 200:
            return response.json().get("message", {}).get("content")
        logger.warning("Ollama returned %s", response.status_code)
    except Exception as exc:
        logger.warning("Ollama request failed: %s", exc)
    return None


def rule_based_response(user_prompt: str) -> tuple[str, list[dict]]:
    prompt_lower = user_prompt.lower()

    if any(k in prompt_lower for k in ("rythu", "bharosa", "farmer", "రైతు")):
        return (
            "YSR Rythu Bharosa provides ₹13,500 per year to eligible farmer families in Andhra Pradesh, "
            "paid in installments. You typically need farmer registration, income below ₹2.5 lakh, "
            "Aadhaar, income certificate, and land passbook.",
            [
                {"title": "YSR Rythu Bharosa Portal", "url": "https://ysrrythubharosa.ap.gov.in"},
                {"title": "AP Agriculture Department", "url": "https://apagrisnet.gov.in"},
            ],
        )

    if any(k in prompt_lower for k in ("vidya", "deevena", "student", "scholarship", "విద్య")):
        return (
            "Jagananna Vidya Deevena offers full fee reimbursement for eligible students in higher education. "
            "Common requirements include student status, SC/ST/OBC/EBC category, and family income up to ₹2.5 lakh.",
            [{"title": "JnanaBhumi Portal", "url": "https://jnanabhumi.ap.gov.in"}],
        )

    if any(k in prompt_lower for k in ("pension", "kanuka", "elderly", "పించన్", "పెన్షన్")):
        return (
            "YSR Pension Kanuka provides ₹3,000 monthly pension to senior citizens (60+ years), widows, and disabled individuals. "
            "Requires age >= 60 (or disability proof), annual income <= ₹1.2 lakh, and Rice Card.",
            [{"title": "AP Social Security Pensions", "url": "https://sspensions.ap.gov.in"}],
        )

    if any(k in prompt_lower for k in ("cheyutha", "women", "చేయూత", "మహిళ")):
        return (
            "YSR Cheyutha provides financial assistance of ₹18,750 per year for 4 years (total ₹75,000) "
            "to SC, ST, OBC, and Minority women aged between 45 and 60.",
            [{"title": "AP Government Portal", "url": "https://ap.gov.in"}],
        )

    if any(k in prompt_lower for k in ("aarogya", "health", "insurance", "ఆరోగ్యశ్రీ")):
        return (
            "YSR Aarogyasri provides universal healthcare coverage with free cashless treatment up to ₹5 Lakhs per year "
            "for eligible families with annual income up to ₹5 Lakhs.",
            [{"title": "YSR Aarogyasri Health Care Trust", "url": "https://aarogyasri.ap.gov.in"}],
        )

    if any(k in prompt_lower for k in ("amma", "vodi", "mother", "అమ్మ ఒడి")):
        return (
            "Jagananna Amma Vodi provides ₹15,000 annual financial aid directly to mothers who send their children to school (Class 1-12). "
            "Family annual income limit is ₹2.5 Lakhs.",
            [{"title": "JnanaBhumi Portal", "url": "https://jnanabhumi.ap.gov.in"}],
        )

    if any(k in prompt_lower for k in ("eligib", "qualify", "అర్హ")):
        return (
            "Open your Profile, enter accurate details, then check Discover Schemes. "
            "JanMitra runs each scheme's rules against your profile and shows pass/fail for every criterion.",
            [{"title": "AP Official Portal", "url": "https://www.ap.gov.in"}],
        )

    return (
        "I can help with Andhra Pradesh welfare schemes such as YSR Rythu Bharosa, Jagananna Vidya Deevena, "
        "YSR Pension Kanuka, YSR Cheyutha, YSR Aarogyasri, and Jagananna Amma Vodi. Ask about eligibility, documents, or benefits — in English or Telugu.",
        [{"title": "AP Official Portal", "url": "https://www.ap.gov.in"}],
    )


def generate_chat_response(user_prompt: str) -> tuple[str, list[dict], str]:
    """Returns (content, sources, engine_used)."""
    groq = _groq_complete(user_prompt)
    if groq:
        return groq, [{"title": "AP Government Portal", "url": "https://www.ap.gov.in"}], "groq"

    ollama = _ollama_complete(user_prompt)
    if ollama:
        return ollama, [{"title": "AP Government Portal", "url": "https://www.ap.gov.in"}], "ollama"

    content, sources = rule_based_response(user_prompt)
    return content, sources, "rules"
