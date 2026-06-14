# Admin Account - Testing Guide

## Admin Account Credentials

A hardcoded admin account has been created for testing purposes. This account allows administrators to view and manage both the **Teams** and **Umpires** sheets simultaneously.

### Login Credentials:
- **Email**: `admin@sportmanager.com`
- **Password**: `Admin@12345`
- **User Type**: `Admin`

## How to Login

1. Open `index.html` in your browser
2. In the login form:
   - Enter Email: `admin@sportmanager.com`
   - Enter Password: `Admin@12345`
   - Select User Type: **Admin**
3. Click **Login**

## Admin Dashboard Features

Once logged in as an admin, you will see:

### 1. **Quick Stats**
- Total Matches
- Upcoming Matches
- Registered Teams
- Available Umpires

### 2. **System Administration Section**
The admin dashboard displays two key data registries side-by-side:

#### **Teams Registry**
- View all registered teams
- Displays:
  - Team Name
  - Sport
  - Location
  - Manager Name
  - Number of Players

#### **Umpires Registry**
- View all umpires in the system
- Displays:
  - Umpire Name
  - Rank (Professional/Advanced/Beginner)
  - Location
  - Region
  - Phone Number
  - Sports Expertise

### 3. **Full Navigation Access**
As an admin, you have access to all features:
- Dashboard (with admin view)
- Matches Management
- Umpires Management
- Team Registration
- Game Setup
- Sport Registration
- User Profile

## Database Sheets Access

The admin account can view data from:
- **Teams Sheet** - Complete team registry
- **Umpires Sheet** - Complete umpires registry

## Account Details

- **ID**: `admin-001`
- **Type**: Admin (read: `admin` in CONFIG.USER_TYPES)
- **Storage**: Hardcoded in `js/auth.js` (constructor)
- **Password**: Hashed using simple hash function (for testing only)

## Security Notes

⚠️ **Important**: This is a test/demo account. For production:
1. Remove hardcoded credentials from `js/auth.js`
2. Implement proper admin account creation through a secure admin panel
3. Use strong password hashing (bcrypt, Argon2, etc.)
4. Implement proper authentication on the server side
5. Add role-based access control (RBAC)
6. Enable admin audit logs

## Modifying Admin Credentials

To change the admin account credentials, edit `js/auth.js`:

```javascript
// In the AuthManager constructor, find this section:
const adminPassword = this.hashPassword('Admin@12345');
this.users.push({
    id: 'admin-001',
    email: 'admin@sportmanager.com',  // Change email here
    password: adminPassword,           // Change password (must be hashed)
    // ... rest of user object
});
```

## Testing Workflow

1. **Login as Admin**
   - Use credentials above
   - Verify admin dashboard loads with stats and sheet data

2. **View Teams**
   - Check Teams Registry section
   - Verify all teams from the system are displayed

3. **View Umpires**
   - Check Umpires Registry section
   - Verify all umpires from the system are displayed

4. **Navigation**
   - Test access to all other pages
   - Verify admin can perform all operations

5. **Compare with Manager View**
   - Login as Manager to compare what data is visible
   - Note the differences in the dashboard view

## Known Limitations

- This admin account is stored client-side in JavaScript (for testing)
- Data is read from Google Sheets or localStorage
- No write/edit permissions in the admin sheet view (read-only display)
- For editing data, admins must use the individual management pages (Matches, Teams, Umpires, etc.)

## Support

For questions about the admin account or setup, refer to the main [README.md](README.md) file.
