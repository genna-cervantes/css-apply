"use client";

import styles from './quiz-styles.module.css';
import React, { useMemo, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Answers, CommitteeName } from './types/quiz';
import { COMMITTEES, questions, SCORE_MAP } from './data/quizData';
import ResultCard from './ResultCard';
import BackgroundIcons from './BackgroundIcons';
import Link from 'next/link';

interface ResultsPageProps {
    answers: Answers;
    onRetake: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ answers, onRetake }) => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const quizData = useMemo(() => {
        // This calculation logic is purely client-side and is safe to keep.
        const rawScores: Record<CommitteeName, number> = COMMITTEES.reduce((acc, c) => ({...acc, [c]: 0}), {} as Record<CommitteeName, number>);

        questions.forEach(q => {
            const answerValue = answers[q.id];
            if (answerValue && SCORE_MAP[answerValue as keyof typeof SCORE_MAP]) {
                const points = SCORE_MAP[answerValue as keyof typeof SCORE_MAP];
                
                if (Array.isArray(q.dominant)) {
                    q.dominant.forEach((c: string) => { rawScores[c as CommitteeName] += points.dominant; });
                } else {
                    rawScores[q.dominant as CommitteeName] += points.dominant;
                }

                (q.average || []).forEach((c: string) => { rawScores[c as CommitteeName] += points.average; });
                (q.less || []).forEach((c: string) => { rawScores[c as CommitteeName] += points.less; });
            }
        });
        
        const sortedResults: { committee: CommitteeName; score: number }[] = Object.entries(rawScores)
            .map(([committee, score]) => ({ committee: committee as CommitteeName, score: Number(score) }))
            .sort((a, b) => (b.score as number) - (a.score as number));
            
        return { rawScores, sortedResults };
    }, [answers]);

    // Submit results to Supabase once when results are computed
    const didSubmitRef = useRef(false);
    useEffect(() => {
        const submitResults = async () => {
            const { rawScores, sortedResults } = quizData;

            if (didSubmitRef.current) return; // prevent duplicate inserts
            if (!sortedResults || sortedResults.length < 3) {
                console.error('Not enough results to submit.');
                return;
            }

            try {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                if (!supabaseUrl || !supabaseAnonKey) {
                    console.warn('Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Skipping submission.');
                    return;
                }
                const supabase = createClient(supabaseUrl, supabaseAnonKey);

                const formatColumnName = (name: string) =>
                    `score_${name.toLowerCase().replace(/ & /g, '_and_').replace(/ /g, '_')}`;

                const scoresForDb = Object.entries(rawScores).reduce((acc, [committee, score]) => {
                    acc[formatColumnName(committee)] = score as number;
                    return acc;
                }, {} as Record<string, number>);

                const submissionData = {
                    top_committee: sortedResults[0].committee,
                    second_committee: sortedResults[1].committee,
                    third_committee: sortedResults[2].committee,
                    ...scoresForDb,
                } as Record<string, unknown>;

                const { data, error } = await supabase
                    .from('quiz_submissions')
                    .insert([submissionData]);

                if (error) throw error;
                didSubmitRef.current = true;
                console.log('Submitted quiz results to Supabase:', data);
            } catch (error) {
                const err = error as Error;
                console.error('Error submitting quiz results to Supabase:', err.message);
            }
        };

    submitResults();
    }, [quizData]);

    const { sortedResults } = quizData;
    const [topResult, secondResult, thirdResult] = sortedResults;
    
    if (!topResult) {
        return <div className={styles['results-container']}><h2>Calculating your results...</h2></div>; 
    }

    return (
        <>
            <div className={styles['results-container']}>
                <h2>Your Results Are In!</h2>
                
                <ResultCard committee={topResult} isPrimary={true} />

                <h4>Other Committees You Might Enjoy</h4>
                <div className={styles['other-results-grid']}>
                    <ResultCard committee={secondResult} />
                    <ResultCard committee={thirdResult} />
                </div>

                <div className={styles['results-actions']}>
                    <Link href="/#join-section" className={`${styles.btn} ${styles['btn-primary']}`}>Join CSS</Link>
                    <button className={`${styles.btn} ${styles['btn-secondary']}`} onClick={onRetake}>Retake the Test</button>
                </div>
            </div>
            <BackgroundIcons />
        </>
    );
}

export default ResultsPage;