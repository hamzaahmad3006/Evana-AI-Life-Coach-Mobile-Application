import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { BottomTab } from '../../components/ui/BottomTab';
import { InsightCard } from '../../components/ui/InsightCard';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Star, Heart, Target, Sparkles, RefreshCw } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchInsights, generateInsights } from '../../store/insightSlice';

const ICON_MAP: Record<string, any> = {
  habit: { icon: Clock, color: COLORS.success, bg: '#E1F5EE' },
  mood: { icon: Heart, color: '#D4537E', bg: '#FBEAF0' },
  goal: { icon: Target, color: COLORS.purple, bg: COLORS.purpleSoft },
  celebration: { icon: Star, color: COLORS.warning, bg: '#FAEEDA' },
};

export const InsightsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { insights, loading, generating } = useAppSelector(state => state.insights);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchInsights(user.id));
    }
  }, [user?.id]);

  const handleRefresh = () => {
    if (user?.id) {
      dispatch(generateInsights(user.id));
    }
  };

  const featuredInsight = insights.find(i => i.priority >= 2) || insights[0];
  const listInsights = insights.filter(i => i.id !== featuredInsight?.id);

  if (loading && insights.length === 0) {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Evana is analyzing your patterns...</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => user?.id && dispatch(fetchInsights(user.id))} tintColor={COLORS.purple} />
        }
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Evana's insights</Text>
              <Text style={styles.subtitle}>Personalised coaching for you</Text>
            </View>
            <TouchableOpacity 
              style={[styles.refreshBtn, generating && { opacity: 0.5 }]} 
              onPress={handleRefresh}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color={COLORS.purple} />
              ) : (
                <RefreshCw size={20} color={COLORS.purple} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Insight */}
        {featuredInsight && (
          <LinearGradient
            colors={[COLORS.purple, COLORS.purpleLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredInsight}
          >
            <View style={styles.featuredIconBox}>
              <Sparkles size={20} color={COLORS.white} />
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>{featuredInsight.title}</Text>
              <Text style={styles.featuredText}>
                {featuredInsight.description}
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* Insights List */}
        <View style={styles.insightsList}>
          {insights.length === 0 ? (
            <View style={styles.emptyState}>
              <Sparkles size={48} color={COLORS.purpleSoft} />
              <Text style={styles.emptyText}>Tap refresh to generate your first AI insights!</Text>
            </View>
          ) : (
            insights.map((insight, idx) => {
              const config = ICON_MAP[insight.type] || ICON_MAP.habit;
              const IconComp = config.icon;
              
              return (
                <InsightCard
                  key={insight.id || idx}
                  title={insight.title}
                  description={insight.description}
                  icon={<IconComp size={18} color={config.color} />}
                  iconBg={config.bg}
                />
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomTab activeTab="insights" />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    ...TYPOGRAPHY.body,
    color: COLORS.textMid,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 16,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontSize: 24,
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: '500',
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  featuredInsight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    gap: 16,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  featuredIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
  },
  featuredText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
    fontWeight: '500',
  },
  insightsList: {
    marginBottom: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    ...TYPOGRAPHY.body,
    color: COLORS.textMid,
  },
});
