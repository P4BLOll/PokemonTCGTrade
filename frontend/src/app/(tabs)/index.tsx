import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DesignTokens } from "@/constants/Tokens";
import { Header } from "@/components/Header";
import { PokemonCardItem } from "@/components/PokemonCardItem";
import { useAuth } from "@/context/AuthContext";
import { Card, CardOwner, cardService, binderService } from "@/services/api";

// ── DADOS ESTÁTICOS / FILTROS ──
const EXPANSIONS_LIST = [
  { id: "Base Set", name: "Base Set", year: "1999" },
  { id: "Fossil", name: "Fossil", year: "1999" },
  { id: "Neo Genesis", name: "Neo Genesis", year: "2000" },
  { id: "Evolving Skies", name: "Evolving Skies", year: "2021" },
];

const TYPES_LIST = [
  { id: "FIRE", name: "Fogo", icon: "flame", color: "#FF4422" },
  { id: "WATER", name: "Água", icon: "water", color: "#3399FF" },
  { id: "GRASS", name: "Grama", icon: "leaf", color: "#77CC55" },
  { id: "ELECTRIC", name: "Elétrico", icon: "flash", color: "#FFCC33" },
  { id: "PSYCHIC", name: "Psíquico", icon: "eye", color: "#FF5599" },
  { id: "FIGHTING", name: "Lutador", icon: "fitness", color: "#BB5544" },
  { id: "DARKNESS", name: "Sombrio", icon: "moon", color: "#705848" },
  { id: "DRAGON", name: "Dragão", icon: "sparkles", color: "#7766EE" },
  { id: "COLORLESS", name: "Incolor", icon: "star", color: "#A8A878" },
];

const RARITIES_LIST = [
  { id: "COMMON", name: "Comum", symbol: "●" },
  { id: "UNCOMMON", name: "Incomum", symbol: "◆" },
  { id: "RARE", name: "Rara", symbol: "★" },
  { id: "ULTRA_RARE", name: "Rara Holo", symbol: "★★★" },
  { id: "SECRET_RARE", name: "Secreta Rara", symbol: "✦✦✦" },
];

const CATEGORIES = [
  { id: "ALL", name: "Todas as Cartas", description: "Ver catálogo completo" },
  { id: "POKEMON", name: "Pokémon", description: "Criaturas colecionáveis" },
  { id: "TRAINER", name: "Treinador", description: "Cartas de suporte e itens (0 disponíveis)", disabled: true },
  { id: "ENERGY", name: "Energia", description: "Cartas de energia elemental (0 disponíveis)", disabled: true },
];

const SORT_OPTIONS = [
  { id: "relevance", label: "Mais relevantes" },
  { id: "price", label: "Preço" },
  { id: "name", label: "Nome A–Z" },
  { id: "hp", label: "Pontos de Vida (HP)" },
  { id: "rarity", label: "Raridade" },
];

