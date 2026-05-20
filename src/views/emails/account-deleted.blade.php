<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>NTI account was deleted</title>
</head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, Helvetica, sans-serif; color: #111827;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 32px 12px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
                    <tr>
                        <td style="background: #111827; padding: 28px 32px;">
                            <div style="font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: #fecaca; font-weight: 700;">
                                NTI Admin Notification
                            </div>
                            <h1 style="margin: 10px 0 0; color: #ffffff; font-size: 26px; line-height: 1.25;">
                                Account was deleted
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">
                                A user account was deleted from the NTI admin panel.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; margin: 22px 0;">
                                <tr>
                                    <td style="padding: 18px 20px;">
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">Deleted user</p>

                                        <p style="margin: 0 0 8px; font-size: 16px;">
                                            <strong>Name:</strong>
                                            {{ $deletedUser['first_name'] ?? '-' }} {{ $deletedUser['last_name'] ?? '' }}
                                        </p>

                                        <p style="margin: 0 0 8px; font-size: 16px;">
                                            <strong>Email:</strong>
                                            {{ $deletedUser['email'] ?? '-' }}
                                        </p>

                                        <p style="margin: 0 0 8px; font-size: 16px;">
                                            <strong>Account type:</strong>
                                            {{ isset($deletedUser['account_type']) ? str_replace('_', ' ', $deletedUser['account_type']) : '-' }}
                                        </p>

                                        <p style="margin: 0; font-size: 16px;">
                                            <strong>Previous status:</strong>
                                            {{ $deletedUser['status'] ?? '-' }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 14px; margin: 22px 0;">
                                <tr>
                                    <td style="padding: 18px 20px;">
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #9a3412;">Deleted by</p>

                                        @if($deletedBy)
                                            <p style="margin: 0 0 8px; font-size: 16px;">
                                                <strong>Name:</strong>
                                                {{ $deletedBy['first_name'] ?? '-' }} {{ $deletedBy['last_name'] ?? '' }}
                                            </p>

                                            <p style="margin: 0 0 8px; font-size: 16px;">
                                                <strong>Email:</strong>
                                                {{ $deletedBy['email'] ?? '-' }}
                                            </p>

                                            <p style="margin: 0; font-size: 16px;">
                                                <strong>Account type:</strong>
                                                {{ isset($deletedBy['account_type']) ? str_replace('_', ' ', $deletedBy['account_type']) : '-' }}
                                            </p>
                                        @else
                                            <p style="margin: 0; font-size: 16px;">
                                                Unknown admin.
                                            </p>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                                This action cannot be undone from the admin panel.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 18px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 13px; color: #6b7280;">
                                This is an automatic notification from NTI.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>