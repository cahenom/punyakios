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
  Platform,
} from 'react-native';
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {BellIkon, Eye, EyeCros, SendIkon, MoreIkon, TransferIkon, QrisPayIkon, ArrowRight, AddIkon, ScanIcon} from '../../assets';
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

  const onRefresh = async (silent = false) => {
    if (!silent) setRefreshing(true);
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
      if (!silent) setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { onRefresh(true); }, []));

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

      {/* ===== FIXED HEADER WITH CURVE ===== */}
      <View style={[styles.headerContainer, {backgroundColor: isDarkMode ? '#101622' : BLUE_COLOR}]}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>Halo, 👋</Text>
            <Text style={styles.userNameText} numberOfLines={1}>
              {user?.name || 'User PunyaKios'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.bellButton}
              onPress={() => navigation.navigate('Notifikasi')}>
              <BellIkon width={24} height={24} fill={WHITE_COLOR} />
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profil')}>
              <View style={styles.profileCircle}>
                <Image 
                  source={{uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}} 
                  style={styles.profileImage} 
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BLUE_COLOR]}
            tintColor={BLUE_COLOR}
          />
        }>

        {/* ===== BALANCE CARD ===== */}
        <View style={styles.balanceCardWrapper}>
          <LinearGradient
            colors={isDarkMode ? ['#1e293b', '#0f172a'] : GRADIENTS.primary}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.mainBalanceCard}>
            
            <View style={styles.cardInfoRow}>
              <View style={styles.balanceMain}>
                <Text style={styles.cardLabel}>Saldo Saya</Text>
                <View style={styles.amountRow}>
                  <View style={{flex: 1, height: 40, justifyContent: 'center', flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={[styles.mainAmountText, {fontSize: 20, marginRight: 2, marginTop: 4}]}>Rp</Text>
                    <View style={{flex: 1}}>
                      <Text 
                        style={styles.mainAmountText}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.4}
                      >
                        {isBalanceVisible
                          ? (user?.saldo ? parseFloat(user.saldo).toLocaleString('id-ID') : '0')
                          : '••••••'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={toggleBalanceVisibility} style={styles.visibilityToggle}>
                    {isBalanceVisible ? (
                      <Eye width={20} height={20} fill={WHITE_COLOR} />
                    ) : (
                      <EyeCros width={20} height={20} fill={WHITE_COLOR} />
                    )}
                  </TouchableOpacity>
                  
                  {/* Points badge now level with amount */}
                  <TouchableOpacity 
                    style={styles.pointsFloatingBadge}
                    onPress={() => navigation.navigate('PointsRedeem')}>
                    <Text style={styles.pointsCount}>🪙 {user?.points || 0}</Text>
                    <View style={styles.pointsArrow}>
                      <ArrowRight width={10} height={10} fill="#f97316" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.actionGridContainer}>
              <View style={styles.actionGridInner}>
                <TouchableOpacity
                  style={styles.gridBtn}
                  onPress={() => navigation.navigate('DepositPage')}
                  activeOpacity={0.7}>
                  <View style={styles.gridBtnIcon}>
                    <AddIkon width={22} height={22} fill={BLUE_COLOR} />
                  </View>
                  <Text style={styles.gridBtnLabel}>Deposit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gridBtn}
                  onPress={() => navigation.navigate('Transfer')}
                  activeOpacity={0.7}>
                  <View style={styles.gridBtnIcon}>
                    <SendIkon width={20} height={20} fill={BLUE_COLOR} />
                  </View>
                  <Text style={styles.gridBtnLabel}>Kirim</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gridBtn}
                  onPress={() => navigation.navigate('Scan')}
                  activeOpacity={0.7}>
                  <View style={styles.gridBtnIcon}>
                    <ScanIcon width={32} height={32} fill={BLUE_COLOR} />
                  </View>
                  <Text style={styles.gridBtnLabel}>Bayar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gridBtn}
                  onPress={() => navigation.navigate('Transaksi')}
                  activeOpacity={0.7}>
                  <View style={styles.gridBtnIcon}>
                    <MoreIkon width={20} height={20} fill={BLUE_COLOR} />
                  </View>
                  <Text style={styles.gridBtnLabel}>Riwayat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ===== SERVICES GRID ===== */}
        <View style={styles.servicesCard(isDarkMode)}>
          <View style={styles.servicesCardInner}>
            <View style={styles.servicesGrid}>
            {visibleServices.map((item, index) => {
              const getIconBg = (label) => {
                if (isDarkMode) return 'rgba(255,255,255,0.05)';
                const colors = {
                  'Pulsa': '#f0f9ff',
                  'Paket Data': '#f5f3ff',
                  'PLN': '#fffbeb',
                  'Dompet Elektronik': '#f0fdf4',
                  'Games': '#fdf2f8',
                };
                return colors[label] || '#f8fafc';
              };

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.serviceItem}
                  onPress={() => navigation.navigate(item.path)}
                  activeOpacity={0.7}>
                  <View style={[styles.serviceIconBox, {backgroundColor: getIconBg(item.label)}]}>
                    {React.createElement(item.ikon, {width: 26, height: 26})}
                  </View>
                  <Text style={styles.serviceLabel(isDarkMode)} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {/* Lihat Semua */}
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => navigation.navigate('LihatSemua')}
              activeOpacity={0.7}>
              <View style={[styles.serviceIconBox, {backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc'}]}>
                <MoreIkon width={24} height={24} fill={isDarkMode ? WHITE_COLOR : BLUE_COLOR} />
              </View>
              <Text style={styles.serviceLabel(isDarkMode)} numberOfLines={2}>
                Lihat{'\n'}Semua
              </Text>
            </TouchableOpacity>
            </View>
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
            <Text style={styles.seeAll}>Lihat Semua</Text>
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
                  <View style={styles.activityCardInner}>
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
                        Rp{(activity.price || 0).toLocaleString('id-ID')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyActivity(isDarkMode)}>
              <Text style={{fontSize: 40, marginBottom: 16}}>empty</Text>
              <Text style={styles.emptyText(isDarkMode)}>Belum ada transaksi hari ini</Text>
            </View>
          )}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{height: 100}} />
      </ScrollView>

      <TutorialModal 
        visible={showTutorial} 
        onComplete={handleTutorialComplete} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: isDarkMode => ({
    flex: 1,
    backgroundColor: isDarkMode ? '#101622' : '#f6f6f8',
  }),

  // ===== HEADER & GREETING =====
  headerContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: HORIZONTAL_MARGIN,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    fontFamily: REGULAR_FONT,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  userNameText: {
    fontFamily: BOLD_FONT,
    fontSize: 22,
    color: WHITE_COLOR,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bellButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BLUE_COLOR,
  },
  bellBadgeText: {
    fontFamily: BOLD_FONT,
    fontSize: 8,
    color: WHITE_COLOR,
  },
  profileButton: {
    padding: 2,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
    backgroundColor: WHITE_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },

  // ===== BALANCE CARD =====
  balanceCardWrapper: {
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: 12,
    zIndex: 20,
  },
  mainBalanceCard: {
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceMain: {
    flex: 1,
  },
  cardLabel: {
    fontFamily: MEDIUM_FONT,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainAmountText: {
    fontFamily: BOLD_FONT,
    fontSize: 32,
    color: WHITE_COLOR,
  },
  visibilityToggle: {
    padding: 4,
  },
  pointsFloatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    flexShrink: 0,
  },
  pointsCount: {
    fontFamily: BOLD_FONT,
    fontSize: 12,
    color: '#f97316',
  },
  pointsArrow: {
    marginLeft: 2,
  },
  actionGridContainer: {
    marginTop: 24,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 20,
    padding: 14,
  },
  actionGridInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  gridBtn: {
    alignItems: 'center',
    width: '22%',
  },
  gridBtnIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: WHITE_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridBtnLabel: {
    fontFamily: BOLD_FONT,
    fontSize: 11,
    color: WHITE_COLOR,
  },

  // ===== SERVICES GRID =====
  servicesCard: isDarkMode => ({
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: SPACING.xxl,
    backgroundColor: isDarkMode ? '#1a2332' : WHITE_BACKGROUND,
    borderRadius: 24,
  }),
  servicesCardInner: {
    padding: SPACING.lg,
    borderRadius: 24,
    overflow: 'hidden',
  },
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
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceIcon: {
    width: 28,
    height: 28,
  },
  serviceLabel: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 11,
    color: isDarkMode ? '#cbd5e1' : '#334155',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
  }),

  // ===== SECTION HEADER =====
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_MARGIN,
    marginTop: 40,
    marginBottom: 16,
  },
  sectionTitle: isDarkMode => ({
    fontFamily: BOLD_FONT,
    fontSize: 18,
    color: isDarkMode ? DARK_COLOR : '#0f172a',
  }),
  seeAll: {
    fontFamily: BOLD_FONT,
    fontSize: 13,
    color: BLUE_COLOR,
  },

  // ===== PROMO CARDS =====
  promoImage: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: BLUE_COLOR,
    width: 24,
  },

  // ===== RECENT ACTIVITY =====
  activitiesList: {
    paddingHorizontal: HORIZONTAL_MARGIN,
    gap: 14,
  },
  activityCard: isDarkMode => ({
    backgroundColor: isDarkMode ? '#1e293b' : WHITE_COLOR,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#f1f5f9',
  }),
  activityCardInner: {
    padding: 18,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardType: isDarkMode => ({
    fontSize: 12,
    fontFamily: BOLD_FONT,
    color: isDarkMode ? '#94a3b8' : '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }),
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 80,
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
    fontSize: 16,
    fontFamily: BOLD_FONT,
    color: isDarkMode ? WHITE_COLOR : '#0f172a',
    marginBottom: 6,
  }),
  cardDate: isDarkMode => ({
    fontSize: 12,
    fontFamily: REGULAR_FONT,
    color: isDarkMode ? '#94a3b8' : '#64748b',
  }),
  cardPrice: isDarkMode => ({
    fontSize: 18,
    fontFamily: BOLD_FONT,
    color: isDarkMode ? WHITE_COLOR : BLUE_COLOR,
  }),
  emptyActivity: isDarkMode => ({
    alignItems: 'center',
    padding: 40,
    backgroundColor: isDarkMode ? '#1a2332' : '#f8fafc',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: isDarkMode ? '#334155' : '#cbd5e1',
  }),
  emptyText: isDarkMode => ({
    fontFamily: MEDIUM_FONT,
    fontSize: 14,
    color: isDarkMode ? '#64748b' : '#94a3b8',
    marginTop: 8,
  }),
});
