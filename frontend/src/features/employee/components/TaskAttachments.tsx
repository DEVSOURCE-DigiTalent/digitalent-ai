import { Download, ExternalLink, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { meService, type MyTaskFile } from '@/services/me.service';
import { formatFileSize, saveBlob } from '@/lib/download';
import { apiErrorMessage } from '@/lib/utils';

interface TaskAttachmentsProps {
  assignmentId: string;
  links: string[];
  files: MyTaskFile[];
}

/** Liên kết + tệp minh chứng của 1 bài nộp (tệp tải qua API vì cần token). */
export function TaskAttachments({ assignmentId, links, files }: TaskAttachmentsProps) {
  if (links.length === 0 && files.length === 0) return null;

  const download = async (file: MyTaskFile) => {
    try {
      saveBlob(await meService.downloadAttachment(assignmentId, file.id), file.fileName);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không tải được tệp.'));
    }
  };

  return (
    <div className="space-y-1.5">
      {links.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 p-2 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-medium transition"
        >
          <ExternalLink className="size-3.5 shrink-0" />
          <span className="truncate">{url}</span>
        </a>
      ))}
      {files.map((file) => (
        <button
          key={file.id}
          type="button"
          onClick={() => download(file)}
          className="w-full flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition text-left"
        >
          <Paperclip className="size-3.5 shrink-0" />
          <span className="truncate flex-1">{file.fileName}</span>
          <span className="text-slate-400 shrink-0">{formatFileSize(file.sizeBytes)}</span>
          <Download className="size-3.5 shrink-0 text-slate-400" />
        </button>
      ))}
    </div>
  );
}
