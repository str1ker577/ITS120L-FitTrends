import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail, Shield, AlertCircle } from 'lucide-react';
import { fetchUsers, createUser, deleteUser } from '../../api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STAFF'
    });

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchUsers();
            setUsers(data);
        } catch (err) {
            setError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await createUser(formData);
            setSuccess("User created successfully!");
            setFormData({ name: '', email: '', password: '', role: 'STAFF' });
            setShowForm(false);
            loadUsers(); // refresh the list
        } catch (err) {
            setError(err.message || "Failed to create user.");
        }
    };

    const handleDeleteUser = async (userId, email) => {
        if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;
        
        setError("");
        setSuccess("");
        
        try {
            await deleteUser(userId);
            setSuccess("User deleted successfully.");
            loadUsers();
        } catch (err) {
            setError(err.message || "Failed to delete user.");
        }
    };

    return (
        <div className="page-wrapper" style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 24, fontWeight: 700, color: '#102a43', margin: 0 }}>User Management</h1>
                    <p className="page-subtitle" style={{ fontSize: 14, color: '#627d98', margin: '4px 0 0 0' }}>Manage staff accounts and permissions</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: 8, 
                        background: '#102a43', color: 'white', border: 'none', 
                        padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
                        fontSize: 14, fontWeight: 500
                    }}
                >
                    <UserPlus size={18} />
                    {showForm ? 'Cancel' : 'Add New User'}
                </button>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {success && (
                <div style={{ padding: '12px 16px', background: '#dcfce3', color: '#166534', borderRadius: 8, marginBottom: 20 }}>
                    {success}
                </div>
            )}

            {showForm && (
                <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 24, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Create New Account</h3>
                    <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#4a5568', fontWeight: 500 }}>Full Name</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Jane Doe" style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#4a5568', fontWeight: 500 }}>Email Address</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane@fittrends.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#4a5568', fontWeight: 500 }}>Password</label>
                            <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#4a5568', fontWeight: 500 }}>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Create Account</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: 13 }}>User</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: 13 }}>Contact</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: 13 }}>Role</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: 13, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Loading directory...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No users found.</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 600 }}>
                                                {user.name ? user.name.charAt(0).toUpperCase() : <Users size={16} />}
                                            </div>
                                            <div style={{ fontWeight: 500, color: '#1e293b' }}>{user.name || 'Unknown User'}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14 }}>
                                            <Mail size={14} /> {user.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                            background: user.role === 'SUPER_ADMIN' ? '#fef2f2' : user.role === 'ADMIN' ? '#fffbeb' : '#f0fdf4',
                                            color: user.role === 'SUPER_ADMIN' ? '#991b1b' : user.role === 'ADMIN' ? '#92400e' : '#166534'
                                        }}>
                                            <Shield size={12} /> {user.role || 'STAFF'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        {user.role !== 'SUPER_ADMIN' && user.email !== 'owner@fittrends.com' && (
                                            <button 
                                                onClick={() => handleDeleteUser(user.id, user.email)}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
