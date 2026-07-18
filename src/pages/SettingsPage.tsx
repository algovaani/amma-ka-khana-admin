import { useEffect, useState } from 'react';
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MapIcon from '@mui/icons-material/Map';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PaymentsIcon from '@mui/icons-material/Payments';
import CampaignIcon from '@mui/icons-material/Campaign';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { settingsApi, OnboardingFees, PaymentGatewayConfig } from '../services/api/settingsApi';

type SettingCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  highlight?: boolean;
  highlightColor?: 'warning' | 'success' | 'error';
};

const SettingCard = ({
  title,
  description,
  icon,
  children,
  action,
  highlight,
  highlightColor = 'warning',
}: SettingCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 3 },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid',
      borderColor: highlight ? `${highlightColor}.main` : 'divider',
      borderRadius: 2,
      bgcolor: highlight ? 'action.selected' : 'background.paper',
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {description}
        </Typography>
      </Box>
    </Stack>

    <Box sx={{ flex: 1 }}>{children}</Box>

    {action ? (
      <>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{action}</Box>
      </>
    ) : null}
  </Paper>
);

const SettingsPage = () => {
  const [fees, setFees] = useState<OnboardingFees>({
    securityDeposit: 2000,
    certificateFeeExistingFssai: 0,
    certificateFeeNeedFssai: 1500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [routeCookRadiusKm, setRouteCookRadiusKm] = useState<number>(1);
  const [savingRadius, setSavingRadius] = useState(false);
  const [menuPackagePrice, setMenuPackagePrice] = useState<number>(0);
  const [savingMenuPrice, setSavingMenuPrice] = useState(false);
  const [platformName, setPlatformName] = useState('AMMA KA KHANA');
  const [supportEmail, setSupportEmail] = useState('support@ammakakhana.com');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [platformCommissionPercent, setPlatformCommissionPercent] = useState(40);
  const [minOrderAmount, setMinOrderAmount] = useState(70);
  const [minWithdrawAmount, setMinWithdrawAmount] = useState(100);
  const [maxWithdrawAmount, setMaxWithdrawAmount] = useState(500000);
  const [minWalletTopUp, setMinWalletTopUp] = useState(1);
  const [maxWalletTopUp, setMaxWalletTopUp] = useState(50000);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingPaymentLimits, setSavingPaymentLimits] = useState(false);
  const [serverIssueTitle, setServerIssueTitle] = useState('Service Temporarily Unavailable');
  const [serverIssueMessage, setServerIssueMessage] = useState('');
  const [serverIssueSubMessage, setServerIssueSubMessage] = useState('');
  const [savingServerIssue, setSavingServerIssue] = useState(false);
  const [appsActive, setAppsActive] = useState(true);
  const [appsBlockedTitle, setAppsBlockedTitle] = useState('App Temporarily Unavailable');
  const [appsBlockedMessage, setAppsBlockedMessage] = useState('');
  const [appsBlockedSubMessage, setAppsBlockedSubMessage] = useState('');
  const [savingAppAccess, setSavingAppAccess] = useState(false);
  const [cookHomeCardEnabled, setCookHomeCardEnabled] = useState(true);
  const [cookHomeCardTitle, setCookHomeCardTitle] = useState('What happens next?');
  const [cookHomeCardMessage, setCookHomeCardMessage] = useState('');
  const [cookHomeCardSubMessage, setCookHomeCardSubMessage] = useState('');
  const [savingCookHomeCard, setSavingCookHomeCard] = useState(false);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>([]);
  const [savingPaymentGateways, setSavingPaymentGateways] = useState(false);
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [referralTrigger, setReferralTrigger] = useState<'signup' | 'first_order'>('first_order');
  const [customerReferrerReward, setCustomerReferrerReward] = useState(50);
  const [customerRefereeReward, setCustomerRefereeReward] = useState(50);
  const [cookReferrerReward, setCookReferrerReward] = useState(100);
  const [cookRefereeReward, setCookRefereeReward] = useState(100);
  const [referralTitle, setReferralTitle] = useState('Refer & Earn');
  const [referralSubtitle, setReferralSubtitle] = useState('');
  const [referralShareMessage, setReferralShareMessage] = useState('');
  const [referralTerms, setReferralTerms] = useState('');
  const [referralLinkBaseUrl, setReferralLinkBaseUrl] = useState('https://ammakakhana.com/join?code=');
  const [savingReferral, setSavingReferral] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      settingsApi.getOnboardingFees(),
      settingsApi.getRouteCookRadius(),
      settingsApi.getMenuPackagePrice(),
      settingsApi.getGeneralPlatform(),
      settingsApi.getPaymentLimits(),
      settingsApi.getServerIssue(),
      settingsApi.getAppAccess(),
      settingsApi.getCookHomeCard(),
      settingsApi.getPaymentGateways(),
      settingsApi.getReferralSettings(),
    ])
      .then(([feesRes, radiusRes, menuPriceRes, generalRes, paymentLimitsRes, serverIssueRes, appAccessRes, cookHomeCardRes, paymentGatewaysRes, referralRes]) => {
        setFees(feesRes.data.fees);
        setRouteCookRadiusKm(radiusRes.data.routeCookRadiusKm);
        setMenuPackagePrice(menuPriceRes.data.menuPackagePrice);
        setPlatformName(generalRes.data.platformName);
        setSupportEmail(generalRes.data.supportEmail);
        setDeliveryFee(generalRes.data.deliveryFee);
        setPlatformCommissionPercent(generalRes.data.platformCommissionPercent);
        setMinOrderAmount(paymentLimitsRes.data.minOrderAmount ?? 70);
        setMinWithdrawAmount(paymentLimitsRes.data.minWithdrawAmount ?? 100);
        setMaxWithdrawAmount(paymentLimitsRes.data.maxWithdrawAmount ?? 500000);
        setMinWalletTopUp(paymentLimitsRes.data.minWalletTopUp ?? 1);
        setMaxWalletTopUp(paymentLimitsRes.data.maxWalletTopUp ?? 50000);
        setServerIssueTitle(serverIssueRes.data.title);
        setServerIssueMessage(serverIssueRes.data.message);
        setServerIssueSubMessage(serverIssueRes.data.subMessage);
        setAppsActive(appAccessRes.data.appsActive);
        setAppsBlockedTitle(appAccessRes.data.title);
        setAppsBlockedMessage(appAccessRes.data.message);
        setAppsBlockedSubMessage(appAccessRes.data.subMessage);
        setCookHomeCardEnabled(cookHomeCardRes.data.enabled);
        setCookHomeCardTitle(cookHomeCardRes.data.title);
        setCookHomeCardMessage(cookHomeCardRes.data.message);
        setCookHomeCardSubMessage(cookHomeCardRes.data.subMessage);
        setPaymentGateways(paymentGatewaysRes.data.gateways ?? []);
        setReferralEnabled(referralRes.data.enabled);
        setReferralTrigger(referralRes.data.trigger);
        setCustomerReferrerReward(referralRes.data.customerReferrerReward);
        setCustomerRefereeReward(referralRes.data.customerRefereeReward);
        setCookReferrerReward(referralRes.data.cookReferrerReward);
        setCookRefereeReward(referralRes.data.cookRefereeReward);
        setReferralTitle(referralRes.data.title);
        setReferralSubtitle(referralRes.data.subtitle);
        setReferralShareMessage(referralRes.data.shareMessage);
        setReferralTerms(referralRes.data.terms);
        setReferralLinkBaseUrl(referralRes.data.linkBaseUrl);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const existingTotal = fees.certificateFeeExistingFssai + fees.securityDeposit;
  const needTotal = fees.certificateFeeNeedFssai + fees.securityDeposit;

  const clearAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setSaving(true);
    clearAlerts();
    try {
      const res = await settingsApi.updateOnboardingFees(fees);
      setFees(res.data.fees);
      setSuccess('Cook onboarding fees updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save fees');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRadius = async () => {
    setSavingRadius(true);
    clearAlerts();
    try {
      const res = await settingsApi.updateRouteCookRadius(routeCookRadiusKm);
      setRouteCookRadiusKm(res.data.routeCookRadiusKm);
      setSuccess('Route cook radius updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update radius');
    } finally {
      setSavingRadius(false);
    }
  };

  const handleSaveMenuPackagePrice = async () => {
    setSavingMenuPrice(true);
    clearAlerts();
    try {
      const res = await settingsApi.updateMenuPackagePrice(menuPackagePrice);
      setMenuPackagePrice(res.data.menuPackagePrice);
      setSuccess('Menu package price updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update menu package price');
    } finally {
      setSavingMenuPrice(false);
    }
  };

  const handleSaveGeneralPlatform = async () => {
    setSavingGeneral(true);
    clearAlerts();
    try {
      const res = await settingsApi.updateGeneralPlatform({
        platformName: platformName.trim(),
        supportEmail: supportEmail.trim(),
        deliveryFee,
        platformCommissionPercent,
      });
      setPlatformName(res.data.platformName);
      setSupportEmail(res.data.supportEmail);
      setDeliveryFee(res.data.deliveryFee);
      setPlatformCommissionPercent(res.data.platformCommissionPercent);
      setSuccess('General platform settings updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update general platform settings');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSavePaymentLimits = async () => {
    setSavingPaymentLimits(true);
    clearAlerts();
    try {
      const res = await settingsApi.updatePaymentLimits({
        minOrderAmount,
        minWithdrawAmount,
        maxWithdrawAmount,
        minWalletTopUp,
        maxWalletTopUp,
      });
      setMinOrderAmount(res.data.minOrderAmount);
      setMinWithdrawAmount(res.data.minWithdrawAmount);
      setMaxWithdrawAmount(res.data.maxWithdrawAmount);
      setMinWalletTopUp(res.data.minWalletTopUp);
      setMaxWalletTopUp(res.data.maxWalletTopUp);
      setSuccess('Payment limits updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update payment limits');
    } finally {
      setSavingPaymentLimits(false);
    }
  };

  const handleSaveServerIssue = async () => {
    setSavingServerIssue(true);
    clearAlerts();
    try {
      const res = await settingsApi.updateServerIssue({
        title: serverIssueTitle.trim(),
        message: serverIssueMessage.trim(),
        subMessage: serverIssueSubMessage.trim() || undefined,
      });
      setServerIssueTitle(res.data.title);
      setServerIssueMessage(res.data.message);
      setServerIssueSubMessage(res.data.subMessage);
      setSuccess('Server issue message updated for customer and cook apps');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update server issue message');
    } finally {
      setSavingServerIssue(false);
    }
  };

  const handleSaveAppAccess = async () => {
    setSavingAppAccess(true);
    clearAlerts();
    try {
      const res = await settingsApi.updateAppAccess({
        appsActive,
        title: appsBlockedTitle.trim(),
        message: appsBlockedMessage.trim(),
        subMessage: appsBlockedSubMessage.trim() || undefined,
      });
      setAppsActive(res.data.appsActive);
      setAppsBlockedTitle(res.data.title);
      setAppsBlockedMessage(res.data.message);
      setAppsBlockedSubMessage(res.data.subMessage);
      setSuccess(
        res.data.appsActive
          ? 'Customer and cook apps are now active'
          : 'Customer and cook apps are now stopped'
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update app access');
    } finally {
      setSavingAppAccess(false);
    }
  };

  const handleSaveCookHomeCard = async () => {
    setSavingCookHomeCard(true);
    clearAlerts();
    try {
      const res = await settingsApi.updateCookHomeCard({
        enabled: cookHomeCardEnabled,
        title: cookHomeCardTitle.trim(),
        message: cookHomeCardMessage.trim(),
        subMessage: cookHomeCardSubMessage.trim() || undefined,
      });
      setCookHomeCardEnabled(res.data.enabled);
      setCookHomeCardTitle(res.data.title);
      setCookHomeCardMessage(res.data.message);
      setCookHomeCardSubMessage(res.data.subMessage);
      setSuccess(
        res.data.enabled
          ? 'Cook home card saved — cooks will see the latest message on top'
          : 'Cook home card hidden in cook app'
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update cook home card');
    } finally {
      setSavingCookHomeCard(false);
    }
  };

  const updateGatewayField = <K extends keyof PaymentGatewayConfig>(
    id: string,
    field: K,
    value: PaymentGatewayConfig[K]
  ) => {
    setPaymentGateways((prev) =>
      prev.map((gw) => (gw.id === id ? { ...gw, [field]: value } : gw))
    );
  };

  const handleSavePaymentGateways = async () => {
    setSavingPaymentGateways(true);
    clearAlerts();
    try {
      const activeWithoutKey = paymentGateways.find((g) => g.isActive && !g.keyId.trim());
      if (activeWithoutKey) {
        setError(`${activeWithoutKey.displayName}: Key ID is required when gateway is active`);
        setSavingPaymentGateways(false);
        return;
      }
      const res = await settingsApi.updatePaymentGateways({ gateways: paymentGateways });
      setPaymentGateways(res.data.gateways);
      const activeCount = res.data.gateways.filter((g) => g.isActive).length;
      setSuccess(
        `Payment gateways saved — ${activeCount} active gateway${activeCount === 1 ? '' : 's'} visible in apps`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update payment gateways');
    } finally {
      setSavingPaymentGateways(false);
    }
  };

  const handleSaveReferral = async () => {
    setSavingReferral(true);
    clearAlerts();
    try {
      const res = await settingsApi.updateReferralSettings({
        enabled: referralEnabled,
        trigger: referralTrigger,
        customerReferrerReward,
        customerRefereeReward,
        cookReferrerReward,
        cookRefereeReward,
        title: referralTitle.trim(),
        subtitle: referralSubtitle.trim(),
        shareMessage: referralShareMessage.trim(),
        terms: referralTerms.trim(),
        linkBaseUrl: referralLinkBaseUrl.trim(),
      });
      setReferralEnabled(res.data.enabled);
      setReferralTrigger(res.data.trigger);
      setCustomerReferrerReward(res.data.customerReferrerReward);
      setCustomerRefereeReward(res.data.customerRefereeReward);
      setCookReferrerReward(res.data.cookReferrerReward);
      setCookRefereeReward(res.data.cookRefereeReward);
      setReferralTitle(res.data.title);
      setReferralSubtitle(res.data.subtitle);
      setReferralShareMessage(res.data.shareMessage);
      setReferralTerms(res.data.terms);
      setReferralLinkBaseUrl(res.data.linkBaseUrl);
      setSuccess('Referral program settings updated');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update referral settings');
    } finally {
      setSavingReferral(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage platform, apps, pricing, and cook onboarding from one place.
          </Typography>
        </Box>
        <Chip
          label={appsActive ? 'Apps Live' : 'Apps Stopped'}
          color={appsActive ? 'success' : 'warning'}
          variant={appsActive ? 'filled' : 'outlined'}
          size="small"
        />
      </Stack>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {success ? (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        ) : null}
        {error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}
      </Stack>

      <Grid container spacing={2.5}>
        {/* App access — full width */}
        <Grid item xs={12}>
          <SettingCard
            title="Customer & Cook Apps"
            description="Stop or allow both mobile apps instantly. Users see your custom blocked message when stopped."
            icon={<AppsIcon fontSize="small" />}
            highlight={!appsActive}
            highlightColor="warning"
            action={
              <Button
                variant="contained"
                color={appsActive ? 'success' : 'warning'}
                onClick={handleSaveAppAccess}
                disabled={
                  loading ||
                  savingAppAccess ||
                  (!appsActive && (!appsBlockedTitle.trim() || !appsBlockedMessage.trim()))
                }
              >
                {savingAppAccess
                  ? 'Saving...'
                  : appsActive
                    ? 'Save & Keep Active'
                    : 'Save & Stop Apps'}
              </Button>
            }
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: !appsActive ? 2 : 0 }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={appsActive}
                    onChange={(e) => setAppsActive(e.target.checked)}
                    disabled={loading || savingAppAccess}
                    color="success"
                  />
                }
                label={
                  <Typography fontWeight={600}>
                    {appsActive ? 'Apps are active' : 'Apps are stopped'}
                  </Typography>
                }
              />
            </Stack>

            {!appsActive ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Blocked screen title"
                    value={appsBlockedTitle}
                    onChange={(e) => setAppsBlockedTitle(e.target.value)}
                    disabled={loading || savingAppAccess}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Blocked message"
                    value={appsBlockedMessage}
                    onChange={(e) => setAppsBlockedMessage(e.target.value)}
                    multiline
                    minRows={3}
                    disabled={loading || savingAppAccess}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Sub message (optional)"
                    value={appsBlockedSubMessage}
                    onChange={(e) => setAppsBlockedSubMessage(e.target.value)}
                    multiline
                    minRows={3}
                    disabled={loading || savingAppAccess}
                  />
                </Grid>
              </Grid>
            ) : null}
          </SettingCard>
        </Grid>

        <Grid item xs={12}>
          <SettingCard
            title="Cook app home card"
            description="Show one admin message card at the top of the cook dashboard (e.g. What happens next?). Updating and saving shows the new card on top."
            icon={<CampaignIcon fontSize="small" />}
            highlight={cookHomeCardEnabled}
            highlightColor="success"
            action={
              <Button
                variant="contained"
                onClick={handleSaveCookHomeCard}
                disabled={
                  loading ||
                  savingCookHomeCard ||
                  (cookHomeCardEnabled &&
                    (!cookHomeCardTitle.trim() || !cookHomeCardMessage.trim()))
                }
              >
                {savingCookHomeCard ? 'Saving...' : 'Save cook card'}
              </Button>
            }
          >
            <FormControlLabel
              control={
                <Switch
                  checked={cookHomeCardEnabled}
                  onChange={(e) => setCookHomeCardEnabled(e.target.checked)}
                  disabled={loading || savingCookHomeCard}
                  color="success"
                />
              }
              label={
                <Typography fontWeight={600}>
                  {cookHomeCardEnabled ? 'Card is visible in cook app' : 'Card is hidden'}
                </Typography>
              }
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Card title"
                  value={cookHomeCardTitle}
                  onChange={(e) => setCookHomeCardTitle(e.target.value)}
                  disabled={loading || savingCookHomeCard}
                  placeholder="What happens next?"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Main message"
                  value={cookHomeCardMessage}
                  onChange={(e) => setCookHomeCardMessage(e.target.value)}
                  multiline
                  minRows={3}
                  disabled={loading || savingCookHomeCard}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Sub message / tip (optional)"
                  value={cookHomeCardSubMessage}
                  onChange={(e) => setCookHomeCardSubMessage(e.target.value)}
                  multiline
                  minRows={3}
                  disabled={loading || savingCookHomeCard}
                />
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>

        {/* General platform */}
        <Grid item xs={12} md={6}>
          <SettingCard
            title="General Platform"
            description="Brand name, support contact, delivery fee, and commission used in billing."
            icon={<StorefrontIcon fontSize="small" />}
            action={
              <Button
                variant="contained"
                onClick={handleSaveGeneralPlatform}
                disabled={
                  loading || savingGeneral || !platformName.trim() || !supportEmail.trim()
                }
              >
                {savingGeneral ? 'Saving...' : 'Save Platform'}
              </Button>
            }
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Platform name"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  disabled={loading || savingGeneral}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Support email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  disabled={loading || savingGeneral}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Delivery fee (₹)"
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                  disabled={loading || savingGeneral}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Platform commission (%)"
                  type="number"
                  value={platformCommissionPercent}
                  onChange={(e) => setPlatformCommissionPercent(Number(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 100 }}
                  disabled={loading || savingGeneral}
                />
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>

        {/* Payment limits */}
        <Grid item xs={12} md={6}>
          <SettingCard
            title="Payment Limits"
            description="Control minimum order, wallet top-up, and cook withdrawal limits across customer and cook apps."
            icon={<PaymentsIcon fontSize="small" />}
            action={
              <Button
                variant="contained"
                onClick={handleSavePaymentLimits}
                disabled={
                  loading ||
                  savingPaymentLimits ||
                  minWithdrawAmount > maxWithdrawAmount ||
                  minWalletTopUp > maxWalletTopUp
                }
              >
                {savingPaymentLimits ? 'Saving...' : 'Save Limits'}
              </Button>
            }
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Minimum order amount (₹)"
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                  disabled={loading || savingPaymentLimits}
                  helperText="Customer cannot place an order below this total."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Minimum wallet top-up (₹)"
                  type="number"
                  value={minWalletTopUp}
                  onChange={(e) => setMinWalletTopUp(Number(e.target.value) || 0)}
                  inputProps={{ min: 1 }}
                  disabled={loading || savingPaymentLimits}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Maximum wallet top-up (₹)"
                  type="number"
                  value={maxWalletTopUp}
                  onChange={(e) => setMaxWalletTopUp(Number(e.target.value) || 0)}
                  inputProps={{ min: 1 }}
                  disabled={loading || savingPaymentLimits}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Minimum withdrawal amount (₹)"
                  type="number"
                  value={minWithdrawAmount}
                  onChange={(e) => setMinWithdrawAmount(Number(e.target.value) || 0)}
                  inputProps={{ min: 1 }}
                  disabled={loading || savingPaymentLimits}
                  helperText="Cook partner minimum payout request."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Maximum withdrawal amount (₹)"
                  type="number"
                  value={maxWithdrawAmount}
                  onChange={(e) => setMaxWithdrawAmount(Number(e.target.value) || 0)}
                  inputProps={{ min: 1 }}
                  disabled={loading || savingPaymentLimits}
                />
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>

        {/* Payment gateways */}
        <Grid item xs={12}>
          <SettingCard
            title="Payment Gateway Settings"
            description="Manage up to 10 payment gateways. Activate Razorpay with Key ID + Key Secret for live in-app checkout (wallet top-up & cook onboarding). Only active gateways appear in apps."
            icon={<AccountBalanceWalletIcon fontSize="small" />}
            highlight={paymentGateways.some((g) => g.isActive)}
            highlightColor="success"
            action={
              <Button
                variant="contained"
                onClick={handleSavePaymentGateways}
                disabled={loading || savingPaymentGateways}
              >
                {savingPaymentGateways ? 'Saving...' : 'Save Gateways'}
              </Button>
            }
          >
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                color="success"
                label={`${paymentGateways.filter((g) => g.isActive).length} active`}
              />
              <Chip size="small" variant="outlined" label={`${paymentGateways.length} / 10 configured`} />
            </Stack>

            <Stack spacing={1}>
              {paymentGateways.map((gw) => (
                <Accordion
                  key={gw.id}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: gw.isActive ? 'success.main' : 'divider',
                    borderRadius: '8px !important',
                    '&:before': { display: 'none' },
                    overflow: 'hidden',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ width: '100%', pr: 1 }}
                    >
                      <Box onClick={(e) => e.stopPropagation()}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={gw.isActive}
                              onChange={(e) => updateGatewayField(gw.id, 'isActive', e.target.checked)}
                              disabled={loading || savingPaymentGateways}
                            />
                          }
                          label=""
                          sx={{ mr: 0 }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {gw.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {gw.provider} · {gw.mode.toUpperCase()}
                          {gw.isActive ? ' · visible in apps' : ' · hidden'}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={gw.isActive ? 'Active' : 'Inactive'}
                        color={gw.isActive ? 'success' : 'default'}
                        variant={gw.isActive ? 'filled' : 'outlined'}
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Display name"
                          value={gw.displayName}
                          onChange={(e) => updateGatewayField(gw.id, 'displayName', e.target.value)}
                          disabled={loading || savingPaymentGateways}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Mode"
                          value={gw.mode}
                          onChange={(e) =>
                            updateGatewayField(gw.id, 'mode', e.target.value as 'test' | 'live')
                          }
                          disabled={loading || savingPaymentGateways}
                        >
                          <MenuItem value="test">Test</MenuItem>
                          <MenuItem value="live">Live</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Key ID / Public key"
                          value={gw.keyId}
                          onChange={(e) => updateGatewayField(gw.id, 'keyId', e.target.value)}
                          disabled={loading || savingPaymentGateways}
                          helperText="Sent to apps when gateway is active"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Key secret"
                          type="password"
                          value={gw.keySecret}
                          onChange={(e) => updateGatewayField(gw.id, 'keySecret', e.target.value)}
                          disabled={loading || savingPaymentGateways}
                          helperText="Server-side only — never sent to apps"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Merchant ID"
                          value={gw.merchantId}
                          onChange={(e) => updateGatewayField(gw.id, 'merchantId', e.target.value)}
                          disabled={loading || savingPaymentGateways}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Webhook secret"
                          type="password"
                          value={gw.webhookSecret}
                          onChange={(e) => updateGatewayField(gw.id, 'webhookSecret', e.target.value)}
                          disabled={loading || savingPaymentGateways}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Sort order"
                          type="number"
                          value={gw.sortOrder}
                          onChange={(e) =>
                            updateGatewayField(gw.id, 'sortOrder', Number(e.target.value) || 0)
                          }
                          disabled={loading || savingPaymentGateways}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Extra config (JSON / notes)"
                          value={gw.extraConfig}
                          onChange={(e) => updateGatewayField(gw.id, 'extraConfig', e.target.value)}
                          disabled={loading || savingPaymentGateways}
                          multiline
                          minRows={2}
                          placeholder='e.g. {"clientId":"...","environment":"sandbox"}'
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </SettingCard>
        </Grid>

        {/* Map & menu pricing */}
        <Grid item xs={12} md={6}>
          <SettingCard
            title="Map & Menu Pricing"
            description="Customer map filter radius and default menu package price for cooks."
            icon={<MapIcon fontSize="small" />}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={handleSaveRadius}
                  disabled={loading || savingRadius}
                >
                  {savingRadius ? 'Saving...' : 'Save Radius'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveMenuPackagePrice}
                  disabled={loading || savingMenuPrice}
                >
                  {savingMenuPrice ? 'Saving...' : 'Save Price'}
                </Button>
              </Stack>
            }
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Route cook radius (km)"
                  type="number"
                  value={routeCookRadiusKm}
                  onChange={(e) => setRouteCookRadiusKm(Number(e.target.value) || 0)}
                  inputProps={{ min: 0.1, step: 0.1 }}
                  disabled={loading || savingRadius}
                  helperText="Cooks near route on home map"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Menu package price (₹)"
                  type="number"
                  value={menuPackagePrice}
                  onChange={(e) => setMenuPackagePrice(Number(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                  disabled={loading || savingMenuPrice}
                  helperText="Default when cook adds menu"
                />
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>

        {/* Cook onboarding fees — full width */}
        <Grid item xs={12}>
          <SettingCard
            title="Cook Onboarding Fees"
            description="Payment amounts based on FSSAI status. Applies to new cook payment steps immediately."
            icon={<RestaurantIcon fontSize="small" />}
            action={
              <Button variant="contained" onClick={handleSave} disabled={loading || saving}>
                {saving ? 'Saving...' : 'Save Onboarding Fees'}
              </Button>
            }
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Security deposit (₹)"
                  type="number"
                  value={fees.securityDeposit}
                  onChange={(e) =>
                    setFees({ ...fees, securityDeposit: Number(e.target.value) || 0 })
                  }
                  inputProps={{ min: 0 }}
                  disabled={loading}
                  helperText="Both FSSAI cases"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Fee — FSSAI already hai (₹)"
                  type="number"
                  value={fees.certificateFeeExistingFssai}
                  onChange={(e) =>
                    setFees({ ...fees, certificateFeeExistingFssai: Number(e.target.value) || 0 })
                  }
                  inputProps={{ min: 0 }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Fee — FSSAI chahiye (₹)"
                  type="number"
                  value={fees.certificateFeeNeedFssai}
                  onChange={(e) =>
                    setFees({ ...fees, certificateFeeNeedFssai: Number(e.target.value) || 0 })
                  }
                  inputProps={{ min: 0 }}
                  disabled={loading}
                />
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>Case</TableCell>
                    <TableCell align="right">Certificate</TableCell>
                    <TableCell align="right">Security</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>FSSAI already hai</TableCell>
                    <TableCell align="right">₹{fees.certificateFeeExistingFssai}</TableCell>
                    <TableCell align="right">₹{fees.securityDeposit}</TableCell>
                    <TableCell align="right">
                      <Typography component="span" fontWeight={700}>
                        ₹{existingTotal}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>FSSAI chahiye</TableCell>
                    <TableCell align="right">₹{fees.certificateFeeNeedFssai}</TableCell>
                    <TableCell align="right">₹{fees.securityDeposit}</TableCell>
                    <TableCell align="right">
                      <Typography component="span" fontWeight={700}>
                        ₹{needTotal}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </SettingCard>
        </Grid>

        <Grid item xs={12}>
          <SettingCard
            title="Refer & Earn Program"
            description="Configure referral rewards, share message, invite link, and when bonuses are paid."
            icon={<CardGiftcardIcon fontSize="small" />}
            action={
              <Button
                variant="contained"
                onClick={handleSaveReferral}
                disabled={loading || savingReferral || !referralTitle.trim() || !referralShareMessage.trim()}
              >
                {savingReferral ? 'Saving...' : 'Save Referral Settings'}
              </Button>
            }
          >
            <FormControlLabel
              control={
                <Switch
                  checked={referralEnabled}
                  onChange={(e) => setReferralEnabled(e.target.checked)}
                  disabled={loading || savingReferral}
                />
              }
              label={referralEnabled ? 'Referral program enabled' : 'Referral program disabled'}
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Bonus trigger"
                  value={referralTrigger}
                  onChange={(e) => setReferralTrigger(e.target.value as 'signup' | 'first_order')}
                  disabled={loading || savingReferral}
                >
                  <MenuItem value="signup">On signup</MenuItem>
                  <MenuItem value="first_order">After first completed order</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Customer referrer ₹"
                  value={customerReferrerReward}
                  onChange={(e) => setCustomerReferrerReward(Number(e.target.value))}
                  disabled={loading || savingReferral}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Customer referee ₹"
                  value={customerRefereeReward}
                  onChange={(e) => setCustomerRefereeReward(Number(e.target.value))}
                  disabled={loading || savingReferral}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Cook referrer ₹"
                  value={cookReferrerReward}
                  onChange={(e) => setCookReferrerReward(Number(e.target.value))}
                  disabled={loading || savingReferral}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Cook referee ₹"
                  value={cookRefereeReward}
                  onChange={(e) => setCookRefereeReward(Number(e.target.value))}
                  disabled={loading || savingReferral}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Screen title"
                  value={referralTitle}
                  onChange={(e) => setReferralTitle(e.target.value)}
                  disabled={loading || savingReferral}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Invite link base URL"
                  value={referralLinkBaseUrl}
                  onChange={(e) => setReferralLinkBaseUrl(e.target.value)}
                  helperText="Use {{code}} in URL or append code automatically"
                  disabled={loading || savingReferral}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Subtitle shown in apps"
                  value={referralSubtitle}
                  onChange={(e) => setReferralSubtitle(e.target.value)}
                  multiline
                  minRows={2}
                  disabled={loading || savingReferral}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Share message template"
                  value={referralShareMessage}
                  onChange={(e) => setReferralShareMessage(e.target.value)}
                  multiline
                  minRows={3}
                  helperText="Placeholders: {{code}}, {{link}}, {{referrerAmount}}, {{refereeAmount}}"
                  disabled={loading || savingReferral}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Terms & conditions"
                  value={referralTerms}
                  onChange={(e) => setReferralTerms(e.target.value)}
                  multiline
                  minRows={3}
                  disabled={loading || savingReferral}
                />
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>

        {/* Server issue — full width */}
        <Grid item xs={12}>
          <SettingCard
            title="Server Issue Screen"
            description="Message shown in both apps when the server is down or unreachable."
            icon={<CloudOffIcon fontSize="small" />}
            action={
              <Button
                variant="contained"
                onClick={handleSaveServerIssue}
                disabled={
                  loading ||
                  savingServerIssue ||
                  !serverIssueTitle.trim() ||
                  !serverIssueMessage.trim()
                }
              >
                {savingServerIssue ? 'Saving...' : 'Save Server Message'}
              </Button>
            }
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Screen title"
                  value={serverIssueTitle}
                  onChange={(e) => setServerIssueTitle(e.target.value)}
                  disabled={loading || savingServerIssue}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Main message"
                  value={serverIssueMessage}
                  onChange={(e) => setServerIssueMessage(e.target.value)}
                  multiline
                  minRows={4}
                  disabled={loading || savingServerIssue}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Sub message (optional)"
                  value={serverIssueSubMessage}
                  onChange={(e) => setServerIssueSubMessage(e.target.value)}
                  multiline
                  minRows={4}
                  disabled={loading || savingServerIssue}
                />
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
