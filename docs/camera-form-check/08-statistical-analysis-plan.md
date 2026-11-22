---
title: "Statistical analysis plan"
subtitle: "Pilot agreement and reliability study of PNA RehabVerse Form Check (Part A) — version 0.1 DRAFT, to be frozen at registration — contains [TO COMPLETE] fields"
---

*This plan expands section 10 of the protocol. It is written to be registered before the first participant is enrolled and not to be changed afterwards; any deviation is listed in the report. The independent analyst runs it.*

# 1. Aims of the analysis

Estimation, not testing. For each of eight movement types: (1) agreement between camera and reference (bias and 95% limits of agreement); (2) test–retest reliability of the camera readings; (3) counting and timing accuracy; (4) sensitivity and specificity of cues for instructed faults; (5) coverage; (6) effect of conditions (descriptive). The results feed the decision rules of protocol section 10.7.

# 2. Data and units

One record per trial (participant × session × movement × repetition). The **participant** is the unit of independence: all intervals are computed with participant-level resampling so that repeated trials do not inflate the apparent precision. Movements with two sides (rotation, side bend) are analysed per side and, for the decision rule, as the worse of the two.

# 3. Populations

- **All enrolled** (safety and coverage).
- **Per-protocol** for each movement type: participants who completed that movement in at least one session. The decision rules use this population but report coverage on all enrolled, so a tool that "refuses" difficult trials cannot look better by dropping them.

# 4. Agreement

For trial *k* of participant *i* in session *s*, the difference is *d* = camera − reference (degrees).

1. **Model.** A linear mixed model *d = μ + u_i + e*, with *u_i* ~ N(0, σ²_u) a participant effect and *e* ~ N(0, σ²_e). Bias = μ. The 95% limits of agreement are μ ± 1.96·√(σ²_u + σ²_e).
2. **Intervals.** The 95% confidence intervals for bias and for each limit come from a **participant-level (cluster) bootstrap** with 5,000 resamples and the percentile method (the model is refitted in each resample). If fewer than 8 participants contribute, intervals are reported but flagged as unreliable.
3. **Plots.** Bland–Altman plots (difference against mean of camera and reference), with the bias and limits, participant-coloured, one per movement type.
4. **Proportional bias.** Regress *d* on the mean of the two measurements (mixed model with participant random intercept); report the slope with its cluster-bootstrap interval. If the slope interval excludes 0, limits of agreement that vary with the mean are also shown.
5. **Other summaries.** Mean absolute error, root-mean-square error, and the proportion of trials within 5° and within 10°, each with a cluster-bootstrap interval; Lin's concordance correlation coefficient (camera against reference).
6. **Reference error.** The reference measurement is repeated in [TO COMPLETE: at least 3] participants to estimate its own repeatability; the camera's error is also reported after subtracting the reference's variance as a sensitivity analysis (never as the primary result).

# 5. Reliability (test–retest, session 1 against session 2)

- ICC for absolute agreement, single measurement, two-way random effects [ICC(2,1)] as the primary form (the tool would be used by different sessions), ICC(3,1) as a sensitivity analysis; the form is stated with every value [Koo & Li 2016].
- 95% confidence interval from the cluster bootstrap.
- SEM = √(within-participant variance); MDC95 = 1.96 × √2 × SEM.
- Reliability is computed for the camera readings, and separately for the reference readings.

# 6. Counting and timing

- Repetitions: proportion of sets in which the tool's count equals the manual count (exact agreement, Wilson interval, adjusted for clustering by bootstrap); mean absolute count error; the direction of error (over- or under-counting).
- Holds: difference (tool − stopwatch) in seconds with bias and limits of agreement as in section 4.

# 7. Cues

For each instructed-fault movement, the 2×2 table of tool cue (fired / not) against the known fault (present / absent): sensitivity, specificity, positive and negative predictive value, and Cohen's kappa, with cluster-bootstrap intervals. The proportion of **correct** trials in which a cue fired incorrectly is reported on its own (false alarms), because a false cue is a harm to a patient.

# 8. Coverage

For each movement type, the proportion of trials in which the tool gave a reading, with the reasons for "no reading" coded (set-up not met, tracking lost, low confidence). Missing readings are never imputed. A **worst-case** analysis assigns the missing trials an error equal to the largest error observed for that movement and reports the mean absolute error again.

# 9. Conditions (descriptive)

Error (absolute difference) by phone model, lighting category, clothing category, orientation and camera distance band; medians and interquartile ranges with cluster-bootstrap intervals. No testing; the aim is to name conditions in which the tool should not be trusted.

# 10. The decision rules (applied mechanically)

For each movement type, a numeric angle may be shown to a patient only if **all** hold (protocol 10.7): mean absolute error ≤ 5°; 95% limits of agreement within ±10° and the upper limit of their confidence interval within ±12°; the lower 95% confidence limit of the ICC ≥ 0.5; coverage ≥ 80% (all enrolled). A movement with count accuracy ≥ 95% and hold timing within ±1 s may show a count and a timer. Otherwise nothing is shown for that movement. The analyst applies the rules and records the outcome per type; the principal investigator then records the decision in the application's list of validated movement types. A type that fails stays at counts, timers and position cues.

# 11. Precision and what the pilot can and cannot show

With 8 to 10 participants the number of independent units is small. As an illustration only (the numbers are planning assumptions, not results): suppose the participant-to-participant standard deviation of the error is 2° and the trial-to-trial standard deviation is 3°. Then the total standard deviation is about 3.6° and the limits of agreement about ±7.1° around the bias. For *n* = 8 participants, the standard error of each limit is about √(s²/n + 1.96²·s²/(2(n−1))) = 2.3°, so the confidence interval of the upper limit extends to roughly 12° (11.5° with a normal multiplier, 12.5° with a *t* multiplier). The rule of 10.7 (upper limit ≤ 12°) is therefore **demanding at this sample size**: it will be met only by a tool whose error is at or below these assumptions. That is intended: a pilot should not declare a tool ready on weak evidence. The confirmatory study (at least 35 to 50 participants) is sized from the variance components found here.

# 12. Reporting

GRRAS [Kottner 2011] and COSMIN principles [Mokkink 2010]. All pre-specified analyses are reported whether or not favourable, with the number of trials and participants behind each. Deviations from this plan, and anything done after the data were seen, are labelled as exploratory.

# 13. Software and reproducibility

The analysis script, the data dictionary, the random seed for the bootstrap [TO COMPLETE] and the versions of the statistical software and packages are registered with this plan. The independent analyst runs the script on the de-identified export and archives the output together with the export's checksum.

# 14. References

Bland & Altman 1986, 1999; Koo & Li 2016; Lin 1989; Kottner 2011; Mokkink 2010 (as in the protocol). *(Please check each reference against the original before submission.)*
