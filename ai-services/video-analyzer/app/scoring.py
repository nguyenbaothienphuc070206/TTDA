from typing import List


def calculate_score(user_pose: List[float], ideal_pose: List[float]) -> int:
    if not user_pose or not ideal_pose:
        return 0

    limit = min(len(user_pose), len(ideal_pose))
    error = 0.0

    for i in range(limit):
        error += abs(float(user_pose[i]) - float(ideal_pose[i]))

    score = max(0, round(100 - (error * 100 / max(1, limit))))
    return int(min(100, score))


def build_feedback(user_pose: List[float], ideal_pose: List[float]):
    if not user_pose or not ideal_pose:
        return [
            "Khong du du lieu pose de phan tich.",
            "Hay thu quay video ro hon va toan than.",
        ]

    messages = []

    # Simple heuristic messages for MVP pipeline.
    if len(user_pose) >= 9 and len(ideal_pose) >= 9:
        axis_error = abs(user_pose[1] - ideal_pose[1])
        if axis_error > 0.08:
            messages.append("Ban bi lech truc khi da.")

    if len(user_pose) >= 15 and len(ideal_pose) >= 15:
        knee_error = abs(user_pose[13] - ideal_pose[13])
        if knee_error > 0.08:
            messages.append("Goi chua nang du cao.")

    if len(user_pose) >= 6 and len(ideal_pose) >= 6:
        guard_error = abs(user_pose[4] - ideal_pose[4])
        if guard_error < 0.05:
            messages.append("Tay giu guard tot.")

    if not messages:
        messages.append("Dong tac kha on. Hay tiep tuc luyen deu nhip.")

    return messages
