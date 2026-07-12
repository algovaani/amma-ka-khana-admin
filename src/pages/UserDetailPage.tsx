import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { usersApi, UserDetailResponse } from '../services/api/usersApi';
import { cooksApi } from '../services/api/cooksApi';
import { resolveUploadUrl } from '../utils/resolveUploadUrl';
import CookProfileEditor from '../components/CookProfileEditor';

const clickableImageSx = {
  cursor: 'pointer',
  transition: 'opacity 0.2s, transform 0.2s',
  '&:hover': {
    opacity: 0.9,
    transform: 'scale(1.02)',
  },
};

const ImageCard = ({
  label,
  src,
  onPreview,
}: {
  label: string;
  src?: string | null;
  onPreview?: (src: string, label: string) => void;
}) => (
  <Box>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>
      {label}
    </Typography>
    {src ? (
      <Box
        component="img"
        src={src}
        alt={label}
        onClick={() => onPreview?.(src, label)}
        sx={{
          width: '100%',
          maxWidth: 280,
          height: 180,
          objectFit: 'cover',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.100',
          ...clickableImageSx,
        }}
      />
    ) : (
      <Box
        sx={{
          width: '100%',
          maxWidth: 280,
          height: 180,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          bgcolor: 'grey.50',
        }}
      >
        Not uploaded
      </Box>
    )}
  </Box>
);

const getCookDocUrl = (
  profile: NonNullable<UserDetailResponse['cookProfile']>,
  type: string,
) => profile.documents?.find((doc) => doc.type === type)?.url;

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'error';
  if (status === 'inactive' || status === 'pending_verification') return 'warning';
  return 'default';
};

const isValidObjectId = (value?: string) => Boolean(value && /^[a-f\d]{24}$/i.test(value));

