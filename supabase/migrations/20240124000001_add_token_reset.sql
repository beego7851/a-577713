-- Add new RPC function for token-based password resets
CREATE OR REPLACE FUNCTION handle_password_reset_with_token(
    token_value TEXT,
    new_password TEXT,
    ip_address TEXT DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    client_info JSONB DEFAULT NULL
)
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_member_record RECORD;
    v_response JSONB;
    v_error_code TEXT;
    v_error_message TEXT;
    v_success BOOLEAN;
    v_execution_log JSONB[];
BEGIN
    -- Log function entry
    v_execution_log := array_append(v_execution_log, jsonb_build_object(
        'step', 'function_entry',
        'timestamp', now(),
        'has_token', token_value IS NOT NULL
    ));

    -- Validate token and get member info
    SELECT m.* 
    INTO v_member_record
    FROM password_reset_tokens t
    JOIN members m ON m.member_number = t.member_number
    WHERE t.token = token_value
    AND t.used = FALSE
    AND t.expires_at > now();

    v_execution_log := array_append(v_execution_log, jsonb_build_object(
        'step', 'token_validation',
        'timestamp', now(),
        'found_member', v_member_record IS NOT NULL
    ));

    IF v_member_record IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired token' USING ERRCODE = 'INVALID_TOKEN';
    END IF;

    -- Begin password update
    BEGIN
        v_execution_log := array_append(v_execution_log, jsonb_build_object(
            'step', 'password_update_start',
            'timestamp', now(),
            'auth_user_id', v_member_record.auth_user_id
        ));
        
        -- Update auth user password
        PERFORM auth.update_user(
            v_member_record.auth_user_id,
            JSONB_BUILD_OBJECT('password', new_password)
        );

        -- Mark token as used
        UPDATE password_reset_tokens
        SET used = TRUE,
            used_at = now()
        WHERE token = token_value;

        -- Update member record
        UPDATE members 
        SET 
            updated_at = now(),
            password_reset_required = FALSE
        WHERE member_number = v_member_record.member_number;

        v_success := TRUE;
        v_response := jsonb_build_object(
            'success', TRUE,
            'message', 'Password successfully reset',
            'details', jsonb_build_object(
                'timestamp', now(),
                'member_number', v_member_record.member_number,
                'execution_log', v_execution_log
            )
        );

    EXCEPTION WHEN OTHERS THEN
        v_success := FALSE;
        v_error_code := SQLSTATE;
        v_error_message := SQLERRM;
        
        v_execution_log := array_append(v_execution_log, jsonb_build_object(
            'step', 'error_handler',
            'timestamp', now(),
            'error_code', SQLSTATE,
            'error_message', SQLERRM
        ));
        
        v_response := jsonb_build_object(
            'success', FALSE,
            'error', SQLERRM,
            'code', SQLSTATE,
            'details', jsonb_build_object(
                'timestamp', now(),
                'member_number', v_member_record.member_number,
                'error_details', format('Error occurred during password update: %s', SQLERRM),
                'execution_log', v_execution_log
            )
        );
    END;

    -- Log the reset attempt
    INSERT INTO password_reset_logs (
        member_number,
        reset_type,
        performed_by,
        client_info,
        ip_address,
        user_agent,
        success,
        error_code,
        error_message,
        execution_context
    ) VALUES (
        v_member_record.member_number,
        'self_service',
        v_member_record.auth_user_id,
        client_info,
        ip_address,
        user_agent,
        v_success,
        v_error_code,
        v_error_message,
        jsonb_build_object('execution_log', v_execution_log)
    );

    RETURN v_response;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_password_reset_with_token TO authenticated;