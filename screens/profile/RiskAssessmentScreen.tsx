import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import {
    Button,
    Text,
    Card,
    Surface,
    ProgressBar,
    RadioButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { RiskAssessment, RiskAssessmentAnswer, RiskTolerance } from '@/types';

interface Question {
    id: string;
    question: string;
    options: {
        value: string;
        label: string;
        score: number;
    }[];
}

const riskQuestions: Question[] = [
    {
        id: 'q1',
        question: 'আপনার বয়স কত?',
        options: [
            { value: 'under25', label: '২৫ বছরের নিচে', score: 4 },
            { value: '25to35', label: '২৫-৩৫ বছর', score: 3 },
            { value: '35to50', label: '৩৫-৫০ বছর', score: 2 },
            { value: 'over50', label: '৫০ বছরের উপরে', score: 1 },
        ],
    },
    {
        id: 'q2',
        question: 'আপনার বিনিয়োগের অভিজ্ঞতা কেমন?',
        options: [
            { value: 'none', label: 'কোনো অভিজ্ঞতা নেই', score: 1 },
            { value: 'limited', label: 'সীমিত অভিজ্ঞতা (১-২ বছর)', score: 2 },
            { value: 'moderate', label: 'মাঝারি অভিজ্ঞতা (৩-৫ বছর)', score: 3 },
            { value: 'extensive', label: 'ব্যাপক অভিজ্ঞতা (৫+ বছর)', score: 4 },
        ],
    },
    {
        id: 'q3',
        question: 'আপনার বিনিয়োগের মূল লক্ষ্য কী?',
        options: [
            { value: 'capital_preservation', label: 'মূলধন সংরক্ষণ', score: 1 },
            { value: 'income_generation', label: 'নিয়মিত আয় সৃষ্টি', score: 2 },
            { value: 'balanced_growth', label: 'সুষম বৃদ্ধি', score: 3 },
            { value: 'aggressive_growth', label: 'দ্রুত বৃদ্ধি', score: 4 },
        ],
    },
    {
        id: 'q4',
        question: 'আপনার বিনিয়োগের সময়সীমা কত?',
        options: [
            { value: 'short', label: '১ বছরের কম', score: 1 },
            { value: 'medium_short', label: '১-৩ বছর', score: 2 },
            { value: 'medium_long', label: '৩-৭ বছর', score: 3 },
            { value: 'long', label: '৭ বছরের বেশি', score: 4 },
        ],
    },
    {
        id: 'q5',
        question: 'যদি আপনার বিনিয়োগ ২০% কমে যায়, আপনি কী করবেন?',
        options: [
            { value: 'sell_immediately', label: 'তৎক্ষণাৎ বিক্রি করব', score: 1 },
            { value: 'sell_some', label: 'কিছু অংশ বিক্রি করব', score: 2 },
            { value: 'hold', label: 'ধরে রাখব', score: 3 },
            { value: 'buy_more', label: 'আরও কিনব', score: 4 },
        ],
    },
    {
        id: 'q6',
        question: 'আপনার মাসিক আয়ের কত অংশ বিনিয়োগ করতে চান?',
        options: [
            { value: 'very_low', label: '৫% এর কম', score: 1 },
            { value: 'low', label: '৫-১০%', score: 2 },
            { value: 'moderate', label: '১০-২০%', score: 3 },
            { value: 'high', label: '২০% এর বেশি', score: 4 },
        ],
    },
    {
        id: 'q7',
        question: 'আপনার জরুরি তহবিল কেমন?',
        options: [
            { value: 'none', label: 'কোনো জরুরি তহবিল নেই', score: 1 },
            { value: 'partial', label: '৩ মাসের খরচের সমান', score: 2 },
            { value: 'adequate', label: '৬ মাসের খরচের সমান', score: 3 },
            { value: 'excellent', label: '১ বছরের খরচের সমান', score: 4 },
        ],
    },
    {
        id: 'q8',
        question: 'বিনিয়োগে ক্ষতির ব্যাপারে আপনার মনোভাব কী?',
        options: [
            { value: 'very_conservative', label: 'কোনো ক্ষতি সহ্য করতে পারি না', score: 1 },
            { value: 'conservative', label: 'সামান্য ক্ষতি সহ্য করতে পারি', score: 2 },
            { value: 'moderate', label: 'মাঝারি ক্ষতি সহ্য করতে পারি', score: 3 },
            { value: 'aggressive', label: 'বেশি ক্ষতি সহ্য করতে পারি', score: 4 },
        ],
    },
];

export const RiskAssessmentScreen: React.FC = () => {
    const navigation = useNavigation();
    const { setRiskAssessment, isLoading, user } = useUserStore();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleNext = () => {
        if (currentQuestion < riskQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            calculateRiskScore();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const calculateRiskScore = () => {
        let totalScore = 0;
        const assessmentAnswers: RiskAssessmentAnswer[] = [];

        riskQuestions.forEach(question => {
            const selectedAnswer = answers[question.id];
            if (selectedAnswer) {
                const option = question.options.find(opt => opt.value === selectedAnswer);
                if (option) {
                    totalScore += option.score;
                    assessmentAnswers.push({
                        questionId: question.id,
                        answer: selectedAnswer,
                        score: option.score,
                    });
                }
            }
        });

        // Calculate risk tolerance based on score
        let riskTolerance: RiskTolerance;
        const maxScore = riskQuestions.length * 4;
        const scorePercentage = (totalScore / maxScore) * 100;

        if (scorePercentage <= 40) {
            riskTolerance = RiskTolerance.CONSERVATIVE;
        } else if (scorePercentage <= 70) {
            riskTolerance = RiskTolerance.MODERATE;
        } else {
            riskTolerance = RiskTolerance.AGGRESSIVE;
        }

        const assessment: RiskAssessment = {
            userId: user?.id || '',
            score: totalScore,
            tolerance: riskTolerance,
            answers: assessmentAnswers,
            completedAt: new Date(),
        };

        setRiskAssessment(assessment);
        showResults(riskTolerance, scorePercentage);
    };

    const showResults = (tolerance: RiskTolerance, scorePercentage: number) => {
        const toleranceText = {
            [RiskTolerance.CONSERVATIVE]: 'রক্ষণশীল',
            [RiskTolerance.MODERATE]: 'মাঝারি',
            [RiskTolerance.AGGRESSIVE]: 'আক্রমণাত্মক',
        };

        const recommendations = {
            [RiskTolerance.CONSERVATIVE]: 'সঞ্চয়পত্র, ফিক্সড ডিপোজিট, DPS এর মতো নিরাপদ বিনিয়োগ',
            [RiskTolerance.MODERATE]: 'মিউচুয়াল ফান্ড, সরকারি বন্ড, এবং কিছু শেয়ারের মিশ্রণ',
            [RiskTolerance.AGGRESSIVE]: 'শেয়ার বাজার, গ্রোথ মিউচুয়াল ফান্ড, এবং উচ্চ রিটার্ন বিনিয়োগ',
        };

        Alert.alert(
            'ঝুঁকি মূল্যায়ন সম্পূর্ণ',
            `আপনার ঝুঁকি সহনশীলতা: ${toleranceText[tolerance]} (${scorePercentage.toFixed(0)}%)\n\nসুপারিশকৃত বিনিয়োগ: ${recommendations[tolerance]}`,
            [
                {
                    text: 'ঠিক আছে',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    const currentQ = riskQuestions[currentQuestion];
    const isAnswered = answers[currentQ.id] !== undefined;
    const progress = (currentQuestion + 1) / riskQuestions.length;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* Progress Header */}
                <Surface style={styles.progressHeader} elevation={2}>
                    <Text variant="titleLarge" style={styles.progressTitle}>
                        ঝুঁকি মূল্যায়ন
                    </Text>
                    <Text variant="bodyMedium" style={styles.progressSubtitle}>
                        প্রশ্ন {currentQuestion + 1} / {riskQuestions.length}
                    </Text>
                    <ProgressBar
                        progress={progress}
                        color={theme.colors.primary}
                        style={styles.progressBar}
                    />
                </Surface>

                {/* Question Card */}
                <Card style={styles.questionCard}>
                    <Card.Content>
                        <View style={styles.questionHeader}>
                            <Icon
                                name="help-circle"
                                size={40}
                                color={theme.colors.primary}
                            />
                            <Text variant="headlineSmall" style={styles.questionTitle}>
                                {currentQ.question}
                            </Text>
                        </View>

                        <View style={styles.optionsContainer}>
                            {currentQ.options.map((option, index) => (
                                <Surface
                                    key={option.value}
                                    style={[
                                        styles.optionCard,
                                        answers[currentQ.id] === option.value && styles.selectedOption,
                                    ]}
                                    onTouchEnd={() => handleAnswer(currentQ.id, option.value)}>
                                    <View style={styles.optionContent}>
                                        <RadioButton
                                            value={option.value}
                                            status={
                                                answers[currentQ.id] === option.value
                                                    ? 'checked'
                                                    : 'unchecked'
                                            }
                                            onPress={() => handleAnswer(currentQ.id, option.value)}
                                        />
                                        <Text variant="bodyLarge" style={styles.optionText}>
                                            {option.label}
                                        </Text>
                                    </View>
                                </Surface>
                            ))}
                        </View>
                    </Card.Content>
                </Card>

                {/* Risk Info Card */}
                <Card style={styles.infoCard}>
                    <Card.Content>
                        <View style={styles.infoHeader}>
                            <Icon name="information" size={24} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={styles.infoTitle}>
                                কেন ঝুঁকি মূল্যায়ন গুরুত্বপূর্ণ?
                            </Text>
                        </View>
                        <Text variant="bodyMedium" style={styles.infoText}>
                            আপনার ঝুঁকি সহনশীলতা জানা থাকলে আমরা আপনার জন্য সবচেয়ে উপযুক্ত বিনিয়োগ পরিকল্পনা তৈরি করতে পারি। এটি আপনার আর্থিক লক্ষ্য অর্জনে সাহায্য করবে।
                        </Text>
                    </Card.Content>
                </Card>

                {/* Navigation Buttons */}
                <View style={styles.navigationContainer}>
                    {currentQuestion > 0 && (
                        <Button
                            mode="outlined"
                            onPress={handlePrevious}
                            style={styles.previousButton}
                            icon="arrow-left">
                            পূর্ববর্তী
                        </Button>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleNext}
                        disabled={!isAnswered}
                        loading={isLoading}
                        style={styles.nextButton}
                        icon={currentQuestion === riskQuestions.length - 1 ? "check" : "arrow-right"}>
                        {currentQuestion === riskQuestions.length - 1 ? 'ফলাফল দেখুন' : 'পরবর্তী'}
                    </Button>
                </View>

                {/* Question Navigation Dots */}
                <View style={styles.dotsContainer}>
                    {riskQuestions.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index <= currentQuestion
                                        ? theme.colors.primary
                                        : theme.colors.outline,
                                },
                                index === currentQuestion && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.md,
    },
    progressHeader: {
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.surface,
    },
    progressTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    progressSubtitle: {
        textAlign: 'center',
        color: theme.colors.onSurfaceVariant,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
    },
    questionCard: {
        marginBottom: spacing.lg,
    },
    questionHeader: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    questionTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginTop: spacing.md,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
    },
    optionsContainer: {
        gap: spacing.sm,
    },
    optionCard: {
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.surfaceVariant,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOption: {
        backgroundColor: theme.colors.primaryContainer,
        borderColor: theme.colors.primary,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    optionText: {
        flex: 1,
        marginLeft: spacing.sm,
        color: theme.colors.onSurface,
    },
    infoCard: {
        marginBottom: spacing.lg,
        backgroundColor: theme.colors.tertiaryContainer,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    infoTitle: {
        marginLeft: spacing.sm,
        fontWeight: 'bold',
        color: theme.colors.onTertiaryContainer,
    },
    infoText: {
        color: theme.colors.onTertiaryContainer,
        lineHeight: 20,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    previousButton: {
        flex: 1,
        marginRight: spacing.sm,
    },
    nextButton: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});

