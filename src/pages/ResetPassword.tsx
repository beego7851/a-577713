import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { PasswordForm } from "@/components/auth/password/PasswordForm";
import { PasswordRequirements } from "@/components/auth/password/PasswordRequirements";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_VALIDATION_RETRIES = 3;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validationAttempts, setValidationAttempts] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [memberNumber, setMemberNumber] = useState('');
  const [memberNumberError, setMemberNumberError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateMemberNumber = (value: string) => {
    const memberNumberRegex = /^[A-Z]{2}\d{5}$/;
    if (!memberNumberRegex.test(value)) {
      setMemberNumberError('Member number must be in format XX00000');
      return false;
    }
    setMemberNumberError('');
    return true;
  };

  const handleMemberNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setMemberNumber(value);
    if (value) {
      validateMemberNumber(value);
    } else {
      setMemberNumberError('');
    }
  };

  const validateTokenWithRetry = async (retryCount = 0) => {
    try {
      console.log("[ResetPassword] Validating token, attempt:", retryCount + 1);
      const { data, error } = await supabase
        .rpc('validate_reset_token', { token_value: token });

      if (error) throw error;
      
      console.log("[ResetPassword] Token validation result:", {
        isValid: !!data,
        timestamp: new Date().toISOString()
      });
      
      setIsValidToken(!!data);
      setValidationAttempts(retryCount + 1);
    } catch (error: any) {
      console.error('[ResetPassword] Token validation error:', error);
      
      if (retryCount < MAX_VALIDATION_RETRIES - 1) {
        console.log("[ResetPassword] Retrying validation...");
        setTimeout(() => validateTokenWithRetry(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      setIsValidToken(false);
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setIsLoading(false);
      return;
    }

    validateTokenWithRetry();
  }, [token, toast]);

  const handleSuccess = () => {
    setIsResetting(false);
    console.log("[ResetPassword] Password reset successful");
    toast({
      title: "Password Reset Successful",
      description: "Your password has been successfully reset. You can now login with your new password.",
      duration: 5000,
    });
    setTimeout(() => navigate('/login'), 2000);
  };

  const handleError = (error: any) => {
    setIsResetting(false);
    console.error("[ResetPassword] Reset error:", error);
    toast({
      title: "Password Reset Failed",
      description: error.message || "An unexpected error occurred. Please try again.",
      variant: "destructive",
      duration: 5000,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dashboard-dark p-4 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-dashboard-accent1" />
        <p className="text-dashboard-text">Validating reset link...</p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dashboard-dark p-4 space-y-6">
        <Alert className="max-w-md bg-dashboard-card border-dashboard-error/50">
          <AlertCircle className="h-4 w-4 text-dashboard-error" />
          <AlertTitle className="text-xl font-semibold text-white mb-2">
            Invalid Reset Link
          </AlertTitle>
          <AlertDescription className="text-dashboard-text">
            This password reset link is invalid or has expired. Please request a new password reset link.
          </AlertDescription>
        </Alert>
        
        <Link 
          to="/login" 
          className="flex items-center text-dashboard-accent1 hover:text-dashboard-accent1/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Reset Your Password
          </h1>
          <p className="text-dashboard-text">
            Please enter your member number and new password below
          </p>
        </div>

        <div className="bg-dashboard-card p-6 rounded-lg border border-dashboard-cardBorder space-y-6">
          <div className="space-y-2">
            <label htmlFor="memberNumber" className="block text-sm font-medium text-dashboard-text">
              Member Number
            </label>
            <Input
              id="memberNumber"
              type="text"
              value={memberNumber}
              onChange={handleMemberNumberChange}
              placeholder="Enter your member number (e.g., XX00000)"
              className={`w-full ${memberNumberError ? 'border-red-500' : ''}`}
              maxLength={7}
            />
            {memberNumberError && (
              <p className="text-sm text-red-500 mt-1">{memberNumberError}</p>
            )}
          </div>

          <PasswordRequirements />
          
          <PasswordForm
            onSuccess={handleSuccess}
            onError={handleError}
            memberNumber={memberNumber}
            hideCurrentPassword
            resetToken={token}
            isSubmitting={isResetting}
            setIsSubmitting={setIsResetting}
          />
        </div>

        <Link 
          to="/login" 
          className="flex items-center justify-center text-dashboard-accent1 hover:text-dashboard-accent1/80 transition-colors mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;