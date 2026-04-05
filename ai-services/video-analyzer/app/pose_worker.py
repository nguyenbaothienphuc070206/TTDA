import cv2
import mediapipe as mp

mp_pose = mp.solutions.pose


def analyze_video_file(video_path: str):
    cap = cv2.VideoCapture(video_path)
    pose = mp_pose.Pose(static_image_mode=False, model_complexity=1)

    vectors = []
    frame_index = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_index += 1
        if frame_index % 3 != 0:
            continue

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb)

        if not results.pose_landmarks:
            continue

        flat = []
        for lm in results.pose_landmarks.landmark[:12]:
            flat.extend([float(lm.x), float(lm.y), float(lm.visibility)])

        vectors.append(flat)

    cap.release()
    pose.close()

    if not vectors:
        return []

    # Return average pose vector across sampled frames.
    n = len(vectors)
    m = len(vectors[0])
    avg = [0.0] * m

    for vec in vectors:
        for i, val in enumerate(vec):
            avg[i] += val

    return [v / n for v in avg]
