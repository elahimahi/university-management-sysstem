# 👑 Admin Quick Reference - User Verification

## Daily Admin Tasks

### 📋 Check Pending Registrations
1. Go to http://localhost:3000/admin/verify
2. See list of pending users
3. Review their details (name, email, role, date)

---

## ✅ APPROVE User

### When to Approve:
- ✔️ Known students/faculty
- ✔️ Valid educational email domain
- ✔️ Complete registration form
- ✔️ No suspicious activity

### How to Approve:
1. Find user in pending list
2. Click **GREEN APPROVE** button
3. User can login after approval

---

## ❌ REJECT User

### When to Reject:
- 🚫 Fake email domain
- 🚫 Suspicious registration
- 🚫 Duplicate account
- 🚫 Incomplete information
- 🚫 Not authorized to register

### How to Reject:
1. Find user in pending list
2. Click **RED REJECT** button
3. Enter rejection reason (user will see this)
4. User cannot login

### Common Rejection Reasons:
- "Email domain not verified"
- "Duplicate account detected"
- "Invalid student ID"
- "Faculty not in system"
- "Suspicious registration pattern"

---

## 📊 Dashboard Stats

| Status | Meaning | User Can Login? |
|--------|---------|-----------------|
| 🟡 **Pending** | Waiting for admin | ❌ No |
| 🟢 **Approved** | Ready to use | ✅ Yes |
| 🔴 **Rejected** | Access denied | ❌ No |

---

## 🔐 Access Control

**Your Admin Powers:**
- ✅ View all pending registrations
- ✅ Approve users
- ✅ Reject users with reasons
- ✅ See user details
- ✅ Track approval history

**You CANNOT:**
- ❌ Edit user passwords
- ❌ Modify user email from here
- ❌ Change approval reason after decision

---

## 🚨 Security Reminders

1. **Only YOU can approve** - No other role has this power
2. **Check carefully** before approving - Follow your institution's rules
3. **Provide reasons** when rejecting - Help users understand
4. **Document decisions** - Admin actions are tracked

---

## 📱 Mobile Friendly

Access from anywhere:
- Desktop: Full interface
- Mobile: Responsive design
- Tablets: Optimized view

---

## ⚡ Keyboard Shortcuts (Features)

*Coming Soon*

---

## 💡 Pro Tips

1. **Sort by date** - Newest registrations first
2. **Check email domain** - Verify it matches your institution
3. **Look up names** - Cross-reference with student directory
4. **Be consistent** - Apply same standards to all users
5. **Document reasons** - Helps audit trail

---

## 🆘 Troubleshooting

### I don't see the Verification page
- Check you're logged in as admin
- Go to: /admin/verify

### Users are not updating after approval
- Refresh the page
- Clear browser cache
- Try logout/login

### Can't approve - getting error
- Check user hasn't been processed
- Refresh the page
- Try again

### Forgot admin password
- Ask super admin or reset via database

---

## 📞 Need Help?

Check these documents:
- **ADMIN_APPROVAL_SYSTEM.md** - Full system details
- **SETUP_INSTRUCTIONS.md** - Installation guide
- **Backend API endpoints** - Technical documentation

---

## ✨ System Status

**Current Time**: Live and monitoring
**Pending Users**: [See dashboard count]
**Last Updated**: [Auto-updates every refresh]

---

*Remember: Your job is to verify real users. Be thorough, be fair, be consistent.*

🎯 **Your Role**: Guardian of system security
🛡️ **Your Mission**: Approve legitimate users, catch suspicious ones
✅ **Your Impact**: Keeps the university safe and secure
