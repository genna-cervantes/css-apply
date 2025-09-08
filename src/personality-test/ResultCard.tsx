"use client";

// STEP 1: Correct the import to use the .module.css file
import styles from './quiz-styles.module.css';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
    committeeImagePaths, 
    committeeFitReasons, 
    committeeDescriptions 
} from './data/quizData';
import { CommitteeName } from './types/quiz';

interface CommitteeData {
    committee: CommitteeName;
    score: number;
}

interface ResultCardProps {
  committee: CommitteeData | undefined;
  isPrimary?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ committee, isPrimary = false }) => {
    const [view, setView] = useState<'fit' | 'duties'>('fit');

    useEffect(() => {
        setView('fit');
    }, [committee]);

    if (!committee) {
        return null;
    }

    const committeeName = committee.committee;

    // STEP 2: Convert all class names, handling static, dynamic, and conditional cases
    return (
        <div className={`${styles['result-card-container']} ${isPrimary ? styles['is-primary'] : ''}`}>
            <div className={styles['result-card-header']}>
                <div className={`${styles['result-image-wrapper']} ${isPrimary ? styles['is-primary'] : ''}`}>
                    <Image 
                        src={committeeImagePaths[committeeName]} 
                        alt={`${committeeName} committee illustration`} 
                        width={250}
                        height={250}
                    />
                </div>
                <div className={styles['result-title-wrapper']}>
                    {isPrimary && <h3>Your Primary Committee Fit is...</h3>}
                    <h1 className={isPrimary ? styles['result-title-main'] : styles['result-title-other']}>{committeeName}</h1>
                </div>
            </div>
            <div className={styles['result-card-body']}>
                {view === 'fit' ? (
                    // The CSS provided doesn't have a 'fit-reason-text' class, so I'm omitting it. 
                    // If you have it, you can add it back as className={styles.fitReasonText}
                    <p>{committeeFitReasons[committeeName]}</p>
                ) : (
                    <div className={styles['committee-duties']}>
                        <h4>Key Responsibilities:</h4>
                        <ul>
                            {committeeDescriptions[committeeName].map((duty, index) => (
                                <li key={index}>{duty}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className={styles['result-card-nav']}>
                <button onClick={() => setView('fit')} disabled={view === 'fit'} aria-label="Show fit reason">
                    <span className={styles['nav-arrow']} aria-label="Previous">&#60;</span>
                </button>
                <div className={styles['nav-dots']}>
                    <span className={`${styles['nav-dot']} ${view === 'fit' ? styles.active : ''}`}></span>
                    <span className={`${styles['nav-dot']} ${view === 'duties' ? styles.active : ''}`}></span>
                </div>
                <button onClick={() => setView('duties')} disabled={view === 'duties'} aria-label="Show key responsibilities">
                    <span className={styles['nav-arrow']} aria-label="Next">&#62;</span>
                </button>
            </div>
        </div>
    );
};

export default ResultCard;