// Cartas Mockadas para Fallback Completo das 4 Coleções
const FALLBACK_CARDS: Card[] = [
  // Base Set (1999)
  { id: "card-base1-1", name: "Alakazam", type: "PSYCHIC", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 80, imageUrl: "https://images.pokemontcg.io/base1/1_hires.png", marketPrice: 350.00 },
  { id: "card-blastoise", name: "Blastoise", type: "WATER", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 100, imageUrl: "https://images.pokemontcg.io/base1/2_hires.png", marketPrice: 420.00 },
  { id: "card-base1-3", name: "Chansey", type: "COLORLESS", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 120, imageUrl: "https://images.pokemontcg.io/base1/3_hires.png", marketPrice: 180.00 },
  { id: "card-charizard", name: "Charizard", type: "FIRE", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 120, imageUrl: "https://images.pokemontcg.io/base1/4_hires.png", marketPrice: 1850.00 },
  { id: "card-base1-5", name: "Clefairy", type: "COLORLESS", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 40, imageUrl: "https://images.pokemontcg.io/base1/5_hires.png", marketPrice: 120.00 },
  { id: "card-base1-6", name: "Gyarados", type: "WATER", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 100, imageUrl: "https://images.pokemontcg.io/base1/6_hires.png", marketPrice: 160.00 },
  { id: "card-base1-7", name: "Hitmonchan", type: "FIGHTING", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 70, imageUrl: "https://images.pokemontcg.io/base1/7_hires.png", marketPrice: 110.00 },
  { id: "card-base1-8", name: "Machamp", type: "FIGHTING", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 100, imageUrl: "https://images.pokemontcg.io/base1/8_hires.png", marketPrice: 140.00 },
  { id: "card-base1-9", name: "Magneton", type: "ELECTRIC", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 60, imageUrl: "https://images.pokemontcg.io/base1/9_hires.png", marketPrice: 95.00 },
  { id: "card-mewtwo", name: "Mewtwo", type: "PSYCHIC", rarity: "RARE", expansion: "Base Set", hp: 70, imageUrl: "https://images.pokemontcg.io/base1/10_hires.png", marketPrice: 190.00 },
  { id: "card-base1-11", name: "Nidoking", type: "GRASS", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 90, imageUrl: "https://images.pokemontcg.io/base1/11_hires.png", marketPrice: 130.00 },
  { id: "card-base1-12", name: "Ninetales", type: "FIRE", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 80, imageUrl: "https://images.pokemontcg.io/base1/12_hires.png", marketPrice: 125.00 },
  { id: "card-base1-13", name: "Poliwrath", type: "WATER", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 90, imageUrl: "https://images.pokemontcg.io/base1/13_hires.png", marketPrice: 115.00 },
  { id: "card-base1-14", name: "Raichu", type: "ELECTRIC", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 90, imageUrl: "https://images.pokemontcg.io/base1/14_hires.png", marketPrice: 210.00 },
  { id: "card-venusaur", name: "Venusaur", type: "GRASS", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 100, imageUrl: "https://images.pokemontcg.io/base1/15_hires.png", marketPrice: 360.00 },
  { id: "card-base1-16", name: "Zapdos", type: "ELECTRIC", rarity: "ULTRA_RARE", expansion: "Base Set", hp: 90, imageUrl: "https://images.pokemontcg.io/base1/16_hires.png", marketPrice: 230.00 },
  { id: "card-base1-24", name: "Charmeleon", type: "FIRE", rarity: "UNCOMMON", expansion: "Base Set", hp: 80, imageUrl: "https://images.pokemontcg.io/base1/24_hires.png", marketPrice: 45.00 },
  { id: "card-base1-30", name: "Ivysaur", type: "GRASS", rarity: "UNCOMMON", expansion: "Base Set", hp: 60, imageUrl: "https://images.pokemontcg.io/base1/30_hires.png", marketPrice: 35.00 },
  { id: "card-base1-42", name: "Wartortle", type: "WATER", rarity: "UNCOMMON", expansion: "Base Set", hp: 70, imageUrl: "https://images.pokemontcg.io/base1/42_hires.png", marketPrice: 40.00 },
  { id: "card-base1-44", name: "Bulbasaur", type: "GRASS", rarity: "COMMON", expansion: "Base Set", hp: 40, imageUrl: "https://images.pokemontcg.io/base1/44_hires.png", marketPrice: 50.00 },
  { id: "card-base1-46", name: "Charmander", type: "FIRE", rarity: "COMMON", expansion: "Base Set", hp: 50, imageUrl: "https://images.pokemontcg.io/base1/46_hires.png", marketPrice: 55.00 },
  { id: "card-pikachu", name: "Pikachu", type: "ELECTRIC", rarity: "COMMON", expansion: "Base Set", hp: 40, imageUrl: "https://images.pokemontcg.io/base1/58_hires.png", marketPrice: 85.00 },
  { id: "card-base1-63", name: "Squirtle", type: "WATER", rarity: "COMMON", expansion: "Base Set", hp: 40, imageUrl: "https://images.pokemontcg.io/base1/63_hires.png", marketPrice: 50.00 },

  // Fossil (1999)
  { id: "card-aerodactyl", name: "Aerodactyl", type: "FIGHTING", rarity: "RARE", expansion: "Fossil", hp: 60, imageUrl: "https://images.pokemontcg.io/base3/1_hires.png", marketPrice: 160.00 },
  { id: "card-base3-2", name: "Articuno", type: "WATER", rarity: "ULTRA_RARE", expansion: "Fossil", hp: 70, imageUrl: "https://images.pokemontcg.io/base3/2_hires.png", marketPrice: 240.00 },
  { id: "card-base3-3", name: "Ditto", type: "COLORLESS", rarity: "RARE", expansion: "Fossil", hp: 50, imageUrl: "https://images.pokemontcg.io/base3/3_hires.png", marketPrice: 130.00 },
  { id: "card-dragonite", name: "Dragonite", type: "COLORLESS", rarity: "RARE", expansion: "Fossil", hp: 100, imageUrl: "https://images.pokemontcg.io/base3/4_hires.png", marketPrice: 280.00 },
  { id: "card-base3-5", name: "Gengar Holo", type: "PSYCHIC", rarity: "ULTRA_RARE", expansion: "Fossil", hp: 80, imageUrl: "https://images.pokemontcg.io/base3/5_hires.png", marketPrice: 310.00 },
  { id: "card-base3-6", name: "Haunter", type: "PSYCHIC", rarity: "RARE", expansion: "Fossil", hp: 50, imageUrl: "https://images.pokemontcg.io/base3/6_hires.png", marketPrice: 85.00 },
  { id: "card-base3-7", name: "Hitmonlee", type: "FIGHTING", rarity: "RARE", expansion: "Fossil", hp: 60, imageUrl: "https://images.pokemontcg.io/base3/7_hires.png", marketPrice: 95.00 },
  { id: "card-base3-8", name: "Hypno", type: "PSYCHIC", rarity: "RARE", expansion: "Fossil", hp: 90, imageUrl: "https://images.pokemontcg.io/base3/8_hires.png", marketPrice: 90.00 },
  { id: "card-base3-9", name: "Kabutops", type: "FIGHTING", rarity: "RARE", expansion: "Fossil", hp: 60, imageUrl: "https://images.pokemontcg.io/base3/9_hires.png", marketPrice: 140.00 },
  { id: "card-base3-10", name: "Lapras", type: "WATER", rarity: "ULTRA_RARE", expansion: "Fossil", hp: 80, imageUrl: "https://images.pokemontcg.io/base3/10_hires.png", marketPrice: 195.00 },
  { id: "card-base3-11", name: "Magneton Fossil", type: "ELECTRIC", rarity: "RARE", expansion: "Fossil", hp: 70, imageUrl: "https://images.pokemontcg.io/base3/11_hires.png", marketPrice: 85.00 },
  { id: "card-base3-12", name: "Moltres", type: "FIRE", rarity: "ULTRA_RARE", expansion: "Fossil", hp: 70, imageUrl: "https://images.pokemontcg.io/base3/12_hires.png", marketPrice: 260.00 },
  { id: "card-base3-13", name: "Muk", type: "GRASS", rarity: "RARE", expansion: "Fossil", hp: 70, imageUrl: "https://images.pokemontcg.io/base3/13_hires.png", marketPrice: 75.00 },
  { id: "card-base3-14", name: "Raichu Fossil", type: "ELECTRIC", rarity: "RARE", expansion: "Fossil", hp: 90, imageUrl: "https://images.pokemontcg.io/base3/14_hires.png", marketPrice: 150.00 },
  { id: "card-base3-15", name: "Zapdos Fossil", type: "ELECTRIC", rarity: "ULTRA_RARE", expansion: "Fossil", hp: 80, imageUrl: "https://images.pokemontcg.io/base3/15_hires.png", marketPrice: 275.00 },
  { id: "card-gengar", name: "Gengar", type: "PSYCHIC", rarity: "RARE", expansion: "Fossil", hp: 80, imageUrl: "https://images.pokemontcg.io/base3/20_hires.png", marketPrice: 220.00 },
  { id: "card-base3-36", name: "Golem", type: "FIGHTING", rarity: "UNCOMMON", expansion: "Fossil", hp: 80, imageUrl: "https://images.pokemontcg.io/base3/36_hires.png", marketPrice: 30.00 },
  { id: "card-base3-37", name: "Graveler", type: "FIGHTING", rarity: "UNCOMMON", expansion: "Fossil", hp: 60, imageUrl: "https://images.pokemontcg.io/base3/37_hires.png", marketPrice: 25.00 },
  { id: "card-base3-44", name: "Tentacruel", type: "WATER", rarity: "UNCOMMON", expansion: "Fossil", hp: 60, imageUrl: "https://images.pokemontcg.io/base3/44_hires.png", marketPrice: 20.00 },
  { id: "card-base3-48", name: "Grimer", type: "GRASS", rarity: "COMMON", expansion: "Fossil", hp: 50, imageUrl: "https://images.pokemontcg.io/base3/48_hires.png", marketPrice: 15.00 },
  { id: "card-base3-50", name: "Kabuto", type: "FIGHTING", rarity: "COMMON", expansion: "Fossil", hp: 30, imageUrl: "https://images.pokemontcg.io/base3/50_hires.png", marketPrice: 18.00 },
  { id: "card-base3-52", name: "Omanyte", type: "WATER", rarity: "COMMON", expansion: "Fossil", hp: 40, imageUrl: "https://images.pokemontcg.io/base3/52_hires.png", marketPrice: 18.00 },
  { id: "card-base3-55", name: "Slowpoke", type: "PSYCHIC", rarity: "COMMON", expansion: "Fossil", hp: 50, imageUrl: "https://images.pokemontcg.io/base3/55_hires.png", marketPrice: 22.00 },

  // Neo Genesis (2000)
  { id: "card-neo1-1", name: "Ampharos", type: "ELECTRIC", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 80, imageUrl: "https://images.pokemontcg.io/neo1/1_hires.png", marketPrice: 180.00 },
  { id: "card-neo1-2", name: "Azumarill", type: "WATER", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 70, imageUrl: "https://images.pokemontcg.io/neo1/2_hires.png", marketPrice: 110.00 },
  { id: "card-neo1-3", name: "Bellossom", type: "GRASS", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 70, imageUrl: "https://images.pokemontcg.io/neo1/3_hires.png", marketPrice: 105.00 },
  { id: "card-neo1-4", name: "Feraligatr", type: "WATER", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 120, imageUrl: "https://images.pokemontcg.io/neo1/4_hires.png", marketPrice: 450.00 },
  { id: "card-neo1-5", name: "Feraligatr (Riptide)", type: "WATER", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 100, imageUrl: "https://images.pokemontcg.io/neo1/5_hires.png", marketPrice: 320.00 },
  { id: "card-neo1-6", name: "Heracross", type: "GRASS", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 60, imageUrl: "https://images.pokemontcg.io/neo1/6_hires.png", marketPrice: 120.00 },
  { id: "card-neo1-8", name: "Kingdra", type: "WATER", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 90, imageUrl: "https://images.pokemontcg.io/neo1/8_hires.png", marketPrice: 160.00 },
  { id: "card-lugia", name: "Lugia", type: "COLORLESS", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 90, imageUrl: "https://images.pokemontcg.io/neo1/9_hires.png", marketPrice: 980.00 },
  { id: "card-neo1-10", name: "Meganium", type: "GRASS", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 100, imageUrl: "https://images.pokemontcg.io/neo1/10_hires.png", marketPrice: 340.00 },
  { id: "card-neo1-11", name: "Meganium (Wild Growth)", type: "GRASS", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 100, imageUrl: "https://images.pokemontcg.io/neo1/11_hires.png", marketPrice: 290.00 },
  { id: "card-neo1-12", name: "Pichu", type: "ELECTRIC", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 30, imageUrl: "https://images.pokemontcg.io/neo1/12_hires.png", marketPrice: 310.00 },
  { id: "card-neo1-13", name: "Skarmory", type: "COLORLESS", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 60, imageUrl: "https://images.pokemontcg.io/neo1/13_hires.png", marketPrice: 140.00 },
  { id: "card-neo1-14", name: "Slowking", type: "PSYCHIC", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 80, imageUrl: "https://images.pokemontcg.io/neo1/14_hires.png", marketPrice: 220.00 },
  { id: "card-neo1-15", name: "Steelix", type: "FIGHTING", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 110, imageUrl: "https://images.pokemontcg.io/neo1/15_hires.png", marketPrice: 260.00 },
  { id: "card-neo1-16", name: "Togetic", type: "COLORLESS", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 60, imageUrl: "https://images.pokemontcg.io/neo1/16_hires.png", marketPrice: 175.00 },
  { id: "card-typhlosion", name: "Typhlosion", type: "FIRE", rarity: "RARE", expansion: "Neo Genesis", hp: 100, imageUrl: "https://images.pokemontcg.io/neo1/17_hires.png", marketPrice: 650.00 },
  { id: "card-neo1-18", name: "Typhlosion (Fire Recharge)", type: "FIRE", rarity: "ULTRA_RARE", expansion: "Neo Genesis", hp: 100, imageUrl: "https://images.pokemontcg.io/neo1/18_hires.png", marketPrice: 480.00 },
  { id: "card-neo1-20", name: "Cleffa", type: "COLORLESS", rarity: "RARE", expansion: "Neo Genesis", hp: 30, imageUrl: "https://images.pokemontcg.io/neo1/20_hires.png", marketPrice: 95.00 },
  { id: "card-neo1-21", name: "Donphan", type: "FIGHTING", rarity: "RARE", expansion: "Neo Genesis", hp: 70, imageUrl: "https://images.pokemontcg.io/neo1/21_hires.png", marketPrice: 80.00 },
  { id: "card-neo1-22", name: "Elekid", type: "ELECTRIC", rarity: "RARE", expansion: "Neo Genesis", hp: 30, imageUrl: "https://images.pokemontcg.io/neo1/22_hires.png", marketPrice: 85.00 },
  { id: "card-neo1-28", name: "Bayleef", type: "GRASS", rarity: "UNCOMMON", expansion: "Neo Genesis", hp: 70, imageUrl: "https://images.pokemontcg.io/neo1/28_hires.png", marketPrice: 35.00 },
  { id: "card-neo1-31", name: "Croconaw", type: "WATER", rarity: "UNCOMMON", expansion: "Neo Genesis", hp: 70, imageUrl: "https://images.pokemontcg.io/neo1/31_hires.png", marketPrice: 35.00 },
  { id: "card-neo1-41", name: "Quilava", type: "FIRE", rarity: "UNCOMMON", expansion: "Neo Genesis", hp: 70, imageUrl: "https://images.pokemontcg.io/neo1/41_hires.png", marketPrice: 38.00 },
  { id: "card-neo1-54", name: "Chikorita", type: "GRASS", rarity: "COMMON", expansion: "Neo Genesis", hp: 40, imageUrl: "https://images.pokemontcg.io/neo1/54_hires.png", marketPrice: 25.00 },
  { id: "card-neo1-56", name: "Cyndaquil", type: "FIRE", rarity: "COMMON", expansion: "Neo Genesis", hp: 40, imageUrl: "https://images.pokemontcg.io/neo1/56_hires.png", marketPrice: 30.00 },
  { id: "card-neo1-80", name: "Totodile", type: "WATER", rarity: "COMMON", expansion: "Neo Genesis", hp: 50, imageUrl: "https://images.pokemontcg.io/neo1/80_hires.png", marketPrice: 25.00 },

  // Evolving Skies (2021)
  { id: "card-swsh7-7", name: "Leafeon V", type: "GRASS", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 210, imageUrl: "https://images.pokemontcg.io/swsh7/7_hires.png", marketPrice: 80.00 },
  { id: "card-swsh7-40", name: "Glaceon V", type: "WATER", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 210, imageUrl: "https://images.pokemontcg.io/swsh7/40_hires.png", marketPrice: 75.00 },
  { id: "card-swsh7-74", name: "Sylveon V", type: "PSYCHIC", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 200, imageUrl: "https://images.pokemontcg.io/swsh7/74_hires.png", marketPrice: 85.00 },
  { id: "card-swsh7-94", name: "Umbreon V", type: "DARKNESS", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 220, imageUrl: "https://images.pokemontcg.io/swsh7/94_hires.png", marketPrice: 95.00 },
  { id: "card-swsh7-110", name: "Rayquaza V", type: "DRAGON", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 210, imageUrl: "https://images.pokemontcg.io/swsh7/110_hires.png", marketPrice: 120.00 },
  { id: "card-swsh7-167", name: "Dragonite V", type: "DRAGON", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 230, imageUrl: "https://images.pokemontcg.io/swsh7/167_hires.png", marketPrice: 420.00 },
  { id: "card-swsh7-175", name: "Leafeon V Alt Art", type: "GRASS", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 210, imageUrl: "https://images.pokemontcg.io/swsh7/175_hires.png", marketPrice: 350.00 },
  { id: "card-swsh7-180", name: "Flareon V", type: "FIRE", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 210, imageUrl: "https://images.pokemontcg.io/swsh7/180_hires.png", marketPrice: 110.00 },
  { id: "card-swsh7-184", name: "Glaceon V Alt Art", type: "WATER", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 210, imageUrl: "https://images.pokemontcg.io/swsh7/184_hires.png", marketPrice: 380.00 },
  { id: "card-swsh7-189", name: "Sylveon V Alt Art", type: "PSYCHIC", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 200, imageUrl: "https://images.pokemontcg.io/swsh7/189_hires.png", marketPrice: 390.00 },
  { id: "card-swsh7-192", name: "Umbreon V Alt Art", type: "DARKNESS", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 220, imageUrl: "https://images.pokemontcg.io/swsh7/192_hires.png", marketPrice: 550.00 },
  { id: "card-swsh7-194", name: "Rayquaza V Alt Art", type: "DRAGON", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 210, imageUrl: "https://images.pokemontcg.io/swsh7/194_hires.png", marketPrice: 580.00 },
  { id: "card-swsh7-195", name: "Duraludon V", type: "DRAGON", rarity: "ULTRA_RARE", expansion: "Evolving Skies", hp: 220, imageUrl: "https://images.pokemontcg.io/swsh7/195_hires.png", marketPrice: 95.00 },
  { id: "card-swsh7-205", name: "Leafeon VMAX Alt Art", type: "GRASS", rarity: "SECRET_RARE", expansion: "Evolving Skies", hp: 310, imageUrl: "https://images.pokemontcg.io/swsh7/205_hires.png", marketPrice: 1100.00 },
  { id: "card-swsh7-209", name: "Glaceon VMAX Alt Art", type: "WATER", rarity: "SECRET_RARE", expansion: "Evolving Skies", hp: 310, imageUrl: "https://images.pokemontcg.io/swsh7/209_hires.png", marketPrice: 1250.00 },
  { id: "card-swsh7-212", name: "Sylveon VMAX Alt Art", type: "PSYCHIC", rarity: "SECRET_RARE", expansion: "Evolving Skies", hp: 310, imageUrl: "https://images.pokemontcg.io/swsh7/212_hires.png", marketPrice: 1350.00 },
  { id: "card-umbreon", name: "Umbreon VMAX Alt Art", type: "DARKNESS", rarity: "SECRET_RARE", expansion: "Evolving Skies", hp: 310, imageUrl: "https://images.pokemontcg.io/swsh7/215_hires.png", marketPrice: 3800.00 },
  { id: "card-rayquaza", name: "Rayquaza VMAX", type: "DRAGON", rarity: "SECRET_RARE", expansion: "Evolving Skies", hp: 320, imageUrl: "https://images.pokemontcg.io/swsh7/218_hires.png", marketPrice: 1450.00 },
  { id: "card-swsh7-220", name: "Duraludon VMAX Alt Art", type: "DRAGON", rarity: "SECRET_RARE", expansion: "Evolving Skies", hp: 330, imageUrl: "https://images.pokemontcg.io/swsh7/220_hires.png", marketPrice: 280.00 },
];

