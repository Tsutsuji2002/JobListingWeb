import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Menu, 
  MenuItem, 
  IconButton, 
  Tooltip, 
  Avatar, 
  TextField,
  Typography 
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon, 
} from '@mui/icons-material';
import { Search as SearchIcon } from 'lucide-react';
import { logoutAdmin } from '../../../redux/slices/adminSlice';
import { getAdminProfile } from '../../../redux/slices/adminSlice';

const AdminHeader = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const { profile } = useSelector((state) => state.admin);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !profile) {
      dispatch(getAdminProfile());
    }
    console.log(profile);
  }, [dispatch, profile]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutAdmin());
    handleMenuClose();
  };

  const getUserDisplayName = () => {
    if (!profile) return 'User';
    if (!profile.email) {
      return profile.firstName || profile.lastName || 'User';
    }
    if (!profile.firstName && !profile.lastName) {
      return profile.email.includes('@') 
        ? profile.email.split('@')[0] 
        : 'User';
    }
    
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <IconButton onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          {/* <div className="relative flex items-center">
            <TextField 
              variant="outlined" 
              size="small" 
              placeholder="Search..." 
              className="w-64"
              InputProps={{
                startAdornment: (
                  <SearchIcon className="text-gray-500 mr-2" size={20} />
                )
              }}
            />
          </div> */}
        </div>
        <div className="flex items-center space-x-4">
          <Tooltip title="Notifications">
            <IconButton>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          
          <div className="flex items-center space-x-2">
            <Typography variant="subtitle1" className="text-gray-700">
              {getUserDisplayName()}
            </Typography>
            <Tooltip title="User Menu">
              <IconButton onClick={handleMenuOpen}>
                <Avatar>
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </div>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem>
              <div className="flex flex-col">
                <Typography variant="subtitle2" className="font-medium">
                  {getUserDisplayName()}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  {profile?.email}
                </Typography>
              </div>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Đăng xuát</MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;