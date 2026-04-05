# Scale + Security + Testing Checklist (100K-ready)

## Performance / Scale

- [ ] Put training-videos bucket behind CDN delivery.
- [ ] Add queue worker for pose_analysis_jobs.
- [ ] Use batched frame extraction and downscale before model inference.
- [ ] Add Edge cache for public leaderboard endpoints.
- [ ] Add DB indexes for high-volume reads.

## Security

- [ ] Enforce strict auth on all video and coach endpoints.
- [ ] Keep OPENAI_API_KEY server-only.
- [ ] Add API rate limits per route group.
- [ ] Validate upload MIME type and size before signed URL issue.
- [ ] Add abuse logs for AI endpoint spikes.

## AI Quality

- [ ] Build golden dataset for pose scoring calibration.
- [ ] Evaluate false positive/false negative by technique.
- [ ] Track score drift by model version.
- [ ] Add human coach override feedback loop.

## Testing

- [ ] Unit test score function with benchmark vectors.
- [ ] Integration test upload -> analyze -> feedback pipeline.
- [ ] Load test 1,000 concurrent read/write users.
- [ ] Realtime test for leaderboard subscription under burst updates.

## Product Metrics

- [ ] DAU / MAU
- [ ] D1, W4 retention
- [ ] Drop-off by belt/lesson
- [ ] Coach response time SLA
