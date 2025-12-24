import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Email, 2: Password, 3: Name (Signup only)
  const [direction, setDirection] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleNext = async () => {
    setError(null);
    if (step === 1) {
      const result = emailSchema.safeParse(email);
      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }
      setDirection(1);
      setStep(2);
    } else if (step === 2) {
      const result = passwordSchema.safeParse(password);
      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }
      if (isLogin) {
        handleAuth();
      } else {
        setDirection(1);
        setStep(3);
      }
    } else if (step === 3) {
      const result = nameSchema.safeParse(name);
      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }
      handleAuth();
    }
  };

  const handleBack = () => {
    setError(null);
    setDirection(-1);
    setStep(step - 1);
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, { full_name: name });
        if (error) throw error;
      }
      toast.success(isLogin ? "Welcome back!" : "Account created!");
      navigate(isLogin ? "/dashboard" : "/north-star"); // New users to North Star maybe?
    } catch (err: any) {
      if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password");
      } else if (err.message.includes("already registered")) {
        setError("Email already registered");
      } else {
        setError(err.message);
      }
      // Shake animation trigger could go here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center cockpit-canvas p-4 sm:p-6 overflow-hidden relative">
      <div className="w-full max-w-sm relative z-10">

        {/* Logo Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_30px_-10px_var(--primary)]"
          >
            <Zap className="w-6 h-6 text-primary filled-icon" />
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-mono text-xl font-bold text-foreground tracking-widest"
          >
            LIFE_OS
          </motion.h1>
        </div>

        {/* Dynamic Card */}
        <motion.div
          layout
          className="card-surface backdrop-blur-xl border border-white/5 bg-black/60 shadow-2xl rounded-2xl overflow-hidden relative"
        >
          {/* Progress Bar */}
          <div className="h-1 w-full bg-white/5 top-0 absolute">
            <motion.div
              className="h-full bg-primary shadow-[0_0_10px_var(--primary)]"
              animate={{ width: isLogin ? (step / 2) * 100 + "%" : (step / 3) * 100 + "%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          <div className="p-8 pt-10">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  initial={{ x: direction * 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction * -50, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Identity </Label>
                    <Input
                      autoFocus
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-12 bg-white/5 border-white/10 focus:border-primary/50 text-lg transition-all"
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  initial={{ x: direction * 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction * -50, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Security Protocol</Label>
                    <div className="relative">
                      <Input
                        autoFocus
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 bg-white/5 border-white/10 focus:border-primary/50 text-lg pr-10 transition-all font-mono tracking-widest"
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  initial={{ x: direction * 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction * -50, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">What should we call you?</Label>
                    <Input
                      autoFocus
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="h-12 bg-white/5 border-white/10 focus:border-primary/50 text-lg transition-all"
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                {error}
              </motion.div>
            )}

            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="h-12 w-12 rounded-full border border-white/5 hover:bg-white/5 hover:border-white/10"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="h-12 flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  step === (isLogin ? 2 : 3) ? (
                    <span className="flex items-center gap-2">Explore System <ArrowRight className="w-5 h-5" /></span>
                  ) : (
                    <span className="flex items-center gap-2">Continue <ArrowRight className="w-5 h-5" /></span>
                  )
                )}
              </Button>
            </div>
          </div>

          {/* Footer Toggle */}
          <div className="p-4 bg-white/5 border-t border-white/5 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStep(1);
                setError(null);
                setDirection(-1);
              }}
              className="text-xs text-muted-foreground hover:text-white transition-colors"
            >
              {isLogin ? "New Operator? " : "Already have access? "}
              <span className="text-primary font-medium hover:underline">
                {isLogin ? "Initialize Protocol" : "Login"}
              </span>
            </button>
          </div>
        </motion.div>

        <p className="text-center text-[10px] text-white/20 mt-8 font-mono">
          V1.0.7 // SECURE CONNECTION
        </p>
      </div>

      {/* Background Ambient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
    </div>
  );
}
