import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { DesignTokens } from "@/constants/Tokens";
import { AeroIcon } from "../AeroIcon";
import { styles } from "./styles";

export interface TerminalButtonProps {
  title: string;
  icon?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
  title,
  icon,
  variant = "primary",
  disabled = false,
  loading = false,
  onPress,
  size = "md",
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isSecondary = variant === "secondary";

  const getContainerStyle = () => {
    switch (variant) {
      case "primary":
        return styles.btnPrimary;
      case "secondary":
        return styles.btnSecondary;
      case "danger":
        return styles.btnDanger;
      case "ghost":
        return styles.btnGhost;
    }
  };

  const getTextColor = () => {
    if (disabled) return DesignTokens.colors.amberDim;
    if (isPrimary) return DesignTokens.colors.bgDeep;
    if (isDanger) return DesignTokens.colors.alert;
    return DesignTokens.colors.amber;
  };

  const textColor = getTextColor();

  const sizeStyle = size === "sm" ? styles.sizeSm : size === "lg" ? styles.sizeLg : styles.sizeMd;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.baseButton,
        sizeStyle,
        getContainerStyle(),
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon ? (
            <AeroIcon
              name={icon}
              size={size === "sm" ? 13 : size === "lg" ? 16 : 14}
              color={textColor}
              style={{ marginRight: 6 }}
            />
          ) : null}
          <Text
            style={[
              styles.btnText,
              styles[`textSize_${size}`],
              { color: textColor },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const Button = TerminalButton;
