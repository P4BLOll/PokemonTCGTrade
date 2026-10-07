import React from "react";
import { View, Text, StyleProp, ViewStyle } from "react-native";
import { DesignTokens, glowText } from "@/constants/Tokens";
import { styles } from "./styles";

export interface TerminalPanelProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  borderColor?: string;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  title,
  subtitle,
  rightElement,
  children,
  style,
  bodyStyle,
  borderColor = DesignTokens.colors.amberDim,
}) => {
  return (
    <View style={[styles.panelFrame, { borderColor }, style]}>
      <View style={[styles.titleBar, { borderBottomColor: borderColor }]}>
        <View style={styles.titleGroup}>
          <Text style={[styles.titleText, glowText("body")]}>{title}</Text>
          {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
        </View>
        {rightElement ? <View style={styles.rightGroup}>{rightElement}</View> : null}
      </View>
      <View style={[styles.panelBody, bodyStyle]}>{children}</View>
    </View>
  );
};

export const Panel = TerminalPanel;
