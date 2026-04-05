# AI Platform Roadmap (Next Level)

This document operationalizes the founder-level roadmap into buildable tracks.

## Track A: AI Video Analysis (Computer Vision)

- Upload video to Supabase Storage
- Create analysis job in Postgres
- Worker service extracts frames and runs pose detection
- Compare with ideal pose template and generate score + feedback
- Save feedback to database and return to user dashboard

Schema file:

- supabase/ai_video_coach.sql

Worker service:

- ai-services/video-analyzer/

## Track B: Coach Dashboard

- Coach can list student submissions
- Coach comments with timestamp + score
- Feedback is stored in coach_feedback table

## Track C: Global Leaderboard (Realtime)

- Build rank_points from streak + technique score + completed lessons
- Expose /api/leaderboard endpoint
- Subscribe with Supabase Realtime channel on user_streak_stats

## Track D: Advanced AI Coach (Memory + RAG)

- Save weakness/history per user in ai_user_memory
- Merge memory with RAG context in prompt
- Return "improved vs last time" style coaching feedback

## Track E: Notifications + Personalization

- Inactive-day reminders via notification_events
- Training engine recommends basic drills when fail_rate is high
- Unlock advanced combos when streak is stable

## Track F: Scale & Reliability

- Queue for video analysis jobs
- CDN for video playback
- API rate limits and strict auth policies
- Load test and model-accuracy test loops
