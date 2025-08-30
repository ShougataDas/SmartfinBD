"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { investmentOptions } from "@/data/investmentData"
import { formatCurrency } from "@/utils/formatters"
import { theme } from "@/constants/theme"

export default function MutualFundScreen() {
    const navigation = useNavigation()
    const route = useRoute()
    const investmentId = (route.params as { investmentId?: string } | undefined)?.investmentId


    const investment =
        investmentOptions.find((inv) => inv.id === investmentId) ||
        investmentOptions.find((inv) => inv.type === "mutual_fund")

    const [investmentAmount, setInvestmentAmount] = useState("")
    const [monthlyAmount, setMonthlyAmount] = useState("")
    const [selectedTenure, setSelectedTenure] = useState(5)
    const [investmentType, setInvestmentType] = useState("lumpsum") // 'lumpsum' or 'sip'

    const calculateReturns = () => {
        if (investmentType === "lumpsum") {
            const amount = Number.parseFloat(investmentAmount)
            if (!amount) return { totalReturn: 0, maturityAmount: 0 }

            const annualRate = investment?.expectedReturn.average || 12
            const maturityAmount = amount * Math.pow(1 + annualRate / 100, selectedTenure)
            const totalReturn = maturityAmount - amount

            return { totalReturn, maturityAmount }
        } else {
            const amount = Number.parseFloat(monthlyAmount)
            if (!amount) return { totalInvestment: 0, maturityAmount: 0, totalReturn: 0 }

            const totalInvestment = amount * selectedTenure * 12
            const annualRate = investment?.expectedReturn.average || 12
            const monthlyRate = annualRate / 12 / 100
            const totalMonths = selectedTenure * 12

            // SIP future value calculation
            const maturityAmount = amount * (((1 + monthlyRate) ** totalMonths - 1) / monthlyRate) * (1 + monthlyRate)
            const totalReturn = maturityAmount - totalInvestment

            return { totalInvestment, maturityAmount, totalReturn }
        }
    }

    const returns = calculateReturns()

    const handleInvest = () => {
        if (investmentType === "lumpsum" && !investmentAmount) {
            Alert.alert("ত্রুটি", "বিনিয়োগের পরিমাণ লিখুন")
            return
        }
        if (investmentType === "sip" && !monthlyAmount) {
            Alert.alert("ত্রুটি", "মাসিক বিনিয়োগের পরিমাণ লিখুন")
            return
        }
        Alert.alert("সফল", "আপনার মিউচুয়াল ফান্ড বিনিয়োগ শুরু হয়েছে!")
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{investment?.name}</Text>
                <Text style={styles.subtitle}>{investment?.nameEn}</Text>
                <Text style={styles.description}>{investment?.description}</Text>
            </View>

            {/* Investment Structure */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>বিনিয়োগ কাঠামো</Text>
                <View style={styles.structureItem}>
                    <Text style={styles.structureLabel}>বিনিয়োগ ধরন:</Text>
                    <Text style={styles.structureValue}>একবারে বা মাসিক কিস্তি</Text>
                </View>
                <View style={styles.structureItem}>
                    <Text style={styles.structureLabel}>রিটার্ন প্যাটার্ন:</Text>
                    <Text style={styles.structureValue}>বাজার অনুযায়ী পরিবর্তনশীল</Text>
                </View>
                <View style={styles.structureItem}>
                    <Text style={styles.structureLabel}>ঝুঁকির মাত্রা:</Text>
                    <Text style={styles.structureValue}>মাঝারি থেকে উচ্চ</Text>
                </View>
                <View style={styles.structureItem}>
                    <Text style={styles.structureLabel}>তরলতা:</Text>
                    <Text style={styles.structureValue}>উচ্চ (T+2 দিনে)</Text>
                </View>
            </View>

            {/* Investment Type Selection */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>বিনিয়োগের ধরন নির্বাচন করুন</Text>
                <View style={styles.typeOptions}>
                    <TouchableOpacity
                        style={[styles.typeOption, investmentType === "lumpsum" && styles.selectedType]}
                        onPress={() => setInvestmentType("lumpsum")}
                    >
                        <Text style={[styles.typeText, investmentType === "lumpsum" && styles.selectedTypeText]}>
                            একবারে বিনিয়োগ
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeOption, investmentType === "sip" && styles.selectedType]}
                        onPress={() => setInvestmentType("sip")}
                    >
                        <Text style={[styles.typeText, investmentType === "sip" && styles.selectedTypeText]}>SIP (মাসিক কিস্তি)</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Investment Calculator */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>মিউচুয়াল ফান্ড ক্যালকুলেটর</Text>

                {investmentType === "lumpsum" ? (
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>বিনিয়োগের পরিমাণ (টাকা)</Text>
                        <TextInput
                            style={styles.input}
                            value={investmentAmount}
                            onChangeText={setInvestmentAmount}
                            placeholder="যেমন: ১০০০০০"
                            keyboardType="numeric"
                        />
                    </View>
                ) : (
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>মাসিক বিনিয়োগ (টাকা)</Text>
                        <TextInput
                            style={styles.input}
                            value={monthlyAmount}
                            onChangeText={setMonthlyAmount}
                            placeholder="যেমন: ১০০০০"
                            keyboardType="numeric"
                        />
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>বিনিয়োগের মেয়াদ (বছর)</Text>
                    <View style={styles.tenureOptions}>
                        {[3, 5, 10, 15].map((years) => (
                            <TouchableOpacity
                                key={years}
                                style={[styles.tenureOption, selectedTenure === years && styles.selectedTenure]}
                                onPress={() => setSelectedTenure(years)}
                            >
                                <Text style={[styles.tenureText, selectedTenure === years && styles.selectedTenureText]}>
                                    {years} বছর
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {((investmentType === "lumpsum" && investmentAmount) || (investmentType === "sip" && monthlyAmount)) && (
                    <View style={styles.resultsCard}>
                        <Text style={styles.resultsTitle}>প্রত্যাশিত ফলাফল</Text>
                        {investmentType === "sip" && (
                            <View style={styles.resultItem}>
                                <Text style={styles.resultLabel}>মোট বিনিয়োগ:</Text>
                                <Text style={styles.resultValue}>{formatCurrency(returns.totalInvestment || 0)}</Text>
                            </View>
                        )}
                        <View style={styles.resultItem}>
                            <Text style={styles.resultLabel}>{investmentType === "lumpsum" ? "মূল অর্থ:" : "মুনাফা:"}</Text>
                            <Text style={styles.resultValue}>
                                {formatCurrency(
                                    investmentType === "lumpsum" ? Number.parseFloat(investmentAmount) || 0 : returns.totalReturn || 0,
                                )}
                            </Text>
                        </View>
                        {investmentType === "lumpsum" && (
                            <View style={styles.resultItem}>
                                <Text style={styles.resultLabel}>মুনাফা:</Text>
                                <Text style={styles.resultValue}>{formatCurrency(returns.totalReturn || 0)}</Text>
                            </View>
                        )}
                        <View style={styles.resultItem}>
                            <Text style={styles.resultLabel}>মেয়াদ শেষে প্রাপ্তি:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(returns.maturityAmount || 0)}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Features */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>বৈশিষ্ট্য</Text>
                {investment?.benefits.map((benefit, index) => (
                    <View key={index} style={styles.featureItem}>
                        <Text style={styles.featureBullet}>•</Text>
                        <Text style={styles.featureText}>{benefit}</Text>
                    </View>
                ))}
            </View>

            {/* Required Documents */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>প্রয়োজনীয় কাগজপত্র</Text>
                {investment?.requiredDocuments.map((doc, index) => (
                    <View key={index} style={styles.documentItem}>
                        <Text style={styles.documentBullet}>•</Text>
                        <Text style={styles.documentText}>{doc.name}</Text>
                    </View>
                ))}
            </View>

            {/* Action Button */}
            <TouchableOpacity style={styles.investButton} onPress={handleInvest}>
                <Text style={styles.investButtonText}>মিউচুয়াল ফান্ড বিনিয়োগ শুরু করুন</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: theme.colors.primary,
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
        lineHeight: 20,
    },
    card: {
        backgroundColor: "white",
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
    },
    structureItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    structureLabel: {
        fontSize: 14,
        color: "#666",
    },
    structureValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    typeOptions: {
        flexDirection: "row",
        gap: 12,
    },
    typeOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f9f9f9",
        alignItems: "center",
    },
    selectedType: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    selectedTypeText: {
        color: "white",
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    tenureOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tenureOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f9f9f9",
    },
    selectedTenure: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tenureText: {
        fontSize: 14,
        color: "#666",
    },
    selectedTenureText: {
        color: "white",
    },
    resultsCard: {
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
    },
    resultItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    resultLabel: {
        fontSize: 14,
        color: "#666",
    },
    resultValue: {
        fontSize: 14,
        fontWeight: "500",
        color: theme.colors.primary,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.primary,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    featureBullet: {
        fontSize: 16,
        color: theme.colors.primary,
        marginRight: 8,
        marginTop: 2,
    },
    featureText: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    documentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    documentBullet: {
        fontSize: 16,
        color: "#666",
        marginRight: 8,
        marginTop: 2,
    },
    documentText: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    investButton: {
        backgroundColor: theme.colors.primary,
        margin: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    investButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
})
