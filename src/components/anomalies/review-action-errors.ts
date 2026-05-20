const REVIEW_ERROR_MESSAGES: Record<string, string> = {
  invalid_origin:
    "The request origin does not match the deployed app URL. Check DEMO_BASE_URL in Vercel.",
  unauthenticated: "Your demo session is missing or expired. Open the invite link again.",
  invalid_anomaly_id: "The selected anomaly was not recognized by the server.",
  invalid_action: "The server rejected the requested action.",
  invalid_ignore_reason: "Please choose a valid ignore reason.",
  invalid_note: "The ignore note is too long.",
  forbidden_transition: "That anomaly is already in the requested state.",
  review_update_failed: "The server failed to save the review change.",
  message_update_failed: "The server failed to save the message change.",
};

function normalizeErrorCode(errorCode: string) {
  return errorCode.trim().toLowerCase();
}

export function formatActionSaveError(fallbackMessage: string, errorCode?: string | null) {
  if (!errorCode) {
    return fallbackMessage;
  }

  const normalizedCode = normalizeErrorCode(errorCode);
  const specificMessage = REVIEW_ERROR_MESSAGES[normalizedCode];

  if (specificMessage) {
    return `${fallbackMessage} ${specificMessage}`;
  }

  return `${fallbackMessage} Server error: ${errorCode}.`;
}
