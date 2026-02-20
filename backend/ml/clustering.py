"""
K-Means clustering to assign students to performance clusters:
  Cluster 0 → Beginner
  Cluster 1 → Intermediate
  Cluster 2 → Advanced
Features used: avg_score, total_attempts, avg_time (normalised)
"""
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import List, Dict

# Map cluster center rank → readable label
LEVEL_LABELS = ["Beginner", "Intermediate", "Advanced"]


def _rank_clusters(kmeans: KMeans, scaler: StandardScaler) -> Dict[int, str]:
    """Rank clusters by their avg_score centroid (ascending) → assign labels."""
    centres = scaler.inverse_transform(kmeans.cluster_centers_)
    # centres[:,0] = avg_score column
    order = np.argsort(centres[:, 0])  # ascending by avg score
    mapping = {}
    for rank, cluster_idx in enumerate(order):
        mapping[int(cluster_idx)] = LEVEL_LABELS[rank]
    return mapping


def get_student_level(avg_score: float, total_attempts: int, avg_time: float) -> str:
    """
    Return student level using heuristic clustering.
    If we have only one student we fall back to rule-based thresholds
    (K-Means needs ≥3 samples).
    """
    if avg_score < 40:
        return "Beginner"
    elif avg_score < 70:
        return "Intermediate"
    else:
        return "Advanced"


def cluster_students(student_stats: List[Dict]) -> Dict[int, str]:
    """
    Cluster a list of student stat dicts and return {student_id: level}.
    Each dict must have keys: student_id, avg_score, total_attempts, avg_time.
    Returns rule-based results if fewer than 3 students.
    """
    if len(student_stats) < 3:
        return {
            s["student_id"]: get_student_level(
                s["avg_score"], s["total_attempts"], s.get("avg_time", 60)
            )
            for s in student_stats
        }

    X = np.array([
        [s["avg_score"], s["total_attempts"], s.get("avg_time", 60)]
        for s in student_stats
    ], dtype=float)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    n_clusters = min(3, len(student_stats))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    labels = kmeans.fit_predict(X_scaled)

    cluster_label_map = _rank_clusters(kmeans, scaler)

    result = {}
    for i, s in enumerate(student_stats):
        cluster = int(labels[i])
        result[s["student_id"]] = cluster_label_map[cluster]
    return result
