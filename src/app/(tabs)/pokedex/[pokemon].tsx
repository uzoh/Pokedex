import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { STAT_BAR_COLORS, STAT_LABELS, STAT_THRESHOLDS, TYPE_COLORS } from "../../lib/constants";
import { fetchPokemonDetails } from "../../lib/pokeapi";
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from "../../lib/theme";

type PokemonDetail = {
  id: number;
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  base_experience: number;
};

export default function PokemonDetails() {
  const { pokemon } = useLocalSearchParams<{ pokemon?: string }>();
  const [details, setDetails] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!pokemon) {
        setError("No Pokémon selected");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const data = await fetchPokemonDetails(pokemon);
        if (!cancelled) {
          setDetails(data as PokemonDetail);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load details");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [pokemon]);

  if (loading) {
    return (
      <View style={[styles.centered, styles.screen]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={[styles.centered, styles.screen]}>
        <Text style={styles.errorText}>{error || "Pokémon not found"}</Text>
      </View>
    );
  }

  const imageUrl = details.sprites.other["official-artwork"].front_default;
  const primaryType = details.types[0]?.type.name || "normal";
  const primaryColor = TYPE_COLORS[primaryType] || "#A8A878";

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      {/* Hero Header */}
      <View style={[styles.heroHeader, { backgroundColor: primaryColor + "15" }]}>
        <View style={[styles.heroOverlay, { borderColor: primaryColor }]} />
        <Text style={styles.pokemonId}>
          #{details.id.toString().padStart(3, "0")}
        </Text>
        <View style={styles.imageCardsContainer}>
          <View style={[styles.imagePlate, { backgroundColor: primaryColor + "20" }]}>
            {imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={styles.heroImage}
                contentFit="contain"
              />
            )}
          </View>
        </View>
        <Text style={styles.pokemonName}>
          {details.name.charAt(0).toUpperCase() + details.name.slice(1)}
        </Text>
      </View>

      {/* Types and Quick Info */}
      <View style={styles.quickInfoSection}>
        <View style={styles.typesRow}>
          {details.types.map((typeInfo: typeof details.types[0]) => (
            <View
              key={typeInfo.type.name}
              style={[
                styles.modernTypeTag,
                { backgroundColor: TYPE_COLORS[typeInfo.type.name] + "25", borderColor: TYPE_COLORS[typeInfo.type.name] },
              ]}
            >
              <Text style={[styles.typeTagText, { color: TYPE_COLORS[typeInfo.type.name] }]}>
                {typeInfo.type.name.charAt(0).toUpperCase() +
                  typeInfo.type.name.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Physical Attributes Card */}
      <View style={styles.modernCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Attributes</Text>
        </View>
        <View style={styles.attributesGrid}>
          <View style={styles.attributeCard}>
            <Text style={styles.attributeIcon}>📏</Text>
            <Text style={styles.attributeLabel}>Height</Text>
            <Text style={styles.attributeValue}>
              {(details.height / 10).toFixed(1)}m
            </Text>
          </View>
          <View style={styles.attributeDivider} />
          <View style={styles.attributeCard}>
            <Text style={styles.attributeIcon}>⚖️</Text>
            <Text style={styles.attributeLabel}>Weight</Text>
            <Text style={styles.attributeValue}>
              {(details.weight / 10).toFixed(1)}kg
            </Text>
          </View>
          <View style={styles.attributeDivider} />
          <View style={styles.attributeCard}>
            <Text style={styles.attributeIcon}>✨</Text>
            <Text style={styles.attributeLabel}>EXP</Text>
            <Text style={styles.attributeValue}>{details.base_experience}</Text>
          </View>
        </View>
      </View>

      {/* Base Stats Card */}
      <View style={styles.modernCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Base Stats</Text>
          <Pressable
            style={styles.expandButton}
            onPress={() => setShowStatsModal(true)}
          >
            <Text style={styles.expandButtonText}>Details</Text>
          </Pressable>
        </View>
        <View style={styles.statsContainer}>
          {details.stats.map((stat, index: number) => {
            const maxStat = 255;
            const percentage = (stat.base_stat / maxStat) * 100;
            const barColor =
              percentage > STAT_THRESHOLDS.high
                ? STAT_BAR_COLORS.high
                : percentage > STAT_THRESHOLDS.medium
                  ? STAT_BAR_COLORS.medium
                  : STAT_BAR_COLORS.low;

            return (
              <View key={stat.stat.name}>
                <View style={styles.statRowModern}>
                  <View style={styles.statLabelContainer}>
                    <Text style={styles.statLabelText}>
                      {STAT_LABELS[stat.stat.name] || stat.stat.name}
                    </Text>
                  </View>
                  <View style={styles.statBarWrapperModern}>
                    <View style={[styles.statBarModern, { width: `${percentage}%`, backgroundColor: barColor }]} />
                  </View>
                  <Text style={styles.statValueText}>{stat.base_stat}</Text>
                </View>
                {index < details.stats.length - 1 && <View style={styles.statDivider} />}
              </View>
            );
          })}
        </View>
      </View>

      {/* Abilities Card */}
      <View style={styles.modernCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Abilities</Text>
        </View>
        <View style={styles.abilitiesGrid}>
          {details.abilities.map((ability) => (
            <View key={ability.ability.name} style={styles.modernAbilityTag}>
              <Text style={styles.modernAbilityText}>
                {ability.ability.name
                  .split("-")
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>

    {/* Stats Details Modal */}
    <Modal
      visible={showStatsModal}
      presentationStyle="formSheet"
      animationType="slide"
      onRequestClose={() => setShowStatsModal(false)}
    >
      <SafeAreaView style={styles.modalScreen}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Stats</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowStatsModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Stat Visualization */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Stat Summary</Text>
            <View style={styles.statSummaryGrid}>
              {details!.stats.map((stat) => {
                const maxStat = 255;
                const percentage = (stat.base_stat / maxStat) * 100;
                const barColor =
                  percentage > STAT_THRESHOLDS.high
                    ? STAT_BAR_COLORS.high
                    : percentage > STAT_THRESHOLDS.medium
                      ? STAT_BAR_COLORS.medium
                      : STAT_BAR_COLORS.low;

                return (
                  <View key={stat.stat.name} style={styles.statDetailCard}>
                    <Text style={styles.statDetailLabel}>
                      {STAT_LABELS[stat.stat.name] || stat.stat.name}
                    </Text>
                    <View style={styles.statDetailBarContainer}>
                      <View
                        style={[
                          styles.statDetailBar,
                          {
                            width: `${percentage}%`,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.statDetailValue}>{stat.base_stat}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Total Stats */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Overall Performance</Text>
            <View style={styles.performanceCard}>
              {(() => {
                const totalStats = details!.stats.reduce(
                  (sum, stat) => sum + stat.base_stat,
                  0
                );
                const avgStat = Math.round(totalStats / details!.stats.length);

                return (
                  <>
                    <View style={styles.performanceMetric}>
                      <Text style={styles.performanceLabel}>Total Stats</Text>
                      <Text style={styles.performanceValue}>{totalStats}</Text>
                    </View>
                    <View style={styles.performanceDivider} />
                    <View style={styles.performanceMetric}>
                      <Text style={styles.performanceLabel}>Average</Text>
                      <Text style={styles.performanceValue}>{avgStat}</Text>
                    </View>
                  </>
                );
              })()}
            </View>
          </View>

          {/* Type Effectiveness Info */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Type Information</Text>
            <View style={styles.typeInfoCard}>
              <Text style={styles.typeInfoLabel}>Primary Type</Text>
              <Text style={styles.typeInfoValue}>
                {details!.types[0]?.type.name.charAt(0).toUpperCase() +
                  details!.types[0]?.type.name.slice(1)}
              </Text>
              {details!.types.length > 1 && (
                <>
                  <Text style={[styles.typeInfoLabel, { marginTop: SPACING.md }]}>
                    Secondary Type
                  </Text>
                  <Text style={styles.typeInfoValue}>
                    {details!.types[1]?.type.name.charAt(0).toUpperCase() +
                      details!.types[1]?.type.name.slice(1)}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Power Level Indicator */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Power Level</Text>
            <View style={styles.powerLevelCard}>
              {(() => {
                const totalStats = details!.stats.reduce(
                  (sum, stat) => sum + stat.base_stat,
                  0
                );
                const powerPercentage = (totalStats / (255 * 6)) * 100;
                let powerLevel = "Weak";
                let powerColor = STAT_BAR_COLORS.low;

                if (powerPercentage > 70) {
                  powerLevel = "Legendary";
                  powerColor = "#FFD700";
                } else if (powerPercentage > 60) {
                  powerLevel = "Strong";
                  powerColor = STAT_BAR_COLORS.high;
                } else if (powerPercentage > 50) {
                  powerLevel = "Balanced";
                  powerColor = STAT_BAR_COLORS.medium;
                }

                return (
                  <>
                    <Text style={[styles.powerLevelLabel, { color: powerColor }]}>
                      {powerLevel}
                    </Text>
                    <View style={styles.powerBarContainer}>
                      <View
                        style={[
                          styles.powerBar,
                          { width: `${powerPercentage}%`, backgroundColor: powerColor },
                        ]}
                      />
                    </View>
                    <Text style={styles.powerPercentage}>{Math.round(powerPercentage)}%</Text>
                  </>
                );
              })()}
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: SPACING.xxxxl,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Hero Header
  heroHeader: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopWidth: 2,
  },
  pokemonId: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text.tertiary,
    letterSpacing: 1,
    marginBottom: SPACING.xl,
  },
  imageCardsContainer: {
    marginBottom: SPACING.xl,
  },
  imagePlate: {
    width: 240,
    height: 240,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  pokemonName: {
    fontSize: FONT_SIZES["4xl"],
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },

  // Quick Info
  quickInfoSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  typesRow: {
    flexDirection: "row",
    gap: SPACING.md,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  modernTypeTag: {
    paddingHorizontal: 14,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
  },
  typeTagText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.3,
  },

  // Modern Card Style
  modernCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: FONT_SIZES.base + 2,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
    letterSpacing: 0.2,
  },

  // Attributes Grid
  attributesGrid: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  attributeCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  attributeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  attributeLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  attributeValue: {
    fontSize: FONT_SIZES.base + 2,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
  },
  attributeDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },

  // Stats Container
  statsContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statRowModern: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  statLabelContainer: {
    width: 45,
  },
  statLabelText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.secondary,
    letterSpacing: 0.4,
  },
  statBarWrapperModern: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
  },
  statBarModern: {
    height: "100%",
    borderRadius: BORDER_RADIUS.sm,
  },
  statValueText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    minWidth: 28,
    textAlign: "right",
  },
  statDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  // Abilities Grid
  abilitiesGrid: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  modernAbilityTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  modernAbilityText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
  },

  // Utilities
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.base + 2,
    textAlign: "center",
  },
  spacer: {
    height: SPACING.xxl,
  },

  // Modal Styles
  modalScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalContent: {
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  closeButtonText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text.secondary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  expandButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
  },
  expandButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#fff",
  },
  modalSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  modalSectionTitle: {
    fontSize: FONT_SIZES.base + 2,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.accent,
    marginBottom: SPACING.lg,
  },
  statSummaryGrid: {
    gap: SPACING.md,
  },
  statDetailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statDetailLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  statDetailBarContainer: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  statDetailBar: {
    height: "100%",
    borderRadius: BORDER_RADIUS.sm,
  },
  statDetailValue: {
    fontSize: FONT_SIZES.base + 2,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
    textAlign: "right",
  },
  performanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  performanceMetric: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  performanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.sm,
  },
  performanceValue: {
    fontSize: FONT_SIZES["3xl"],
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.accent,
  },
  performanceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  typeInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeInfoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.sm,
  },
  typeInfoValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
  },
  powerLevelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  powerLevelLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extrabold,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  powerBarContainer: {
    width: "100%",
    height: 20,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  powerBar: {
    height: "100%",
    borderRadius: BORDER_RADIUS.sm,
  },
  powerPercentage: {
    fontSize: FONT_SIZES.base + 2,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
  },
});