export default function CatalogScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 640 && width < 1024;

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Cartas que o usuário possui na "Minha Coleção"
  const [userOwnedMap, setUserOwnedMap] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Filtros com Seleção Múltipla
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [onlyWithTradeOffers, setOnlyWithTradeOffers] = useState(false);
  const [cardsWithOffers, setCardsWithOffers] = useState<string[]>([]);

  // Ordenação
  const [sortBy, setSortBy] = useState("relevance");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Visualização (Grade vs Lista)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Accordion da Sidebar
  const [accordion, setAccordion] = useState({
    expansions: true,
    types: true,
    rarities: true,
  });

  // Mobile Drawer
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Busca: Foco, Histórico e Sugestões
  const searchInputRef = useRef<any>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(["Charizard", "Base Set", "Lugia", "Pikachu"]);

  // Modal de Detalhes da Carta (Lightbox / Deep Dive)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [owners, setOwners] = useState<CardOwner[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);

  // Feedback Toast
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Scroll to Top
  const scrollRef = useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ── BUSCA DE DADOS & COLEÇÃO ──
  const fetchCatalogData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [data, offers] = await Promise.all([
        cardService.getCatalog(),
        cardService.getCardsWithOffers().catch(() => []),
      ]);
      if (data && data.length > 0) {
        setCards(data);
      } else {
        setCards(FALLBACK_CARDS);
      }
      setCardsWithOffers(offers || []);
    } catch (e) {
      console.warn("Falha ao carregar catálogo da API, utilizando dados mockados:", e);
      setCards(FALLBACK_CARDS);
      setCardsWithOffers([
        "card-pikachu", "card-charizard", "card-gengar", "card-base1-44",
        "card-base1-63", "card-base3-12", "card-neo1-56", "card-blastoise",
        "card-lugia", "card-base1-6", "card-base3-10", "card-neo1-4",
        "card-swsh7-184", "card-venusaur", "card-rayquaza", "card-mewtwo"
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCollection = async () => {
    if (!user) return;
    try {
      const binder = await binderService.getBinder(user);
      if (binder && binder.cards) {
        const countsMap: Record<string, number> = {};
        binder.cards.forEach((item) => {
          countsMap[item.cardId] = (countsMap[item.cardId] || 0) + 1;
        });
        setUserOwnedMap(countsMap);
      }
    } catch (e) {
      console.warn("Erro ao buscar Minha Coleção do usuário:", e);
    }
  };

  useEffect(() => {
    fetchCatalogData();
    fetchUserCollection();
  }, [user]);

  // ── ATALHO DE TECLADO "/" PARA BUSCA & ESC PARA FECHAR MODAL ──
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Atalho "/" para focar na busca se não estiver digitando em outro input
        if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault();
          searchInputRef.current?.focus?.();
        }
        // Tecla Esc fecha modais
        if (e.key === "Escape") {
          if (selectedCard) setSelectedCard(null);
          if (mobileDrawerOpen) setMobileDrawerOpen(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedCard, mobileDrawerOpen]);

  // ── DEBOUNCE DA BUSCA (250ms) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // ── SINCRONIZAÇÃO COM URL (Query String no Navegador) ──
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (selectedExpansions.length > 0) params.set("sets", selectedExpansions.join(","));
      if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
      if (selectedRarities.length > 0) params.set("rarity", selectedRarities.join(","));
      if (selectedCategory !== "ALL") params.set("cat", selectedCategory);
      if (sortBy !== "relevance") params.set("sort", sortBy);
      if (sortDirection !== "desc") params.set("dir", sortDirection);

      const queryStr = params.toString();
      const newUrl = queryStr ? `${window.location.pathname}?${queryStr}` : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [debouncedSearch, selectedExpansions, selectedTypes, selectedRarities, selectedCategory, sortBy, sortDirection]);

  // ── CONTROLE DE TOAST COM DESFAZER ──
  const showToast = (message: string, onUndo?: () => void) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, onUndo });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const toggleFavorite = (card: Card) => {
    const isFav = !favorites[card.id];
    setFavorites((prev) => ({ ...prev, [card.id]: isFav }));
    showToast(
      isFav ? `${card.name} adicionado aos favoritos.` : `${card.name} removido dos favoritos.`,
      () => {
        setFavorites((prev) => ({ ...prev, [card.id]: !isFav }));
      }
    );
  };

  // ── ABERTURA DE DETALHES DA CARTA (MODAL DEEP DIVE) ──
  const openCardDetails = async (card: Card) => {
    setSelectedCard(card);
    setOwners([]);
    setLoadingOwners(true);
    try {
      const list = await cardService.getOwners(card.id);
      setOwners(list);
    } catch (e) {
      console.warn("Erro ao buscar donos da carta:", e);
    } finally {
      setLoadingOwners(false);
    }
  };

  // Navegação entre cartas no modal (< e >)
  const currentCardIndex = useMemo(() => {
    if (!selectedCard) return -1;
    return cards.findIndex((c) => c.id === selectedCard.id);
  }, [selectedCard, cards]);

  const navigateCard = (direction: "prev" | "next") => {
    if (currentCardIndex === -1) return;
    const targetIdx = direction === "prev" ? currentCardIndex - 1 : currentCardIndex + 1;
    if (targetIdx >= 0 && targetIdx < cards.length) {
      openCardDetails(cards[targetIdx]);
    }
  };

  // ── FILTROS ATIVOS & CONTAGEM ──
  const toggleSelection = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const clearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedExpansions([]);
    setSelectedTypes([]);
    setSelectedRarities([]);
    setSelectedCategory("ALL");
    setOnlyWithTradeOffers(false);
  };

  const hasAnyFilter = Boolean(
    debouncedSearch ||
    selectedExpansions.length > 0 ||
    selectedTypes.length > 0 ||
    selectedRarities.length > 0 ||
    selectedCategory !== "ALL" ||
    onlyWithTradeOffers
  );

  // Filtro & Ordenação
  const filteredCards = useMemo(() => {
    let result = cards.filter((c) => {
      // Filtro de cartas com ofertas de troca ativas
      if (onlyWithTradeOffers && !cardsWithOffers.includes(c.id)) {
        return false;
      }
      // Busca
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesExpansion = c.expansion.toLowerCase().includes(q);
        const matchesType = c.type.toLowerCase().includes(q);
        if (!matchesName && !matchesExpansion && !matchesType) return false;
      }
      // Expansões (Seleção Múltipla)
      if (selectedExpansions.length > 0 && !selectedExpansions.includes(c.expansion)) {
        return false;
      }
      // Tipos (Seleção Múltipla)
      if (selectedTypes.length > 0 && !selectedTypes.includes(c.type)) {
        return false;
      }
      // Raridades (Seleção Múltipla)
      if (selectedRarities.length > 0 && !selectedRarities.includes(c.rarity)) {
        return false;
      }
      return true;
    });

    // Ordenação
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "price") {
        comparison = (a.marketPrice || 0) - (b.marketPrice || 0);
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "hp") {
        comparison = a.hp - b.hp;
      } else if (sortBy === "rarity") {
        comparison = a.rarity.localeCompare(b.rarity);
      } else {
        // relevance padrão
        comparison = 0;
      }
      return sortDirection === "desc" ? -comparison : comparison;
    });

    return result;
  }, [cards, debouncedSearch, selectedExpansions, selectedTypes, selectedRarities, selectedCategory, onlyWithTradeOffers, cardsWithOffers, sortBy, sortDirection]);

  // Contadores dinâmicos coerentes com os filtros
  const counts = useMemo(() => {
    const exp: Record<string, number> = {};
    const typ: Record<string, number> = {};
    const rar: Record<string, number> = {};

    cards.forEach((c) => {
      exp[c.expansion] = (exp[c.expansion] || 0) + 1;
      typ[c.type] = (typ[c.type] || 0) + 1;
      rar[c.rarity] = (rar[c.rarity] || 0) + 1;
    });

    const withOffers = cards.filter((c) => cardsWithOffers.includes(c.id)).length;

    return { exp, typ, rar, withOffers };
  }, [cards, cardsWithOffers]);

  // ── RENDER DA BARRA LATERAL (SIDEBAR DE FILTROS) ──
  const renderSidebarContent = () => (
    <View style={styles.sidebarContent}>
      {/* Botão Global Limpar Filtros (Ação secundária: Neutro, NÃO vermelho) */}
      {hasAnyFilter && (
        <TouchableOpacity
          style={styles.globalClearBtn}
          onPress={clearAllFilters}
          accessibilityRole="button"
          accessibilityLabel="Limpar todos os filtros selecionados"
        >
          <Ionicons name="refresh-outline" size={14} color={DesignTokens.colors.textSecondary} />
          <Text style={styles.globalClearBtnText}>Limpar todos os filtros</Text>
        </TouchableOpacity>
      )}

      {/* SEÇÃO 0: OFERTAS DE TROCA */}
      <View style={styles.accordionSection}>
        <TouchableOpacity
          style={[styles.sidebarTradeToggleBtn, onlyWithTradeOffers && styles.sidebarTradeToggleBtnActive]}
          onPress={() => setOnlyWithTradeOffers((prev) => !prev)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: onlyWithTradeOffers }}
          accessibilityLabel={`Filtrar apenas cartas com ofertas de troca, ${counts.withOffers} disponíveis`}
        >
          <View style={styles.sidebarTradeLeft}>
            <View style={[styles.sidebarTradeIcon, onlyWithTradeOffers && styles.sidebarTradeIconActive]}>
              <Ionicons name="swap-horizontal" size={15} color={onlyWithTradeOffers ? "#FFFFFF" : DesignTokens.colors.brandRed} />
            </View>
            <View>
              <Text style={[styles.sidebarTradeTitle, onlyWithTradeOffers && styles.sidebarTradeTitleActive]}>
                Ofertas de Troca
              </Text>
              <Text style={styles.sidebarTradeSub}>
                Apenas com propostas ativas
              </Text>
            </View>
          </View>
          <View style={[styles.sidebarTradeCountBadge, onlyWithTradeOffers && styles.sidebarTradeCountBadgeActive]}>
            <Text style={[styles.sidebarTradeCountText, onlyWithTradeOffers && styles.sidebarTradeCountTextActive]}>
              {counts.withOffers}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sidebarDivider} />

      {/* SEÇÃO 1: EXPANSÕES / COLEÇÕES (Accordion + Multi-select) */}
      <View style={styles.accordionSection}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setAccordion((prev) => ({ ...prev, expansions: !prev.expansions }))}
          accessibilityRole="button"
          accessibilityState={{ expanded: accordion.expansions }}
          accessibilityLabel="Expandir ou recolher seção de coleções"
        >
          <View style={styles.accordionTitleRow}>
            <Text style={styles.accordionTitle}>COLEÇÕES</Text>
            {selectedExpansions.length > 0 && (
              <View style={styles.activeFilterDot} />
            )}
          </View>
          <View style={styles.accordionRightRow}>
            {selectedExpansions.length > 0 && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  setSelectedExpansions([]);
                }}
                accessibilityRole="button"
                accessibilityLabel="Limpar filtros de coleção"
              >
                <Text style={styles.sectionClearText}>Limpar</Text>
              </TouchableOpacity>
            )}
            <Ionicons
              name={accordion.expansions ? "chevron-up" : "chevron-down"}
              size={16}
              color={DesignTokens.colors.textMuted}
            />
          </View>
        </TouchableOpacity>

        {accordion.expansions && (
          <View style={styles.filterList}>
            {EXPANSIONS_LIST.map((item) => {
              const isSelected = selectedExpansions.includes(item.id);
              const count = counts.exp[item.id] || 0;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.filterCheckboxRow, isSelected && styles.filterRowSelected]}
                  onPress={() => toggleSelection(selectedExpansions, setSelectedExpansions, item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`Filtrar por ${item.name}, ano ${item.year}, ${count} cartas`}
                >
                  <View style={styles.filterRowLeft}>
                    {/* Checkbox Acessível */}
                    <View style={[styles.checkboxBox, isSelected && styles.checkboxBoxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                    </View>
                    <View>
                      <Text style={[styles.filterItemText, isSelected && styles.filterItemTextSelected]}>
                        {item.name}
                      </Text>
                      <Text style={styles.filterItemSub}>{item.year}</Text>
                    </View>
                  </View>
                  <Text style={[styles.filterCountBadge, isSelected && styles.filterCountBadgeSelected]}>
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.sidebarDivider} />

      {/* SEÇÃO 2: TIPOS ELEMENTAIS (Accordion + Multi-select) */}
      <View style={styles.accordionSection}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setAccordion((prev) => ({ ...prev, types: !prev.types }))}
          accessibilityRole="button"
          accessibilityState={{ expanded: accordion.types }}
          accessibilityLabel="Expandir ou recolher seção de tipos"
        >
          <View style={styles.accordionTitleRow}>
            <Text style={styles.accordionTitle}>TIPOS</Text>
            {selectedTypes.length > 0 && <View style={styles.activeFilterDot} />}
          </View>
          <View style={styles.accordionRightRow}>
            {selectedTypes.length > 0 && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  setSelectedTypes([]);
                }}
                accessibilityRole="button"
                accessibilityLabel="Limpar filtros de tipo"
              >
                <Text style={styles.sectionClearText}>Limpar</Text>
              </TouchableOpacity>
            )}
            <Ionicons
              name={accordion.types ? "chevron-up" : "chevron-down"}
              size={16}
              color={DesignTokens.colors.textMuted}
            />
          </View>
        </TouchableOpacity>

        {accordion.types && (
          <View style={styles.filterList}>
            {TYPES_LIST.map((item) => {
              const isSelected = selectedTypes.includes(item.id);
              const count = counts.typ[item.id] || 0;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.filterCheckboxRow, isSelected && styles.filterRowSelected]}
                  onPress={() => toggleSelection(selectedTypes, setSelectedTypes, item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`Filtrar por tipo ${item.name}, ${count} cartas`}
                >
                  <View style={styles.filterRowLeft}>
                    <View style={[styles.checkboxBox, isSelected && styles.checkboxBoxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                    </View>
                    <View style={[styles.typeIconCircle, { backgroundColor: item.color }]}>
                      <Ionicons name={item.icon as any} size={11} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.filterItemText, isSelected && styles.filterItemTextSelected]}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={[styles.filterCountBadge, isSelected && styles.filterCountBadgeSelected]}>
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.sidebarDivider} />

      {/* SEÇÃO 3: RARIDADES (Accordion + Multi-select) */}
      <View style={styles.accordionSection}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setAccordion((prev) => ({ ...prev, rarities: !prev.rarities }))}
          accessibilityRole="button"
          accessibilityState={{ expanded: accordion.rarities }}
          accessibilityLabel="Expandir ou recolher seção de raridades"
        >
          <View style={styles.accordionTitleRow}>
            <Text style={styles.accordionTitle}>RARIDADES</Text>
            {selectedRarities.length > 0 && <View style={styles.activeFilterDot} />}
          </View>
          <View style={styles.accordionRightRow}>
            {selectedRarities.length > 0 && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  setSelectedRarities([]);
                }}
                accessibilityRole="button"
                accessibilityLabel="Limpar filtros de raridade"
              >
                <Text style={styles.sectionClearText}>Limpar</Text>
              </TouchableOpacity>
            )}
            <Ionicons
              name={accordion.rarities ? "chevron-up" : "chevron-down"}
              size={16}
              color={DesignTokens.colors.textMuted}
            />
          </View>
        </TouchableOpacity>

        {accordion.rarities && (
          <View style={styles.filterList}>
            {RARITIES_LIST.map((item) => {
              const isSelected = selectedRarities.includes(item.id);
              const count = counts.rar[item.id] || 0;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.filterCheckboxRow, isSelected && styles.filterRowSelected]}
                  onPress={() => toggleSelection(selectedRarities, setSelectedRarities, item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`Filtrar por raridade ${item.name}, ${count} cartas`}
                >
                  <View style={styles.filterRowLeft}>
                    <View style={[styles.checkboxBox, isSelected && styles.checkboxBoxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.raritySymbolBadge}>{item.symbol}</Text>
                    <Text style={[styles.filterItemText, isSelected && styles.filterItemTextSelected]}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={[styles.filterCountBadge, isSelected && styles.filterCountBadgeSelected]}>
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.pageContainer}>
      {/* ── CABEÇALHO GLOBAL COM NOVA IDENTIDADE VERMELHA ── */}
      <Header
        title="Catálogo"
        subtitle="Marketplace de Cartas TCG"
        badgeText={`${cards.length} Cartas`}
      />

      {/* ── LAYOUT PRINCIPAL (Sidebar à Esquerda no Desktop + Galeria) ── */}
      <View style={styles.mainLayout} nativeID="main-content">
        {/* Sidebar Sticky com rolagem própria no Desktop */}
        {isDesktop && (
          <View style={styles.sidebarWrapper} accessibilityRole={"complementary" as any} accessibilityLabel="Filtros de catálogo">
            <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
              {renderSidebarContent()}
            </ScrollView>
            <View style={styles.sidebarBottomGradient} />
          </View>
        )}

        {/* ── COLUNA DA GALERIA ── */}
        <View style={styles.galleryColumn} accessibilityRole={"main" as any}>
          <ScrollView
            ref={scrollRef}
            style={styles.galleryScrollView}
            contentContainerStyle={styles.galleryScrollInner}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              const y = e.nativeEvent.contentOffset.y;
              setShowScrollTop(y > 300);
            }}
            scrollEventThrottle={16}
          >
            {/* ── CONTROLES SUPERIORES (Busca com Atalho "/", Sugestões e Filtro Mobile) ── */}
            <View style={styles.controlsBar}>
              <View style={styles.searchRow}>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search-outline" size={18} color={DesignTokens.colors.textMuted} style={styles.searchIcon} />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder="Buscar cartas por nome, tipo, expansão... (pressione '/' para focar)"
                    placeholderTextColor={DesignTokens.colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    accessibilityRole="search"
                    accessibilityLabel="Campo de busca de cartas"
                  />
                  {search.length > 0 ? (
                    <TouchableOpacity
                      onPress={() => setSearch("")}
                      style={styles.searchClearBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Limpar busca"
                    >
                      <Ionicons name="close-circle" size={18} color={DesignTokens.colors.textSecondary} />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.kbdBadge}>
                      <Text style={styles.kbdBadgeText}>/</Text>
                    </View>
                  )}
                </View>

                {/* Botão Rápido: Ofertas de Troca */}
                <TouchableOpacity
                  style={[styles.tradeOffersQuickBtn, onlyWithTradeOffers && styles.tradeOffersQuickBtnActive]}
                  onPress={() => setOnlyWithTradeOffers((prev) => !prev)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: onlyWithTradeOffers }}
                  accessibilityLabel={`Filtrar apenas cartas com ofertas de troca, ${counts.withOffers} disponíveis`}
                >
                  <Ionicons
                    name="swap-horizontal"
                    size={16}
                    color={onlyWithTradeOffers ? "#FFFFFF" : DesignTokens.colors.brandRed}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.tradeOffersQuickBtnText, onlyWithTradeOffers && styles.tradeOffersQuickBtnTextActive]}>
                    Com Ofertas de Troca
                  </Text>
                  <View style={[styles.tradeOffersQuickBadge, onlyWithTradeOffers && styles.tradeOffersQuickBadgeActive]}>
                    <Text style={[styles.tradeOffersQuickBadgeText, onlyWithTradeOffers && styles.tradeOffersQuickBadgeTextActive]}>
                      {counts.withOffers}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Botão de Filtros no Mobile (Abre Bottom Sheet) */}
                {!isDesktop && (
                  <TouchableOpacity
                    style={[styles.mobileFilterToggle, hasAnyFilter && styles.mobileFilterToggleActive]}
                    onPress={() => setMobileDrawerOpen(true)}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir filtros de pesquisa. ${hasAnyFilter ? "Filtros ativos" : ""}`}
                  >
                    <Ionicons
                      name="filter"
                      size={16}
                      color={hasAnyFilter ? DesignTokens.colors.brandRed : DesignTokens.colors.textPrimary}
                    />
                    <Text style={[styles.mobileFilterToggleText, hasAnyFilter && { color: DesignTokens.colors.brandRed }]}>
                      Filtros {hasAnyFilter ? "●" : ""}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Popup de Buscas Recentes / Sugestões ao Focar */}
              {searchFocused && search.length === 0 && (
                <View style={styles.suggestionsPopup}>
                  <Text style={styles.suggestionsHeader}>Buscas recentes:</Text>
                  <View style={styles.suggestionsChipsRow}>
                    {recentSearches.map((term) => (
                      <TouchableOpacity
                        key={term}
                        style={styles.suggestionChip}
                        onPress={() => setSearch(term)}
                        accessibilityRole="button"
                        accessibilityLabel={`Buscar por ${term}`}
                      >
                        <Ionicons name="time-outline" size={13} color={DesignTokens.colors.textMuted} />
                        <Text style={styles.suggestionChipText}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* ── CHIPS DE FILTROS ATIVOS ACIMA DO GRID (Cada um com botão remover) ── */}
              {hasAnyFilter && (
                <View style={styles.activeChipsContainer} accessibilityRole={"region" as any} accessibilityLabel="Filtros ativos">
                  <Text style={styles.activeChipsPrefix}>Filtros ativos:</Text>

                  {onlyWithTradeOffers && (
                    <TouchableOpacity
                      style={[styles.filterChip, { borderColor: DesignTokens.colors.brandRed, backgroundColor: DesignTokens.colors.brandRedSubtle }]}
                      onPress={() => setOnlyWithTradeOffers(false)}
                      accessibilityRole="button"
                      accessibilityLabel="Remover filtro de ofertas de troca"
                    >
                      <Ionicons name="swap-horizontal" size={13} color={DesignTokens.colors.brandRed} style={{ marginRight: 4 }} />
                      <Text style={[styles.filterChipText, { color: DesignTokens.colors.brandRed, fontWeight: "700" }]}>
                        Ofertas de Troca ({counts.withOffers})
                      </Text>
                      <View style={[styles.chipCloseCircle, { backgroundColor: DesignTokens.colors.brandRed }]}>
                        <Text style={styles.chipCloseX}>✕</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {debouncedSearch.length > 0 && (
                    <TouchableOpacity
                      style={styles.filterChip}
                      onPress={() => setSearch("")}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover filtro de busca: ${debouncedSearch}`}
                    >
                      <Text style={styles.filterChipText}>Busca: "{debouncedSearch}"</Text>
                      <View style={styles.chipCloseCircle}><Text style={styles.chipCloseX}>✕</Text></View>
                    </TouchableOpacity>
                  )}

                  {selectedExpansions.map((exp) => (
                    <TouchableOpacity
                      key={exp}
                      style={styles.filterChip}
                      onPress={() => setSelectedExpansions((prev) => prev.filter((i) => i !== exp))}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover filtro de coleção: ${exp}`}
                    >
                      <Text style={styles.filterChipText}>Coleção: {exp}</Text>
                      <View style={styles.chipCloseCircle}><Text style={styles.chipCloseX}>✕</Text></View>
                    </TouchableOpacity>
                  ))}

                  {selectedTypes.map((typ) => {
                    const label = TYPES_LIST.find((t) => t.id === typ)?.name || typ;
                    return (
                      <TouchableOpacity
                        key={typ}
                        style={styles.filterChip}
                        onPress={() => setSelectedTypes((prev) => prev.filter((i) => i !== typ))}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover filtro de tipo: ${label}`}
                      >
                        <Text style={styles.filterChipText}>Tipo: {label}</Text>
                        <View style={styles.chipCloseCircle}><Text style={styles.chipCloseX}>✕</Text></View>
                      </TouchableOpacity>
                    );
                  })}

                  {selectedRarities.map((rar) => {
                    const label = RARITIES_LIST.find((r) => r.id === rar)?.name || rar;
                    return (
                      <TouchableOpacity
                        key={rar}
                        style={styles.filterChip}
                        onPress={() => setSelectedRarities((prev) => prev.filter((i) => i !== rar))}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover filtro de raridade: ${label}`}
                      >
                        <Text style={styles.filterChipText}>Raridade: {label}</Text>
                        <View style={styles.chipCloseCircle}><Text style={styles.chipCloseX}>✕</Text></View>
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={styles.clearAllChipsBtn}
                    onPress={clearAllFilters}
                    accessibilityRole="button"
                    accessibilityLabel="Limpar todos os filtros"
                  >
                    <Text style={styles.clearAllChipsText}>Limpar tudo</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── ABAS DE CATEGORIA COM CONTADORES & ESTADO DESABILITADO ── */}
              <View style={styles.categoryTabsBar} accessibilityRole="tablist">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const count = cat.id === "ALL" || cat.id === "POKEMON" ? filteredCards.length : 0;
                  const isDisabled = Boolean(cat.disabled);

                  return (
                    <TouchableOpacity
                      key={cat.id}
                      disabled={isDisabled}
                      style={[
                        styles.catTab,
                        isActive && styles.catTabActive,
                        isDisabled && styles.catTabDisabled,
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isActive, disabled: isDisabled }}
                      accessibilityLabel={`${cat.name}, ${count} cartas disponíveis. ${isDisabled ? "Categoria desabilitada: sem cartas disponíveis." : ""}`}
                      // @ts-ignore Web tooltip
                      title={cat.description}
                    >
                      <View style={[styles.catTabIndicatorDot, isActive && styles.catTabIndicatorDotActive]} />
                      <Text style={[styles.catTabText, isActive && styles.catTabTextActive, isDisabled && styles.catTabTextDisabled]}>
                        {cat.name}
                      </Text>
                      <View style={[styles.catCountBadge, isActive && styles.catCountBadgeActive]}>
                        <Text style={[styles.catCountBadgeText, isActive && styles.catCountBadgeTextActive]}>
                          {count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── BARRA DE STATUS, ORDENAÇÃO & ALTERNADOR DE VISUALIZAÇÃO (GRADE/LISTA) ── */}
              <View style={styles.statusBarRow}>
                {/* Contagem Dinâmica com aria-live */}
                <Text style={styles.statusCountText} accessibilityLiveRegion="polite">
                  Mostrando <Text style={styles.boldRedText}>{filteredCards.length}</Text> de {cards.length} cartas
                </Text>

                <View style={styles.statusRightControls}>
                  {/* Seletor Único de Ordenação com Dropdown */}
                  <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Ordenar por:</Text>
                    <View style={styles.sortPillsGroup}>
                      {SORT_OPTIONS.map((opt) => {
                        const isSortActive = sortBy === opt.id;
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            style={[styles.sortPill, isSortActive && styles.sortPillActive]}
                            onPress={() => setSortBy(opt.id)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSortActive }}
                            accessibilityLabel={`Ordenar por ${opt.label}`}
                          >
                            <Text style={[styles.sortPillText, isSortActive && styles.sortPillTextActive]}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}

                      {/* Botão de Direção Ascendente / Descendente com aria-label claro */}
                      <TouchableOpacity
                        style={styles.sortDirBtn}
                        onPress={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                        accessibilityRole="button"
                        accessibilityLabel={`Direção da ordenação: ${sortDirection === "asc" ? "Crescente. Clique para decrescente" : "Decrescente. Clique para crescente"}`}
                        // @ts-ignore
                        title={sortDirection === "asc" ? "Ordenação crescente" : "Ordenação decrescente"}
                      >
                        <Ionicons
                          name={sortDirection === "asc" ? "arrow-up" : "arrow-down"}
                          size={14}
                          color={DesignTokens.colors.brandRed}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Alternador de Visualização (Grade / Lista Compacta) */}
                  <View style={styles.viewToggleGroup}>
                    <TouchableOpacity
                      style={[styles.viewToggleBtn, viewMode === "grid" && styles.viewToggleBtnActive]}
                      onPress={() => setViewMode("grid")}
                      accessibilityRole="button"
                      accessibilityLabel="Visualizar em grade"
                      // @ts-ignore
                      title="Visualização em grade"
                    >
                      <Ionicons
                        name="grid-outline"
                        size={15}
                        color={viewMode === "grid" ? "#FFFFFF" : DesignTokens.colors.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.viewToggleBtn, viewMode === "list" && styles.viewToggleBtnActive]}
                      onPress={() => setViewMode("list")}
                      accessibilityRole="button"
                      accessibilityLabel="Visualizar em lista compacta"
                      // @ts-ignore
                      title="Visualização em lista compacta"
                    >
                      <Ionicons
                        name="list-outline"
                        size={15}
                        color={viewMode === "list" ? "#FFFFFF" : DesignTokens.colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* ── ÁREA PRINCIPAL DA GALERIA DE CARTAS ── */}
            {loading ? (
              // Skeletons com Shimmer e Reserva de Espaço
              <View style={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View key={i} style={styles.skeletonCard}>
                    <View style={styles.skeletonArt} />
                    <View style={styles.skeletonTextLarge} />
                    <View style={styles.skeletonTextSmall} />
                  </View>
                ))}
              </View>
            ) : loadError ? (
              // Estado de Erro com Botão Tentar Novamente
              <View style={styles.emptyContainer} accessibilityRole="alert">
                <Ionicons name="alert-circle-outline" size={48} color={DesignTokens.colors.danger} />
                <Text style={styles.emptyTitle}>Falha ao carregar cartas</Text>
                <Text style={styles.emptySubtitle}>Não foi possível sincronizar o catálogo com o servidor.</Text>
                <TouchableOpacity style={styles.primaryRedBtn} onPress={fetchCatalogData} accessibilityRole="button">
                  <Text style={styles.primaryRedBtnText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            ) : filteredCards.length === 0 ? (
              // Estado Vazio Ilustrado com Sugestões e Limpar Filtros
              <View style={styles.emptyContainer} accessibilityRole={"status" as any}>
                <Ionicons name="search-outline" size={48} color={DesignTokens.colors.textMuted} />
                <Text style={styles.emptyTitle}>Nenhuma carta encontrada</Text>
                <Text style={styles.emptySubtitle}>
                  Não encontramos cartas para os filtros selecionados. Tente termos como "Pikachu", "Charizard" ou limpe os filtros.
                </Text>
                <TouchableOpacity
                  style={styles.secondaryNeutralBtn}
                  onPress={clearAllFilters}
                  accessibilityRole="button"
                  accessibilityLabel="Redefinir e limpar todos os filtros"
                >
                  <Text style={styles.secondaryNeutralBtnText}>Limpar Todos os Filtros</Text>
                </TouchableOpacity>
              </View>
            ) : viewMode === "grid" ? (
              // ── VISUALIZAÇÃO EM GRADE RESPONSIVA (CSS Grid Oficial) ──
              <View
                style={[
                  styles.cssCardGrid,
                  Platform.OS === "web" && ({
                    display: "grid" as any,
                    gridTemplateColumns: isDesktop
                      ? "repeat(6, minmax(0, 1fr))"
                      : isTablet
                      ? "repeat(3, minmax(0, 1fr))"
                      : "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  } as any),
                ]}
              >
                {filteredCards.map((card) => {
                  const owned = userOwnedMap[card.id] || 0;
                  return (
                    <View key={card.id} style={styles.cardCell}>
                      <PokemonCardItem
                        card={card}
                        isOwned={owned > 0}
                        ownedCount={owned}
                        hasTradeOffer={cardsWithOffers.includes(card.id)}
                        isFavorite={Boolean(favorites[card.id])}
                        onToggleFavorite={() => toggleFavorite(card)}
                        onPress={() => openCardDetails(card)}
                      />
                    </View>
                  );
                })}
              </View>
            ) : (
              // ── VISUALIZAÇÃO EM LISTA COMPACTA ──
              <View style={styles.listViewContainer}>
                {filteredCards.map((card) => {
                  const owned = userOwnedMap[card.id] || 0;
                  const typeInfo = DesignTokens.colors.types[card.type] || DesignTokens.colors.types.COLORLESS;
                  return (
                    <TouchableOpacity
                      key={card.id}
                      style={styles.listRowItem}
                      onPress={() => openCardDetails(card)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver carta ${card.name}, preço ${card.marketPrice ? `R$ ${card.marketPrice}` : "150,00"}`}
                    >
                      <Image source={{ uri: card.imageUrl }} style={styles.listThumb} resizeMode="contain" />
                      <View style={styles.listMainInfo}>
                        <View style={styles.listTitleRow}>
                          <Text style={styles.listCardName}>{card.name}</Text>
                          {owned > 0 && (
                            <View style={styles.ownedInlineBadge}>
                              <Text style={styles.ownedInlineBadgeText}>Possui {owned}x</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.listMetaText}>
                          {card.expansion} • {typeInfo.label} • {card.hp} HP • {card.rarity.replace("_", " ").toLowerCase()}
                        </Text>
                      </View>
                      <View style={styles.listPriceCol}>
                        <Text style={styles.listPriceLabel}>Mercado</Text>
                        <Text style={styles.listPriceValue}>
                          R$ {card.marketPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "150,00"}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={DesignTokens.colors.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Botão Flutuante "Voltar ao Topo" */}
          {showScrollTop && (
            <TouchableOpacity
              style={styles.scrollTopFloatingBtn}
              onPress={() => scrollRef.current?.scrollTo?.({ y: 0, animated: true })}
              accessibilityRole="button"
              accessibilityLabel="Voltar ao topo da lista"
              // @ts-ignore
              title="Voltar ao topo"
            >
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── MODAL / BOTTOM SHEET DE FILTROS NO MOBILE ── */}
      <Modal visible={mobileDrawerOpen} animationType="slide" transparent>
        <View style={styles.mobileModalBackdrop}>
          <View style={styles.mobileModalSheet}>
            <View style={styles.mobileSheetHeader}>
              <Text style={styles.mobileSheetTitle}>Filtros de Catálogo</Text>
              <TouchableOpacity
                onPress={() => setMobileDrawerOpen(false)}
                style={styles.closeSheetBtn}
                accessibilityRole="button"
                accessibilityLabel="Fechar filtros"
              >
                <Ionicons name="close" size={20} color={DesignTokens.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {renderSidebarContent()}
            </ScrollView>

            {/* Botão Fixo "Aplicar (N resultados)" */}
            <View style={styles.mobileSheetFooter}>
              <TouchableOpacity
                style={styles.primaryRedBtn}
                onPress={() => setMobileDrawerOpen(false)}
                accessibilityRole="button"
              >
                <Text style={styles.primaryRedBtnText}>
                  Aplicar ({filteredCards.length} cartas)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL DE DETALHES DA CARTA (LIGHTBOX / DEEP DIVE) ── */}
      <Modal visible={!!selectedCard} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.detailDialog} accessibilityRole={"dialog" as any} accessibilityLabel="Detalhes da carta">
            {selectedCard && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
                {/* Header do Modal com Navegação Anterior/Próxima & Fechar */}
                <View style={styles.detailTopNav}>
                  <View style={styles.navArrowsGroup}>
                    <TouchableOpacity
                      disabled={currentCardIndex <= 0}
                      style={[styles.arrowNavBtn, currentCardIndex <= 0 && { opacity: 0.3 }]}
                      onPress={() => navigateCard("prev")}
                      accessibilityRole="button"
                      accessibilityLabel="Carta anterior"
                      // @ts-ignore
                      title="Carta anterior"
                    >
                      <Ionicons name="chevron-back" size={18} color={DesignTokens.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.cardIndexText}>
                      {currentCardIndex + 1} de {cards.length}
                    </Text>
                    <TouchableOpacity
                      disabled={currentCardIndex >= cards.length - 1}
                      style={[styles.arrowNavBtn, currentCardIndex >= cards.length - 1 && { opacity: 0.3 }]}
                      onPress={() => navigateCard("next")}
                      accessibilityRole="button"
                      accessibilityLabel="Próxima carta"
                      // @ts-ignore
                      title="Próxima carta"
                    >
                      <Ionicons name="chevron-forward" size={18} color={DesignTokens.colors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedCard(null)}
                    style={styles.closeModalBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar janela de detalhes (Esc)"
                    // @ts-ignore
                    title="Fechar (Esc)"
                  >
                    <Ionicons name="close" size={20} color={DesignTokens.colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Conteúdo em 2 Colunas */}
                <View style={[styles.detailBody, isDesktop && styles.detailBodyRow]}>
                  {/* Coluna 1: Arte Ampliada (63:88) */}
                  <View style={styles.detailArtSide}>
                    <View style={styles.detailImageWrapper}>
                      <Image
                        source={{ uri: selectedCard.imageUrl }}
                        style={styles.detailCardImage}
                        resizeMode="contain"
                        accessibilityLabel={`Arte ampliada de ${selectedCard.name}`}
                      />
                    </View>
                  </View>

                  {/* Coluna 2: Especificações Técnicas, Preço e Donos */}
                  <View style={styles.detailInfoSide}>
                    <Text style={styles.detailCardTitle}>{selectedCard.name}</Text>
                    <Text style={styles.detailSetSubtitle}>
                      📦 Coleção Oficial {selectedCard.expansion}
                    </Text>

                    {/* Linha de Badges de Especificações */}
                    <View style={styles.detailSpecPillsRow}>
                      <View style={[styles.specPill, { backgroundColor: DesignTokens.colors.types[selectedCard.type]?.bg || "#475569" }]}>
                        <Text style={styles.specPillText}>
                          {DesignTokens.colors.types[selectedCard.type]?.label || selectedCard.type}
                        </Text>
                      </View>
                      <View style={styles.specPillElevated}>
                        <Text style={styles.specPillTextElevated}>{selectedCard.hp} HP</Text>
                      </View>
                      <View style={styles.specPillElevated}>
                        <Text style={styles.specPillTextGold}>
                          {selectedCard.rarity.replace("_", " ")}
                        </Text>
                      </View>
                    </View>

                    {/* Card de Preço Oficial TCGPlayer */}
                    <View style={styles.detailPriceCard}>
                      <View style={styles.priceCardHeader}>
                        <Ionicons name="trending-up" size={16} color={DesignTokens.colors.accentGold} />
                        <Text style={styles.priceCardHeaderTitle}>Cotação de Mercado Oficial TCGPlayer</Text>
                      </View>
                      <Text style={styles.priceCardBigValue}>
                        R$ {selectedCard.marketPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "150,00"}
                      </Text>
                      <Text style={styles.priceCardNote}>
                        Preço médio oficial calculado para condição Near Mint (Holofoil Oficial).
                      </Text>
                    </View>

                    {/* Treinadores que possuem a carta para troca */}
                    <View style={styles.ownersContainer}>
                      <View style={styles.ownersTitleRow}>
                        <Ionicons name="people-outline" size={16} color={DesignTokens.colors.brandRed} />
                        <Text style={styles.ownersSectionTitle}>Treinadores com esta Carta para Troca</Text>
                      </View>

                      {loadingOwners ? (
                        <View style={{ padding: 16, alignItems: "center" }}>
                          <ActivityIndicator size="small" color={DesignTokens.colors.brandRed} />
                          <Text style={{ color: DesignTokens.colors.textMuted, fontSize: 12, marginTop: 6 }}>
                            Verificando disponibilidade nas coleções...
                          </Text>
                        </View>
                      ) : owners.length > 0 ? (
                        owners.map((owner, idx) => {
                          const isMe = owner.trainerUsername.toLowerCase() === user?.toLowerCase();
                          return (
                            <View key={idx} style={styles.ownerItemRow}>
                              <View style={styles.ownerItemLeft}>
                                <View style={styles.ownerAvatarCircle}>
                                  <Text style={styles.ownerAvatarInitial}>
                                    {owner.trainerUsername.substring(0, 2).toUpperCase()}
                                  </Text>
                                </View>
                                <View>
                                  <Text style={styles.ownerUsernameText}>
                                    @{owner.trainerUsername} {isMe ? "(Você)" : ""}
                                  </Text>
                                  <View style={styles.availabilityStatusRow}>
                                    <View style={[styles.statusDot, owner.lockedForTrade ? styles.dotLocked : styles.dotAvailable]} />
                                    <Text style={styles.statusDescriptionText}>
                                      {owner.lockedForTrade ? "Em Negociação (Bloqueada)" : "Disponível para Troca"}
                                    </Text>
                                  </View>
                                </View>
                              </View>

                              {!isMe && !owner.lockedForTrade && (
                                <TouchableOpacity
                                  style={styles.proposeTradeBtn}
                                  onPress={() => {
                                    setSelectedCard(null);
                                    router.push("/(tabs)/trades");
                                  }}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Propor troca com @${owner.trainerUsername}`}
                                >
                                  <Text style={styles.proposeTradeBtnText}>PROPOR TROCA</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        })
                      ) : (
                        <View style={styles.emptyOwnersBox}>
                          <Ionicons name="information-circle-outline" size={20} color={DesignTokens.colors.textMuted} />
                          <Text style={styles.emptyOwnersText}>
                            Nenhum treinador possui esta carta cadastrada para troca no momento.
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Botão de Fechar no Rodapé */}
                <TouchableOpacity
                  style={styles.secondaryNeutralBtn}
                  onPress={() => setSelectedCard(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar ao catálogo"
                >
                  <Text style={styles.secondaryNeutralBtnText}>Voltar ao Catálogo</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── FEEDBACK TOAST COM AÇÃO DE DESFAZER (UNDO) ── */}
      {toast && (
        <View style={styles.toastContainer} accessibilityRole="alert" accessibilityLiveRegion="assertive">
          <Ionicons name="information-circle" size={18} color={DesignTokens.colors.brandRed} style={{ marginRight: 8 }} />
          <Text style={styles.toastMessage}>{toast.message}</Text>
          {toast.onUndo && (
            <TouchableOpacity
              onPress={() => {
                toast.onUndo?.();
                setToast(null);
              }}
              style={styles.toastUndoBtn}
              accessibilityRole="button"
              accessibilityLabel="Desfazer ação"
            >
              <Text style={styles.toastUndoText}>Desfazer</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgBase,
  },
  mainLayout: {
    flex: 1,
    flexDirection: "row",
  },

  /* ── SIDEBAR STICKY (Filtros Desktop) ── */
  sidebarWrapper: {
    width: 250,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRightWidth: 1,
    borderRightColor: DesignTokens.colors.border,
    position: "relative",
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarContent: {
    padding: DesignTokens.spacing.base,
    paddingBottom: 40,
  },
  sidebarBottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: "transparent",
    pointerEvents: "none",
  } as any,

  globalClearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.control,
    paddingVertical: 8,
    marginBottom: DesignTokens.spacing.base,
    minHeight: 40,
    gap: 6,
  },
  globalClearBtnText: {
    fontSize: DesignTokens.typography.sizes.meta,
    fontWeight: "600",
    color: DesignTokens.colors.textSecondary,
  },

  accordionSection: {
    marginBottom: DesignTokens.spacing.sm,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  accordionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  accordionTitle: {
    fontSize: DesignTokens.typography.sizes.meta,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  activeFilterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignTokens.colors.brandRed,
  },
  accordionRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionClearText: {
    fontSize: DesignTokens.typography.sizes.meta,
    fontWeight: "500",
    color: DesignTokens.colors.textMuted,
  },
  filterList: {
    gap: 3,
    paddingTop: 4,
  },
  filterCheckboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: DesignTokens.radii.control,
    backgroundColor: "transparent",
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  filterRowSelected: {
    backgroundColor: DesignTokens.colors.brandRedSubtle,
    borderLeftColor: DesignTokens.colors.brandRed,
  },
  filterRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderLight,
    backgroundColor: DesignTokens.colors.bgElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBoxSelected: {
    backgroundColor: DesignTokens.colors.brandRed,
    borderColor: DesignTokens.colors.brandRed,
  },
  filterItemText: {
    fontSize: 13,
    fontWeight: "500",
    color: DesignTokens.colors.textSecondary,
  },
  filterItemTextSelected: {
    color: DesignTokens.colors.textPrimary,
    fontWeight: "700",
  },
  filterItemSub: {
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  filterCountBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: DesignTokens.colors.textMuted,
  },
  filterCountBadgeSelected: {
    color: DesignTokens.colors.brandRed,
    fontWeight: "700",
  },
  typeIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  raritySymbolBadge: {
    width: 18,
    textAlign: "center",
    fontSize: 11,
    color: DesignTokens.colors.accentGold,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: DesignTokens.colors.border,
    marginVertical: DesignTokens.spacing.md,
  },

  /* ── COLUNA DA GALERIA ── */
  galleryColumn: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgBase,
    position: "relative",
  },
  galleryScrollView: {
    flex: 1,
  },
  galleryScrollInner: {
    paddingBottom: 60,
  },

  /* Controles Superiores */
  controlsBar: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.control,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: DesignTokens.colors.textPrimary,
    fontSize: DesignTokens.typography.sizes.bodySmall,
    outlineWidth: 0,
  } as any,
  searchClearBtn: {
    padding: 4,
  },
  kbdBadge: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  kbdBadgeText: {
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
    fontFamily: "monospace",
  },

  mobileFilterToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.control,
    height: 44,
    paddingHorizontal: 14,
    gap: 6,
  },
  mobileFilterToggleActive: {
    borderColor: DesignTokens.colors.brandRed,
    backgroundColor: DesignTokens.colors.brandRedSubtle,
  },
  mobileFilterToggleText: {
    fontSize: DesignTokens.typography.sizes.bodySmall,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },

  /* Botão de Trocas na Sidebar */
  sidebarTradeToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: DesignTokens.radii.control,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 10,
    marginBottom: 4,
  },
  sidebarTradeToggleBtnActive: {
    backgroundColor: DesignTokens.colors.brandRedSubtle,
    borderColor: DesignTokens.colors.brandRed,
  },
  sidebarTradeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sidebarTradeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DesignTokens.colors.bgSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarTradeIconActive: {
    backgroundColor: DesignTokens.colors.brandRed,
  },
  sidebarTradeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },
  sidebarTradeTitleActive: {
    color: DesignTokens.colors.brandRed,
    fontWeight: "800",
  },
  sidebarTradeSub: {
    fontSize: 10,
    color: DesignTokens.colors.textMuted,
  },
  sidebarTradeCountBadge: {
    backgroundColor: DesignTokens.colors.bgSurface,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sidebarTradeCountBadgeActive: {
    backgroundColor: DesignTokens.colors.brandRed,
  },
  sidebarTradeCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: DesignTokens.colors.textSecondary,
  },
  sidebarTradeCountTextActive: {
    color: "#FFFFFF",
  },

  /* Botão Rápido de Ofertas de Troca no ControlsBar */
  tradeOffersQuickBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.control,
    height: 44,
    paddingHorizontal: 14,
  },
  tradeOffersQuickBtnActive: {
    borderColor: DesignTokens.colors.brandRed,
    backgroundColor: DesignTokens.colors.brandRed,
  },
  tradeOffersQuickBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },
  tradeOffersQuickBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  tradeOffersQuickBadge: {
    backgroundColor: DesignTokens.colors.brandRedSubtle,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tradeOffersQuickBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  tradeOffersQuickBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: DesignTokens.colors.brandRed,
  },
  tradeOffersQuickBadgeTextActive: {
    color: "#FFFFFF",
  },

  /* Popup de Sugestões de Busca */
  suggestionsPopup: {
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.control,
    padding: 12,
    marginTop: 8,
  },
  suggestionsHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: DesignTokens.colors.textMuted,
    marginBottom: 8,
  },
  suggestionsChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.chip,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  suggestionChipText: {
    fontSize: 12,
    color: DesignTokens.colors.textPrimary,
  },

  /* Chips de Filtros Ativos */
  activeChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
  },
  activeChipsPrefix: {
    fontSize: 12,
    color: DesignTokens.colors.textMuted,
    marginRight: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DesignTokens.radii.chip,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: DesignTokens.colors.textPrimary,
  },
  chipCloseCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: DesignTokens.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  chipCloseX: {
    fontSize: 9,
    color: DesignTokens.colors.textPrimary,
    fontWeight: "800",
  },
  clearAllChipsBtn: {
    paddingHorizontal: 6,
    minHeight: 28,
    justifyContent: "center",
  },
  clearAllChipsText: {
    fontSize: 12,
    fontWeight: "600",
    color: DesignTokens.colors.brandRed,
    textDecorationLine: "underline",
  },

  /* Abas de Categoria */
  categoryTabsBar: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border,
    marginTop: 14,
    gap: 16,
  },
  catTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    gap: 8,
  },
  catTabActive: {
    borderBottomColor: DesignTokens.colors.brandRed,
  },
  catTabDisabled: {
    opacity: 0.45,
  },
  catTabIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignTokens.colors.textMuted,
  },
  catTabIndicatorDotActive: {
    backgroundColor: DesignTokens.colors.brandRed,
  },
  catTabText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 14,
    fontWeight: "600",
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.3,
  },
  catTabTextActive: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: DesignTokens.colors.textPrimary,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  catTabTextDisabled: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: DesignTokens.colors.textMuted,
  },
  catCountBadge: {
    backgroundColor: DesignTokens.colors.bgElevated,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  catCountBadgeActive: {
    backgroundColor: DesignTokens.colors.brandRedSubtle,
  },
  catCountBadgeText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.textMuted,
  },
  catCountBadgeTextActive: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: DesignTokens.colors.brandRed,
    fontWeight: "800",
  },

  /* Status Bar e Controles de Ordenação */
  statusBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  statusCountText: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: 13,
    color: DesignTokens.colors.textSecondary,
  },
  boldRedText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: DesignTokens.colors.brandRed,
    fontWeight: "800",
    fontSize: 15,
  },
  statusRightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sortLabel: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "600",
    color: DesignTokens.colors.textMuted,
    letterSpacing: 0.3,
  },
  sortPillsGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: DesignTokens.radii.control,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 2,
    gap: 2,
  },
  sortPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sortPillActive: {
    backgroundColor: DesignTokens.colors.brandRed,
  },
  sortPillText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "600",
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.3,
  },
  sortPillTextActive: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sortDirBtn: {
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: DesignTokens.colors.border,
    marginLeft: 2,
  },

  viewToggleGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: DesignTokens.radii.control,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 2,
  },
  viewToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  viewToggleBtnActive: {
    backgroundColor: DesignTokens.colors.brandRed,
  },

  /* ── GRID DE CARTAS (CSS Grid Oficial 6 Colunas) ── */
  cssCardGrid: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cardCell: {
    width: "100%",
  },

  /* Visualização em Lista Compacta */
  listViewContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  listRowItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.control,
    padding: 10,
    gap: 12,
  },
  listThumb: {
    width: 44,
    height: 61,
    borderRadius: 4,
    backgroundColor: DesignTokens.colors.bgBase,
  },
  listMainInfo: {
    flex: 1,
  },
  listTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listCardName: {
    fontSize: 14,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },
  ownedInlineBadge: {
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.success,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  ownedInlineBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: DesignTokens.colors.success,
  },
  listMetaText: {
    fontSize: 12,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  listPriceCol: {
    alignItems: "flex-end",
  },
  listPriceLabel: {
    fontSize: 10,
    color: DesignTokens.colors.textMuted,
    textTransform: "uppercase",
  },
  listPriceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: DesignTokens.colors.accentGold,
  },

  /* Skeletons */
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skeletonCard: {
    width: "15.3%",
    minWidth: 140,
    height: 250,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 10,
  },
  skeletonArt: {
    width: "100%",
    aspectRatio: DesignTokens.cardAspect,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonTextLarge: {
    width: "70%",
    height: 12,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonTextSmall: {
    width: "45%",
    height: 10,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: 4,
  },

  /* Estado Vazio */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: DesignTokens.colors.textSecondary,
    textAlign: "center",
    maxWidth: 420,
    marginTop: 6,
  },
  primaryRedBtn: {
    backgroundColor: DesignTokens.colors.brandRed,
    borderRadius: DesignTokens.radii.control,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    minHeight: 44,
  },
  primaryRedBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryNeutralBtn: {
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderLight,
    borderRadius: DesignTokens.radii.control,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    minHeight: 44,
  },
  secondaryNeutralBtnText: {
    color: DesignTokens.colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },

  /* Botão Flutuante Voltar ao Topo */
  scrollTopFloatingBtn: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DesignTokens.colors.brandRed,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    zIndex: 90,
  },

  /* ── MODAL MOBILE BOTTOM SHEET ── */
  mobileModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  mobileModalSheet: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    maxHeight: "85%",
    padding: 16,
  },
  mobileSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border,
  },
  mobileSheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },
  closeSheetBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  mobileSheetFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border,
  },

  /* ── MODAL DE DETALHES DA CARTA (LIGHTBOX / DEEP DIVE) ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  detailDialog: {
    width: "100%",
    maxWidth: 900,
    maxHeight: "92%",
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    overflow: "hidden",
  },
  detailScrollContent: {
    padding: 24,
  },
  detailTopNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border,
    paddingBottom: 12,
  },
  navArrowsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrowNavBtn: {
    width: 36,
    height: 36,
    borderRadius: DesignTokens.radii.control,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIndexText: {
    fontSize: 12,
    color: DesignTokens.colors.textSecondary,
    fontWeight: "600",
    paddingHorizontal: 4,
  },
  closeModalBtn: {
    width: 44,
    height: 44,
    borderRadius: DesignTokens.radii.control,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  detailBody: {
    gap: 24,
  },
  detailBodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailArtSide: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minWidth: 260,
  },
  detailImageWrapper: {
    width: 270,
    aspectRatio: DesignTokens.cardAspect,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    backgroundColor: DesignTokens.colors.bgBase,
  },
  detailCardImage: {
    width: "100%",
    height: "100%",
  },

  detailInfoSide: {
    flex: 1.3,
  },
  detailCardTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 26,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  detailSetSubtitle: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: 13,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  detailSpecPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  specPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specPillText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  specPillElevated: {
    backgroundColor: DesignTokens.colors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  specPillTextElevated: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  specPillTextGold: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.accentGold,
    letterSpacing: 0.5,
  },

  detailPriceCard: {
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.accentGoldBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  priceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  priceCardHeaderTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.accentGold,
    letterSpacing: 0.5,
  },
  priceCardBigValue: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 30,
    fontWeight: "800",
    color: DesignTokens.colors.accentGold,
    letterSpacing: 0.5,
    marginVertical: 2,
  },
  priceCardNote: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },

  ownersContainer: {
    backgroundColor: DesignTokens.colors.bgBase,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 14,
    marginBottom: 16,
  },
  ownersTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  ownersSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },
  ownerItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgSurface,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  ownerItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ownerAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.bgElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  ownerAvatarInitial: {
    fontSize: 11,
    fontWeight: "800",
    color: DesignTokens.colors.brandRed,
  },
  ownerUsernameText: {
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },
  availabilityStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotAvailable: {
    backgroundColor: DesignTokens.colors.success,
  },
  dotLocked: {
    backgroundColor: DesignTokens.colors.warning,
  },
  statusDescriptionText: {
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    fontWeight: "500",
  },
  proposeTradeBtn: {
    backgroundColor: DesignTokens.colors.brandRed,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    minHeight: 36,
    justifyContent: "center",
  },
  proposeTradeBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  emptyOwnersBox: {
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
  },
  emptyOwnersText: {
    fontSize: 12,
    color: DesignTokens.colors.textMuted,
    textAlign: "center",
  },

  /* ── FEEDBACK TOAST ── */
  toastContainer: {
    position: "absolute",
    bottom: 24,
    left: "50%",
    transform: [{ translateX: -180 }],
    width: 360,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: DesignTokens.radii.control,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    zIndex: 9999,
  },
  toastMessage: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: DesignTokens.colors.textPrimary,
  },
  toastUndoBtn: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toastUndoText: {
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.brandRed,
  },
});