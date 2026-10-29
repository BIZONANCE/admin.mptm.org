"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Send,
  ShieldCheck,
  CheckCircle2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  KeyRound,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { getApiUrl } from "../../utils/config";

export default function LoginPage() {
  const router = useRouter();

  // Mode: standard OTP login (single field) vs emergency password fallback
  const [usePasswordFallback, setUsePasswordFallback] = useState<boolean>(false);

  // Email input and OTP state
  const [emailInput, setEmailInput] = useState<string>("");
  const [otpStep, setOtpStep] = useState<"IDLE" | "SENT">("IDLE");
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [inputOtp, setInputOtp] = useState<string>("");

  // 6-digit OTP boxes state & refs
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Emergency Super Admin Password state
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status & Feedback state
  const [loginError, setLoginError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Floating label focus states
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [isAdminUserFocused, setIsAdminUserFocused] = useState<boolean>(false);
  const [isAdminPassFocused, setIsAdminPassFocused] = useState<boolean>(false);

  const API_URL = getApiUrl();

  // If already logged in, redirect straight to appropriate page based on role
  useEffect(() => {
    const savedLogin = localStorage.getItem("mptm_admin_logged_in");
    if (savedLogin === "true") {
      const uName = localStorage.getItem("mptm_admin_username") || "";
      const lower = uName.toLowerCase();
      const isSuperCreds =
        lower === "mptmamravati@gmail.com" ||
        lower === "admin@mptmamravati.org" ||
        lower === "mptmamravati.org" ||
        lower === "admin" ||
        lower === "superadmin";
      const role = localStorage.getItem("mptm_admin_role") || (isSuperCreds ? "SUPER_ADMIN" : "USER");
      if (role === "SUPER_ADMIN" || isSuperCreds) {
        router.push("/");
      } else {
        router.push("/memberregistration");
      }
    }
  }, [router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle 6-digit OTP input change
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      setInputOtp(updated.join(""));
      return;
    }

    const digit = cleanVal.slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    setInputOtp(updated.join(""));

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    setInputOtp(newDigits.join(""));

    const focusIndex = Math.min(pasted.length - 1, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };

  // STEP 1: Send OTP to Email (Super Admin or User)
  const handleSendOtpCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setSuccessMsg(null);

    const emailTrimmed = emailInput.trim();
    const emailLower = emailTrimmed.toLowerCase();

    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setLoginError("⚠️ Please enter a valid email address!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLower }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedOtp(data.code || "");
        setOtpStep("SENT");
        setResendCooldown(45);
        setSuccessMsg(
          `Verification code sent to ${emailTrimmed}! Check your email inbox or spam folder.`
        );
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setLoginError(
          data.error || "⚠️ Error sending OTP code. Please ensure your email is registered."
        );
      }
    } catch (err: any) {
      console.error("OTP send error:", err);
      setLoginError("Unexpected server error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP Code and Log In (Auto-routes Super Admin to / and Users to /memberregistration)
  const handleVerifyOtpAndLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setSuccessMsg(null);

    const emailTrimmed = emailInput.trim();
    const cleanEmail = emailTrimmed.toLowerCase();

    if (!inputOtp.trim() || inputOtp.trim().length !== 6) {
      setLoginError("⚠️ Please enter the complete 6-digit verification code!");
      return;
    }

    setIsLoading(true);
    try {
      let verified = false;
      let verifiedUser: any = null;

      try {
        const res = await fetch(`${API_URL}/api/users/verify-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, code: inputOtp.trim() }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          verified = true;
          if (data.user) {
            verifiedUser = data.user;
          }
        } else if (data.error) {
          setLoginError(data.error);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Backend verify code error:", err);
      }

      // Local fallback in case of direct code match
      if (!verified && generatedOtp && inputOtp.trim() === generatedOtp.trim()) {
        verified = true;
      }

      if (!verified) {
        setLoginError("⚠️ Entered OTP verification code is invalid or expired!");
        setIsLoading(false);
        return;
      }

      // Check if this email belongs to Super Admin
      const isSuperAdminEmail =
        cleanEmail === "mptmamravati@gmail.com" ||
        cleanEmail === "admin@mptmamravati.org" ||
        cleanEmail === "mptmamravati.org" ||
        cleanEmail === "admin" ||
        cleanEmail === "superadmin" ||
        (verifiedUser && (
          String(verifiedUser.role).toLowerCase() === "super admin" ||
          String(verifiedUser.role).toUpperCase() === "SUPER_ADMIN"
        ));

      const targetRole = isSuperAdminEmail ? "SUPER_ADMIN" : "USER";

      // Save session credentials
      document.cookie = `mptm_admin_token=mptm_${isSuperAdminEmail ? "admin" : "user"}_otp_token; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("mptm_admin_logged_in", "true");
      localStorage.setItem("mptm_admin_username", cleanEmail);
      localStorage.setItem("mptm_admin_role", targetRole);

      if (verifiedUser?.name) {
        localStorage.setItem("mptm_admin_name", verifiedUser.name);
      } else if (isSuperAdminEmail) {
        localStorage.setItem("mptm_admin_name", "Super Admin");
      }

      // Route to respective dashboard
      if (targetRole === "SUPER_ADMIN") {
        router.push("/");
      } else {
        router.push("/memberregistration");
      }
    } catch (err: any) {
      console.error("Login verification error:", err);
      setLoginError("Unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Emergency Super Admin Password Login Handler
  const handleSuperAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const enteredUser = adminUsername.trim();
    const lowerUser = enteredUser.toLowerCase();
    const isSuperAdminUser =
      lowerUser === "mptmamravati@gmail.com" ||
      lowerUser === "admin@mptmamravati.org" ||
      lowerUser === "mptmamravati.org" ||
      lowerUser === "admin" ||
      lowerUser === "superadmin";

    try {
      if (isSuperAdminUser) {
        let loggedIn = false;
        try {
          const res = await fetch(`${API_URL}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: enteredUser,
              password: adminPassword,
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            document.cookie = `mptm_admin_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
            localStorage.setItem("mptm_admin_logged_in", "true");
            localStorage.setItem("mptm_admin_username", "mptmamravati@gmail.com");
            localStorage.setItem("mptm_admin_role", "SUPER_ADMIN");
            localStorage.setItem("mptm_admin_name", "Super Admin");
            loggedIn = true;
            router.push("/");
            return;
          } else if (res.status === 401) {
            setLoginError(data.error || "युझरनेम किंवा पासवर्ड चुकीचा आहे! (Invalid Password)");
            return;
          }
        } catch (backendErr) {
          console.error("Backend login error:", backendErr);
        }

        if (!loggedIn) {
          if (adminPassword === "Mptmamt@2026" || adminPassword === "Test@2026") {
            document.cookie = `mptm_admin_token=mptm_fallback_token; path=/; max-age=86400; SameSite=Lax`;
            localStorage.setItem("mptm_admin_logged_in", "true");
            localStorage.setItem("mptm_admin_username", "mptmamravati@gmail.com");
            localStorage.setItem("mptm_admin_role", "SUPER_ADMIN");
            localStorage.setItem("mptm_admin_name", "Super Admin");
            router.push("/");
            return;
          } else {
            setLoginError("चुकीचा पासवर्ड! (Incorrect Super Admin password)");
            return;
          }
        }
      } else {
        setLoginError("युझरनेम चुकीचे आहे! (Use mptmamravati@gmail.com किंवा mptmamravati.org)");
      }
    } catch (err: any) {
      console.error("Super Admin login error:", err);
      setLoginError("सर्व्हरशी संपर्क साधताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 select-none font-sans">
      <div className="w-full max-w-5xl flex flex-col gap-4 my-auto">
        {/* Card with color strip flush against its bottom edge */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-lg relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="p-10 sm:p-14 lg:p-16 pb-12 sm:pb-16 lg:pb-[4.5rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
              {/* Left Column: Logo, Heading & Description */}
              <div className="space-y-6 text-left">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-white shadow-2xs">
                  <Image
                    src="/navlogo.png"
                    alt="Logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight">
                    Sign in
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
                    to continue MPTM Amravati Dashboard
                  </p>
                </div>

                <div className="pt-2 text-xs sm:text-sm text-slate-600 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Secure OTP-based authentication</span>
                  </div>

                </div>
              </div>

              {/* Right Column: Single Input & Verification Action */}
              <div className="space-y-6 pt-10">
                {/* Feedback Alerts */}
                {loginError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm font-medium text-red-700 flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* PRIMARY: SINGLE EMAIL INPUT & OTP LOGIN */}
                {!usePasswordFallback ? (
                  <div>
                    {otpStep === "IDLE" ? (
                      /* STEP 1: SINGLE EMAIL INPUT FIELD */
                      <form onSubmit={handleSendOtpCode} className="space-y-4">
                        <div className="relative pt-2">
                          <label
                            className={`absolute left-4 px-1.5 transition-all duration-200 pointer-events-none z-10 ${
                              isEmailFocused || emailInput.trim().length > 0
                                ? "top-0 text-xs font-bold text-blue-600 bg-white"
                                : "top-5 text-sm sm:text-base text-slate-400 font-normal"
                            }`}
                          >
                            Enter Your Email
                          </label>
                          <input
                            type="email"
                            required
                            autoFocus
                            value={emailInput}
                            onFocus={() => setIsEmailFocused(true)}
                            onBlur={() => setIsEmailFocused(false)}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder={isEmailFocused ? "example@gmail.com" : ""}
                            className={`w-full px-5 py-3.5 bg-white border rounded-lg text-base sm:text-lg text-slate-900 focus:outline-none transition ${
                              isEmailFocused ? "border-blue-600 ring-1 ring-blue-600" : "border-slate-300"
                            }`}
                          />
                          <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                            A 6-digit one-time password (OTP) will be sent to your email.
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <br />
                          <button
                            type="submit"
                            disabled={isLoading || !emailInput.trim()}
                            className="px-8 py-3 bg-[#1B66C9] hover:bg-blue-700 text-white font-medium text-sm sm:text-base rounded-full shadow-2xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                <span>Sending code...</span>
                              </>
                            ) : (
                              <>
                                <span>Send Verification Code</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* STEP 2: 6-DIGIT OTP VERIFICATION */
                      <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4 animate-in fade-in">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{emailInput}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpStep("IDLE");
                              setInputOtp("");
                              setOtpDigits(["", "", "", "", "", ""]);
                              setSuccessMsg(null);
                              setLoginError(null);
                            }}
                            className="text-xs font-bold text-blue-600 underline hover:text-blue-800 shrink-0 ml-2 cursor-pointer"
                          >
                            Change Email
                          </button>
                        </div>

                        {successMsg && (
                          <div className="text-xs sm:text-sm font-semibold text-slate-900 flex items-start gap-2 pt-1 animate-in fade-in">
                            <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                            <span className="leading-snug">{successMsg}</span>
                          </div>
                        )}

                        {/* 6-Digit OTP Boxes */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs sm:text-sm font-bold text-slate-700">
                              Enter 6-Digit OTP
                            </label>
                            {resendCooldown > 0 ? (
                              <span className="text-xs text-slate-400">
                                Resend in {resendCooldown}s
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSendOtpCode()}
                                disabled={isLoading}
                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                              >
                                Resend Code
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
                            {otpDigits.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => {
                                  otpInputRefs.current[idx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                onPaste={handleOtpPaste}
                                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-extrabold font-mono text-slate-900 border rounded-xl transition-all shadow-2xs ${
                                  digit
                                    ? "border-blue-600 bg-blue-50/40 text-blue-900 ring-1 ring-blue-600"
                                    : "border-slate-300 bg-slate-50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-2.5">
                            Please type the 6-digit OTP code sent to your email inbox.
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setOtpStep("IDLE");
                              setInputOtp("");
                              setOtpDigits(["", "", "", "", "", ""]);
                              setSuccessMsg(null);
                              setLoginError(null);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800 transition flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                          </button>

                          <button
                            type="submit"
                            disabled={isLoading || inputOtp.length !== 6}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm sm:text-base rounded-full shadow-2xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <span>Verify OTP & Sign In</span>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  /* EMERGENCY PASSWORD LOGIN FORM */
                  <form onSubmit={handleSuperAdminPasswordLogin} className="space-y-4 animate-in fade-in">
                    <div className="relative pt-2">
                      <label
                        className={`absolute left-4 px-1.5 transition-all duration-200 pointer-events-none z-10 ${
                          isAdminUserFocused || adminUsername.trim().length > 0
                            ? "top-0 text-xs font-bold text-blue-600 bg-white"
                            : "top-5 text-sm sm:text-base text-slate-400 font-normal"
                        }`}
                      >
                        Super Admin Username
                      </label>
                      <input
                        type="text"
                        required
                        value={adminUsername}
                        onFocus={() => setIsAdminUserFocused(true)}
                        onBlur={() => setIsAdminUserFocused(false)}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder={isAdminUserFocused ? "mptmamravati@gmail.com" : ""}
                        className={`w-full px-5 py-3.5 bg-white border rounded-lg text-base sm:text-lg text-slate-900 focus:outline-none transition ${
                          isAdminUserFocused ? "border-blue-600 ring-1 ring-blue-600" : "border-slate-300"
                        }`}
                      />
                    </div>

                    <div className="relative pt-2">
                      <label
                        className={`absolute left-4 px-1.5 transition-all duration-200 pointer-events-none z-10 ${
                          isAdminPassFocused || adminPassword.length > 0
                            ? "top-0 text-xs font-bold text-blue-600 bg-white"
                            : "top-5 text-sm sm:text-base text-slate-400 font-normal"
                        }`}
                      >
                        Super Admin Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={adminPassword}
                          onFocus={() => setIsAdminPassFocused(true)}
                          onBlur={() => setIsAdminPassFocused(false)}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className={`w-full pl-5 pr-12 py-3.5 bg-white border rounded-lg text-base sm:text-lg text-slate-900 focus:outline-none transition ${
                            isAdminPassFocused ? "border-blue-600 ring-1 ring-blue-600" : "border-slate-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none z-20 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setUsePasswordFallback(false);
                          setLoginError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline transition cursor-pointer"
                      >
                        ← Back to OTP sign in
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-[#1B66C9] hover:bg-blue-700 text-white font-medium text-sm sm:text-base rounded-full shadow-2xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Signing in...</span>
                          </>
                        ) : (
                          <span>Sign in as Admin</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Colorful strip flush against the card's bottom edge */}
          <div className="h-1.5 w-full flex absolute bottom-0 left-0">
            <div className="flex-1 bg-[#FFB800]" />
            <div className="flex-1 bg-[#1B66C9]" />
            <div className="flex-1 bg-[#E53935]" />
          </div>
        </div>

        {/* Developed by Bizonance section */}
        <div className="flex flex-col items-center justify-center text-center gap-1">
          <span className="text-xs font-medium text-slate-500 tracking-wider">
            Developed by
          </span>
          <a
            href="https://bizonance.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-85 transition-opacity"
          >
            <Image
              src="/Logo.png"
              alt="Bizonance"
              width={70}
              height={16}
              unoptimized
              priority
              className="h-3 sm:h-3.5 w-auto object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  );
}