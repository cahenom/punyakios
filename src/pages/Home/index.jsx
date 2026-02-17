import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {BellIkon, Eye, EyeCros} from '../../assets';
import LinearGradient from 'react-native-linear-gradient';
import {
  BOLD_FONT,
  MEDIUM_FONT,
  REGULAR_FONT,
  DARK_BACKGROUND,
  DARK_COLOR,
  FONT_NORMAL,
  FONT_SEDANG,
  HORIZONTAL_MARGIN,
  LIGHT_COLOR,
  SLATE_COLOR,
  WHITE_COLOR,
  BLUE_COLOR,
  WHITE_BACKGROUND,
  GREY_COLOR,
  GRADIENTS,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  windowWidth,
} from '../../utils/const';
import {mainmenus} from '../../data/mainmenu';
import {useAuth} from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from '../../utils/api';
import TutorialModal from '../../components/TutorialModal';

export default function HomeScreen({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const {user, refreshUserProfile, isBalanceVisible, toggleBalanceVisibility} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const flatListRef = useRef(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeen) {
        setShowTutorial(true);
      }
    } catch (err) {
      console.log('Error checking onboarding:', err);
    }
  };

  const handleTutorialComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowTutorial(false);
    } catch (err) {
      console.log('Error saving onboarding state:', err);
      setShowTutorial(false);
    }
  };

  // Promo banner data
  const promoData = [
    {
      id: 1,
      image: 'https://idwebhost.com/blog/wp-content/uploads/2025/02/275_cara-klaim-dana-kaget.webp',
    },
    {
      id: 2,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGQR9IDBYMlnCq-og5mFWJIojXRBxZW492Rg&s',
    },
    {
      id: 3,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQtVEMPq5bpMJWGr8xfefY7giRzs-WgxURJw&s',
    },
  ];

  // Auto-slide promo
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = activeSlideIndex + 1;
      if (nextIndex >= promoData.length) nextIndex = 0;
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: nextIndex * (CARD_WIDTH + CARD_GAP),
          animated: true,
        });
        setActiveSlideIndex(nextIndex);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlideIndex, promoData.length]);

  // State for recent activities
  const [recentActivities, setRecentActivities] = useState([]);

  const getTransactionIcon = sku => {
    if (sku.toLowerCase().includes('pulsa') || sku.toLowerCase().includes('data')) return '📶';
    if (sku.toLowerCase().includes('pln')) return '⚡';
    if (sku.toLowerCase().includes('pdam')) return '💧';
    if (sku.toLowerCase().includes('wallet') || sku.toLowerCase().includes('dompet')) return '💳';
    if (sku.toLowerCase().includes('game')) return '🎮';
    if (sku.toLowerCase().includes('bpjs')) return '🏥';
    return '📦';
  };

  const mapTransactions = (transactions) => {
    return transactions.slice(0, 3).map((transaction, index) => ({
      id: index + 1,
      ref: transaction.ref || '-',
      tujuan: transaction.tujuan || '-',
      sku: transaction.sku || '-',
      produk: transaction.produk || 'Transaksi',
      status: transaction.status || '-',
      message: transaction.message || '-',
      price: transaction.price !== undefined && transaction.price !== null
        ? typeof transaction.price === 'number'
          ? transaction.price
          : typeof transaction.price === 'string'
          ? parseFloat(transaction.price) || 0
          : 0
        : 0,
      sn: transaction.sn || '-',
      type: transaction.type || '-',
      created_at: transaction.created_at || '-',
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserProfile();
      const response = await api.post('/api/user/transaksi');
      if (response.data.status) {
        let fetched = response.data.data || [];
        if (Array.isArray(fetched)) {
          await AsyncStorage.setItem('user_transactions', JSON.stringify(fetched));
          setRecentActivities(mapTransactions(fetched));
        }
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { onRefresh(); }, []));

  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('user_transactions');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed)) setRecentActivities(mapTransactions(parsed));
        }
        const response = await api.post('/api/user/transaksi');
        if (response.data.status) {
          let fetched = response.data.data || [];
          if (Array.isArray(fetched)) {
            await AsyncStorage.setItem('user_transactions', JSON.stringify(fetched));
            setRecentActivities(mapTransactions(fetched));
          }
        }
      } catch (error) {
        console.error('Error loading recent activities:', error);
      }
    };
    loadRecentActivities();
  }, []);

  // Services — first 7 from mainmenus + Lihat Semua
  const visibleServices = mainmenus
    .filter(item =>
      item.label.toLowerCase() !== 'pdam' &&
      item.label.toLowerCase() !== 'internet' &&
      item.label.toLowerCase() !== 'indosat' &&
      item.label.toLowerCase() !== 'voucher' &&
      item.label.toLowerCase() !== 'bpjs kesehatan'
    )
    .slice(0, 7);



  const getStatusTheme = (status) => {
    const s = status?.toLowerCase() || '';
    if (['berhasil', 'sukses', 'success', 'completed'].includes(s)) {
      return {bg: isDarkMode ? 'rgba(1,193,162,0.15)' : 'rgba(1,193,162,0.1)', text: '#01C1A2'};
    }
    if (['gagal', 'failed', 'error', 'none'].includes(s)) {
      return {bg: isDarkMode ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)', text: '#EF4444'};
    }
    if (['pending', 'diproses', 'processing'].includes(s)) {
      return {bg: isDarkMode ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)', text: '#F59E0B'};
    }
    return {bg: isDarkMode ? '#1e293b' : '#f1f5f9', text: isDarkMode ? '#94a3b8' : '#64748b'};
  };

  const formatDate = dateString => {
    if (!dateString || dateString === '-') return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'});
  };

  const formatTime = dateString => {
    if (!dateString || dateString === '-') return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'});
  };
  const CARD_WIDTH = windowWidth * 0.85;
  const CARD_GAP = 16;
  const SIDE_PADDING = (windowWidth - CARD_WIDTH) / 2;

  return (
    <SafeAreaView style={styles.container(isDarkMode)}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#101622' : BLUE_COLOR}
        translucent={false}
      />

      {/* ===== TOP BAR ===== */}
      <View style={[styles.topBar, {backgroundColor: isDarkMode ? '#101622' : BLUE_COLOR}]}>
        <Text style={styles.appName}>PUNYA KIOS</Text>
        <TouchableOpacity style={styles.bellButton}>
          <BellIkon width={24} height={24} fill={WHITE_COLOR} />
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TutorialModal 
        visible={showTutorial} 
        onComplete={handleTutorialComplete} 
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BLUE_COLOR]}
            tintColor={BLUE_COLOR}
          />
        }>

        {/* ===== BALANCE ROW ===== */}
        <View style={styles.balanceRow(isDarkMode)}>
          <View>
            <Text style={styles.balanceLabel(isDarkMode)}>Saldo Dimiliki,</Text>
            <View style={styles.balanceAmountRow}>
              <Text style={styles.balanceAmount(isDarkMode)}>
                {isBalanceVisible
                  ? `Rp${user?.saldo ? parseFloat(user.saldo).toLocaleString('id-ID') : '0'}`
                  : 'Rp ••••••'}
              </Text>
              <TouchableOpacity onPress={toggleBalanceVisibility} style={{marginLeft: 8}}>
                {isBalanceVisible ? (
                  <Eye width={18} height={18} fill={isDarkMode ? '#94a3b8' : '#374957'} />
                ) : (
                  <EyeCros width={18} height={18} fill={isDarkMode ? '#94a3b8' : '#374957'} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.depositButton}
            onPress={() => navigation.navigate('DepositPage')}
            activeOpacity={0.8}>
            <Text style={styles.depositText}>+ Deposit</Text>
          </TouchableOpacity>
        </View>

        {/* ===== SERVICES GRID ===== */}
        <View style={styles.servicesCard(isDarkMode)}>
          <View style={styles.servicesGrid}>
            {visibleServices.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.serviceItem}
                onPress={() => navigation.navigate(item.path)}
                activeOpacity={0.7}>
                <View style={[styles.serviceIconBox, {backgroundColor: isDarkMode ? '#1e293b' : '#f0f3f7'}]}>
                  {React.createElement(item.ikon, {width: 24, height: 24})}
                </View>
                <Text style={styles.serviceLabel(isDarkMode)} numberOfLines={2}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            {/* Lihat Semua */}
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => navigation.navigate('LihatSemua')}
              activeOpacity={0.7}>
              <View style={[styles.serviceIconBox, {backgroundColor: isDarkMode ? '#1e293b' : '#f0f3f7'}]}>
                <Text style={{fontSize: 22}}>⊞</Text>
              </View>
              <Text style={styles.serviceLabel(isDarkMode)} numberOfLines={2}>
                Lihat{'\n'}Semua
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== PROMO SECTION ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle(isDarkMode)}>Promo Spesial</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Promo')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          horizontal
          data={promoData}
          renderItem={({item}) => (
            <TouchableOpacity activeOpacity={0.9} style={{width: CARD_WIDTH, marginRight: CARD_GAP}}>
              <Image
                source={{uri: item.image}}
                style={styles.promoImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={{paddingHorizontal: SIDE_PADDING}}
          onScroll={event => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
            if (index >= 0 && index < promoData.length) {
              setActiveSlideIndex(index);
            }
          }}
          scrollEventThrottle={16}
          onScrollToIndexFailed={() => {}}
        />

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {promoData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeSlideIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* ===== RECENT ACTIVITY ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle(isDarkMode)}>Aktivitas Terkini</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transaksi')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activitiesList}>
          {recentActivities.length > 0 ? (
            recentActivities.map(activity => {
              const statusTheme = getStatusTheme(activity.status);
              return (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityCard(isDarkMode)}
                  onPress={() =>
                    navigation.navigate('SuccessNotif', {
                      item: {
                        ref: activity.ref,
                        tujuan: activity.tujuan,
                        sku: activity.sku,
                        status: activity.status,
                        message: activity.message,
                        price: activity.price,
                        sn: activity.sn,
                        type: activity.type,
                        created_at: activity.created_at,
                        customer_no: activity.tujuan,
                        ref_id: activity.ref,
                        data: activity,
                      },
                      product: {
                        produk: activity.produk,
                        name: activity.sku,
                        label: activity.sku,
                        product_seller_price: `Rp ${(activity.price || 0).toLocaleString('id-ID')}`,
                        price: `Rp ${(activity.price || 0).toLocaleString('id-ID')}`,
                      },
                    })
                  }
                  activeOpacity={0.7}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardType(isDarkMode)}>
                      {activity.produk}
                    </Text>
                    <View style={[styles.statusBadge, {backgroundColor: statusTheme.bg}]}>
                      <Text style={[styles.statusText, {color: statusTheme.text}]}>
                        {activity.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <View style={{flex: 1}}>
                      <Text style={styles.cardTujuan(isDarkMode)} numberOfLines={1}>
                        {activity.tujuan}
                      </Text>
                      <Text style={styles.cardDate(isDarkMode)}>
                        {formatDate(activity.created_at)} • {formatTime(activity.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.cardPrice(isDarkMode)}>
                      Rp {(activity.price || 0).toLocaleString('id-ID')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyActivity(isDarkMode)}>
              <Text style={{fontSize: 32, marginBottom: 8}}>📭</Text>
              <Text style={styles.emptyText(isDarkMode)}>Belum ada transaksi</Text>
            </View>
          )}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? '#101622' : '#f6f6f8',
  }),

  // ===== TOP BAR =====
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: HORIZONTAL_MARGIN,
  },
  appName: {
    fontFamily: BOLD_FONT,
    fontSize: 26,
    color: WHITE_COLOR,
    letterSpacing: 1.2,
  },
  bellButton: {
    position: 'relative',
    padding: 6,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    fontFamily: BOLD_FONT,
    fontSize: 10,
    color: WHITE_COLOR,
  },

  // ===== BALANCE ROW =====
  balanceRow: isDarkMode => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_MARGIN,
    paddingVertical: SPACING.lg,
    backgroundColor: isDarkMode ? '#1a2332' : WHITE_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#2d3748' : '#f1f5f9',
  }),
  balanceLabel: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 13,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
    marginBottom: 2,
  }),
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 22,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  depositButton: {
    backgroundColor: BLUE_COLOR,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
  },
  depositText: {
    fontFamily: BOLD_FONT,
    fontSize: 13,
    color: WHITE_COLOR,
  },

  // ===== SERVICES GRID =====
  servicesCard: isDarkMode => ({
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: SPACING.lg,
    backgroundColor: isDarkMode ? '#1a2332' : WHITE_BACKGROUND,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    ...SHADOWS.small,
  }),
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  serviceIconBox: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs + 2,
  },
  serviceIcon: {
    width: 26,
    height: 26,
  },
  serviceLabel: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 11,
    color: isDarkMode ? '#cbd5e1' : '#334155',
    textAlign: 'center',
    lineHeight: 14,
  }),

  // ===== SECTION HEADER =====
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_MARGIN,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.md,
  },
  sectionTitle: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 17,
    color: isDarkMode ? DARK_COLOR : LIGHT_COLOR,
  }),
  seeAll: {
    fontFamily: MEDIUM_FONT,
    fontSize: 13,
    color: BLUE_COLOR,
  },

  // ===== PROMO CARDS =====
  promoImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: BLUE_COLOR,
    width: 20,
  },

  // ===== RECENT ACTIVITY (matches Transaksi page) =====
  activitiesList: {
    paddingHorizontal: HORIZONTAL_MARGIN,
    gap: 12,
  },
  activityCard: isDarkMode => ({
    backgroundColor: isDarkMode ? '#1e293b' : WHITE_COLOR,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  }),
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardType: isDarkMode => ({
    fontSize: 12,
    fontFamily: MEDIUM_FONT,
    color: isDarkMode ? '#94a3b8' : '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }),
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontFamily: BOLD_FONT,
    textTransform: 'capitalize',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardTujuan: isDarkMode => ({
    fontSize: 15,
    fontFamily: BOLD_FONT,
    color: isDarkMode ? WHITE_COLOR : LIGHT_COLOR,
    marginBottom: 4,
  }),
  cardDate: isDarkMode => ({
    fontSize: 12,
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? '#94a3b8' : SLATE_COLOR,
  }),
  cardPrice: isDarkMode => ({
    fontSize: 16,
    fontFamily: BOLD_FONT,
    color: isDarkMode ? WHITE_COLOR : DARK_COLOR,
  }),
  emptyActivity: isDarkMode => ({
    alignItems: 'center',
    padding: SPACING.xxxl,
    backgroundColor: isDarkMode ? '#1a2332' : WHITE_BACKGROUND,
    borderRadius: BORDER_RADIUS.medium,
    ...SHADOWS.small,
  }),
  emptyText: isDarkMode => ({
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: isDarkMode ? SLATE_COLOR : '#64748b',
  }),
});
