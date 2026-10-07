import React from "react";
import { View, Text, StyleProp, ViewStyle, TextStyle } from "react-native";
import { DesignTokens } from "@/constants/Tokens";
import { styles } from "./styles";

export interface TerminalTagProps {
  label: string;
  variant?: "amber" | "alert" | "info" | "dim" | "custom";
  customColor?: string;
  fixedWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const TerminalTag: React.FC<TerminalTagProps> = ({
  label,
  variant = "amber",
  customColor,
  fixedWidth = false,
  style,
  textStyle,
}) => {
  const getColor = () => {
    if (customColor) return customColor;
    switch (variant) {
      case "amber":
        return DesignTokens.colors.amber;
      case "alert":
        return DesignTokens.colors.alert;
      case "info":
        return DesignTokens.colors.textSecondary;
      case "dim":
        return DesignTokens.colors.amberMid;
      default:
        return DesignTokens.colors.amber;
    }
  };

  const color = getColor();

  return (
    <View
      style={[
        styles.tagContainer,
        { borderColor: color },
        fixedWidth && styles.fixedWidth,
        style,
      ]}
    >
      <Text style={[styles.tagText, { color }, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

export const Tag = TerminalTag;
