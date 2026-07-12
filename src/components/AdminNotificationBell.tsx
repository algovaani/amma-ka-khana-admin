import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import {
  clearNotifications,
  markAllRead,
  markNotificationRead,
  notificationReceived,
  AdminNotification,
} from '../redux/reducers/notificationReducer';
import {
  connectAdminSocket,
  disconnectAdminSocket,
  onAdminNotification,
} from '../services/socket/socketService';

const AdminNotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items, unreadCount } = useSelector((state: RootState) => state.notifications);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!token) {
      disconnectAdminSocket();
      dispatch(clearNotifications());
      return;
    }

    connectAdminSocket(token);

    const unsubscribe = onAdminNotification((payload) => {
      const notification = payload as {
        id?: string;
        title?: string;
        body?: string;
        type?: string;
        category?: string;
        data?: Record<string, unknown>;
        createdAt?: string;
      };

      if (!notification?.title) {
        return;
      }

      dispatch(
        notificationReceived({
          id: notification.id,
          title: notification.title,
          body: notification.body ?? '',
          type: notification.type ?? 'system',
          category: notification.category,
          data: notification.data,
          createdAt: notification.createdAt,
        })
      );
    });

    return () => {
      unsubscribe();
      disconnectAdminSocket();
    };
  }, [dispatch, token]);

  const open = Boolean(anchorEl);

  const handleNotificationClick = (item: AdminNotification) => {
    if (item.id) {
      dispatch(markNotificationRead(item.id));
    }

    setAnchorEl(null);

    const orderId = item.data?.orderId;
    if (orderId) {
      navigate(`/orders/${String(orderId)}`);
      return;
    }

    if (item.type.includes('wallet')) {
      navigate('/wallet');
    }
  };

  return (
    <>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
        <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0}>
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 360, maxHeight: 420 } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {items.length > 0 ? (
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => dispatch(markAllRead())}
            >
              Mark all read
            </Typography>
          ) : null}
        </Box>
        <Divider />
        {items.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet. Order updates will appear here in real time.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {items.slice(0, 20).map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                sx={{ bgcolor: item.isRead ? 'inherit' : 'action.hover' }}
              >
                <ListItemText
                  primary={item.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        {item.body}
                      </Typography>
                      {item.createdAt ? (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.createdAt).toLocaleString('en-IN')}
                        </Typography>
                      ) : null}
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default AdminNotificationBell;
