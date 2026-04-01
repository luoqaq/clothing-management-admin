import axios from 'axios';

export function getErrorMessage(error: unknown, fallback = '操作失败，请稍后重试'): string {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
