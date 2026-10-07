import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { DesignTokens, glowText } from "@/constants/Tokens";
import { TerminalButton } from "../TerminalButton";
import { AeroIcon } from "../AeroIcon";
import { styles } from "./styles";

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  costCR?: number;
  costCr?: number;
  shipName?: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  isDanger?: boolean;
  isDangerous?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  costCR,
  costCr,
  shipName,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  isDanger,
  isDangerous,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const actualCost = costCR ?? costCr;
  const actualConfirmLabel = confirmLabel ?? confirmText ?? "CONFIRMAR ORDEM";
  const actualCancelLabel = cancelLabel ?? cancelText ?? "CANCELAR [ESC]";
  const actualIsDanger = isDanger ?? isDangerous ?? false;

  useEffect(() => {
    if (!visible || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <AeroIcon
                name={actualIsDanger ? "warning" : "shield"}
                size={16}
                color={actualIsDanger ? DesignTokens.colors.alert : DesignTokens.colors.amber}
              />
              <Text style={[styles.headerTitle, actualIsDanger && { color: DesignTokens.colors.alert }]}>
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel} accessibilityLabel="Fechar modal">
              <AeroIcon name="close" size={16} color={DesignTokens.colors.amberMid} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {shipName && (
              <View style={styles.shipHighlightBox}>
                <Text style={styles.shipHighlightLabel}>VETOR SELECIONADO:</Text>
                <Text style={[styles.shipHighlightName, glowText("body")]}>{shipName}</Text>
              </View>
            )}

            <Text style={styles.messageText}>{message}</Text>

            {actualCost !== undefined && (
              <View style={styles.costBox}>
                <Text style={styles.costLabel}>TARIFA DE DESPACHO:</Text>
                <Text style={styles.costValue}>-{actualCost.toLocaleString()} CR</Text>
              </View>
            )}

            <View style={styles.actionsRow}>
              <TerminalButton
                title={actualCancelLabel}
                variant="secondary"
                size="md"
                onPress={onCancel}
                style={{ flex: 1 }}
              />
              <TerminalButton
                title={actualConfirmLabel}
                variant={actualIsDanger ? "danger" : "primary"}
                size="md"
                loading={loading}
                onPress={onConfirm}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const ModalDialog = ConfirmModal;
