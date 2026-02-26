import { useState } from "react";
import { Eye, EyeOff, Github } from "lucide-react";

export default function AuthForm({ view = "login", setView }) {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    if (view === "forgot") {
        return (
            <div className="forgot-card">
                <div className="auth-header">
                    <h2 className="auth-title">Forgot password?</h2>
                    <p className="auth-subtitle">
                        Remember your password? <span className="link" onClick={() => setView('login')}>Login here</span>
                    </p>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label className="label">Email address</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="Enter your email"
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        Reset password
                    </button>
                </form>

                <div className="forgot-footer">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        <Github className="icon" />
                        View Github
                    </a>
                    <div className="separator"></div>
                    <span>Contact us!</span>
                </div>
            </div>
        );
    }

    if (view === "register") {
        return (
            <div className="forgot-card">
                <div className="auth-header">
                    <h2 className="auth-title">Sign up</h2>
                    <p className="auth-subtitle">
                        Already have an account? <span className="link" onClick={() => setView('login')}>Login here</span>
                    </p>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Email address</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="example@gmail.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Create a password"
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        Create account
                    </button>
                </form>

                <div className="forgot-footer">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        <Github className="icon" />
                        View Github
                    </a>
                    <div className="separator"></div>
                    <span>Contact us!</span>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-form-wrapper">
            <div className="auth-header" style={{ textAlign: 'left' }}>
                <h2 className="auth-title">Sign in</h2>
                <p className="auth-subtitle">
                    Don't have an account? <span className="link" onClick={() => setView('register')}>Create now</span>
                </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label className="label">E-mail</label>
                    <input
                        type="email"
                        className="input"
                        placeholder="example@gmail.com"
                    />
                </div>

                <div className="form-group">
                    <label className="label">Password</label>
                    <div className="input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="input"
                            placeholder="@#%"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="input-action"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="form-options">
                    <label className="remember-me">
                        <input type="checkbox" />
                        <span>Remember me</span>
                    </label>
                    <span
                        className="forgot-link"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setView('forgot')}
                    >
                        Forgot Password?
                    </span>
                </div>

                <button type="submit" className="btn-primary">
                    Sign in
                </button>

                <div className="divider">or</div>

                <div className="social-btns">
                    <button type="button" className="btn-social">
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="social-icon" />
                        Continue with Google
                    </button>
                    <button type="button" className="btn-social">
                        <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="social-icon" />
                        Continue with Facebook
                    </button>
                </div>
            </form>
        </div>
    );
}
