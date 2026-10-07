import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { DesignTokens } from "@/constants/Tokens";
import { AeroIcon } from "@/components/AeroIcon";
import { PixelShipView, getShipClassColor } from "@/components/PixelShipView";
import { ShipAssetDTO } from "@/services/api";
import { styles } from "./styles";

export interface ShipAssetCardProps {
  card?: ShipAssetDTO;
  asset?: ShipAssetDTO;
  ship?: {
    id?: string;
    code?: string;
    name: string;
    classType?: string;
    type?: string;
    rarity?: string;
    status?: string;
    contractRateCR?: number;
    marketPrice?: number;
    shieldPercent?: number;
    fuelPercent?: number;
    isRareSingleUnit?: boolean;
  };
  onPress?: () => void;
  onDispatch?: () => void;
  style?: any;
}

// Card visual que exibe a nave com escudo, preço, sprite em pixel art e botão de despachar
export const ShipAssetCard: React.FC<ShipAssetCardProps> = ({
  card,
  ship,
  onPress,
  onDispatch,
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Normaliza os atributos da nave vinda de diferentes fontes (catálogo ou doca)
  const name = ship?.name || card?.name || "TACTICAL_VESSEL";
  const classType = (ship?.classType || ship?.type || card?.type || "INTERCEPTOR").toUpperCase();
  const rarity = ship?.rarity || card?.rarity || "FLEET_STANDARD";
  const price = ship?.contractRateCR || ship?.marketPrice || card?.marketPrice || 150;
  const shield = ship?.shieldPercent || card?.hp || 100;


  const isRare =
    rarity === "SECRET_RARE" ||
    rarity === "PROTOTYPE" ||
    rarity === "SECRET" ||
    name.toUpperCase().includes("PROTO") ||
    name.toUpperCase().includes("STARHAWK") ||
    Boolean(ship?.isRareSingleUnit);

  const shipColor = getShipClassColor(classType, isRare, name);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      // @ts-ignore
      onMouseEnter={() => setIsHovered(true)}
      // @ts-ignore
      onMouseLeave={() => setIsHovered(false)}
      style={[
        styles.cardContainer,
        { borderTopColor: shipColor, borderTopWidth: 1 },
        isHovered && { borderColor: shipColor, backgroundColor: `${shipColor}0D` },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.codeWrap}>
          <Text style={[styles.screwMark, { color: shipColor }]}>[+]</Text>
          <Text style={[styles.cardName, { color: shipColor }]} numberOfLines={1}>{name}</Text>
        </View>
        <Text style={[styles.cardType, { color: shipColor, opacity: 0.85 }]}>// {classType}</Text>
      </View>

      <View
        style={[
          styles.blueprintContainer,
          { borderColor: `${shipColor}4D`, backgroundColor: `${shipColor}08` },
        ]}
      >
        <PixelShipView
          classType={classType}
          size={110}
          color={shipColor}
          showBlueprintGrid
        />
      </View>

      <View style={styles.telemetryRow}>
        <Text style={styles.telemetryLabel}>INTEGRIDADE DO CASCO:</Text>
        <Text style={[styles.telemetryVal, { color: shipColor }]}>{shield}%</Text>
      </View>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${Math.min(shield, 100)}%`, backgroundColor: shipColor }]} />
      </View>

      <View style={styles.footerRow}>
        <View style={[styles.rarityPill, isRare && { borderColor: shipColor, backgroundColor: `${shipColor}1F` }]}>
          <Text style={[styles.rarityText, isRare && { color: shipColor }]}>{rarity.replace("_", " ")}</Text>
        </View>

        <View style={styles.priceRow}>
          <AeroIcon name="credit" size={13} color={DesignTokens.colors.statusWarning} />
          <Text style={styles.priceText}>{price} CR</Text>
        </View>
      </View>

      {onDispatch && (
        <TouchableOpacity
          style={[styles.dispatchBtn, { backgroundColor: shipColor }]}
          onPress={onDispatch}
        >
          <AeroIcon name="send" size={12} color={DesignTokens.colors.bgDeep} />
          <Text style={styles.dispatchBtnText}>ORDEM DE DESPACHO</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export const CardComponent = ShipAssetCard;
