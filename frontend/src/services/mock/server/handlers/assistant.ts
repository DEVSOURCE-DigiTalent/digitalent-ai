import { PERMISSIONS } from '../../../../hooks/use-permission';
import { route } from '../router';

/**
 * Mock of AssistantController (POST /assistant/chat). The real chatbot needs the backend (Gemini or Claude + the
 * caller's scoped data), so demo mode only explains how to turn it on.
 */
route('POST', '/assistant/chat', () => ({
  reply:
    'Trợ lý AI đang chạy ở **chế độ demo** (VITE_USE_MOCK=true) nên chưa đọc được dữ liệu thật.\n\n'
    + 'Để dùng thật: đặt `VITE_USE_MOCK=false`, chạy backend và cấu hình khóa `Assistant:ApiKey` (user-secrets) hoặc `GEMINI_API_KEY`.',
  sources: [],
  toolCalls: [],
}), { permission: PERMISSIONS.ASSISTANT_CHAT });
