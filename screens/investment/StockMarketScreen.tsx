"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { investmentOptions } from "@/data/investmentData"
import { formatCurrency } from "@/utils/formatters"
import { theme } from "@/constants/theme"

export default function StockMarketScreen() {
    const navigation = useNavigation()
    const route = useRoute()
    const investmentId = (route.params as { investmentId?: string } | undefined)?.investmentId


    const investment =
        investmentOptions.find((inv) => inv.id === investmentId) || investmentOptions.find((inv) => inv.type === "stock")

    const [investmentAmount, setInvestmentAmount] = useState("")
    const [selectedRiskLevel, setSelectedRiskLevel] = useState("medium")

    const calculatePotentialReturns = () => {
        const amount = Number.parseFloat(investmentAmount)
        if (!amount) return { minReturn: 0, maxReturn: 0, averageReturn: 0 }

        const minRate = investment?.expectedReturn.min || -10
        const maxRate = investment?.expectedReturn.max || 40
        const avgRate = investment?.expectedReturn.average || 15

        const minReturn = (amount * minRate) / 100
        const maxReturn = (amount * maxRate) / 100
        const averageReturn = (amount * avgRate) / 100

        return { minReturn, maxReturn, averageReturn }
    }

    const { minReturn, maxReturn, averageReturn } = calculatePotentialReturns()

    const handleInvest = () => {
        if (!investmentAmount) {
            Alert.alert("ত্রুটি", "বিনিয়োগের পরিমাণ লিখুন")
            return
        }
        Alert.alert("সফল", "আপনার শেয়ার বাজার বিনিয়োগ শুরু হয়েছে!")
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
                    <Text style={styles.structureValue}>যেকোনো সময় যেকোনো পরিমাণ</Text>
                </View>
                <View style={styles.structureItem}>
                    <Text style={styles.structureLabel}>রিটার্ন প্যাটার্ন:</Text>
                    <Text style={styles.structureValue}>বাজার অনুযায়ী পরিবর্তনশীল</Text>
                </View>
                <View style={styles.structureItem}>
                    <Text style={styles.structureLabel}>ঝুঁকির মাত্রা:</Text>
                    <Text style={styles.structureValue}>উচ্চ ঝুঁকি, উচ্চ রিটার্ন</Text>
                </View>
                <View style={styles.structureItem}>
                    <Text style={styles.structureLabel}>তরলতা:</Text>
                    <Text style={styles.structureValue}>উচ্চ (যেকোনো সময় বিক্রয়)</Text>
                </View>
            </View>

            {/* Investment Calculator */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>শেয়ার বিনিয়োগ ক্যালকুলেটর</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>বিনিয়োগের পরিমাণ (টাকা)</Text>
                    <TextInput
                        style={styles.input}
                        value={investmentAmount}
                        onChangeText={setInvestmentAmount}
                        placeholder="যেমন: ৫০০০০"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ঝুঁকি সহনশীলতা</Text>
                    <View style={styles.riskOptions}>
                        {[
                            { key: "low", label: "কম ঝুঁকি" },
                            { key: "medium", label: "মাঝারি ঝুঁকি" },
                            { key: "high", label: "উচ্চ ঝুঁকি" },
                        ].map((risk) => (
                            <TouchableOpacity
                                key={risk.key}
                                style={[styles.riskOption, selectedRiskLevel === risk.key && styles.selectedRisk]}
                                onPress={() => setSelectedRiskLevel(risk.key)}
                            >
                                <Text style={[styles.riskText, selectedRiskLevel === risk.key && styles.selectedRiskText]}>
                                    {risk.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {investmentAmount && (
                    <View style={styles.resultsCard}>
                        <Text style={styles.resultsTitle}>সম্ভাব্য রিটার্ন (১ বছরে)</Text>
                        <View style={styles.resultItem}>
                            <Text style={styles.resultLabel}>সর্বনিম্ন রিটার্ন:</Text>
                            <Text style={[styles.resultValue, { color: "#f44336" }]}>{formatCurrency(minReturn)}</Text>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.resultLabel}>গড় রিটার্ন:</Text>
                            <Text style={styles.resultValue}>{formatCurrency(averageReturn)}</Text>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.resultLabel}>সর্বোচ্চ রিটার্ন:</Text>
                            <Text style={[styles.totalValue, { color: "#4caf50" }]}>{formatCurrency(maxReturn)}</Text>
                        </View>
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>⚠️ শেয়ার বাজারে বিনিয়োগ ঝুঁকিপূর্ণ। অতীতের পারফরমেন্স ভবিষ্যতের গ্যারান্টি নয়।</Text>
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
                <Text style={styles.investButtonText}>শেয়ার বিনিয়োগ শুরু করুন</Text>
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
    riskOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    riskOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f9f9f9",
    },
    selectedRisk: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    riskText: {
        fontSize: 14,
        color: "#666",
    },
    selectedRiskText: {
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
    warningBox: {
        backgroundColor: "#fff3cd",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#ffc107",
    },
    warningText: {
        fontSize: 12,
        color: "#856404",
        lineHeight: 16,
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
