import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Dashboard,
  LocationOn,
  FlashOn,
  People,
  CreditCard,
  Schedule,
  Description,
  Support,
  ExpandLess,
  ExpandMore,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 260;

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [openSubMenus, setOpenSubMenus] = useState<{[key: string]: boolean}>({
    stations: false,
    sessions: false,
    users: false,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    handleUserMenuClose();
  };

  const handleSubMenuToggle = (menuKey: string) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const navigation = [
    {
      title: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      title: 'Analytics',
      icon: <Assessment />,
      path: '/analytics',
    },
    {
      title: 'Stations',
      icon: <LocationOn />,
      path: '/stations',
      submenu: [
        { title: 'All Stations', path: '/stations' },
        { title: 'Add Station', path: '/stations/create' },
      ]
    },
    {
      title: 'Connectors',
      icon: <FlashOn />,
      path: '/connectors',
    },
    {
      title: 'Sessions',
      icon: <TrendingUp />,
      path: '/sessions',
      submenu: [
        { title: 'All Sessions', path: '/sessions' },
        { title: 'Live Monitoring', path: '/sessions/live' },
      ]
    },
    {
      title: 'Reservations',
      icon: <Schedule />,
      path: '/reservations',
    },
    {
      title: 'Users',
      icon: <People />,
      path: '/users',
      submenu: [
        { title: 'All Users', path: '/users' },
        { title: 'User Analytics', path: '/users/analytics' },
      ]
    },
    {
      title: 'Payments',
      icon: <CreditCard />,
      path: '/payments',
    },
    {
      title: 'Notifications',
      icon: <NotificationsIcon />,
      path: '/notifications',
    },
    {
      title: 'Support',
      icon: <Support />,
      path: '/support',
    },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          EV Charging Platform
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Admin Dashboard
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 1 }}>
          {navigation.map((item) => (
            <div key={item.title}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  if (item.submenu) {
                    handleSubMenuToggle(item.title.toLowerCase());
                  } else {
                    navigate(item.path);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
                {item.submenu && (openSubMenus[item.title.toLowerCase()] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>

              {/* Submenu */}
              {item.submenu && (
                <Collapse in={openSubMenus[item.title.toLowerCase()]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.submenu.map((subItem) => (
                      <ListItemButton
                        key={subItem.title}
                        selected={location.pathname === subItem.path}
                        onClick={() => navigate(subItem.path)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                            },
                          },
                        }}
                      >
                        <ListItemText 
                          primary={subItem.title}
                          sx={{ pl: 1 }}
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </div>
          ))}
        </List>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          boxShadow: 1,
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            {location.pathname.split('/').pop()?.charAt(0).toUpperCase()}{location.pathname.split('/').pop()?.slice(1) || 'Dashboard'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton color="inherit" sx={{ color: 'text.primary' }}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Settings */}
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/settings')}
              sx={{ color: 'text.primary' }}
            >
              <Settings />
            </IconButton>

            {/* User Menu */}
            <IconButton color="inherit" onClick={handleUserMenuOpen} sx={{ color: 'text.primary' }}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              PaperProps={{
                sx: { minWidth: 200 }
              }}
            >
              <MenuItem onClick={() => navigate('/profile')}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => navigate('/settings')}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderRightColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderRightColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for app bar */}
        {children || <Outlet />}
      </Box>
    </Box>
  );
}
