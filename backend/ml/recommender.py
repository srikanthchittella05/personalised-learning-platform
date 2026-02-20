"""
Recommendation engine: picks the best topic to recommend
based on student's weakest subject and current cluster level.
"""
from typing import List, Dict, Optional
from ml.clustering import get_student_level
from ml.difficulty import get_difficulty_adjustment


def generate_recommendation(
    student_id: int,
    attempts_data: List[Dict],
    all_topics: List[Dict],
) -> Dict:
    """
    Generate a recommendation for a student.

    attempts_data: list of dicts with keys:
        topic_id, topic_name, avg_score, attempt_count
    all_topics: list of dicts with keys:
        id, name

    Returns dict with: student_id, current_level, recommended_topic_id,
                       recommended_topic, difficulty_adjustment, reasoning
    """
    if not attempts_data:
        # Cold start – recommend first topic
        first_topic = all_topics[0] if all_topics else {"id": 1, "name": "Introduction"}
        return {
            "student_id": student_id,
            "current_level": "Beginner",
            "recommended_topic_id": first_topic["id"],
            "recommended_topic": first_topic["name"],
            "difficulty_adjustment": "Maintain",
            "reasoning": "No prior attempts found. Starting with the first available topic.",
        }

    total_score = sum(a["avg_score"] * a["attempt_count"] for a in attempts_data)
    total_attempts = sum(a["attempt_count"] for a in attempts_data)
    overall_avg = total_score / total_attempts if total_attempts > 0 else 0

    current_level = get_student_level(overall_avg, total_attempts, 60)
    difficulty_adjustment = get_difficulty_adjustment(overall_avg)

    # Find weakest topic (lowest avg_score)
    attempted_ids = {a["topic_id"] for a in attempts_data}
    sorted_by_score = sorted(attempts_data, key=lambda x: x["avg_score"])
    weakest = sorted_by_score[0]

    # Prefer an unattempted topic if student is doing well
    recommended_topic_id = weakest["topic_id"]
    recommended_topic_name = weakest["topic_name"]
    reasoning_parts = [
        f"Overall average score: {overall_avg:.1f}%.",
        f"Current level determined as {current_level}.",
    ]

    if difficulty_adjustment == "Increase":
        # Find a topic not yet attempted
        unattempted = [t for t in all_topics if t["id"] not in attempted_ids]
        if unattempted:
            recommended_topic_id = unattempted[0]["id"]
            recommended_topic_name = unattempted[0]["name"]
            reasoning_parts.append(
                f"You are performing well! Exploring new topic: {recommended_topic_name}."
            )
        else:
            reasoning_parts.append(
                f"All topics attempted. Revisiting strongest improvement area: {recommended_topic_name}."
            )
    else:
        reasoning_parts.append(
            f"Weakest topic '{weakest['topic_name']}' scored {weakest['avg_score']:.1f}%."
            " Recommended for improvement."
        )

    reasoning_parts.append(f"Difficulty adjustment: {difficulty_adjustment}.")

    return {
        "student_id": student_id,
        "current_level": current_level,
        "recommended_topic_id": recommended_topic_id,
        "recommended_topic": recommended_topic_name,
        "difficulty_adjustment": difficulty_adjustment,
        "reasoning": " ".join(reasoning_parts),
    }