const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [detail, setDetail] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletDialog, setWalletDialog] = useState(false);
  const [walletType, setWalletType] = useState<'credit' | 'debit'>('credit');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletNote, setWalletNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ src: string; label: string } | null>(null);

  const openImagePreview = (src: string, label: string) => {
    if (src) {
      setImagePreview({ src, label });
    }
  };

  const load = () => {
    if (!userId || !isValidObjectId(userId)) {
      setError('Invalid user id');
      setLoading(false);
      return;
    }
    setLoading(true);
    usersApi
      .getDetail(userId)
      .then((res) => {
        setDetail(res.data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [userId]);

  const handleStatus = async (status: string) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await usersApi.updateStatus(userId, status);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWalletHold = async (hold: boolean) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await usersApi.setWalletHold(userId, hold);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to update wallet hold');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWalletAdjust = async () => {
    if (!userId || !walletAmount) return;
    setActionLoading(true);
    try {
      await usersApi.adjustWallet(userId, {
        amount: Number(walletAmount),
        type: walletType,
        description: walletNote || `Admin ${walletType}`,
      });
      setWalletDialog(false);
      setWalletAmount('');
      setWalletNote('');
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to adjust wallet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCookApprove = async (approved: boolean) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await cooksApi.approve(userId, approved);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to update cook approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFssaiVerify = async (verified: boolean) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await cooksApi.verifyFssai(userId, verified);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to update FSSAI verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKycVerify = async (verified: boolean) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await cooksApi.verifyKyc(userId, verified);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to update KYC verification');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!detail) {
    return <Typography color="error">{error || 'User not found'}</Typography>;
  }

  const { user, wallet, orders, transactions, stats, cookProfile } = detail;
  const backPath = user.role === 'cook' ? '/cooks' : '/users';
  const canApproveCook =
    cookProfile?.onboardingStep === 'admin_review' && cookProfile.adminApprovalStatus === 'pending';
  const canVerifyKyc =
    cookProfile?.kycStatus === 'submitted' &&
    Boolean(cookProfile.aadharPhotoUrl || getCookDocUrl(cookProfile, 'aadhar_front'));
  const canVerifyFssai =
    Boolean(cookProfile?.fssaiCertificateUrl) &&
    !cookProfile?.fssaiVerified &&
    (cookProfile?.onboardingStep === 'fssai_review' ||
      cookProfile?.onboardingStep === 'completed' ||
      Boolean(cookProfile?.fssaiCertificateUrl));

  return (
    <Box>
      <Button onClick={() => navigate(backPath)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {cookProfile?.profilePicUrl ? (
            <Box
              component="img"
              src={resolveUploadUrl(cookProfile.profilePicUrl)}
              alt={user.name}
              onClick={() => openImagePreview(resolveUploadUrl(cookProfile.profilePicUrl), 'Profile Photo')}
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid',
                borderColor: 'divider',
                ...clickableImageSx,
              }}
            />
          ) : null}
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {user.name}
            </Typography>
            <Typography color="text.secondary">
              {user.phone} · {user.email} · {formatLabel(user.role)}
            </Typography>
            <Chip label={formatLabel(user.status)} color={statusColor(user.status)} size="small" sx={{ mt: 1 }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="success" disabled={actionLoading} onClick={() => handleStatus('active')}>
            Activate
          </Button>
          <Button variant="outlined" color="warning" disabled={actionLoading} onClick={() => handleStatus('inactive')}>
            Hold Account
          </Button>
          <Button variant="outlined" color="error" disabled={actionLoading} onClick={() => handleStatus('suspended')}>
            Block
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="body2" color="text.secondary">Wallet Balance</Typography><Typography variant="h5">₹{wallet.balance}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="body2" color="text.secondary">Total Orders</Typography><Typography variant="h5">{stats.totalOrders}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="body2" color="text.secondary">Total Spent</Typography><Typography variant="h5">₹{stats.totalSpent}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="body2" color="text.secondary">Total Earned</Typography><Typography variant="h5">₹{stats.totalEarned}</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label={`Orders (${orders.length})`} />
        <Tab label={`Transactions (${transactions.length})`} />
        <Tab label="Wallet Control" />
        {cookProfile ? <Tab label="Cook Profile" /> : null}
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Account Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><Typography><strong>User ID:</strong> {user.id}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>Auth:</strong> {formatLabel(user.authProvider)}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>Registered:</strong> {new Date(user.registeredAt).toLocaleString()}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>Last Login:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>Language:</strong> {user.language}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>Wallet Hold:</strong> {wallet.isOnHold ? 'Yes' : 'No'}</Typography></Grid>
            </Grid>

            {user.addresses.length > 0 ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Addresses</Typography>
                {user.addresses.map((addr, index) => (
                  <Typography key={index} sx={{ mb: 1 }}>
                    {addr.label}: {addr.line1}, {addr.area}, {addr.city} - {addr.pincode}
                    {addr.isDefault ? ' (Default)' : ''}
                  </Typography>
                ))}
              </Box>
            ) : null}
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{formatLabel(order.role)}</TableCell>
                    <TableCell>{formatLabel(order.status)}</TableCell>
                    <TableCell>{formatLabel(order.paymentStatus)}</TableCell>
                    <TableCell>₹{order.total}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 ? (
                  <TableRow><TableCell colSpan={6}>No orders found</TableCell></TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Balance After</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatLabel(tx.type)}</TableCell>
                    <TableCell>₹{tx.amount}</TableCell>
                    <TableCell>₹{tx.balanceAfter}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={5}>No transactions found</TableCell></TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Wallet Management</Typography>
            <Typography sx={{ mb: 2 }}>Current Balance: <strong>₹{wallet.balance}</strong></Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button variant="contained" color="success" disabled={actionLoading} onClick={() => { setWalletType('credit'); setWalletDialog(true); }}>
                Add Balance
              </Button>
              <Button variant="contained" color="warning" disabled={actionLoading} onClick={() => { setWalletType('debit'); setWalletDialog(true); }}>
                Deduct Balance
              </Button>
              <Button variant="outlined" color="error" disabled={actionLoading || wallet.isOnHold} onClick={() => handleWalletHold(true)}>
                Hold Wallet
              </Button>
              <Button variant="outlined" color="success" disabled={actionLoading || !wallet.isOnHold} onClick={() => handleWalletHold(false)}>
                Release Wallet Hold
              </Button>
            </Box>
            {wallet.isOnHold ? (
              <Chip label="Wallet is on HOLD" color="error" />
            ) : (
              <Chip label="Wallet is active" color="success" />
            )}
          </CardContent>
        </Card>
      )}

      {tab === 4 && cookProfile && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Cook Onboarding & KYC</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><Typography><strong>Display Name:</strong> {cookProfile.displayName}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>City:</strong> {cookProfile.city}, {cookProfile.area}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>KYC:</strong> {formatLabel(cookProfile.kycStatus)}</Typography></Grid>
              <Grid item xs={12} md={6}>
                <Typography>
                  <strong>FSSAI:</strong>{' '}
                  {cookProfile.fssaiVerified
                    ? 'Verified'
                    : cookProfile.fssaiNumber || cookProfile.fssaiBusinessName || 'Pending'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography><strong>FSSAI Type:</strong> {cookProfile.fssaiType ? formatLabel(cookProfile.fssaiType) : '—'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography><strong>Payment:</strong> {cookProfile.paymentStatus ? formatLabel(cookProfile.paymentStatus) : 'Pending'}</Typography>
              </Grid>
              {cookProfile.fssaiBusinessName ? (
                <Grid item xs={12} md={6}><Typography><strong>Business Name:</strong> {cookProfile.fssaiBusinessName}</Typography></Grid>
              ) : null}
              {cookProfile.paymentTransactionId ? (
                <Grid item xs={12} md={6}><Typography><strong>Transaction ID:</strong> {cookProfile.paymentTransactionId}</Typography></Grid>
              ) : null}
              {(cookProfile.certificateFeeAmount ?? 0) > 0 || (cookProfile.securityDepositAmount ?? 0) > 0 ? (
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Fees Paid:</strong> Cert ₹{cookProfile.certificateFeeAmount ?? 0} + Deposit ₹{cookProfile.securityDepositAmount ?? 0}
                  </Typography>
                </Grid>
              ) : null}
              <Grid item xs={12} md={6}><Typography><strong>Onboarding Step:</strong> {formatLabel(cookProfile.onboardingStep)}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>Admin Approval:</strong> {formatLabel(cookProfile.adminApprovalStatus)}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>Rating:</strong> {cookProfile.rating} ★</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><strong>Availability:</strong> {formatLabel(cookProfile.availability)}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>Address:</strong> {cookProfile.address || '—'}</Typography></Grid>
              {cookProfile.aadharNumber ? (
                <Grid item xs={12} md={6}><Typography><strong>Aadhar:</strong> {cookProfile.aadharNumber}</Typography></Grid>
              ) : null}
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Profile & Documents
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <ImageCard
                  label="Profile Photo"
                  src={resolveUploadUrl(cookProfile.profilePicUrl)}
                  onPreview={openImagePreview}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ImageCard
                  label="Aadhar Card — Front"
                  src={resolveUploadUrl(cookProfile.aadharPhotoUrl || getCookDocUrl(cookProfile, 'aadhar_front'))}
                  onPreview={openImagePreview}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ImageCard
                  label="Aadhar Card — Back"
                  src={resolveUploadUrl(cookProfile.aadharBackPhotoUrl || getCookDocUrl(cookProfile, 'aadhar_back'))}
                  onPreview={openImagePreview}
                />
              </Grid>
            </Grid>

            {cookProfile.kitchenGallery?.length ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Kitchen Gallery ({cookProfile.kitchenGallery.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {cookProfile.kitchenGallery.map((url, index) => (
                    <Box
                      key={`${url}-${index}`}
                      component="img"
                      src={resolveUploadUrl(url)}
                      alt={`Kitchen ${index + 1}`}
                      onClick={() => openImagePreview(resolveUploadUrl(url), `Kitchen Photo ${index + 1}`)}
                      sx={{
                        width: 140,
                        height: 140,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        ...clickableImageSx,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 3 }}>
                No kitchen photos uploaded
              </Typography>
            )}

            {cookProfile.fssaiCertificateUrl ? (
              <Box sx={{ mt: 3, maxWidth: 320 }}>
                <ImageCard
                  label="FSSAI Certificate"
                  src={resolveUploadUrl(cookProfile.fssaiCertificateUrl)}
                  onPreview={openImagePreview}
                />
              </Box>
            ) : null}

            {cookProfile.bankDetails?.accountNumber ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Bank details (for payouts)
                </Typography>
                <Typography><strong>Holder:</strong> {cookProfile.bankDetails.accountHolder}</Typography>
                <Typography><strong>Account:</strong> {cookProfile.bankDetails.accountNumber}</Typography>
                <Typography><strong>IFSC:</strong> {cookProfile.bankDetails.ifsc}</Typography>
                <Typography><strong>Bank:</strong> {cookProfile.bankDetails.bankName}</Typography>
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 3 }}>
                Bank details not added by cook yet
              </Typography>
            )}

            {canApproveCook ? (
              <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ width: '100%', fontWeight: 700 }}>
                  Profile Review
                </Typography>
                <Button variant="contained" color="success" disabled={actionLoading} onClick={() => handleCookApprove(true)}>
                  Approve Cook Profile
                </Button>
                <Button variant="outlined" color="error" disabled={actionLoading} onClick={() => handleCookApprove(false)}>
                  Reject Cook Profile
                </Button>
              </Box>
            ) : null}

            {canVerifyKyc ? (
              <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ width: '100%', fontWeight: 700 }}>
                  KYC Re-verification
                </Typography>
                <Button variant="contained" color="success" disabled={actionLoading} onClick={() => handleKycVerify(true)}>
                  Approve KYC
                </Button>
                <Button variant="outlined" color="error" disabled={actionLoading} onClick={() => handleKycVerify(false)}>
                  Reject KYC
                </Button>
              </Box>
            ) : null}

            {canVerifyFssai ? (
              <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ width: '100%', fontWeight: 700 }}>
                  FSSAI Verification
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ width: '100%', mb: 1 }}>
                  Review all documents above, then approve or reject FSSAI verification.
                </Typography>
                <Button variant="contained" color="success" disabled={actionLoading} onClick={() => handleFssaiVerify(true)}>
                  Approve FSSAI
                </Button>
                <Button variant="outlined" color="error" disabled={actionLoading} onClick={() => handleFssaiVerify(false)}>
                  Reject FSSAI
                </Button>
              </Box>
            ) : null}

            {cookProfile.fssaiVerified ? (
              <Chip label="FSSAI Verified" color="success" sx={{ mt: 3 }} />
            ) : null}

            <CookProfileEditor
              userId={user.id}
              cookProfile={cookProfile}
              onUpdated={load}
              onPreview={openImagePreview}
            />
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!imagePreview}
        onClose={() => setImagePreview(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 1,
          }}
        >
          {imagePreview?.label}
          <IconButton onClick={() => setImagePreview(null)} sx={{ color: 'common.white' }} aria-label="Close preview">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 1, sm: 2 },
            minHeight: '60vh',
          }}
        >
          {imagePreview ? (
            <Box
              component="img"
              src={imagePreview.src}
              alt={imagePreview.label}
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 1,
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={walletDialog} onClose={() => setWalletDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{walletType === 'credit' ? 'Add Wallet Balance' : 'Deduct Wallet Balance'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Amount (₹)" type="number" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} />
          <TextField label="Note" value={walletNote} onChange={(e) => setWalletNote(e.target.value)} multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWalletDialog(false)}>Cancel</Button>
          <Button variant="contained" disabled={actionLoading || !walletAmount} onClick={handleWalletAdjust}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetailPage;
