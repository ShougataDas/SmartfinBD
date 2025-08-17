import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  Surface,
  Chip,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";

import { theme, spacing } from "@/constants/theme";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";
import { ChatService } from "@/services/chatService";
import { ChatMessage, MessageType } from "@/types";

const ChatScreen: React.FC = () => {
  const { user, financialProfile } = useUserStore();
  const { messages, isLoading, addMessage, clearMessages, setLoading } =
    useChatStore();

  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState<"bn" | "en">("bn");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedQuestions = ChatService.getSuggestedQuestions(
    user || undefined,
    financialProfile || undefined,
    language
  );
  const quickReplies =
    messages.length > 0
      ? ChatService.getQuickReplies(
        messages[messages.length - 1]?.text || "",
        language
      )
      : [];

  useFocusEffect(
    React.useCallback(() => {
      if (messages.length === 0) {
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          userId: "ai_assistant",
          text:
            language === "bn"
              ? "নমস্কার! আমি SmartFin BD এর AI সহায়ক। আপনার আর্থিক প্রশ্ন ও বিনিয়োগ সংক্রান্ত যেকোনো সাহায্যের জন্য আমি এখানে আছি। কীভাবে সাহায্য করতে পারি?"
              : "Hello! I'm SmartFin BD's AI assistant. I'm here to help with your financial questions and investment guidance. How can I assist you today?",
          content:
            language === "bn"
              ? "নমস্কার! আমি SmartFin BD এর AI সহায়ক। আপনার আর্থিক প্রশ্ন ও বিনিয়োগ সংক্রান্ত যেকোনো সাহায্যের জন্য আমি এখানে আছি। কীভাবে সাহায্য করতে পারি?"
              : "Hello! I'm SmartFin BD's AI assistant. I'm here to help with your financial questions and investment guidance. How can I assist you today?",
          isUser: false,
          type: MessageType.Text,
          timestamp: new Date(),
        };
        addMessage(welcomeMessage);
      }
    }, [language])
  );

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();

    if (!textToSend) return;

    // Detect language from message
    const isBengali = ChatService.isBengaliMessage(textToSend);
    if (isBengali !== (language === "bn")) {
      setLanguage(isBengali ? "bn" : "en");
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user?.id || "user",
      text: textToSend,
      isUser: true,
      type: MessageType.Text,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInputText("");
    setShowSuggestions(false);
    Keyboard.dismiss();

    // Show loading
    setLoading(true);

    try {
      // Get AI response
      const response = await ChatService.sendMessage(
        textToSend,
        messages,
        user || undefined,
        financialProfile || undefined
      );

      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          userId: "ai_assistant",
          text: ChatService.formatMessage(response.message),
          isUser: false,
          type: MessageType.Text,
          timestamp: new Date(),
        };
        addMessage(assistantMessage);
      } else {
        throw new Error(response.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId: "ai_assistant",
        text:
          language === "bn"
            ? "দুঃখিত, একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
            : "Sorry, there was an error. Please try again.",
        isUser: false,
        type: MessageType.Text,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleClearChat = () => {
    Alert.alert(
      language === "bn" ? "চ্যাট মুছে ফেলুন" : "Clear Chat",
      language === "bn"
        ? "আপনি কি সমস্ত বার্তা মুছে ফেলতে চান?"
        : "Are you sure you want to clear all messages?",
      [
        {
          text: language === "bn" ? "বাতিল" : "Cancel",
          style: "cancel",
        },
        {
          text: language === "bn" ? "মুছে ফেলুন" : "Clear",
          style: "destructive",
          onPress: () => {
            clearMessages();
            setShowSuggestions(true);
          },
        },
      ]
    );
  };

  const renderMessage = (message: ChatMessage, index: number) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser
          ? styles.userMessageContainer
          : styles.assistantMessageContainer,
      ]}
    >
      <Surface
        style={[
          styles.messageBubble,
          message.isUser
            ? styles.userMessageBubble
            : styles.assistantMessageBubble,
        ]}
        elevation={1}
      >
        {!message.isUser && (
          <View style={styles.assistantHeader}>
            <Icon name="robot" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.assistantLabel}>
              SmartFin AI
            </Text>
          </View>
        )}
        <Text
          variant="bodyMedium"
          style={[
            styles.messageText,
            message.isUser
              ? styles.userMessageText
              : styles.assistantMessageText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          variant="bodySmall"
          style={[
            styles.messageTime,
            message.isUser
              ? styles.userMessageTime
              : styles.assistantMessageTime,
          ]}
        >
          {(message.timestamp || new Date()).toLocaleTimeString("bn-BD", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Surface>
    </View>
  );

  const renderSuggestions = () => {
    if (!showSuggestions || messages.length > 2) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text variant="titleSmall" style={styles.suggestionsTitle}>
          {language === "bn" ? "প্রস্তাবিত প্রশ্ন:" : "Suggested Questions:"}
        </Text>
        <View style={styles.suggestionsGrid}>
          {suggestedQuestions.map((question, index) => (
            <Chip
              key={index}
              mode="outlined"
              onPress={() => handleSuggestionPress(question)}
              style={styles.suggestionChip}
            >
              {question}
            </Chip>
          ))}
        </View>
      </View>
    );
  };

  const renderQuickReplies = () => {
    if (quickReplies.length === 0 || isLoading) return null;

    return (
      <View style={styles.quickRepliesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickReplies.map((reply, index) => (
            <Chip
              key={index}
              mode="outlined"
              onPress={() => handleSuggestionPress(reply)}
              style={styles.quickReplyChip}
            >
              {reply}
            </Chip>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Icon name="robot" size={32} color={theme.colors.primary} />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={styles.headerTitle}>
                SmartFin AI
              </Text>
              <Text variant="bodySmall" style={styles.headerSubtitle}>
                {language === "bn" ? "আর্থিক সহায়ক" : "Financial Assistant"}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <IconButton
              icon={language === "bn" ? "translate" : "translate-off"}
              size={20}
              onPress={() => setLanguage(language === "bn" ? "en" : "bn")}
            />
            <IconButton
              icon="delete-sweep"
              size={20}
              onPress={handleClearChat}
            />
          </View>
        </View>
      </Surface>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Surface style={styles.loadingBubble} elevation={1}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.loadingText}>
                {language === "bn" ? "টাইপ করছি..." : "Typing..."}
              </Text>
            </Surface>
          </View>
        )}

        {renderSuggestions()}
      </ScrollView>

      {/* Quick Replies */}
      {renderQuickReplies()}

      {/* Input */}
      <Surface style={styles.inputContainer} elevation={3}>
        <View style={styles.inputRow}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              language === "bn"
                ? "আপনার প্রশ্ন লিখুন..."
                : "Type your question..."
            }
            multiline
            maxLength={500}
            style={styles.textInput}
            mode="outlined"
            disabled={isLoading}
            onSubmitEditing={() => handleSendMessage()}
          />
          <IconButton
            icon="send"
            size={24}
            mode="contained"
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            style={styles.sendButton}
          />
        </View>

        <Text variant="bodySmall" style={styles.inputHint}>
          {language === "bn"
            ? "💡 বিনিয়োগ, সঞ্চয়, বা আর্থিক পরিকল্পনা সম্পর্কে যেকোনো প্রশ্ন করুন"
            : "💡 Ask anything about investments, savings, or financial planning"}
        </Text>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  headerSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  headerActions: {
    flexDirection: "row",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: spacing.md,
    borderRadius: theme.roundness * 2,
  },
  userMessageBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.roundness / 2,
  },
  assistantMessageBubble: {
    backgroundColor: theme.colors.surfaceVariant,
    borderBottomLeftRadius: theme.roundness / 2,
  },
  assistantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  assistantLabel: {
    marginLeft: spacing.xs,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  messageText: {
    lineHeight: 20,
  },
  userMessageText: {
    color: theme.colors.onPrimary,
  },
  assistantMessageText: {
    color: theme.colors.onSurface,
  },
  messageTime: {
    marginTop: spacing.xs,
    fontSize: 10,
  },
  userMessageTime: {
    color: theme.colors.onPrimary,
    opacity: 0.7,
    textAlign: "right",
  },
  assistantMessageTime: {
    color: theme.colors.onSurfaceVariant,
  },
  loadingContainer: {
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: theme.roundness * 2,
    backgroundColor: theme.colors.surfaceVariant,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: theme.colors.onSurfaceVariant,
  },
  suggestionsContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.roundness,
  },
  suggestionsTitle: {
    marginBottom: spacing.md,
    color: theme.colors.onPrimaryContainer,
    fontWeight: "bold",
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  suggestionChip: {
    marginBottom: spacing.xs,
  },
  quickRepliesContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  quickReplyChip: {
    marginRight: spacing.sm,
  },
  inputContainer: {
    padding: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
  },
  textInput: {
    flex: 1,
    marginRight: spacing.sm,
    maxHeight: 100,
    backgroundColor: theme.colors.background,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
  },
  inputHint: {
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    fontStyle: "italic",
  },
});
export default ChatScreen;
