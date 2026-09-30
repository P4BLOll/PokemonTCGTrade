package com.pabloepedro.trade.config;

import com.pabloepedro.trade.entity.BinderItem;
import com.pabloepedro.trade.entity.Card;
import com.pabloepedro.trade.entity.TrainerBinder;
import com.pabloepedro.trade.entity.enumerable.PokemonType;
import com.pabloepedro.trade.entity.enumerable.Rarity;
import com.pabloepedro.trade.repository.CardRepo;
import com.pabloepedro.trade.repository.TrainerBinderRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CardRepo cardRepo;
    private final TrainerBinderRepo binderRepo;

    public DataInitializer(CardRepo cardRepo, TrainerBinderRepo binderRepo) {
        this.cardRepo = cardRepo;
        this.binderRepo = binderRepo;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Sincronizando catalogo completo de cartas com colecoes presentes no site...");

            List<Card> allCards = new ArrayList<>();

            // ══════════════════════════════════════════════════════════════
            // 1. BASE SET (1999) - set 'base1'
            // ══════════════════════════════════════════════════════════════
            allCards.add(new Card("card-base1-1", "Alakazam", PokemonType.PSYCHIC, Rarity.ULTRA_RARE, "Base Set", 80, "https://images.pokemontcg.io/base1/1_hires.png", 350.00));
            allCards.add(new Card("card-blastoise", "Blastoise", PokemonType.WATER, Rarity.ULTRA_RARE, "Base Set", 100, "https://images.pokemontcg.io/base1/2_hires.png", 420.00));
            allCards.add(new Card("card-base1-3", "Chansey", PokemonType.COLORLESS, Rarity.ULTRA_RARE, "Base Set", 120, "https://images.pokemontcg.io/base1/3_hires.png", 180.00));
            allCards.add(new Card("card-charizard", "Charizard", PokemonType.FIRE, Rarity.ULTRA_RARE, "Base Set", 120, "https://images.pokemontcg.io/base1/4_hires.png", 1850.00));
            allCards.add(new Card("card-base1-5", "Clefairy", PokemonType.COLORLESS, Rarity.ULTRA_RARE, "Base Set", 40, "https://images.pokemontcg.io/base1/5_hires.png", 120.00));
            allCards.add(new Card("card-base1-6", "Gyarados", PokemonType.WATER, Rarity.ULTRA_RARE, "Base Set", 100, "https://images.pokemontcg.io/base1/6_hires.png", 160.00));
            allCards.add(new Card("card-base1-7", "Hitmonchan", PokemonType.FIGHTING, Rarity.ULTRA_RARE, "Base Set", 70, "https://images.pokemontcg.io/base1/7_hires.png", 110.00));
            allCards.add(new Card("card-base1-8", "Machamp", PokemonType.FIGHTING, Rarity.ULTRA_RARE, "Base Set", 100, "https://images.pokemontcg.io/base1/8_hires.png", 140.00));
            allCards.add(new Card("card-base1-9", "Magneton", PokemonType.ELECTRIC, Rarity.ULTRA_RARE, "Base Set", 60, "https://images.pokemontcg.io/base1/9_hires.png", 95.00));
            allCards.add(new Card("card-mewtwo", "Mewtwo", PokemonType.PSYCHIC, Rarity.RARE, "Base Set", 70, "https://images.pokemontcg.io/base1/10_hires.png", 190.00));
            allCards.add(new Card("card-base1-11", "Nidoking", PokemonType.GRASS, Rarity.ULTRA_RARE, "Base Set", 90, "https://images.pokemontcg.io/base1/11_hires.png", 130.00));
            allCards.add(new Card("card-base1-12", "Ninetales", PokemonType.FIRE, Rarity.ULTRA_RARE, "Base Set", 80, "https://images.pokemontcg.io/base1/12_hires.png", 125.00));
            allCards.add(new Card("card-base1-13", "Poliwrath", PokemonType.WATER, Rarity.ULTRA_RARE, "Base Set", 90, "https://images.pokemontcg.io/base1/13_hires.png", 115.00));
            allCards.add(new Card("card-base1-14", "Raichu", PokemonType.ELECTRIC, Rarity.ULTRA_RARE, "Base Set", 90, "https://images.pokemontcg.io/base1/14_hires.png", 210.00));
            allCards.add(new Card("card-venusaur", "Venusaur", PokemonType.GRASS, Rarity.ULTRA_RARE, "Base Set", 100, "https://images.pokemontcg.io/base1/15_hires.png", 360.00));
            allCards.add(new Card("card-base1-16", "Zapdos", PokemonType.ELECTRIC, Rarity.ULTRA_RARE, "Base Set", 90, "https://images.pokemontcg.io/base1/16_hires.png", 230.00));
            allCards.add(new Card("card-base1-24", "Charmeleon", PokemonType.FIRE, Rarity.UNCOMMON, "Base Set", 80, "https://images.pokemontcg.io/base1/24_hires.png", 45.00));
            allCards.add(new Card("card-base1-30", "Ivysaur", PokemonType.GRASS, Rarity.UNCOMMON, "Base Set", 60, "https://images.pokemontcg.io/base1/30_hires.png", 35.00));
            allCards.add(new Card("card-base1-42", "Wartortle", PokemonType.WATER, Rarity.UNCOMMON, "Base Set", 70, "https://images.pokemontcg.io/base1/42_hires.png", 40.00));
            allCards.add(new Card("card-base1-44", "Bulbasaur", PokemonType.GRASS, Rarity.COMMON, "Base Set", 40, "https://images.pokemontcg.io/base1/44_hires.png", 50.00));
            allCards.add(new Card("card-base1-46", "Charmander", PokemonType.FIRE, Rarity.COMMON, "Base Set", 50, "https://images.pokemontcg.io/base1/46_hires.png", 55.00));
            allCards.add(new Card("card-pikachu", "Pikachu", PokemonType.ELECTRIC, Rarity.COMMON, "Base Set", 40, "https://images.pokemontcg.io/base1/58_hires.png", 85.00));
            allCards.add(new Card("card-base1-63", "Squirtle", PokemonType.WATER, Rarity.COMMON, "Base Set", 40, "https://images.pokemontcg.io/base1/63_hires.png", 50.00));

            // ══════════════════════════════════════════════════════════════
            // 2. FOSSIL (1999) - set 'base3'
            // ══════════════════════════════════════════════════════════════
            allCards.add(new Card("card-aerodactyl", "Aerodactyl", PokemonType.FIGHTING, Rarity.RARE, "Fossil", 60, "https://images.pokemontcg.io/base3/1_hires.png", 160.00));
            allCards.add(new Card("card-base3-2", "Articuno", PokemonType.WATER, Rarity.ULTRA_RARE, "Fossil", 70, "https://images.pokemontcg.io/base3/2_hires.png", 240.00));
            allCards.add(new Card("card-base3-3", "Ditto", PokemonType.COLORLESS, Rarity.RARE, "Fossil", 50, "https://images.pokemontcg.io/base3/3_hires.png", 130.00));
            allCards.add(new Card("card-dragonite", "Dragonite", PokemonType.COLORLESS, Rarity.RARE, "Fossil", 100, "https://images.pokemontcg.io/base3/4_hires.png", 280.00));
            allCards.add(new Card("card-base3-5", "Gengar Holo", PokemonType.PSYCHIC, Rarity.ULTRA_RARE, "Fossil", 80, "https://images.pokemontcg.io/base3/5_hires.png", 310.00));
            allCards.add(new Card("card-base3-6", "Haunter", PokemonType.PSYCHIC, Rarity.RARE, "Fossil", 50, "https://images.pokemontcg.io/base3/6_hires.png", 85.00));
            allCards.add(new Card("card-base3-7", "Hitmonlee", PokemonType.FIGHTING, Rarity.RARE, "Fossil", 60, "https://images.pokemontcg.io/base3/7_hires.png", 95.00));
            allCards.add(new Card("card-base3-8", "Hypno", PokemonType.PSYCHIC, Rarity.RARE, "Fossil", 90, "https://images.pokemontcg.io/base3/8_hires.png", 90.00));
            allCards.add(new Card("card-base3-9", "Kabutops", PokemonType.FIGHTING, Rarity.RARE, "Fossil", 60, "https://images.pokemontcg.io/base3/9_hires.png", 140.00));
            allCards.add(new Card("card-base3-10", "Lapras", PokemonType.WATER, Rarity.ULTRA_RARE, "Fossil", 80, "https://images.pokemontcg.io/base3/10_hires.png", 195.00));
            allCards.add(new Card("card-base3-11", "Magneton Fossil", PokemonType.ELECTRIC, Rarity.RARE, "Fossil", 70, "https://images.pokemontcg.io/base3/11_hires.png", 85.00));
            allCards.add(new Card("card-base3-12", "Moltres", PokemonType.FIRE, Rarity.ULTRA_RARE, "Fossil", 70, "https://images.pokemontcg.io/base3/12_hires.png", 260.00));
            allCards.add(new Card("card-base3-13", "Muk", PokemonType.GRASS, Rarity.RARE, "Fossil", 70, "https://images.pokemontcg.io/base3/13_hires.png", 75.00));
            allCards.add(new Card("card-base3-14", "Raichu Fossil", PokemonType.ELECTRIC, Rarity.RARE, "Fossil", 90, "https://images.pokemontcg.io/base3/14_hires.png", 150.00));
            allCards.add(new Card("card-base3-15", "Zapdos Fossil", PokemonType.ELECTRIC, Rarity.ULTRA_RARE, "Fossil", 80, "https://images.pokemontcg.io/base3/15_hires.png", 275.00));
            allCards.add(new Card("card-gengar", "Gengar", PokemonType.PSYCHIC, Rarity.RARE, "Fossil", 80, "https://images.pokemontcg.io/base3/20_hires.png", 220.00));
            allCards.add(new Card("card-base3-36", "Golem", PokemonType.FIGHTING, Rarity.UNCOMMON, "Fossil", 80, "https://images.pokemontcg.io/base3/36_hires.png", 30.00));
            allCards.add(new Card("card-base3-37", "Graveler", PokemonType.FIGHTING, Rarity.UNCOMMON, "Fossil", 60, "https://images.pokemontcg.io/base3/37_hires.png", 25.00));
            allCards.add(new Card("card-base3-44", "Tentacruel", PokemonType.WATER, Rarity.UNCOMMON, "Fossil", 60, "https://images.pokemontcg.io/base3/44_hires.png", 20.00));
            allCards.add(new Card("card-base3-48", "Grimer", PokemonType.GRASS, Rarity.COMMON, "Fossil", 50, "https://images.pokemontcg.io/base3/48_hires.png", 15.00));
            allCards.add(new Card("card-base3-50", "Kabuto", PokemonType.FIGHTING, Rarity.COMMON, "Fossil", 30, "https://images.pokemontcg.io/base3/50_hires.png", 18.00));
            allCards.add(new Card("card-base3-52", "Omanyte", PokemonType.WATER, Rarity.COMMON, "Fossil", 40, "https://images.pokemontcg.io/base3/52_hires.png", 18.00));
            allCards.add(new Card("card-base3-55", "Slowpoke", PokemonType.PSYCHIC, Rarity.COMMON, "Fossil", 50, "https://images.pokemontcg.io/base3/55_hires.png", 22.00));

            // ══════════════════════════════════════════════════════════════
            // 3. NEO GENESIS (2000) - set 'neo1'
            // ══════════════════════════════════════════════════════════════
            allCards.add(new Card("card-neo1-1", "Ampharos", PokemonType.ELECTRIC, Rarity.ULTRA_RARE, "Neo Genesis", 80, "https://images.pokemontcg.io/neo1/1_hires.png", 180.00));
            allCards.add(new Card("card-neo1-2", "Azumarill", PokemonType.WATER, Rarity.ULTRA_RARE, "Neo Genesis", 70, "https://images.pokemontcg.io/neo1/2_hires.png", 110.00));
            allCards.add(new Card("card-neo1-3", "Bellossom", PokemonType.GRASS, Rarity.ULTRA_RARE, "Neo Genesis", 70, "https://images.pokemontcg.io/neo1/3_hires.png", 105.00));
            allCards.add(new Card("card-neo1-4", "Feraligatr", PokemonType.WATER, Rarity.ULTRA_RARE, "Neo Genesis", 120, "https://images.pokemontcg.io/neo1/4_hires.png", 450.00));
            allCards.add(new Card("card-neo1-5", "Feraligatr (Riptide)", PokemonType.WATER, Rarity.ULTRA_RARE, "Neo Genesis", 100, "https://images.pokemontcg.io/neo1/5_hires.png", 320.00));
            allCards.add(new Card("card-neo1-6", "Heracross", PokemonType.GRASS, Rarity.ULTRA_RARE, "Neo Genesis", 60, "https://images.pokemontcg.io/neo1/6_hires.png", 120.00));
            allCards.add(new Card("card-neo1-8", "Kingdra", PokemonType.WATER, Rarity.ULTRA_RARE, "Neo Genesis", 90, "https://images.pokemontcg.io/neo1/8_hires.png", 160.00));
            allCards.add(new Card("card-lugia", "Lugia", PokemonType.COLORLESS, Rarity.ULTRA_RARE, "Neo Genesis", 90, "https://images.pokemontcg.io/neo1/9_hires.png", 980.00));
            allCards.add(new Card("card-neo1-10", "Meganium", PokemonType.GRASS, Rarity.ULTRA_RARE, "Neo Genesis", 100, "https://images.pokemontcg.io/neo1/10_hires.png", 340.00));
            allCards.add(new Card("card-neo1-11", "Meganium (Wild Growth)", PokemonType.GRASS, Rarity.ULTRA_RARE, "Neo Genesis", 100, "https://images.pokemontcg.io/neo1/11_hires.png", 290.00));
            allCards.add(new Card("card-neo1-12", "Pichu", PokemonType.ELECTRIC, Rarity.ULTRA_RARE, "Neo Genesis", 30, "https://images.pokemontcg.io/neo1/12_hires.png", 310.00));
            allCards.add(new Card("card-neo1-13", "Skarmory", PokemonType.COLORLESS, Rarity.ULTRA_RARE, "Neo Genesis", 60, "https://images.pokemontcg.io/neo1/13_hires.png", 140.00));
            allCards.add(new Card("card-neo1-14", "Slowking", PokemonType.PSYCHIC, Rarity.ULTRA_RARE, "Neo Genesis", 80, "https://images.pokemontcg.io/neo1/14_hires.png", 220.00));
            allCards.add(new Card("card-neo1-15", "Steelix", PokemonType.FIGHTING, Rarity.ULTRA_RARE, "Neo Genesis", 110, "https://images.pokemontcg.io/neo1/15_hires.png", 260.00));
            allCards.add(new Card("card-neo1-16", "Togetic", PokemonType.COLORLESS, Rarity.ULTRA_RARE, "Neo Genesis", 60, "https://images.pokemontcg.io/neo1/16_hires.png", 175.00));
            allCards.add(new Card("card-typhlosion", "Typhlosion", PokemonType.FIRE, Rarity.RARE, "Neo Genesis", 100, "https://images.pokemontcg.io/neo1/17_hires.png", 650.00));
            allCards.add(new Card("card-neo1-18", "Typhlosion (Fire Recharge)", PokemonType.FIRE, Rarity.ULTRA_RARE, "Neo Genesis", 100, "https://images.pokemontcg.io/neo1/18_hires.png", 480.00));
            allCards.add(new Card("card-neo1-20", "Cleffa", PokemonType.COLORLESS, Rarity.RARE, "Neo Genesis", 30, "https://images.pokemontcg.io/neo1/20_hires.png", 95.00));
            allCards.add(new Card("card-neo1-21", "Donphan", PokemonType.FIGHTING, Rarity.RARE, "Neo Genesis", 70, "https://images.pokemontcg.io/neo1/21_hires.png", 80.00));
            allCards.add(new Card("card-neo1-22", "Elekid", PokemonType.ELECTRIC, Rarity.RARE, "Neo Genesis", 30, "https://images.pokemontcg.io/neo1/22_hires.png", 85.00));
            allCards.add(new Card("card-neo1-28", "Bayleef", PokemonType.GRASS, Rarity.UNCOMMON, "Neo Genesis", 70, "https://images.pokemontcg.io/neo1/28_hires.png", 35.00));
            allCards.add(new Card("card-neo1-31", "Croconaw", PokemonType.WATER, Rarity.UNCOMMON, "Neo Genesis", 70, "https://images.pokemontcg.io/neo1/31_hires.png", 35.00));
            allCards.add(new Card("card-neo1-41", "Quilava", PokemonType.FIRE, Rarity.UNCOMMON, "Neo Genesis", 70, "https://images.pokemontcg.io/neo1/41_hires.png", 38.00));
            allCards.add(new Card("card-neo1-54", "Chikorita", PokemonType.GRASS, Rarity.COMMON, "Neo Genesis", 40, "https://images.pokemontcg.io/neo1/54_hires.png", 25.00));
            allCards.add(new Card("card-neo1-56", "Cyndaquil", PokemonType.FIRE, Rarity.COMMON, "Neo Genesis", 40, "https://images.pokemontcg.io/neo1/56_hires.png", 30.00));
            allCards.add(new Card("card-neo1-80", "Totodile", PokemonType.WATER, Rarity.COMMON, "Neo Genesis", 50, "https://images.pokemontcg.io/neo1/80_hires.png", 25.00));

            // ══════════════════════════════════════════════════════════════
            // 4. EVOLVING SKIES (2021) - set 'swsh7'
            // ══════════════════════════════════════════════════════════════
            allCards.add(new Card("card-swsh7-7", "Leafeon V", PokemonType.GRASS, Rarity.ULTRA_RARE, "Evolving Skies", 210, "https://images.pokemontcg.io/swsh7/7_hires.png", 80.00));
            allCards.add(new Card("card-swsh7-40", "Glaceon V", PokemonType.WATER, Rarity.ULTRA_RARE, "Evolving Skies", 210, "https://images.pokemontcg.io/swsh7/40_hires.png", 75.00));
            allCards.add(new Card("card-swsh7-74", "Sylveon V", PokemonType.PSYCHIC, Rarity.ULTRA_RARE, "Evolving Skies", 200, "https://images.pokemontcg.io/swsh7/74_hires.png", 85.00));
            allCards.add(new Card("card-swsh7-94", "Umbreon V", PokemonType.DARKNESS, Rarity.ULTRA_RARE, "Evolving Skies", 220, "https://images.pokemontcg.io/swsh7/94_hires.png", 95.00));
            allCards.add(new Card("card-swsh7-110", "Rayquaza V", PokemonType.DRAGON, Rarity.ULTRA_RARE, "Evolving Skies", 210, "https://images.pokemontcg.io/swsh7/110_hires.png", 120.00));
            allCards.add(new Card("card-swsh7-167", "Dragonite V", PokemonType.DRAGON, Rarity.ULTRA_RARE, "Evolving Skies", 230, "https://images.pokemontcg.io/swsh7/167_hires.png", 420.00));
            allCards.add(new Card("card-swsh7-175", "Leafeon V Alt Art", PokemonType.GRASS, Rarity.ULTRA_RARE, "Evolving Skies", 210, "https://images.pokemontcg.io/swsh7/175_hires.png", 350.00));
            allCards.add(new Card("card-swsh7-180", "Flareon V", PokemonType.FIRE, Rarity.ULTRA_RARE, "Evolving Skies", 210, "https://images.pokemontcg.io/swsh7/180_hires.png", 110.00));
            allCards.add(new Card("card-swsh7-184", "Glaceon V Alt Art", PokemonType.WATER, Rarity.ULTRA_RARE, "Evolving Skies", 210, "https://images.pokemontcg.io/swsh7/184_hires.png", 380.00));
            allCards.add(new Card("card-swsh7-189", "Sylveon V Alt Art", PokemonType.PSYCHIC, Rarity.ULTRA_RARE, "Evolving Skies", 200, "https://images.pokemontcg.io/swsh7/189_hires.png", 390.00));
            allCards.add(new Card("card-swsh7-192", "Umbreon V Alt Art", PokemonType.DARKNESS, Rarity.ULTRA_RARE, "Evolving Skies", 220, "https://images.pokemontcg.io/swsh7/192_hires.png", 550.00));
            allCards.add(new Card("card-swsh7-194", "Rayquaza V Alt Art", PokemonType.DRAGON, Rarity.ULTRA_RARE, "Evolving Skies", 210, "https://images.pokemontcg.io/swsh7/194_hires.png", 580.00));
            allCards.add(new Card("card-swsh7-195", "Duraludon V", PokemonType.DRAGON, Rarity.ULTRA_RARE, "Evolving Skies", 220, "https://images.pokemontcg.io/swsh7/195_hires.png", 95.00));
            allCards.add(new Card("card-swsh7-205", "Leafeon VMAX Alt Art", PokemonType.GRASS, Rarity.SECRET_RARE, "Evolving Skies", 310, "https://images.pokemontcg.io/swsh7/205_hires.png", 1100.00));
            allCards.add(new Card("card-swsh7-209", "Glaceon VMAX Alt Art", PokemonType.WATER, Rarity.SECRET_RARE, "Evolving Skies", 310, "https://images.pokemontcg.io/swsh7/209_hires.png", 1250.00));
            allCards.add(new Card("card-swsh7-212", "Sylveon VMAX Alt Art", PokemonType.PSYCHIC, Rarity.SECRET_RARE, "Evolving Skies", 310, "https://images.pokemontcg.io/swsh7/212_hires.png", 1350.00));
            allCards.add(new Card("card-umbreon", "Umbreon VMAX Alt Art", PokemonType.DARKNESS, Rarity.SECRET_RARE, "Evolving Skies", 310, "https://images.pokemontcg.io/swsh7/215_hires.png", 3800.00));
            allCards.add(new Card("card-rayquaza", "Rayquaza VMAX", PokemonType.DRAGON, Rarity.SECRET_RARE, "Evolving Skies", 320, "https://images.pokemontcg.io/swsh7/218_hires.png", 1450.00));
            allCards.add(new Card("card-swsh7-220", "Duraludon VMAX Alt Art", PokemonType.DRAGON, Rarity.SECRET_RARE, "Evolving Skies", 330, "https://images.pokemontcg.io/swsh7/220_hires.png", 280.00));

            // Salva todas as cartas no repositório MongoDB
            for (Card c : allCards) {
                cardRepo.save(c);
            }
            log.info("Total de {} cartas salvas/atualizadas no MongoDB!", allCards.size());

            // Garante que os binders dos treinadores principais tenham várias cartas para ofertas de troca
            initOrUpdateTrainerBinders();

            log.info("Sincronizacao de cartas concluida com sucesso!");
        } catch (Exception ex) {
            log.warn("Aviso na inicializacao de cartas: {}", ex.getMessage());
        }
    }

    private void initOrUpdateTrainerBinders() {
        try {
            // Se binder de ash estiver vazio ou desatualizado
            saveOrUpdateBinder("ash", List.of(
                    new BinderItem("inst-ash-pikachu", "card-pikachu", "Pikachu", PokemonType.ELECTRIC, Rarity.COMMON, "ash", false),
                    new BinderItem("inst-ash-charizard", "card-charizard", "Charizard", PokemonType.FIRE, Rarity.ULTRA_RARE, "ash", false),
                    new BinderItem("inst-ash-gengar", "card-gengar", "Gengar", PokemonType.PSYCHIC, Rarity.RARE, "ash", false),
                    new BinderItem("inst-ash-bulbasaur", "card-base1-44", "Bulbasaur", PokemonType.GRASS, Rarity.COMMON, "ash", false),
                    new BinderItem("inst-ash-squirtle", "card-base1-63", "Squirtle", PokemonType.WATER, Rarity.COMMON, "ash", false),
                    new BinderItem("inst-ash-moltres", "card-base3-12", "Moltres", PokemonType.FIRE, Rarity.ULTRA_RARE, "ash", false),
                    new BinderItem("inst-ash-cyndaquil", "card-neo1-56", "Cyndaquil", PokemonType.FIRE, Rarity.COMMON, "ash", false)
            ));

            saveOrUpdateBinder("misty", List.of(
                    new BinderItem("inst-misty-blastoise", "card-blastoise", "Blastoise", PokemonType.WATER, Rarity.ULTRA_RARE, "misty", false),
                    new BinderItem("inst-misty-lugia", "card-lugia", "Lugia", PokemonType.COLORLESS, Rarity.ULTRA_RARE, "misty", false),
                    new BinderItem("inst-misty-gyarados", "card-base1-6", "Gyarados", PokemonType.WATER, Rarity.ULTRA_RARE, "misty", false),
                    new BinderItem("inst-misty-lapras", "card-base3-10", "Lapras", PokemonType.WATER, Rarity.ULTRA_RARE, "misty", false),
                    new BinderItem("inst-misty-feraligatr", "card-neo1-4", "Feraligatr", PokemonType.WATER, Rarity.ULTRA_RARE, "misty", false),
                    new BinderItem("inst-misty-glaceon", "card-swsh7-184", "Glaceon V Alt Art", PokemonType.WATER, Rarity.ULTRA_RARE, "misty", false)
            ));

            saveOrUpdateBinder("brock", List.of(
                    new BinderItem("inst-brock-venusaur", "card-venusaur", "Venusaur", PokemonType.GRASS, Rarity.ULTRA_RARE, "brock", false),
                    new BinderItem("inst-brock-rayquaza", "card-rayquaza", "Rayquaza VMAX", PokemonType.DRAGON, Rarity.SECRET_RARE, "brock", false),
                    new BinderItem("inst-brock-mewtwo", "card-mewtwo", "Mewtwo", PokemonType.PSYCHIC, Rarity.RARE, "brock", false),
                    new BinderItem("inst-brock-aerodactyl", "card-aerodactyl", "Aerodactyl", PokemonType.FIGHTING, Rarity.RARE, "brock", false),
                    new BinderItem("inst-brock-steelix", "card-neo1-15", "Steelix", PokemonType.FIGHTING, Rarity.ULTRA_RARE, "brock", false),
                    new BinderItem("inst-brock-kabutops", "card-base3-9", "Kabutops", PokemonType.FIGHTING, Rarity.RARE, "brock", false),
                    new BinderItem("inst-brock-umbreon", "card-umbreon", "Umbreon VMAX Alt Art", PokemonType.DARKNESS, Rarity.SECRET_RARE, "brock", false)
            ));
        } catch (Exception ex) {
            log.warn("Erro ao registrar binders de treinadores: {}", ex.getMessage());
        }
    }

    private void saveOrUpdateBinder(String username, List<BinderItem> items) {
        var existing = binderRepo.findByTrainerUsername(username);
        if (existing.isPresent()) {
            TrainerBinder binder = existing.get();
            // Mantém ou expande os itens
            if (binder.cards().size() < items.size()) {
                binderRepo.save(new TrainerBinder(binder.id(), username, items));
            }
        } else {
            binderRepo.save(new TrainerBinder(UUID.randomUUID().toString(), username, items));
        }
    }
}