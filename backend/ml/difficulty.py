"""
Difficulty adjustment logic based on student performance.
"""


def get_difficulty_adjustment(avg_score: float) -> str:
    """
    Returns difficulty adjustment recommendation.
    avg_score: 0-100 percentage
    """
    if avg_score < 40:
        return "Decrease"
    elif avg_score >= 70:
        return "Increase"
    else:
        return "Maintain"


def get_next_difficulty(current_difficulty: str, adjustment: str) -> str:
    """Given current difficulty and adjustment, return next difficulty level."""
    levels = ["Beginner", "Intermediate", "Advanced"]
    idx = levels.index(current_difficulty) if current_difficulty in levels else 1

    if adjustment == "Increase" and idx < 2:
        return levels[idx + 1]
    elif adjustment == "Decrease" and idx > 0:
        return levels[idx - 1]
    return current_difficulty
